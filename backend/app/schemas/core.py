from pydantic import BaseModel
from typing import Literal, Optional, List
from datetime import datetime

# =======================
# USUARIO
# =======================
class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    email: str
    image_url: Optional[str]


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioOut(UsuarioBase):
    id: int
    fecha_registro: datetime

    class Config:
        from_attributes = True

# =======================
# AMISTAD
# =======================
class AmistadBase(BaseModel):
    usuario_id: int
    amigo_id: int


class AmistadCreate(AmistadBase):
    estado: Optional[str] = "pending"  # Por defecto


class AmistadUpdate(BaseModel):
    estado: Literal['accepted', 'rejected']


class AmistadOut(AmistadBase):
    estado: str
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    class Config:
        from_attributes = True

# NUEVO: para mostrar detalle de usuario y amigo en una sola respuesta
class AmistadDetail(BaseModel):
    usuario_id: int
    amigo_id: int
    estado: str
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    usuario: UsuarioOut
    amigo: UsuarioOut

    class Config:
        from_attributes = True

# =======================
# GRUPO
# =======================
class MiembroOut(BaseModel):
    usuario_id: int
    role: str

    class Config:
        from_attributes = True


class GrupoBase(BaseModel):
    nombre: str
    imagen_url: Optional[str]


class GrupoCreate(BaseModel):
    nombre: str
    creador_id: int
    imagen_url: Optional[str] = None
    miembros: Optional[List[int]] = []


class GrupoOut(BaseModel):
    id: int
    nombre: str
    creador_id: Optional[int]
    fecha_creacion: datetime
    imagen_url: Optional[str]
    invite_token: str

    class Config:
        from_attributes = True


class GrupoDetail(GrupoOut):
    miembros: List[MiembroOut]

# =======================
# CONTENIDO
# =======================
class ContenidoBase(BaseModel):
    mensaje_id: int
    tipo_contenido: str
    tipo_archivo: Optional[str]
    texto: Optional[str]
    archivo_url: Optional[str]


class ContenidoCreate(ContenidoBase):
    pass


class ContenidoOut(ContenidoBase):
    id: int

    class Config:
        from_attributes = True


# =======================
# MENSAJE
# =======================
class ReaccionOut(BaseModel):
    usuario_id: int
    tipo: str
    fecha: datetime

    class Config:
        from_attributes = True


class MensajeBase(BaseModel):
    emisor_id: int
    receptor_id: Optional[int]
    grupo_id: Optional[int]
    reply_to_id: Optional[int]
    estado_envio: Optional[str]
    estado_lectura: Optional[str]


class MensajeCreate(BaseModel):
    emisor_id: int
    receptor_id: Optional[int] = None
    grupo_id: Optional[int] = None
    texto: Optional[str] = None


class MensajeOut(BaseModel):
    id: int
    emisor_id: int
    emisor_nombre: Optional[str] = None
    receptor_id: Optional[int]
    grupo_id: Optional[int]
    reply_to_id: Optional[int]
    fecha_envio: datetime
    estado_envio: str
    estado_lectura: str
    texto: Optional[str] = None
    contenidos: List[ContenidoOut] = []

    class Config:
        from_attributes = True

# =======================
# LOGIN / AUTH
# =======================
class LoginIn(BaseModel):
    email: str
    password: str


class LoginOut(BaseModel):
    id: int
    nombre: str
    apellido: str
    email: str
    image_url: str | None

    class Config:
        from_attributes = True