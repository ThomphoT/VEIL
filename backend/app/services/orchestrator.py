import asyncio
import json
from collections.abc import AsyncGenerator

from app.agents.specialists import BehavioralAgent, ComplianceAgent, DeviceAgent, ExplainabilityAgent, FraudAgent, IntentAgent, VoiceAgent
from app.core.config import Settings
from app.mock_data import mock_transaction
from app.models import AgentResult, AnalysisResponse, Transaction
from app.services.model_clients import FeatherlessClient, GeminiClient


def sse(event: dict) -> str:
    return f"data: {json.dumps(event)}\n\n"


class OrchestratorService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.gemini = GeminiClient(settings)
        self.featherless = FeatherlessClient(settings)

    def agents(self):
        return [
            BehavioralAgent(self.gemini, self.featherless),
            DeviceAgent(self.gemini, self.featherless),
            FraudAgent(self.gemini, self.featherless),
            IntentAgent(self.gemini, self.featherless),
            ComplianceAgent(self.gemini, self.featherless),
            ExplainabilityAgent(self.gemini, self.featherless),
            VoiceAgent(self.gemini, self.featherless),
        ]

    async def analyze_core_agents(self, transaction: Transaction | None = None) -> list[AgentResult]:
        transaction = transaction or mock_transaction()
        selected = self.agents()[:3]
        return await asyncio.gather(*(agent.analyze(transaction) for agent in selected))

    async def full_analysis(self, transaction: Transaction | None = None, *, delay: float = 0) -> AnalysisResponse:
        transaction = transaction or mock_transaction()
        results: list[AgentResult] = []
        for agent in self.agents():
            if delay:
                await asyncio.sleep(delay)
            results.append(await agent.analyze(transaction))
        return await self.orchestrate(transaction, results)

    async def stream_analysis(self, *, delay: float = 0.5) -> AsyncGenerator[str, None]:
        transaction = mock_transaction()
        yield sse({"type": "transaction", "transaction": transaction.model_dump()})
        results: list[AgentResult] = []

        for agent in self.agents():
            yield sse({"type": "agent_start", "agent": agent.name, "message": f"{agent.name} analyzing live context"})
            await asyncio.sleep(delay)
            result = await agent.analyze(transaction)
            results.append(result)
            yield sse({"type": "agent_result", "result": result.model_dump()})

        yield sse({"type": "agent_start", "agent": "orchestrator_agent", "message": "Aggregating governance signals"})
        analysis = await self.orchestrate(transaction, results)
        yield sse({
            "type": "orchestrator",
            "decision": analysis.decision,
            "confidence": analysis.confidence,
            "risk_score": analysis.risk_score,
            "reason": analysis.reason,
        })
        yield sse({"type": "explainability", "narrative": analysis.narrative})
        yield sse({"type": "complete", "analysis": analysis.model_dump()})

    async def orchestrate(self, transaction: Transaction, results: list[AgentResult]) -> AnalysisResponse:
        average = round(sum(result.score for result in results) / len(results))
        max_score = max(result.score for result in results)
        confidence = round(sum(result.confidence for result in results) / len(results))

        if max_score >= 85 or average >= 78:
            decision = "ESCALATE"
        elif average >= 65:
            decision = "HOLD"
        elif average >= 45:
            decision = "VERIFY"
        else:
            decision = "APPROVE"

        payload = await self.gemini.generate_json(
            f"""
You are orchestrator_agent for VEIL.
Aggregate these agent results into JSON with decision, confidence, risk_score, reason and narrative.
Allowed decisions: APPROVE, HOLD, ESCALATE, VERIFY.
Transaction: {transaction.model_dump_json()}
Agent results: {[result.model_dump() for result in results]}
""",
            pro=True,
        )

        if payload:
            return AnalysisResponse(transaction=transaction, agents=results, **payload)

        reason = "Multiple independent governance signals show the transaction does not match the customer, device, jurisdiction and timing context."
        narrative = (
            "VEIL recommends escalation before settlement. The behavioral agent identified activity outside the customer's normal window; "
            "the device agent observed a first-seen fingerprint with integrity mismatch; the intent and compliance agents found elevated coercion "
            "and cross-border review risk. The decision is a governance intervention designed to protect the human and preserve an audit-ready record."
        )
        return AnalysisResponse(
            transaction=transaction,
            agents=results,
            decision=decision,
            confidence=confidence,
            risk_score=max(average, max_score - 3),
            reason=reason,
            narrative=narrative,
        )
