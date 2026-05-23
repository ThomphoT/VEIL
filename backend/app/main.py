from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.core.config import Settings, get_settings
from app.core.logging import configure_logging
from app.mock_data import mock_transaction
from app.models import AnalysisResponse, Transaction, VoiceQuery
from app.services.orchestrator import OrchestratorService
from app.services.persistence import AnalysisStore

configure_logging()

app = FastAPI(
    title="VEIL API",
    description="AI-native financial governance infrastructure and autonomous trust layer for global finance.",
    version="0.1.0",
)

settings = get_settings()
allowed_origins = [
    origin.strip()
    for origin in settings.frontend_origin.split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[*allowed_origins, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type"],
)


def orchestrator(settings: Settings = Depends(get_settings)) -> OrchestratorService:
    return OrchestratorService(settings)


def store(settings: Settings = Depends(get_settings)) -> AnalysisStore:
    return AnalysisStore(settings)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "veil-api"}


@app.get("/api/transaction/mock", response_model=Transaction)
async def transaction_mock() -> Transaction:
    return mock_transaction()


@app.post("/api/analyze")
async def analyze(service: OrchestratorService = Depends(orchestrator)) -> dict:
    transaction = mock_transaction()
    results = await service.analyze_core_agents(transaction)
    return {"transaction": transaction, "agents": results}


@app.post("/api/full-analysis", response_model=AnalysisResponse)
async def full_analysis(service: OrchestratorService = Depends(orchestrator), analysis_store: AnalysisStore = Depends(store)) -> AnalysisResponse:
    analysis = await service.full_analysis()
    await analysis_store.save(analysis)
    return analysis


@app.post("/api/demo")
async def demo(service: OrchestratorService = Depends(orchestrator)) -> StreamingResponse:
    return StreamingResponse(service.stream_analysis(delay=0.55), media_type="text/event-stream")


@app.post("/api/voice-query")
async def voice_query(query: VoiceQuery, service: OrchestratorService = Depends(orchestrator)) -> dict:
    analysis = await service.full_analysis()
    prompt_answer = await service.gemini.generate_json(
        f"""
VEIL voice_agent must answer this question as a regulator-ready financial governance explanation.
Question: {query.question}
Analysis: {analysis.model_dump_json()}
Return JSON: {{"answer": "string"}}
""",
        pro=True,
    )
    if prompt_answer and "answer" in prompt_answer:
        return prompt_answer
    return {
        "answer": (
            "VEIL paused settlement because the transaction conflicts with the human context available before settlement: "
            "the device is first-seen, the transfer occurs outside the customer's normal timing profile, the recipient introduces "
            "offshore review risk, and the combined agent confidence supports escalation for human verification."
        )
    }


@app.get("/api/history")
async def history(analysis_store: AnalysisStore = Depends(store)) -> list[dict]:
    return await analysis_store.history()
