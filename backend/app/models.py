from typing import Literal
from pydantic import BaseModel, Field


Decision = Literal["APPROVE", "HOLD", "ESCALATE", "VERIFY"]


class Customer(BaseModel):
    name: str
    segment: str
    homeCountry: str
    normalTransactionWindow: str


class Device(BaseModel):
    id: str
    fingerprint: str
    trustLevel: str
    firstSeen: str


class Geo(BaseModel):
    originCountry: str
    ipCountry: str
    jurisdictionRisk: str


class Transaction(BaseModel):
    id: str
    amount: float
    currency: str
    merchant: str
    recipient: str
    timestamp: str
    channel: str
    customer: Customer
    device: Device
    geo: Geo


class AgentResult(BaseModel):
    agent: str
    score: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    finding: str
    recommendation: str


class AnalysisResponse(BaseModel):
    transaction: Transaction
    agents: list[AgentResult]
    decision: Decision
    confidence: int = Field(ge=0, le=100)
    risk_score: int = Field(ge=0, le=100)
    reason: str
    narrative: str


class VoiceQuery(BaseModel):
    question: str
    transaction_id: str = "mock-transaction"
