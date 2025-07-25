from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app import schemas, models
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.ContenidoOut, status_code=status.HTTP_201_CREATED)
def upload_content(
    mensaje_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    msg = db.query(models.Mensaje).get(mensaje_id)
    if not msg:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Mensaje no encontrado")
    # Aquí podrías guardar el archivo en disco o en la nube.
    file_url = f"/static/{file.filename}"
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
