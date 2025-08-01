-- =======================
-- Base de Datos Simplificada sin Autenticación
-- Sistema de Mensajería Instantánea - Prototipo
-- =======================

-- Eliminar tablas existentes (incluyendo autenticación)
DROP TABLE IF EXISTS contenido CASCADE;
DROP TABLE IF EXISTS mensaje CASCADE;
DROP TABLE IF EXISTS pertenece CASCADE;
DROP TABLE IF EXISTS grupo CASCADE;
DROP TABLE IF EXISTS amistad CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS tipoarchivo CASCADE;
DROP TABLE IF EXISTS tipocontenido CASCADE;
DROP TABLE IF EXISTS sesion CASCADE;

-- Tabla de usuarios
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    image_url TEXT,
    contrasena_hash VARCHAR(128) not null default 'user'
);
CREATE INDEX idx_usuario_nombre ON usuario (nombre);
CREATE INDEX idx_usuario_apellido ON usuario (apellido);
CREATE INDEX idx_usuario_email ON usuario (email);

-- Tabla de amistades
CREATE TABLE amistad (
    usuario_id INT REFERENCES usuario(id) ON DELETE CASCADE,
    amigo_id   INT REFERENCES usuario(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, amigo_id)
);
-- Agregar columna 'status' si no existe
ALTER TABLE "amistad"
ADD COLUMN IF NOT EXISTS estado VARCHAR(10) NOT NULL DEFAULT 'pending';

-- Agregar columna 'created_at' si no existe
ALTER TABLE "amistad"
ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Agregar columna 'updated_at' si no existe
ALTER TABLE "amistad"
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Tabla de grupos
CREATE TABLE grupo (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    creador_id     INT REFERENCES usuario(id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    imagen_url     TEXT
);
ALTER TABLE grupo
ADD COLUMN IF NOT EXISTS invite_token VARCHAR(36) UNIQUE DEFAULT gen_random_uuid();


-- Miembros del grupo
CREATE TABLE pertenece (
    grupo_id   INT REFERENCES grupo(id) ON DELETE CASCADE,
    usuario_id INT REFERENCES usuario(id) ON DELETE CASCADE,
    PRIMARY KEY (grupo_id, usuario_id)
);

ALTER TABLE pertenece
ADD COLUMN IF NOT EXISTS role VARCHAR(10) NOT NULL DEFAULT 'member';



-- Tabla de mensajes
CREATE TABLE mensaje (
    id             SERIAL PRIMARY KEY,
    emisor_id      INT REFERENCES usuario(id) ON DELETE SET NULL,
    receptor_id    INT REFERENCES usuario(id) ON DELETE SET NULL,
    grupo_id       INT REFERENCES grupo(id) ON DELETE CASCADE,
    fecha_envio    TIMESTAMP DEFAULT NOW(),
    estado_envio   VARCHAR(20) DEFAULT 'enviado',
    estado_lectura VARCHAR(20) DEFAULT 'no_leído'
);
ALTER TABLE mensaje
ADD COLUMN IF NOT EXISTS reply_to_id INT REFERENCES mensaje(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS reaccion (
    id          SERIAL PRIMARY KEY,
    mensaje_id  INT   REFERENCES mensaje(id) ON DELETE CASCADE,
    usuario_id  INT   REFERENCES usuario(id) ON DELETE CASCADE,
    tipo        VARCHAR(50) NOT NULL,    -- e.g. '👍','❤️'
    fecha       TIMESTAMPTZ DEFAULT NOW()
);
-- Contenido del mensaje
CREATE TABLE contenido (
    id             SERIAL PRIMARY KEY,
    mensaje_id     INT REFERENCES mensaje(id) ON DELETE CASCADE,
    tipo_contenido VARCHAR(20) NOT NULL, -- texto, imagen, archivo, etc.
    tipo_archivo   VARCHAR(20),           -- opcional si es archivo
    texto          TEXT,
    archivo_url    TEXT
);

-- Catálogo de tipos de contenido
CREATE TABLE tipocontenido (
    id          VARCHAR(10) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

-- Catálogo de tipos de archivo
CREATE TABLE tipoarchivo (
    id          VARCHAR(10) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);
