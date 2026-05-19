import time
from loguru import logger
from app.models.schemas import AgentResult
from app.services.gemini_service import gemini


class IntentAgent:
    def __init__(self):
        self.name = "intent_agent"

    async def analyze(self, transaction: dict) -> AgentResult:
        start = time.time()
        prompt = f"""
Analyze this transaction for signs of coercion, manipulation, or abnormal intent:
- Customer ID: {transaction.get('customer_id')}
- Amount: {transaction.get('amount')} {transaction.get('currency')}
- Merchant: {transaction.get('merchant')}
- Merchant Category: {transaction.get('merchant_category', 'N/A')}
- Geolocation: {transaction.get('geolocation', 'N/A')}

Evaluate:
1. Does the transaction value suggest potential coercion (e.g., round numbers, unusual amounts)?
2. Is the merchant category typical for legitimate transactions?
3. Would this transaction make sense for this customer profile?
4. Are there indicators of social engineering or manipulation?

Return a JSON with: score (0-100), confidence (0-1), finding (string), recommendation (string).
"""
        system = "You are an intent analysis AI that detects coercion in financial transactions. Return ONLY valid JSON."
        result = await gemini.structured_analysis(prompt, system)
        latency = (time.time() - start) * 1000
        return AgentResult(
            agent=self.name,
            score=result.get("score", 50.0),
            confidence=result.get("confidence", 0.7),
            finding=result.get("finding", "Intent analysis incomplete."),
            recommendation=result.get("recommendation", "Verify customer intent."),
            latency_ms=round(latency, 2),
        )


intent_agent = IntentAgent()
