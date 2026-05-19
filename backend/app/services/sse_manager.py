import asyncio
import json
import time
from typing import AsyncGenerator, Dict, Any
from loguru import logger


class SSEManager:
    def __init__(self):
        self._subscribers: Dict[str, asyncio.Queue] = {}

    def register(self, client_id: str) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers[client_id] = queue
        logger.info(f"SSE client registered: {client_id}")
        return queue

    def unregister(self, client_id: str):
        self._subscribers.pop(client_id, None)
        logger.info(f"SSE client unregistered: {client_id}")

    async def broadcast(self, event: str, data: Dict[str, Any]):
        payload = json.dumps({"event": event, "data": data, "timestamp": time.time()})
        for client_id, queue in list(self._subscribers.items()):
            try:
                await queue.put(payload)
            except Exception as e:
                logger.error(f"Failed to send to {client_id}: {e}")
                self.unregister(client_id)

    async def event_stream(self, client_id: str) -> AsyncGenerator[str, None]:
        queue = self.register(client_id)
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
            self.unregister(client_id)


sse_manager = SSEManager()
