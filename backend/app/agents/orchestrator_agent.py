import asyncio
import time
import json
import random
from typing import List, Tuple
from loguru import logger
from app.models.schemas import AgentResult
from app.agents.behavioral_agent import behavioral_agent
from app.agents.device_agent import device_agent
from app.agents.fraud_agent import fraud_agent
from app.agents.intent_agent import intent_agent
from app.agents.compliance_agent import compliance_agent
from app.agents.explainability_agent import explainability_agent
from app.services.sse_manager import sse_manager


class OrchestratorAgent:
    def __init__(self):
        self.name = "orchestrator_agent"
        self.agents = {
            "behavioral_agent": behavioral_agent,
            "device_agent": device_agent,
            "fraud_agent": fraud_agent,
            "intent_agent": intent_agent,
            "compliance_agent": compliance_agent,
        }

    async def analyze(self, transaction: dict) -> Tuple[str, float, float, List[AgentResult], str]:
        start = time.time()
        agent_list = list(self.agents.values())
        random.shuffle(agent_list)

        async def run_agent(agent) -> AgentResult:
            agent_start = time.time()
            try:
                result = await agent.analyze(transaction)
                elapsed = (time.time() - agent_start) * 1000
                await sse_manager.broadcast("agent_update", {
                    "agent": agent.name,
                    "score": result.score,
                    "confidence": result.confidence,
                    "finding": result.finding,
                    "latency_ms": round(elapsed, 2),
                    "status": "complete",
                })
                return result
            except Exception as e:
                logger.error(f"Agent {agent.name} failed: {e}")
                await sse_manager.broadcast("agent_update", {
                    "agent": agent.name,
                    "status": "error",
                    "error": str(e),
                })
                return AgentResult(
                    agent=agent.name,
                    score=50.0,
                    confidence=0.5,
                    finding=f"Analysis failed: {str(e)}",
                    recommendation="Manual review required.",
                    latency_ms=0,
                )

        raw_results = await asyncio.gather(*[run_agent(a) for a in agent_list])

        avg_score = sum(r.score for r in raw_results) / len(raw_results)
        avg_confidence = sum(r.confidence for r in raw_results) / len(raw_results)

        decision = self._determine_decision(avg_score, avg_confidence)
        explanation = await explainability_agent.generate_explanation(transaction, raw_results, decision)

        total_latency = (time.time() - start) * 1000

        await sse_manager.broadcast("orchestrator_result", {
            "decision": decision,
            "risk_score": round(avg_score, 2),
            "confidence": round(avg_confidence, 2),
            "explanation": explanation,
            "total_latency_ms": round(total_latency, 2),
        })

        logger.info(f"Orchestration complete: {decision} (score={avg_score:.1f}, latency={total_latency:.0f}ms)")
        return decision, avg_score, avg_confidence, raw_results, explanation

    def _determine_decision(self, avg_score: float, avg_confidence: float) -> str:
        if avg_score >= 70:
            return "ESCALATE"
        elif avg_score >= 50:
            return "HOLD"
        elif avg_score >= 30:
            return "VERIFY"
        else:
            if avg_confidence > 0.8:
                return "APPROVE"
            return "VERIFY"


orchestrator = OrchestratorAgent()
