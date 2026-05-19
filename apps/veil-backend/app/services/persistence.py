import logging

from supabase import create_client

from app.core.config import Settings
from app.models import AnalysisResponse

logger = logging.getLogger(__name__)


class AnalysisStore:
    def __init__(self, settings: Settings):
        self.client = None
        if settings.supabase_url and settings.supabase_key:
            self.client = create_client(settings.supabase_url, settings.supabase_key)

    async def save(self, analysis: AnalysisResponse) -> None:
        if not self.client:
            return
        try:
            self.client.table("analyses").insert(
                {
                    "transaction_id": analysis.transaction.id,
                    "decision": analysis.decision,
                    "risk_score": analysis.risk_score,
                    "confidence": analysis.confidence,
                    "payload": analysis.model_dump(),
                }
            ).execute()
        except Exception:
            logger.exception("Failed to persist analysis")

    async def history(self) -> list[dict]:
        if not self.client:
            return []
        response = self.client.table("analyses").select("*").order("created_at", desc=True).limit(25).execute()
        return response.data
