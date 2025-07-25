from pydantic import BaseModel
from typing import Literal, Optional, List
from datetime import datetime

# Usuario
class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    email: str
    image_url: Optional[str]
    

class UsuarioCreate(UsuarioBase):
    nombre: str
    apellido: str
    email: str
    password: str
    image_url: Optional[str]

class UsuarioOut(UsuarioBase):
    id: int
    fecha_registro: datetime
    class Config:
        orm_mode = True

# Amistad
typing_import = "List[int]"  # helper placeholder
class AmistadBase(BaseModel):
    usuario_id: int
    amigo_id: int

class AmistadCreate(AmistadBase):
    pass

class AmistadUpdate(BaseModel):
    estado: Literal['accepted', 'rejected']

class AmistadOut(AmistadBase):
    usuario_id: int
    amigo_id: int
    estado: str
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    class Config:
        orm_mode = True

# Grupo
class GrupoBase(BaseModel):
    nombre: str
    imagen_url: Optional[str]

class GrupoCreate(GrupoBase):
    pass

class GrupoOut(GrupoBase):
    id: int
    creador_id: Optional[int]
    fecha_creacion: datetime
    class Config:
        orm_mode = True

# Mensaje
class MensajeBase(BaseModel):
    emisor_id: Optional[int]
    receptor_id: Optional[int]
    grupo_id: Optional[int]
    estado_envio: Optional[str]
    estado_lectura: Optional[str]

class MensajeCreate(MensajeBase):
    texto: Optional[str]
    contenidos: Optional[List[int]] = []

class MensajeOut(MensajeBase):
    id: int
    fecha_envio: datetime
    class Config:
        orm_mode = True

# Contenido
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
        orm_mode = True


# Login / Auth
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
        orm_mode = True