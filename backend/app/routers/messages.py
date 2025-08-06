from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
import asyncio
from datetime import datetime

from app import schemas, models
from app.database import get_db
from app.routers.ws import manager

router = APIRouter()

@router.post("/", response_model=schemas.MensajeOut, status_code=status.HTTP_201_CREATED)
async def create_message(msg: schemas.MensajeCreate, db: Session = Depends(get_db)):
    # Validate sender/receiver
    if not db.query(models.Usuario).get(msg.emisor_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Sender does not exist")
    if msg.receptor_id and not db.query(models.Usuario).get(msg.receptor_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Receiver does not exist")
    if msg.grupo_id and not db.query(models.Grupo).get(msg.grupo_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Group does not exist")
    
    # Validate friendship for direct messages
    if msg.receptor_id and not msg.grupo_id:
        friendship = db.query(models.Amistad).filter(
            ((models.Amistad.usuario_id == msg.emisor_id) & (models.Amistad.amigo_id == msg.receptor_id)) |
            ((models.Amistad.usuario_id == msg.receptor_id) & (models.Amistad.amigo_id == msg.emisor_id))
        ).filter(models.Amistad.estado == "accepted").first()
        
        if not friendship:
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Users are not friends")
    
    # Validate group membership for group messages
    if msg.grupo_id:
        membership = db.query(models.Pertenece).filter(
            models.Pertenece.grupo_id == msg.grupo_id,
            models.Pertenece.usuario_id == msg.emisor_id
        ).first()
        
        if not membership:
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="User is not member of this group")
    
    # Create message
    new_message = models.Mensaje(
        emisor_id=msg.emisor_id,
        receptor_id=msg.receptor_id,
        grupo_id=msg.grupo_id,
        estado_envio="enviado",
        estado_lectura="no_leído",
        reply_to_id=msg.reply_to_id
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    # Create content if text is provided
    if msg.texto:
        content = models.Contenido(
            mensaje_id=new_message.id,
            tipo_contenido="texto",
            texto=msg.texto
        )
        db.add(content)
        db.commit()

    # Determine WebSocket targets
    targets = []
    if new_message.receptor_id:
        targets = [new_message.receptor_id]
    elif new_message.grupo_id:
        # All group members except sender
        targets = [p.usuario_id for p in db.query(models.Pertenece)
                                    .filter_by(grupo_id=new_message.grupo_id)
                                    .filter(models.Pertenece.usuario_id != new_message.emisor_id)]

    # Send real-time notification via WebSocket
    message_data = {
        "type": "new_message",
        "message_id": new_message.id,
        "sender_id": new_message.emisor_id,
        "recipient_id": new_message.receptor_id,
        "group_id": new_message.grupo_id,
        "message": msg.texto,
        "reply_to_id": msg.reply_to_id,
        "timestamp": new_message.fecha_envio.isoformat(),
        "status": "sent"
    }
    
    # Send to targets asynchronously
    asyncio.create_task(manager.send_message_to_users(targets, message_data))
    
    # Send confirmation to sender
    asyncio.create_task(manager.send_personal_message({
        "type": "message_sent",
        "message_id": new_message.id,
        "timestamp": datetime.now().isoformat()
    }, new_message.emisor_id))
    
    return new_message

@router.get("/", response_model=List[schemas.MensajeOut])
def list_messages(
    user1_id: Optional[int] = None,
    user2_id: Optional[int] = None,
    group_id: Optional[int] = None,
    limit: Optional[int] = 50,
    offset: Optional[int] = 0,
    db: Session = Depends(get_db)
):
    q = db.query(models.Mensaje)
    
    if group_id:
        messages = q.filter(models.Mensaje.grupo_id == group_id)
    elif user1_id and user2_id:
        messages = q.filter(
            or_(
                and_(models.Mensaje.emisor_id == user1_id, models.Mensaje.receptor_id == user2_id),
                and_(models.Mensaje.emisor_id == user2_id, models.Mensaje.receptor_id == user1_id)
            )
        )
    else:
        raise HTTPException(status.HTTP_400_BAD_REQUEST,
                            detail="You must provide group_id or both user IDs")
    
    return messages.order_by(models.Mensaje.fecha_envio.desc()).offset(offset).limit(limit).all()

@router.put("/{message_id}/read")
async def mark_message_as_read(message_id: int, user_id: int, db: Session = Depends(get_db)):
    """Mark a message as read and notify the sender"""
    message = db.query(models.Mensaje).filter(models.Mensaje.id == message_id).first()
    
    if not message:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Message not found")
    
    # Update message status
    message.estado_lectura = "leído"
    db.commit()
    
    # Send read receipt to sender via WebSocket
    asyncio.create_task(manager.send_personal_message({
        "type": "read_receipt",
        "message_id": message_id,
        "read_by": user_id,
        "timestamp": datetime.now().isoformat()
    }, message.emisor_id))
    
    return {"status": "success", "message": "Message marked as read"}

@router.get("/conversations/{user_id}")
def get_user_conversations(user_id: int, db: Session = Depends(get_db)):
    """Get all conversations for a user (both direct and group chats)"""
    # Get direct message conversations
    direct_conversations = db.query(models.Mensaje).filter(
        or_(
            models.Mensaje.emisor_id == user_id,
            models.Mensaje.receptor_id == user_id
        )
    ).distinct(models.Mensaje.receptor_id, models.Mensaje.emisor_id).all()
    
    # Get group conversations
    group_conversations = db.query(models.Mensaje).filter(
        models.Mensaje.grupo_id.isnot(None)
    ).join(models.Pertenece, models.Mensaje.grupo_id == models.Pertenece.grupo_id).filter(
        models.Pertenece.usuario_id == user_id
    ).distinct(models.Mensaje.grupo_id).all()
    
    conversations = []
    
    # Process direct conversations
    for msg in direct_conversations:
        other_user_id = msg.receptor_id if msg.emisor_id == user_id else msg.emisor_id
        conversations.append({
            "type": "direct",
            "user_id": other_user_id,
            "last_message": msg,
            "unread_count": db.query(models.Mensaje).filter(
                models.Mensaje.emisor_id == other_user_id,
                models.Mensaje.receptor_id == user_id,
                models.Mensaje.estado_lectura == "no_leído"
            ).count()
        })
    
    # Process group conversations
    for msg in group_conversations:
        conversations.append({
            "type": "group",
            "group_id": msg.grupo_id,
            "last_message": msg,
            "unread_count": db.query(models.Mensaje).filter(
                models.Mensaje.grupo_id == msg.grupo_id,
                models.Mensaje.emisor_id != user_id,
                models.Mensaje.estado_lectura == "no_leído"
            ).count()
        })
    
    return conversations

@router.get("/realtime/{user_id}")
async def get_realtime_messages(user_id: int, db: Session = Depends(get_db)):
    """Get real-time message updates for a user"""
    # Get unread messages for the user
    unread_messages = db.query(models.Mensaje).filter(
        models.Mensaje.receptor_id == user_id,
        models.Mensaje.estado_lectura == "no_leído"
    ).all()
    
    # Get group messages where user is member
    group_messages = db.query(models.Mensaje).join(
        models.Pertenece, models.Mensaje.grupo_id == models.Pertenece.grupo_id
    ).filter(
        models.Pertenece.usuario_id == user_id,
        models.Mensaje.emisor_id != user_id,
        models.Mensaje.estado_lectura == "no_leído"
    ).all()
    
    return {
        "direct_messages": unread_messages,
        "group_messages": group_messages,
        "online_users": manager.get_online_users()
    }
