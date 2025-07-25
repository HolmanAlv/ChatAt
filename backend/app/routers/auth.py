from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.schemas import LoginIn, LoginOut
from app import schemas, database, models

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/login", response_model=LoginOut)
def login(data: LoginIn, db: Session = Depends(database.get_db)):
    # 1. Buscar usuario por email
    user = db.query(models.Usuario).filter(models.Usuario.email == data.email).first()
    if not user:
        # no existe cuenta
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    # 2. Verificar contraseña con el hash guardado
    if not pwd_context.verify(data.password, user.contrasena_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    # 3. Retornar datos del usuario
    return user


@router.post("/register", response_model=schemas.UsuarioOut, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UsuarioCreate, db: Session = Depends(database.get_db)):
    
    if db.query(models.Usuario).filter(models.Usuario.email == user.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email ya registrado"
        )
    
    hashed = pwd_context.hash(user.password)


    new_user = models.Usuario(
        nombre=user.nombre,
        apellido=user.apellido,
        email=user.email,
        contrasena_hash=hashed,
        image_url=user.image_url
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user