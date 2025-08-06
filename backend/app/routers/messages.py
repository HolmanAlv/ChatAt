from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
import asyncio
from sqlalchemy.orm import joinedload

from app import schemas, models
from app.database import get_db
from app.routers.ws import manager

router = APIRouter()

@router.post("/", response_model=schemas.MensajeOut, status_code=status.HTTP_201_CREATED)
def create_message(msg: schemas.MensajeCreate, db: Session = Depends(get_db)):
    # Validar emisores/receptores
    if not db.query(models.Usuario).get(msg.emisor_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Emisor no existe")
    if msg.receptor_id and not db.query(models.Usuario).get(msg.receptor_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Receptor no existe")
    if msg.grupo_id and not db.query(models.Grupo).get(msg.grupo_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Grupo no existe")

    new = models.Mensaje(
        emisor_id=msg.emisor_id,
        receptor_id=msg.receptor_id,
        grupo_id=msg.grupo_id,
        estado_envio="enviado",
        estado_lectura="no_leído"
    )
    db.add(new)
    db.commit()
    db.refresh(new)

    # Si viene texto, creamos contenido asociado
    if msg.texto:
        c = models.Contenido(
            mensaje_id=new.id,
            tipo_contenido="texto",
            texto=msg.texto
        )
        db.add(c)
        db.commit()

    # Determinar destinatarios WS (para futuro uso)
    targets = []
    if new.receptor_id:
        targets = [new.receptor_id]
    elif new.grupo_id:
        targets = [p.usuario_id for p in db.query(models.Pertenece)
                                     .filter_by(grupo_id=new.grupo_id)]
    # Enviar notificación WS (si manager está activo)
    message_data = schemas.MensajeOut.from_orm(new).dict()
    asyncio.create_task(manager.send(targets, message_data))

    return new


@router.get("/", response_model=List[schemas.MensajeOut])
def list_messages(
    user1_id: Optional[int] = None,
    user2_id: Optional[int] = None,
    group_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    q = db.query(models.Mensaje).options(joinedload(models.Mensaje.emisor))
    if group_id:
        q = q.filter(models.Mensaje.grupo_id == group_id)
    elif user1_id and user2_id:
        q = q.filter(
            or_(
                and_(models.Mensaje.emisor_id == user1_id, models.Mensaje.receptor_id == user2_id),
                and_(models.Mensaje.emisor_id == user2_id, models.Mensaje.receptor_id == user1_id)
            )
        )
    else:
        raise HTTPException(status.HTTP_400_BAD_REQUEST,
                            detail="Debes proporcionar group_id o ambos user IDs")

    mensajes = q.order_by(models.Mensaje.fecha_envio).all()

    resultado = []
    for m in mensajes:
        contenido_texto = db.query(models.Contenido).filter_by(
            mensaje_id=m.id, tipo_contenido="texto"
        ).first()
        resultado.append({
            "id": m.id,
            "emisor_id": m.emisor_id,
            "emisor_nombre": f"{m.emisor.nombre} {m.emisor.apellido}" if m.emisor else None,
            "receptor_id": m.receptor_id,
            "grupo_id": m.grupo_id,
            "reply_to_id": m.reply_to_id,
            "fecha_envio": m.fecha_envio,
            "estado_envio": m.estado_envio,
            "estado_lectura": m.estado_lectura,
            "texto": contenido_texto.texto if contenido_texto else None
        })
    return resultado
