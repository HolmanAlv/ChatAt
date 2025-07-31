-- =======================
-- Base de Datos Simplificada sin Autenticación
-- Sistema de Mensajería Instantánea - Prototipo
-- =======================

-- Eliminar tablas existentes
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
CREATE TABLE IF NOT EXISTS usuario (
    id               SERIAL PRIMARY KEY,
    nombre           VARCHAR(50)   NOT NULL,
    apellido         VARCHAR(50)   NOT NULL,
    email            VARCHAR(100)  NOT NULL UNIQUE,
    fecha_registro   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    image_url        TEXT,
    contrasena_hash  VARCHAR(128)  NOT NULL DEFAULT 'user'
);

CREATE INDEX IF NOT EXISTS idx_usuario_nombre   ON usuario (nombre);
CREATE INDEX IF NOT EXISTS idx_usuario_apellido ON usuario (apellido);

-- Tabla de amistades
CREATE TABLE IF NOT EXISTS amistad (
    usuario_id        INT           NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    amigo_id          INT           NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    estado            VARCHAR(10)   NOT NULL DEFAULT 'pending',
    fecha_creacion    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, amigo_id)
);

-- Tabla de grupos
CREATE TABLE IF NOT EXISTS grupo (
    id               SERIAL       PRIMARY KEY,
    nombre           VARCHAR(100) NOT NULL,
    creador_id       INT          REFERENCES usuario(id) ON DELETE SET NULL,
    fecha_creacion   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    imagen_url       TEXT,
    invite_token     UUID         UNIQUE DEFAULT gen_random_uuid()
);

-- Miembros del grupo
CREATE TABLE IF NOT EXISTS pertenece (
    grupo_id   INT    NOT NULL REFERENCES grupo(id) ON DELETE CASCADE,
    usuario_id INT    NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    role       VARCHAR(10) NOT NULL DEFAULT 'member',
    PRIMARY KEY (grupo_id, usuario_id)
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS mensaje (
    id               SERIAL       PRIMARY KEY,
    emisor_id        INT          REFERENCES usuario(id) ON DELETE SET NULL,
    receptor_id      INT          REFERENCES usuario(id) ON DELETE SET NULL,
    grupo_id         INT          REFERENCES grupo(id)   ON DELETE CASCADE,
    fecha_envio      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    estado_envio     VARCHAR(20)  NOT NULL DEFAULT 'enviado',
    estado_lectura   VARCHAR(20)  NOT NULL DEFAULT 'no_leído'
);

-- Contenido del mensaje
CREATE TABLE IF NOT EXISTS contenido (
    id               SERIAL      PRIMARY KEY,
    mensaje_id       INT         NOT NULL REFERENCES mensaje(id) ON DELETE CASCADE,
    tipo_contenido   VARCHAR(20) NOT NULL,
    tipo_archivo     VARCHAR(20),
    texto            TEXT,
    archivo_url      TEXT
);

-- Catálogo de tipos de contenido
CREATE TABLE IF NOT EXISTS tipocontenido (
    id          VARCHAR(10) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

-- Catálogo de tipos de archivo
CREATE TABLE IF NOT EXISTS tipoarchivo (
    id          VARCHAR(10) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);
