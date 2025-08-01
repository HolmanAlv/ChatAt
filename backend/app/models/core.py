import uuid
from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Usuario(Base):
    __tablename__ = 'usuario'
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    fecha_registro = Column(TIMESTAMP(timezone=True), server_default=func.now())
    image_url = Column(Text)
    contrasena_hash = Column(String(128), nullable=False)

    # Solicitudes de amistad que este usuario ha enviado
    amistades_enviadas = relationship(
        'Amistad',
        foreign_keys='Amistad.usuario_id',
        back_populates='usuario',
        cascade='all, delete-orphan'
    )
    # Solicitudes de amistad que este usuario ha recibido
    amistades_recibidas = relationship(
        'Amistad',
        foreign_keys='Amistad.amigo_id',
        back_populates='amigo',
        cascade='all, delete-orphan'
    )

    grupos = relationship('Pertenece', back_populates='usuario', cascade='all, delete')
    mensajes_enviados = relationship(
        'Mensaje',
        back_populates='emisor',
        foreign_keys='Mensaje.emisor_id'
    )
    mensajes_recibidos = relationship(
        'Mensaje',
        back_populates='receptor',
        foreign_keys='Mensaje.receptor_id'
    )

class Amistad(Base):
    __tablename__ = 'amistad'
    usuario_id = Column(Integer, ForeignKey('usuario.id', ondelete='CASCADE'), primary_key=True)
    amigo_id   = Column(Integer, ForeignKey('usuario.id', ondelete='CASCADE'), primary_key=True)
    estado      = Column(String(10), nullable=False, default='pending')    # pending | accepted | rejected
    fecha_creacion  = Column(TIMESTAMP(timezone=True), server_default=func.now())
    fecha_actualizacion  = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    usuario = relationship(
        'Usuario',
        foreign_keys=[usuario_id],
        back_populates='amistades_enviadas'
    )
    amigo = relationship(
        'Usuario',
        foreign_keys=[amigo_id],
        back_populates='amistades_recibidas'
    )

class Grupo(Base):
    __tablename__ = 'grupo'
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    creador_id = Column(Integer, ForeignKey('usuario.id', ondelete='SET NULL'))
    fecha_creacion = Column(TIMESTAMP(timezone=True), server_default=func.now())
    imagen_url = Column(Text)
    invite_token  = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    
    creador = relationship('Usuario')
    miembros = relationship('Pertenece', back_populates='grupo', cascade='all, delete')
    mensajes = relationship('Mensaje', back_populates='grupo')

class Pertenece(Base):
    __tablename__ = 'pertenece'
    grupo_id = Column(Integer, ForeignKey('grupo.id', ondelete='CASCADE'), primary_key=True)
    usuario_id = Column(Integer, ForeignKey('usuario.id', ondelete='CASCADE'), primary_key=True)
    role       = Column(String(10), nullable=False, default='member')
    
    grupo = relationship('Grupo', back_populates='miembros')
    usuario = relationship('Usuario', back_populates='grupos')

class Mensaje(Base):
    __tablename__ = 'mensaje'
    id = Column(Integer, primary_key=True, index=True)
    emisor_id = Column(Integer, ForeignKey('usuario.id', ondelete='SET NULL'))
    receptor_id = Column(Integer, ForeignKey('usuario.id', ondelete='SET NULL'))
    grupo_id = Column(Integer, ForeignKey('grupo.id', ondelete='CASCADE'), nullable=True)
    fecha_envio = Column(TIMESTAMP(timezone=True), server_default=func.now())
    estado_envio = Column(String(20), default='enviado')
    estado_lectura = Column(String(20), default='no_leído')
    reply_to_id    = Column(Integer, ForeignKey('mensaje.id', ondelete='SET NULL'), nullable=True)
    
    # Relaciones
    emisor    = relationship('Usuario', foreign_keys=[emisor_id])
    receptor  = relationship('Usuario', foreign_keys=[receptor_id])
    grupo     = relationship('Grupo')
    reply_to  = relationship('Mensaje', remote_side=[id])
    reacciones = relationship('Reaccion', back_populates='mensaje', cascade='all, delete')
    contenidos = relationship('Contenido', back_populates='mensaje', cascade='all, delete')

class Reaccion(Base):
    __tablename__ = 'reaccion'
    id          = Column(Integer, primary_key=True, index=True)
    mensaje_id  = Column(Integer, ForeignKey('mensaje.id', ondelete='CASCADE'))
    usuario_id  = Column(Integer, ForeignKey('usuario.id', ondelete='CASCADE'))
    tipo        = Column(String(50), nullable=False)
    fecha       = Column(TIMESTAMP(timezone=True), server_default=func.now())

    mensaje = relationship('Mensaje', back_populates='reacciones')
    usuario = relationship('Usuario')

class Contenido(Base):
    __tablename__ = 'contenido'
    id = Column(Integer, primary_key=True, index=True)
    mensaje_id = Column(Integer, ForeignKey('mensaje.id', ondelete='CASCADE'))
    tipo_contenido = Column(String(20), nullable=False)
    tipo_archivo = Column(String(20))
    texto = Column(Text)
    archivo_url = Column(Text)
    
    mensaje = relationship('Mensaje', back_populates='contenidos')

class TipoContenido(Base):
    __tablename__ = 'tipocontenido'
    id = Column(String(10), primary_key=True)
    descripcion = Column(String(50), nullable=False)

class TipoArchivo(Base):
    __tablename__ = 'tipoarchivo'
    id = Column(String(10), primary_key=True)
    descripcion = Column(String(50), nullable=False)