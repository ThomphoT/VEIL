from abc import ABC, abstractmethod

from app.models import AgentResult, Transaction
from app.services.model_clients import FeatherlessClient, GeminiClient


class BaseAgent(ABC):
    name: str

    def __init__(self, gemini: GeminiClient, featherless: FeatherlessClient):
        self.gemini = gemini
        self.featherless = featherless

    @abstractmethod
    async def analyze(self, transaction: Transaction) -> AgentResult:
        raise NotImplementedError

    def fallback(self, *, score: int, confidence: int, finding: str, recommendation: str) -> AgentResult:
        return AgentResult(
            agent=self.name,
            score=score,
            confidence=confidence,
            finding=finding,
            recommendation=recommendation,
        )

    def prompt(self, transaction: Transaction, focus: str) -> str:
        return f"""
You are {self.name}, part of VEIL, an AI-native financial governance infrastructure.
Evaluate whether this transaction makes sense for this human, right now.
Focus: {focus}
Return JSON exactly as:
{{"score": number, "confidence": number, "finding": "string", "recommendation": "string"}}
Transaction: {transaction.model_dump_json()}
"""
