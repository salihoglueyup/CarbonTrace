"""
WebSocket Manager for Real-time Chat
Streaming AI responses and live updates
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Optional
import json
import asyncio
from datetime import datetime


class ConnectionManager:
    """Manages WebSocket connections"""

    def __init__(self):
        # user_id -> list of websocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # All connections for broadcasts
        self.all_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, user_id: int = 0):
        """Accept and store a new WebSocket connection"""
        await websocket.accept()

        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        self.all_connections.append(websocket)

        # Send welcome message
        await self.send_personal_message(
            {
                "type": "connected",
                "message": "WebSocket bağlantısı kuruldu",
                "timestamp": datetime.now().isoformat(),
            },
            websocket,
        )

    def disconnect(self, websocket: WebSocket, user_id: int = 0):
        """Remove a WebSocket connection"""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
        if websocket in self.all_connections:
            self.all_connections.remove(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to a specific connection"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending message: {e}")

    async def send_to_user(self, message: dict, user_id: int):
        """Send message to all connections of a user"""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await self.send_personal_message(message, connection)

    async def broadcast(self, message: dict):
        """Broadcast message to all connections"""
        for connection in self.all_connections:
            await self.send_personal_message(message, connection)

    async def stream_ai_response(self, websocket: WebSocket, prompt: str):
        """Stream AI response token by token"""
        from app.core.llm_providers import LLMProviderFactory, CBAM_SYSTEM_PROMPT
        from app.services.rag_service import rag_service

        try:
            # Get RAG context
            rag_result = await rag_service.search(prompt)
            context = ""
            if rag_result.get("results"):
                context = "\n\nİlgili bilgiler:\n" + "\n".join(
                    [r["content"] for r in rag_result["results"][:3]]
                )

            full_prompt = prompt + context

            # Get provider
            provider = LLMProviderFactory.get_default_provider()

            # Send typing indicator
            await self.send_personal_message(
                {"type": "typing", "status": True}, websocket
            )

            # Stream response
            full_response = ""
            async for chunk in provider.generate_stream(
                prompt=full_prompt, system_prompt=CBAM_SYSTEM_PROMPT
            ):
                full_response += chunk
                await self.send_personal_message(
                    {"type": "stream", "content": chunk, "done": False}, websocket
                )
                await asyncio.sleep(0.01)  # Small delay for smooth streaming

            # Send completion message
            await self.send_personal_message(
                {
                    "type": "stream",
                    "content": "",
                    "done": True,
                    "full_response": full_response,
                    "sources": rag_result.get("results", [])[:3],
                },
                websocket,
            )

        except Exception as e:
            await self.send_personal_message(
                {"type": "error", "message": f"AI yanıt hatası: {str(e)}"}, websocket
            )

        finally:
            # Stop typing indicator
            await self.send_personal_message(
                {"type": "typing", "status": False}, websocket
            )


# Global connection manager
ws_manager = ConnectionManager()
