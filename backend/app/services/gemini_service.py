import json
from typing import Optional
from loguru import logger
from app.config import settings

try:
    from google import genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False


class GeminiService:
    def __init__(self):
        self.client = None
        self._initialized = False

    async def initialize(self):
        if self._initialized:
            return
        if not settings.gemini_api_key:
            logger.warning("No Gemini API key configured. Using mock mode.")
            self._initialized = True
            return
        if HAS_GENAI:
            self.client = genai.Client(api_key=settings.gemini_api_key)
            logger.info("Gemini client initialized")
        else:
            logger.warning("google-genai not installed. Using mock mode.")
        self._initialized = True

    async def analyze_fast(self, prompt: str, system_instruction: Optional[str] = None) -> dict:
        if not self.client:
            return {"mock": True, "content": "Mock fast analysis response"}
        try:
            model = settings.gemini_flash_model
            contents = []
            if system_instruction:
                contents.append({"role": "system", "parts": [{"text": system_instruction}]})
            contents.append({"role": "user", "parts": [{"text": prompt}]})
            response = self.client.models.generate_content(
                model=model,
                contents=contents,
            )
            return {"content": response.text}
        except Exception as e:
            logger.error(f"Gemini fast analysis failed: {e}")
            return {"error": str(e)}

    async def analyze_pro(self, prompt: str, system_instruction: Optional[str] = None) -> dict:
        if not self.client:
            return {"mock": True, "content": "Mock pro analysis response"}
        try:
            model = settings.gemini_pro_model
            contents = []
            if system_instruction:
                contents.append({"role": "system", "parts": [{"text": system_instruction}]})
            contents.append({"role": "user", "parts": [{"text": prompt}]})
            response = self.client.models.generate_content(
                model=model,
                contents=contents,
            )
            return {"content": response.text}
        except Exception as e:
            logger.error(f"Gemini pro analysis failed: {e}")
            return {"error": str(e)}

    async def structured_analysis(self, prompt: str, system_instruction: str) -> dict:
        if not self.client:
            return self._mock_structured_result()
        try:
            raw = await self.analyze_pro(prompt, system_instruction)
            text = raw.get("content", "")
            cleaned = text.strip().removeprefix("```json").removesuffix("```").strip()
            return json.loads(cleaned)
        except (json.JSONDecodeError, Exception) as e:
            logger.error(f"Failed to parse structured response: {e}")
            return self._mock_structured_result()

    def _mock_structured_result(self) -> dict:
        return {
            "score": 45.0,
            "confidence": 0.78,
            "finding": "Mock analysis: transaction appears normal with minor anomalies.",
            "recommendation": "No immediate action required. Monitor transaction."
        }


gemini = GeminiService()
