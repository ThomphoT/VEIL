from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AgentResult(BaseModel):
    agent: str
    score: float = Field(ge=0, le=100)
    confidence: float = Field(ge=0, le=1)
    finding: str
    recommendation: str
    latency_ms: Optional[float] = None


class TransactionRequest(BaseModel):
    transaction_id: str
    amount: float
    currency: str = "USD"
    merchant: str
    merchant_category: Optional[str] = None
    customer_id: str
    device_id: Optional[str] = None
    ip_address: Optional[str] = None
    geolocation: Optional[str] = None
    timestamp: Optional[str] = None


class AnalyzeResponse(BaseModel):
    transaction_id: str
    decision: str
    confidence: float
    risk_score: float
    explanation: str
    agent_results: List[AgentResult]


class VoiceQueryRequest(BaseModel):
    query: str
    transaction_id: Optional[str] = None


class VoiceQueryResponse(BaseModel):
    response: str


class Decision(str):
    APPROVE = "APPROVE"
    HOLD = "HOLD"
    ESCALATE = "ESCALATE"
    VERIFY = "VERIFY"


class TransactionRecord(BaseModel):
    id: str
    created_at: Optional[str] = None
    transaction_id: str
    amount: float
    currency: str
    merchant: str
    customer_id: str
    decision: str
    risk_score: float
    confidence: float
    agent_results: List[AgentResult]
