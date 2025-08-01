from fastapi import WebSocket, WebSocketDisconnect, APIRouter

class ConnectionManager:
    def __init__(self):
        self.active: dict[int, list[WebSocket]] = {}

    async def connect(self, ws: WebSocket, user_id: int):
        await ws.accept()
        self.active.setdefault(user_id, []).append(ws)

    def disconnect(self, ws: WebSocket, user_id: int):
        self.active[user_id].remove(ws)
        if not self.active[user_id]:
            del self.active[user_id]

    async def send(self, user_ids: list[int], message: dict):
        for uid in user_ids:
            for ws in self.active.get(uid, []):
                await ws.send_json(message)

manager = ConnectionManager()
router = APIRouter()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(ws: WebSocket, user_id: int):
    await manager.connect(ws, user_id)
    try:
        while True:
            data = await ws.receive_json()
            # Aquí podrías procesar mensajes entrantes si quisieras
    except WebSocketDisconnect:
        manager.disconnect(ws, user_id)
