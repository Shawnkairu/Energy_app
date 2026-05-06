from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/{building_id}")
async def websocket_endpoint(websocket: WebSocket, building_id: str):
    await websocket.accept()
    await websocket.send_json({"type": "connected", "buildingId": building_id, "data": {}, "timestamp": None})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        return
