import asyncio
import json
import uuid
import time
import random
from datetime import datetime
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
from loguru import logger

from app.config import settings
from app.models.schemas import (
    TransactionRequest,
    AnalyzeResponse,
    VoiceQueryRequest,
    VoiceQueryResponse,
    AgentResult,
    TransactionRecord,
)
from app.agents.orchestrator_agent import orchestrator
from app.agents.voice_agent import voice_agent
from app.services.supabase_service import supabase
from app.services.gemini_service import gemini
from app.services.featherless_service import featherless
from app.services.sse_manager import sse_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    await gemini.initialize()
    await featherless.initialize()
    await supabase.initialize()
    yield
    await featherless.close()
    logger.info("VEIL shutdown complete")


app = FastAPI(
    title="VEIL - Veiled Enterprise Intelligence Layer",
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


MOCK_CUSTOMERS = {
    "CUST-1001": {"name": "Elena Voss", "tier": "premium", "country": "DE", "avg_transaction": 250.0},
    "CUST-1002": {"name": "Marcus Chen", "tier": "standard", "country": "SG", "avg_transaction": 85.0},
    "CUST-1003": {"name": "Sarah Okafor", "tier": "business", "country": "NG", "avg_transaction": 1500.0},
    "CUST-1004": {"name": "James Rodriguez", "tier": "standard", "country": "US", "avg_transaction": 120.0},
    "CUST-1005": {"name": "Yuki Tanaka", "tier": "premium", "country": "JP", "avg_transaction": 800.0},
}

MOCK_MERCHANTS = ["AlphaPay", "ByteExchange", "CryptoSecure", "DigitalVault", "EcoPay", "FinBridge", "GlobalTrust", "HexaBank"]


def generate_mock_transaction():
    customer_id = random.choice(list(MOCK_CUSTOMERS.keys()))
    customer = MOCK_CUSTOMERS[customer_id]
    amount_multiplier = random.uniform(0.1, 15.0)
    amount = round(customer["avg_transaction"] * amount_multiplier, 2)
    merchant = random.choice(MOCK_MERCHANTS)
    return {
        "transaction_id": f"TXN-{uuid.uuid4().hex[:8].upper()}",
        "amount": amount,
        "currency": "USD",
        "merchant": merchant,
        "merchant_category": random.choice(["retail", "finance", "crypto", "transfer", "ecommerce"]),
        "customer_id": customer_id,
        "device_id": f"DEV-{uuid.uuid4().hex[:6].upper()}",
        "ip_address": f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}",
        "geolocation": f"{random.choice(['DE', 'SG', 'NG', 'US', 'JP', 'UK', 'FR', 'BR'])}",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/transaction/mock")
async def get_mock_transaction():
    txn = generate_mock_transaction()
    return txn


@app.post("/api/analyze")
async def analyze_transaction(req: TransactionRequest):
    transaction = req.model_dump()
    decision, risk_score, confidence, agent_results, explanation = await orchestrator.analyze(transaction)
    record = {
        "transaction_id": transaction["transaction_id"],
        "amount": transaction["amount"],
        "currency": transaction["currency"],
        "merchant": transaction["merchant"],
        "customer_id": transaction["customer_id"],
        "decision": decision,
        "risk_score": risk_score,
        "confidence": confidence,
        "agent_results": [r.model_dump() for r in agent_results],
        "explanation": explanation,
        "created_at": datetime.utcnow().isoformat(),
    }
    await supabase.save_transaction(record)
    return AnalyzeResponse(
        transaction_id=transaction["transaction_id"],
        decision=decision,
        confidence=confidence,
        risk_score=risk_score,
        explanation=explanation,
        agent_results=agent_results,
    )


@app.post("/api/full-analysis")
async def full_analysis(req: TransactionRequest):
    transaction = req.model_dump()
    decision, risk_score, confidence, agent_results, explanation = await orchestrator.analyze(transaction)
    return {
        "transaction": transaction,
        "decision": decision,
        "risk_score": risk_score,
        "confidence": confidence,
        "agent_results": [r.model_dump() for r in agent_results],
        "explanation": explanation,
    }


@app.post("/api/demo")
async def run_demo():
    transaction = generate_mock_transaction()
    decision, risk_score, confidence, agent_results, explanation = await orchestrator.analyze(transaction)
    return {
        "transaction": transaction,
        "decision": decision,
        "risk_score": risk_score,
        "confidence": confidence,
        "agent_results": [r.model_dump() for r in agent_results],
        "explanation": explanation,
    }


@app.post("/api/voice-query")
async def voice_query(req: VoiceQueryRequest):
    context = None
    if req.transaction_id:
        record = await supabase.get_transaction(req.transaction_id)
        if record:
            context = record
    response = await voice_agent.answer_query(req.query, context)
    return VoiceQueryResponse(response=response)


@app.get("/api/history")
async def get_history(limit: int = 50):
    records = await supabase.get_history(limit=limit)
    return {"transactions": records, "count": len(records)}


@app.get("/api/stream")
async def stream_events(request: Request):
    client_id = f"client_{uuid.uuid4().hex[:8]}"

    async def event_generator():
        queue = sse_manager.register(client_id)
        try:
            while True:
                try:
                    message = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield f"data: {message}\n\n"
                except asyncio.TimeoutError:
                    yield f": keepalive\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            sse_manager.unregister(client_id)

    return EventSourceResponse(event_generator())


@app.get("/api/analyze/{transaction_id}")
async def get_transaction_status(transaction_id: str):
    record = await supabase.get_transaction(transaction_id)
    if not record:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return record


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
