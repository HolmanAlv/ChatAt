from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from uuid import uuid4

from app import schemas, models
from app.database import get_db

router = APIRouter()

UPLOAD_DIR = "static"

@router.post("/", response_model=schemas.ContenidoOut, status_code=status.HTTP_201_CREATED)
def upload_content(
    mensaje_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    msg = db.query(models.Mensaje).get(mensaje_id)
    if not msg:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Mensaje no encontrado")

    # Asegurar que exista la carpeta
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Guardar archivo con un nombre único para evitar colisiones
    extension = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid4().hex}{extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # URL accesible
    file_url = f"/static/{unique_name}"

    # Guardar registro en la base de datos
    content = models.Contenido(
        mensaje_id=mensaje_id,
        tipo_contenido="archivo",
        tipo_archivo=file.content_type,
        archivo_url=file_url
    )
    db.add(content)
    db.commit()
    db.refresh(content)

    return content


@router.get("/{mensaje_id}", response_model=List[schemas.ContenidoOut])
def get_contents(mensaje_id: int, db: Session = Depends(get_db)):
    contents = db.query(models.Contenido).filter(models.Contenido.mensaje_id == mensaje_id).all()
    return contents