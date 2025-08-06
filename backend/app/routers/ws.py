from fastapi import WebSocket, WebSocketDisconnect, APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
import json
import logging
from datetime import datetime

from app.database import get_db
from app.models import Usuario, Mensaje, Contenido, Amistad, Grupo, Pertenece

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Map user_id to their active WebSocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Map WebSocket to user_id for quick lookup
        self.websocket_to_user: Dict[WebSocket, int] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        self.websocket_to_user[websocket] = user_id
        
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")
        
        # Send connection confirmation
        await websocket.send_json({
            "type": "connection_established",
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        })

    def disconnect(self, websocket: WebSocket):
        user_id = self.websocket_to_user.get(websocket)
        if user_id and user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        if websocket in self.websocket_to_user:
            del self.websocket_to_user[websocket]
        
        logger.info(f"User {user_id} disconnected")

    async def send_personal_message(self, message: dict, user_id: int):
        """Send message to a specific user"""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to user {user_id}: {e}")
                    # Remove broken connection
                    self.active_connections[user_id].remove(connection)
                    if not self.active_connections[user_id]:
                        del self.active_connections[user_id]

    async def send_message_to_users(self, message: dict, user_ids: List[int]):
        """Send message to multiple users"""
        for user_id in user_ids:
            await self.send_personal_message(message, user_id)

    async def broadcast_to_all(self, message: dict):
        """Send message to all connected users"""
        for user_id in list(self.active_connections.keys()):
            await self.send_personal_message(message, user_id)

    def get_online_users(self) -> List[int]:
        """Get list of online user IDs"""
        return list(self.active_connections.keys())

manager = ConnectionManager()
router = APIRouter()

@router.websocket("/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            # Handle different message types
            message_type = data.get("type", "message")
            
            if message_type == "message":
                await handle_chat_message(data, user_id)
            elif message_type == "typing":
                await handle_typing_indicator(data, user_id)
            elif message_type == "read_receipt":
                await handle_read_receipt(data, user_id)
            elif message_type == "ping":
                await websocket.send_json({"type": "pong", "timestamp": datetime.now().isoformat()})
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

async def handle_chat_message(data: dict, sender_id: int):
    """Handle incoming chat messages and save to database"""
    try:
        recipient_id = data.get("recipient_id")
        group_id = data.get("group_id")
        message_text = data.get("message", "")
        message_type = data.get("message_type", "text")
        reply_to_id = data.get("reply_to_id")
        
        # Validate that we have either recipient_id or group_id, not both
        if not recipient_id and not group_id:
            logger.error("No recipient_id or group_id provided")
            return
        
        if recipient_id and group_id:
            logger.error("Cannot send to both recipient and group")
            return
        
        # Get database session
        db = next(get_db())
        
        # Validate sender exists
        sender = db.query(Usuario).filter(Usuario.id == sender_id).first()
        if not sender:
            logger.error(f"Sender {sender_id} does not exist")
            return
        
        # Validate recipient or group
        if recipient_id:
            # Check if recipient exists
            recipient = db.query(Usuario).filter(Usuario.id == recipient_id).first()
            if not recipient:
                logger.error(f"Recipient {recipient_id} does not exist")
                return
            
            # Check if they are friends (both ways)
            friendship = db.query(Amistad).filter(
                ((Amistad.usuario_id == sender_id) & (Amistad.amigo_id == recipient_id)) |
                ((Amistad.usuario_id == recipient_id) & (Amistad.amigo_id == sender_id))
            ).filter(Amistad.estado == "accepted").first()
            
            if not friendship:
                logger.error(f"Users {sender_id} and {recipient_id} are not friends")
                return
                
        elif group_id:
            # Check if group exists
            group = db.query(Grupo).filter(Grupo.id == group_id).first()
            if not group:
                logger.error(f"Group {group_id} does not exist")
                return
            
            # Check if sender is member of the group
            membership = db.query(Pertenece).filter(
                Pertenece.grupo_id == group_id,
                Pertenece.usuario_id == sender_id
            ).first()
            
            if not membership:
                logger.error(f"User {sender_id} is not member of group {group_id}")
                return
        
        # Create message in database
        new_message = Mensaje(
            emisor_id=sender_id,
            receptor_id=recipient_id,
            grupo_id=group_id,
            estado_envio="enviado",
            estado_lectura="no_leído",
            reply_to_id=reply_to_id
        )
        
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        
        # Create content if text is provided
        if message_text:
            content = Contenido(
                mensaje_id=new_message.id,
                tipo_contenido="texto",
                texto=message_text
            )
            db.add(content)
            db.commit()
        
        # Determine WebSocket targets
        targets = []
        if recipient_id:
            targets = [recipient_id]
        elif group_id:
            # Get all group members except sender
            members = db.query(Pertenece).filter(
                Pertenece.grupo_id == group_id,
                Pertenece.usuario_id != sender_id
            ).all()
            targets = [member.usuario_id for member in members]
        
        # Create message data for WebSocket broadcast
        message_data = {
            "type": "new_message",
            "message_id": new_message.id,
            "sender_id": sender_id,
            "recipient_id": recipient_id,
            "group_id": group_id,
            "message": message_text,
            "message_type": message_type,
            "reply_to_id": reply_to_id,
            "timestamp": new_message.fecha_envio.isoformat(),
            "status": "sent"
        }
        
        # Send to targets
        await manager.send_message_to_users(message_data, targets)
        
        # Send confirmation to sender
        await manager.send_personal_message({
            "type": "message_sent",
            "message_id": new_message.id,
            "timestamp": datetime.now().isoformat()
        }, sender_id)
        
        logger.info(f"Message {new_message.id} sent from {sender_id} to {targets}")
        
    except Exception as e:
        logger.error(f"Error handling chat message: {e}")

async def handle_typing_indicator(data: dict, user_id: int):
    """Handle typing indicators"""
    try:
        recipient_id = data.get("recipient_id")
        group_id = data.get("group_id")
        is_typing = data.get("is_typing", False)
        
        if not recipient_id and not group_id:
            logger.error("No recipient_id or group_id provided for typing indicator")
            return
        
        # Get database session for validation
        db = next(get_db())
        
        targets = []
        if recipient_id:
            # Validate friendship
            friendship = db.query(Amistad).filter(
                ((Amistad.usuario_id == user_id) & (Amistad.amigo_id == recipient_id)) |
                ((Amistad.usuario_id == recipient_id) & (Amistad.amigo_id == user_id))
            ).filter(Amistad.estado == "accepted").first()
            
            if not friendship:
                logger.error(f"Users {user_id} and {recipient_id} are not friends")
                return
            
            targets = [recipient_id]
            
        elif group_id:
            # Validate group membership
            membership = db.query(Pertenece).filter(
                Pertenece.grupo_id == group_id,
                Pertenece.usuario_id == user_id
            ).first()
            
            if not membership:
                logger.error(f"User {user_id} is not member of group {group_id}")
                return
            
            # Get all group members except sender
            members = db.query(Pertenece).filter(
                Pertenece.grupo_id == group_id,
                Pertenece.usuario_id != user_id
            ).all()
            targets = [member.usuario_id for member in members]
        
        typing_data = {
            "type": "typing_indicator",
            "user_id": user_id,
            "recipient_id": recipient_id,
            "group_id": group_id,
            "is_typing": is_typing,
            "timestamp": datetime.now().isoformat()
        }
        
        await manager.send_message_to_users(typing_data, targets)
            
    except Exception as e:
        logger.error(f"Error handling typing indicator: {e}")

async def handle_read_receipt(data: dict, user_id: int):
    """Handle read receipts and update database"""
    try:
        message_id = data.get("message_id")
        sender_id = data.get("sender_id")
        
        if not message_id or not sender_id:
            logger.error("Missing message_id or sender_id for read receipt")
            return
        
        # Get database session
        db = next(get_db())
        
        # Update message status in database
        message = db.query(Mensaje).filter(Mensaje.id == message_id).first()
        if not message:
            logger.error(f"Message {message_id} not found")
            return
        
        # Update to read status
        message.estado_lectura = "leído"
        db.commit()
        
        # Send read receipt to sender
        await manager.send_personal_message({
            "type": "read_receipt",
            "message_id": message_id,
            "read_by": user_id,
            "timestamp": datetime.now().isoformat()
        }, sender_id)
            
    except Exception as e:
        logger.error(f"Error handling read receipt: {e}")

@router.get("/online-users")
async def get_online_users():
    """Get list of currently online users"""
    return {"online_users": manager.get_online_users()}
