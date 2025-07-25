from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app import models, schemas, database
from passlib.context import CryptContext

router = APIRouter()

@router.get("/", response_model=List[schemas.UsuarioOut])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Usuario).offset(skip).limit(limit).all()


@router.get("/search", response_model=List[schemas.UsuarioOut])
def search_users(
    q: str = Query(..., min_length=1, description="Término de búsqueda"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(database.get_db)
):
    """
    Busca usuarios cuyo nombre, apellido o email coincidan parcialmente con el término `q`.
    """
    pattern = f"%{q}%"
    resultados = (
        db.query(models.Usuario)
            .filter(
                or_(
                    models.Usuario.nombre.ilike(pattern),
                    models.Usuario.apellido.ilike(pattern),
                    models.Usuario.email.ilike(pattern),
                )
            )
        .offset(skip)
        .limit(limit)
        .all()
    )
    return resultados