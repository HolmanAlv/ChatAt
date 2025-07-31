import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import schemas, models
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.GrupoDetail, status_code=status.HTTP_201_CREATED)
def create_group(gr: schemas.GrupoCreate, db: Session = Depends(get_db)):
    # 1. Verificar que el creador existe
    creador = db.query(models.Usuario).get(gr.creador_id)
    if not creador:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Usuario creador no existe")

    # 2. Generar token de invitación
    token = secrets.token_urlsafe(16)

    # 3. Crear grupo excluyendo 'miembros' y usando invite_token
    group = models.Grupo(
        nombre=gr.nombre,
        creador_id=gr.creador_id,
        imagen_url=gr.imagen_url,
        invite_token=token
    )
    db.add(group)
    db.commit()
    db.refresh(group)

    # 4. Agregar creador como admin
    db.add(models.Pertenece(grupo_id=group.id, usuario_id=gr.creador_id, role="admin"))

    # 5. Agregar miembros iniciales solo si la amistad está aceptada
    for user_id in gr.miembros:
        from sqlalchemy import and_, or_
        fr = db.query(models.Amistad).filter(
            or_(
                and_(models.Amistad.usuario_id == gr.creador_id, models.Amistad.amigo_id == user_id),
                and_(models.Amistad.usuario_id == user_id, models.Amistad.amigo_id == gr.creador_id)
            ),
            models.Amistad.estado == "accepted"
        ).first()
        if fr:
            db.add(models.Pertenece(grupo_id=group.id, usuario_id=user_id, role="member"))
    db.commit()

    # 6. Preparar detalle de grupo con miembros
    members = db.query(models.Pertenece).filter_by(grupo_id=group.id).all()
    return schemas.GrupoDetail(
        id=group.id,
        nombre=group.nombre,
        creador_id=group.creador_id,
        fecha_creacion=group.fecha_creacion,
        imagen_url=group.imagen_url,
        invite_token=group.invite_token,
        miembros=[schemas.MiembroOut(usuario_id=m.usuario_id, role=m.role) for m in members]
    )

@router.get("/", response_model=List[schemas.GrupoOut])
def list_user_groups(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Grupo)
            .join(models.Pertenece)
            .filter(models.Pertenece.usuario_id == user_id)
            .all()
    )

@router.post("/{group_id}/members/{user_id}", status_code=status.HTTP_201_CREATED)
def add_member(group_id: int, user_id: int, db: Session = Depends(get_db)):
    group = db.query(models.Grupo).get(group_id)
    user = db.query(models.Usuario).get(user_id)
    if not group or not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Grupo o usuario no encontrado")
    exists = db.query(models.Pertenece).get((group_id, user_id))
    if exists:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Ya es miembro del grupo")
    m = models.Pertenece(grupo_id=group_id, usuario_id=user_id)
    db.add(m)
    db.commit()
    return {"message": "Usuario agregado al grupo"}

@router.post("/join/{token}", response_model=schemas.MiembroOut, status_code=status.HTTP_201_CREATED)
def join_by_token(token: str, user_id: int, db: Session = Depends(get_db)):
    group = db.query(models.Grupo).filter_by(invite_token=token).first()
    if not group:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Token inválido")
    exists = db.query(models.Pertenece).get((group.id, user_id))
    if exists:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Ya eres miembro")
    membership = models.Pertenece(grupo_id=group.id, usuario_id=user_id, role="member")
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership

#TODO filtrar que quien elimina sea admin
@router.delete("/{group_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(group_id: int, user_id: int, db: Session = Depends(get_db)):
    m = db.query(models.Pertenece).get((group_id, user_id))
    if not m:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Miembro no encontrado")
    db.delete(m)
    db.commit()

@router.get("/{group_id}/members", response_model=List[schemas.MiembroOut])
def list_group_members(group_id: int, db: Session = Depends(get_db)):
    return db.query(models.Pertenece).filter_by(grupo_id=group_id).all()