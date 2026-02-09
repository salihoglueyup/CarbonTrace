"""
WebSocket Routes for Real-time Communication
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
import json

from app.core.websocket_manager import ws_manager

router = APIRouter()


@router.websocket("/chat")
async def websocket_chat(websocket: WebSocket, user_id: Optional[int] = Query(0)):
    """WebSocket endpoint for real-time chat"""
    await ws_manager.connect(websocket, user_id)

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "chat":
                # Process chat message with AI
                await ws_manager.stream_ai_response(
                    websocket, message.get("content", "")
                )

            elif message.get("type") == "ping":
                # Respond to ping with pong
                await ws_manager.send_personal_message(
                    {"type": "pong", "timestamp": message.get("timestamp")}, websocket
                )

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket, user_id)


@router.websocket("/notifications")
async def websocket_notifications(
    websocket: WebSocket, user_id: Optional[int] = Query(0)
):
    """WebSocket endpoint for real-time notifications"""
    await ws_manager.connect(websocket, user_id)

    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "ping":
                await ws_manager.send_personal_message({"type": "pong"}, websocket)

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)
