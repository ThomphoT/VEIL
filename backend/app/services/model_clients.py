import json
import logging
from typing import Any

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import Settings

logger = logging.getLogger(__name__)


class GeminiClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    @retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=0.4, max=2))
    async def generate_json(self, prompt: str, *, pro: bool = False) -> dict[str, Any] | None:
        if not self.settings.gemini_api_key:
            return None

        model = self.settings.gemini_pro_model if pro else self.settings.gemini_flash_model
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json", "temperature": 0.2},
        }

        async with httpx.AsyncClient(timeout=18) as client:
            response = await client.post(url, params={"key": self.settings.gemini_api_key}, json=payload)
            response.raise_for_status()
            text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)


class FeatherlessClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def generate_json(self, prompt: str) -> dict[str, Any] | None:
        if not self.settings.featherless_api_key:
            return None

        payload = {
            "model": self.settings.featherless_model,
            "messages": [
                {"role": "system", "content": "Return concise financial governance JSON only."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
        }
        headers = {"Authorization": f"Bearer {self.settings.featherless_api_key}"}

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(f"{self.settings.featherless_base_url}/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            return json.loads(content)
