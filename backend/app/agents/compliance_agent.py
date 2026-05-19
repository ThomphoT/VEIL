import time
from loguru import logger
from app.models.schemas import AgentResult
from app.services.gemini_service import gemini


class ComplianceAgent:
    def __init__(self):
        self.name = "compliance_agent"

    async def analyze(self, transaction: dict) -> AgentResult:
        start = time.time()
        prompt = f"""
Perform compliance and regulatory analysis for this transaction:
- Amount: {transaction.get('amount')} {transaction.get('currency')}
- Merchant: {transaction.get('merchant')}
- Merchant Category: {transaction.get('merchant_category', 'N/A')}
- Customer ID: {transaction.get('customer_id')}
- Geolocation: {transaction.get('geolocation', 'N/A')}

Evaluate:
1. Does this transaction trigger AML (Anti-Money Laundering) thresholds?
2. Are there sanctions risks based on merchant or geolocation?
3. What is the jurisdiction risk?
4. Does this require regulatory reporting?

Return a JSON with: score (0-100), confidence (0-1), finding (string), recommendation (string).
"""
        system = "You are a financial compliance and regulatory analysis AI. Return ONLY valid JSON."
        result = await gemini.structured_analysis(prompt, system)
        latency = (time.time() - start) * 1000
        return AgentResult(
            agent=self.name,
            score=result.get("score", 50.0),
            confidence=result.get("confidence", 0.7),
            finding=result.get("finding", "Compliance analysis incomplete."),
            recommendation=result.get("recommendation", "Standard compliance check passed."),
            latency_ms=round(latency, 2),
        )


compliance_agent = ComplianceAgent()
