from typing import Optional, List
from loguru import logger
from app.config import settings

try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False


class SupabaseService:
    def __init__(self):
        self.client: Optional[Client] = None
        self._initialized = False

    async def initialize(self):
        if self._initialized:
            return
        if not settings.supabase_url or not settings.supabase_key:
            logger.warning("Supabase not configured. Using in-memory storage.")
            self._initialized = True
            return
        if HAS_SUPABASE:
            self.client = create_client(settings.supabase_url, settings.supabase_key)
            logger.info("Supabase client initialized")
        else:
            logger.warning("supabase-py not installed. Using in-memory storage.")
        self._initialized = True

    async def save_transaction(self, record: dict) -> dict:
        if not self.client:
            return {"saved": False, "mock": True}
        try:
            response = self.client.table("transactions").insert(record).execute()
            return {"saved": True, "data": response.data}
        except Exception as e:
            logger.error(f"Failed to save transaction: {e}")
            return {"saved": False, "error": str(e)}

    async def get_history(self, limit: int = 50) -> List[dict]:
        if not self.client:
            return []
        try:
            response = self.client.table("transactions").select("*").order("created_at", desc=True).limit(limit).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Failed to fetch history: {e}")
            return []

    async def get_transaction(self, transaction_id: str) -> Optional[dict]:
        if not self.client:
            return None
        try:
            response = self.client.table("transactions").select("*").eq("transaction_id", transaction_id).execute()
            data = response.data
            return data[0] if data else None
        except Exception as e:
            logger.error(f"Failed to fetch transaction: {e}")
            return None


supabase = SupabaseService()
