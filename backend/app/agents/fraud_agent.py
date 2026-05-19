from app.config import settings
import time
from loguru import logger
from app.models.schemas import AgentResult
from app.services.gemini_service import gemini
from app.services.featherless_service import featherless


class FraudAgent:
    def __init__(self):
        self.name = "fraud_agent"

    async def analyze(self, transaction: dict) -> AgentResult:
        start = time.time()
        primary_result = await self._analyze_gemini(transaction)
        secondary_result = await self._analyze_featherless(transaction)
        score = (primary_result.score + secondary_result.score) / 2
        confidence = (primary_result.confidence + secondary_result.confidence) / 2
        latency = (time.time() - start) * 1000
        finding = f"Gemini: {primary_result.finding} | Featherless: {secondary_result.finding}"
        return AgentResult(
            agent=self.name,
            score=round(score, 2),
            confidence=round(confidence, 2),
            finding=finding,
            recommendation=primary_result.recommendation,
            latency_ms=round(latency, 2),
        )

    async def _analyze_gemini(self, transaction: dict) -> AgentResult:
        prompt = f"""
Analyze this transaction for fraud indicators:
- Amount: {transaction.get('amount')} {transaction.get('currency')}
- Merchant: {transaction.get('merchant')}
- Customer ID: {transaction.get('customer_id')}
- IP: {transaction.get('ip_address', 'Unknown')}

Evaluate:
1. Is the transaction amount suspicious?
2. Is the merchant known for fraud?
3. Does the transaction fit known fraud patterns?
4. Are there any red flags in the transaction data?

Return JSON with: score (0-100), confidence (0-1), finding (string), recommendation (string).
"""
        system = "You are a fraud detection AI for financial transactions. Return ONLY valid JSON."
        result = await gemini.structured_analysis(prompt, system)
        return AgentResult(
            agent=f"{self.name}_gemini",
            score=result.get("score", 50.0),
            confidence=result.get("confidence", 0.7),
            finding=result.get("finding", "Gemini fraud analysis incomplete."),
            recommendation=result.get("recommendation", "Review transaction."),
        )

    async def _analyze_featherless(self, transaction: dict) -> AgentResult:
        prompt = f"""
Analyze this transaction for fraud patterns:
Transaction: {transaction.get('amount')} {transaction.get('currency')} to {transaction.get('merchant')}
Customer: {transaction.get('customer_id')}
Risk indicators: amount={transaction.get('amount')}, merchant={transaction.get('merchant')}

Return JSON with score (0-100), confidence (0-1), finding, recommendation.
"""
        result = await featherless.analyze(prompt, model=settings.featherless_model)
        if result.get("mock"):
            return AgentResult(
                agent=f"{self.name}_featherless",
                score=45.0,
                confidence=0.75,
                finding="Mock Featherless analysis: no high-confidence fraud indicators detected.",
                recommendation="Continue monitoring.",
            )
        return AgentResult(
            agent=f"{self.name}_featherless",
            score=result.get("score", 50.0),
            confidence=result.get("confidence", 0.7),
            finding=result.get("finding", "Featherless fraud analysis incomplete."),
            recommendation=result.get("recommendation", "Review transaction."),
        )


fraud_agent = FraudAgent()
