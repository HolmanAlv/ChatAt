from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import schemas, models
from app.database import get_db
from sqlalchemy.orm import joinedload

router = APIRouter()

@router.get("/{user_id}/all", response_model=List[schemas.UsuarioOut])
def get_user_friends(user_id: int, db: Session = Depends(get_db)):
    """
    Devuelve todos los usuarios con los que user_id tiene amistad aceptada.
    Considera ambas direcciones de la relación para que sea simétrica.
    """
    # Verificar que el usuario exista
    me = db.query(models.Usuario).get(user_id)
    if not me:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    # Relaciones donde yo soy quien envió y fue aceptada
    sent = (
        db.query(models.Amistad)
            .filter_by(usuario_id=user_id, estado="accepted")
            .all()
    )
    # Relaciones donde yo soy quien recibió y fue aceptada
    rec = (
        db.query(models.Amistad)
            .filter_by(amigo_id=user_id, estado="accepted")
            .all()
    )

    # Consolidar IDs de amigos
    friend_ids = [rel.amigo_id for rel in sent] + [rel.usuario_id for rel in rec]
    if not friend_ids:
        return []

    # Obtener datos de los usuarios amigos
    amigos = db.query(models.Usuario).filter(models.Usuario.id.in_(friend_ids)).all()
    return amigos



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

@router.get("/incoming/{user_id}", response_model=List[schemas.AmistadDetail])
def list_incoming(user_id: int, db: Session = Depends(get_db)):
    """
    Solicitudes de amistad pendientes recibidas por el usuario con detalles del solicitante y receptor
    """
    return (
        db.query(models.Amistad)
        .options(joinedload(models.Amistad.usuario), joinedload(models.Amistad.amigo))
        .filter(models.Amistad.amigo_id == user_id, models.Amistad.estado == "pending")
        .all()
    )


@router.get("/sent/{user_id}")
def list_sent(user_id: int, db: Session = Depends(get_db)):
    """
    Devuelve las solicitudes enviadas por el usuario con nombre y apellido del receptor
    """
    solicitudes = (
        db.query(models.Amistad, models.Usuario)
        .join(models.Usuario, models.Amistad.amigo_id == models.Usuario.id)
        .filter(models.Amistad.usuario_id == user_id)
        .all()
    )
    result = []
    for amistad, usuario in solicitudes:
        result.append({
            "amigo_id": usuario.id,
            "amigo_nombre": usuario.nombre,
            "amigo_apellido": usuario.apellido,
            "estado": amistad.estado
        })
    return result

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