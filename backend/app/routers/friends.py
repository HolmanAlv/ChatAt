from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import schemas, models
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.AmistadOut, status_code=status.HTTP_201_CREATED)
def send_request(req: schemas.AmistadCreate, db: Session = Depends(get_db)):
    if req.usuario_id == req.amigo_id:
        raise HTTPException(400, "No puedes invitarte a ti mismo")
    exists = db.query(models.Amistad).filter_by(
        usuario_id=req.usuario_id, amigo_id=req.amigo_id
    ).first()
    if exists:
        raise HTTPException(400, "Ya existe una solicitud")
    # Verificar que ambos usuarios existen
    if not db.query(models.Usuario).get(req.usuario_id) or not db.query(models.Usuario).get(req.amigo_id):
        raise HTTPException(404, "Usuario no encontrado")
    fr = models.Amistad(**req.dict())
    db.add(fr)
    db.commit()
    db.refresh(fr)
    # TODO: aquí puedes publicar en Redis o WebSocket para notificar al receptor
    return fr

@router.get("/incoming/{user_id}", response_model=List[schemas.AmistadOut])
def list_incoming(user_id: int, db: Session = Depends(get_db)):
    """Solicitudes PENDING dirigidas al usuario"""
    return db.query(models.Amistad).filter_by(
        amigo_id=user_id, estado="pending"
    ).all()

@router.get("/sent/{user_id}", response_model=List[schemas.AmistadOut])
def list_sent(user_id: int, db: Session = Depends(get_db)):
    """Solicitudes enviadas por el usuario (cualquier estado)"""
    return db.query(models.Amistad).filter_by(usuario_id=user_id).all()

@router.patch("/{usuario_id}/{amigo_id}", response_model=schemas.AmistadOut)
def respond_request(
    usuario_id: int,
    amigo_id: int,
    upd: schemas.AmistadUpdate,
    db: Session = Depends(get_db)
):
    fr = db.query(models.Amistad).filter_by(
        usuario_id=usuario_id, amigo_id=amigo_id
    ).first()
    if not fr:
        raise HTTPException(404, "Solicitud no encontrada")
    if fr.estado != "pending":
        raise HTTPException(400, "Solicitud ya procesada")
    
    
    """
    dentro del body se puede enviar el estado como 'accepted' o 'rejected'
    y se actualiza la solicitud de amistad con el nuevo estado.
    """
    fr.estado = upd.estado
    db.commit()
    db.refresh(fr)
    # Si fue aceptada, podrías enviar un mensaje de bienvenida automático:
    # if upd.estado == "accepted": crear_mensaje_bienvenida(...)
    return fr


@router.post("/{usuario_id}/{amigo_id}/accept", response_model=schemas.AmistadOut, status_code=status.HTTP_200_OK)
def accept_friend_request(
    usuario_id: int,
    amigo_id: int,
    db: Session = Depends(get_db)
):
    # 1. Recuperar la solicitud pendiente
    fr = (
        db.query(models.Amistad)
            .filter_by(usuario_id=usuario_id, amigo_id=amigo_id)
            .first()
    )
    if not fr:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    if fr.estado != "pending":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Solicitud ya procesada")
    # 2. Marcar como aceptada
    fr.estado = "accepted"
    db.commit()
    db.refresh(fr)
    return fr

@router.post("/{usuario_id}/{amigo_id}/reject", response_model=schemas.AmistadOut, status_code=status.HTTP_200_OK)
def reject_friend_request(
    usuario_id: int,
    amigo_id: int,
    db: Session = Depends(get_db)
):
    fr = (
        db.query(models.Amistad)
            .filter_by(usuario_id=usuario_id, amigo_id=amigo_id)
            .first()
    )
    if not fr:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    if fr.estado != "pending":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Solicitud ya procesada")
    # 1. Marcar como rechazada
    fr.estado = "rejected"
    db.commit()
    db.refresh(fr)
    return fr