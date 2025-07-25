from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import schemas, models
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.GrupoOut, status_code=status.HTTP_201_CREATED)
def create_group(gr: schemas.GrupoCreate, db: Session = Depends(get_db)):
    # Verificar creador
    if not db.query(models.Usuario).get(gr.creador_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Usuario creador no existe")
    new = models.Grupo(**gr.dict())
    db.add(new)
    db.commit()
    db.refresh(new)
    # Agregar al creador como miembro automático
    membership = models.Pertenece(grupo_id=new.id, usuario_id=gr.creador_id)
    db.add(membership)
    db.commit()
    return new

@router.get("/", response_model=List[schemas.GrupoOut])
def list_groups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Grupo).offset(skip).limit(limit).all()

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

@router.delete("/{group_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(group_id: int, user_id: int, db: Session = Depends(get_db)):
    m = db.query(models.Pertenece).get((group_id, user_id))
    if not m:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Miembro no encontrado")
    db.delete(m)
    db.commit()
