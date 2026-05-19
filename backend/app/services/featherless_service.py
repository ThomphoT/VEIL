import httpx
from loguru import logger
from app.config import settings


class FeatherlessService:
    def __init__(self):
        self.client = None
        self._initialized = False

    async def initialize(self):
        if self._initialized:
            return
        if not settings.featherless_api_key:
            logger.warning("No Featherless API key configured. Using mock mode.")
            self._initialized = True
            return
        self.client = httpx.AsyncClient(
            base_url=settings.featherless_base_url,
            headers={
                "Authorization": f"Bearer {settings.featherless_api_key}",
                "Content-Type": "application/json",
            },
            timeout=30.0,
        )
        logger.info("Featherless client initialized")
        self._initialized = True

    async def analyze(self, prompt: str, model: str = "default") -> dict:
        if not self.client:
            return {"mock": True, "score": 50.0, "finding": "Mock Featherless analysis"}
        try:
            response = await self.client.post(
                "/chat/completions",
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "You are a financial analysis AI."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.1,
                },
            )
            response.raise_for_status()
            data = response.json()
            return {"content": data["choices"][0]["message"]["content"]}
        except Exception as e:
            logger.error(f"Featherless analysis failed: {e}")
            return {"mock": True, "error": str(e)}

    async def close(self):
        if self.client:
            await self.client.aclose()


featherless = FeatherlessService()
