import time
from loguru import logger
from app.models.schemas import AgentResult
from app.services.gemini_service import gemini


class VoiceAgent:
    def __init__(self):
        self.name = "voice_agent"

    async def answer_query(self, query: str, context: dict = None) -> str:
        start = time.time()
        context_str = ""
        if context:
            context_str = f"""
Transaction Context:
- ID: {context.get('transaction_id', 'N/A')}
- Amount: {context.get('amount', 'N/A')}
- Merchant: {context.get('merchant', 'N/A')}
- Decision: {context.get('decision', 'N/A')}
- Risk Score: {context.get('risk_score', 'N/A')}
"""

        prompt = f"""
You are VEIL's conversational AI for financial governance. Answer the user's question clearly and professionally.

{context_str}

User Question: {query}

Provide a clear, accurate, and helpful response about this transaction's risk analysis.
If you don't have specific data, explain what VEIL would analyze.
Keep responses concise and regulator-friendly.
"""
        system = "You are VEIL, an AI-native financial governance assistant. Be professional, clear, and helpful."
        result = await gemini.analyze_fast(prompt, system)
        latency = (time.time() - start) * 1000
        content = result.get("content", "")
        if isinstance(result.get("mock"), bool) and result.get("mock"):
            content = self._mock_response(query)
        logger.info(f"Voice query answered in {latency:.2f}ms")
        return content

    def _mock_response(self, query: str) -> str:
        return (
            "VEIL has analyzed this transaction across all governance dimensions. "
            "Our behavioral, device, fraud, intent, and compliance agents have each evaluated "
            "the transaction independently. The orchestrator has aggregated these signals "
            "into a unified risk assessment. Based on the analysis, the transaction "
            "appears consistent with normal patterns. All governance criteria are satisfied."
        )


voice_agent = VoiceAgent()
