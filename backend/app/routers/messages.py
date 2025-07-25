from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional

from app import schemas, models
from app.database import get_db

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
    return new

@router.get("/", response_model=List[schemas.MensajeOut])
def list_messages(
    user1_id: Optional[int] = None,
    user2_id: Optional[int] = None,
    group_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    q = db.query(models.Mensaje)
    if group_id:
        msgs = q.filter(models.Mensaje.grupo_id == group_id)
    elif user1_id and user2_id:
        msgs = q.filter(
            or_(
                and_(models.Mensaje.emisor_id == user1_id, models.Mensaje.receptor_id == user2_id),
                and_(models.Mensaje.emisor_id == user2_id, models.Mensaje.receptor_id == user1_id)
            )
        )
    else:
        raise HTTPException(status.HTTP_400_BAD_REQUEST,
                            detail="Debes proporcionar group_id o ambos user IDs")
    return msgs.order_by(models.Mensaje.fecha_envio).all()
