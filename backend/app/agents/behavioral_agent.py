import time
from loguru import logger
from app.models.schemas import AgentResult
from app.services.gemini_service import gemini


class BehavioralAgent:
    def __init__(self):
        self.name = "behavioral_agent"

    async def analyze(self, transaction: dict) -> AgentResult:
        start = time.time()
        prompt = f"""
Analyze the behavioral pattern of this transaction:
- Customer ID: {transaction.get('customer_id')}
- Amount: {transaction.get('amount')} {transaction.get('currency')}
- Merchant: {transaction.get('merchant')}
- Merchant Category: {transaction.get('merchant_category', 'N/A')}
- Timestamp: {transaction.get('timestamp', 'N/A')}
- Geolocation: {transaction.get('geolocation', 'N/A')}

Evaluate:
1. Is the transaction amount typical for this customer?
2. Is the merchant category consistent with historical behavior?
3. Is the transaction timing normal?
4. Are there any velocity concerns?

Return a JSON with: score (0-100), confidence (0-1), finding (string), recommendation (string).
"""
        system = "You are a behavioral analysis AI for financial transactions. Return ONLY valid JSON."
        result = await gemini.structured_analysis(prompt, system)
        latency = (time.time() - start) * 1000
        return AgentResult(
            agent=self.name,
            score=result.get("score", 50.0),
            confidence=result.get("confidence", 0.7),
            finding=result.get("finding", "Behavioral analysis incomplete."),
            recommendation=result.get("recommendation", "Monitor transaction."),
            latency_ms=round(latency, 2),
        )


behavioral_agent = BehavioralAgent()
