import time
from loguru import logger
from app.models.schemas import AgentResult
from app.services.gemini_service import gemini


class DeviceAgent:
    def __init__(self):
        self.name = "device_agent"

    async def analyze(self, transaction: dict) -> AgentResult:
        start = time.time()
        prompt = f"""
Analyze device trust and fingerprint integrity for this transaction:
- Device ID: {transaction.get('device_id', 'Unknown')}
- IP Address: {transaction.get('ip_address', 'Unknown')}
- Geolocation: {transaction.get('geolocation', 'Unknown')}
- Customer ID: {transaction.get('customer_id')}

Evaluate:
1. Is the device recognized for this customer?
2. Does the device fingerprint appear valid?
3. Is the IP address consistent with expected geolocation?
4. Are there signs of device spoofing or emulation?

Return a JSON with: score (0-100), confidence (0-1), finding (string), recommendation (string).
"""
        system = "You are a device trust and fingerprint analysis AI. Return ONLY valid JSON."
        result = await gemini.structured_analysis(prompt, system)
        latency = (time.time() - start) * 1000
        return AgentResult(
            agent=self.name,
            score=result.get("score", 50.0),
            confidence=result.get("confidence", 0.7),
            finding=result.get("finding", "Device analysis incomplete."),
            recommendation=result.get("recommendation", "Verify device identity."),
            latency_ms=round(latency, 2),
        )


device_agent = DeviceAgent()
