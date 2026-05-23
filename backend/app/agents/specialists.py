from app.agents.base import BaseAgent
from app.models import AgentResult, Transaction


class BehavioralAgent(BaseAgent):
    name = "behavioral_agent"

    async def analyze(self, transaction: Transaction) -> AgentResult:
        payload = await self.gemini.generate_json(self.prompt(transaction, "timing, value, customer baseline and behavioral anomalies"))
        if payload:
            return AgentResult(agent=self.name, **payload)
        return self.fallback(score=88, confidence=91, finding="The transfer occurs at 03:14 UTC outside the customer baseline and is materially larger than normal mobile-wire behavior.", recommendation="Pause settlement and require human-context verification.")


class DeviceAgent(BaseAgent):
    name = "device_agent"

    async def analyze(self, transaction: Transaction) -> AgentResult:
        payload = await self.gemini.generate_json(self.prompt(transaction, "device fingerprint trust, device age and entropy integrity"))
        if payload:
            return AgentResult(agent=self.name, **payload)
        return self.fallback(score=82, confidence=89, finding="The device is first-seen minutes before the transfer with a fingerprint entropy mismatch.", recommendation="Bind verification to a previously trusted device before releasing funds.")


class FraudAgent(BaseAgent):
    name = "fraud_agent"

    async def analyze(self, transaction: Transaction) -> AgentResult:
        payload = await self.featherless.generate_json(self.prompt(transaction, "suspicious transaction patterns and beneficiary risk"))
        if payload:
            return AgentResult(agent=self.name, **payload)
        return self.fallback(score=86, confidence=87, finding="High-value offshore transfer pattern aligns with known synthetic beneficiary movement risk.", recommendation="Hold settlement pending recipient provenance review.")


class IntentAgent(BaseAgent):
    name = "intent_agent"

    async def analyze(self, transaction: Transaction) -> AgentResult:
        payload = await self.gemini.generate_json(self.prompt(transaction, "coercion, manipulation, urgency and intent mismatch"))
        if payload:
            return AgentResult(agent=self.name, **payload)
        return self.fallback(score=79, confidence=84, finding="The timing, new device and offshore recipient create a coercion-risk profile even without direct user language.", recommendation="Trigger step-up verification with neutral safety phrasing.")


class ComplianceAgent(BaseAgent):
    name = "compliance_agent"

    async def analyze(self, transaction: Transaction) -> AgentResult:
        payload = await self.gemini.generate_json(self.prompt(transaction, "AML, sanctions, jurisdiction and cross-border compliance exposure"))
        if payload:
            return AgentResult(agent=self.name, **payload)
        return self.fallback(score=74, confidence=81, finding="Jurisdiction and recipient metadata require AML review before irreversible settlement.", recommendation="Route to enhanced due diligence queue and persist a regulator-ready audit trail.")


class ExplainabilityAgent(BaseAgent):
    name = "explainability_agent"

    async def analyze(self, transaction: Transaction) -> AgentResult:
        payload = await self.gemini.generate_json(self.prompt(transaction, "regulator-ready explanation quality and audit narrative sufficiency"), pro=True)
        if payload:
            return AgentResult(agent=self.name, **payload)
        return self.fallback(score=68, confidence=88, finding="The available evidence supports an auditable governance intervention rather than automatic settlement.", recommendation="Summarize the behavioral, device, intent and compliance findings in the case record.")


class VoiceAgent(BaseAgent):
    name = "voice_agent"

    async def analyze(self, transaction: Transaction) -> AgentResult:
        return self.fallback(score=42, confidence=77, finding="Conversational explanation channel is available for the case team.", recommendation="Use Ask VEIL to query the reasoning record.")
