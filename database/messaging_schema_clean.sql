
-- =======================
-- Base de Datos Simplificada
-- Sistema de Mensajería Instantánea - Prototipo
-- =======================

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
    password_hash TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    verified_at TIMESTAMP,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    image_url TEXT
);

-- Tabla de amistades
CREATE TABLE amistad (
    usuario_id INT REFERENCES usuario(id),
    amigo_id INT REFERENCES usuario(id),
    PRIMARY KEY (usuario_id, amigo_id)
);

-- Tabla de grupos
CREATE TABLE grupo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    creador_id INT REFERENCES usuario(id),
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    imagen_url TEXT
);

-- Miembros del grupo
CREATE TABLE pertenece (
    grupo_id INT REFERENCES grupo(id),
    usuario_id INT REFERENCES usuario(id),
    PRIMARY KEY (grupo_id, usuario_id)
);

-- Tabla de mensajes
CREATE TABLE mensaje (
    id SERIAL PRIMARY KEY,
    emisor_id INT REFERENCES usuario(id),
    receptor_id INT REFERENCES usuario(id),
    grupo_id INT REFERENCES grupo(id),
    fecha_envio TIMESTAMP DEFAULT NOW(),
    estado_envio VARCHAR(20) DEFAULT 'enviado',
    estado_lectura VARCHAR(20) DEFAULT 'no_leído'
);

-- Contenido del mensaje
CREATE TABLE contenido (
    id SERIAL PRIMARY KEY,
    mensaje_id INT REFERENCES mensaje(id),
    tipo_contenido VARCHAR(20) NOT NULL, -- texto, imagen, archivo, etc.
    tipo_archivo VARCHAR(20), -- opcional si es archivo
    texto TEXT,
    archivo_url TEXT
);

-- Tipos de contenido
CREATE TABLE tipocontenido (
    id VARCHAR(10) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

-- Tipos de archivo
CREATE TABLE tipoarchivo (
    id VARCHAR(10) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

-- Sesiones activas (opcional para tokens revocables)
CREATE TABLE sesion (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuario(id),
    token TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT NOW(),
    expira_en TIMESTAMP
);
