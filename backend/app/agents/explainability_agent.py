import time
from loguru import logger
from typing import List
from app.models.schemas import AgentResult
from app.services.gemini_service import gemini


class ExplainabilityAgent:
    def __init__(self):
        self.name = "explainability_agent"

    async def generate_explanation(self, transaction: dict, agent_results: List[AgentResult], decision: str) -> str:
        start = time.time()
        agent_summaries = "\n".join(
            [f"- {r.agent}: score={r.score}, confidence={r.confidence}, finding={r.finding}"
             for r in agent_results]
        )
        prompt = f"""
Generate a regulator-ready explanation for this transaction decision.

Transaction:
- ID: {transaction.get('transaction_id')}
- Amount: {transaction.get('amount')} {transaction.get('currency')}
- Merchant: {transaction.get('merchant')}
- Customer: {transaction.get('customer_id')}

Decision: {decision}

Agent Analysis:
{agent_summaries}

Provide a clear, professional narrative explaining why this decision was reached.
Include the key risk factors and the reasoning behind each agent's contribution.
This explanation must be suitable for regulatory review and audit.
"""
        system = "You are a financial explainability AI. Generate clear, regulator-ready explanations."
        result = await gemini.analyze_pro(prompt, system)
        latency = (time.time() - start) * 1000
        logger.info(f"Explanation generated in {latency:.2f}ms")
        content = result.get("content", "Explanation generation failed.")
        if isinstance(result.get("mock"), bool) and result.get("mock"):
            content = self._mock_explanation(decision, agent_results)
        return content

    def _mock_explanation(self, decision: str, agent_results: List[AgentResult]) -> str:
        avg_score = sum(r.score for r in agent_results) / len(agent_results) if agent_results else 50
        return (
            f"VEIL Governance Decision Report\n"
            f"Decision: {decision}\n"
            f"Overall Risk Score: {avg_score:.1f}/100\n\n"
            f"This transaction was analyzed by {len(agent_results)} specialized agents. "
            f"The behavioral analysis found no significant anomalies. "
            f"Device trust assessment indicates a recognized device. "
            f"Fraud detection systems found no suspicious patterns. "
            f"Intent analysis shows no signs of coercion. "
            f"Compliance checks passed all regulatory filters.\n\n"
            f"Conclusion: The transaction {decision.lower()}s all governance criteria."
        )


explainability_agent = ExplainabilityAgent()
