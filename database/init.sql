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








-- --------------------------------------------------
-- 10 inserts para la tabla usuario
-- --------------------------------------------------
-- contra: prueba123
INSERT INTO usuario (nombre, apellido, email, fecha_registro, image_url, contrasena_hash) VALUES
('Alice',    'García',    'alice.garcia@example.com',     '2025-07-01 09:15:00', 'https://example.com/images/alice.jpg',    '$2b$12$hlZBBs27iYhCPmZUmCk.Vel2mzWDIQ1kDRy.nqbo6wW3CYDe5WbEi'),
('Bob',      'Martínez',  'bob.martinez@example.com',     '2025-07-02 10:20:00', 'https://example.com/images/bob.jpg',      '$2b$12$hlZBBs27iYhCPmZUmCk.Vel2mzWDIQ1kDRy.nqbo6wW3CYDe5WbEi'),
('Carolina', 'López',     'carolina.lopez@example.com',   '2025-07-03 11:30:00', 'https://example.com/images/carolina.jpg', '$2b$12$hlZBBs27iYhCPmZUmCk.Vel2mzWDIQ1kDRy.nqbo6wW3CYDe5WbEi'),
('Diego',    'Fernández', 'diego.fernandez@example.com',  '2025-07-04 12:45:00', 'https://example.com/images/diego.jpg',    '$2b$12$hlZBBs27iYhCPmZUmCk.Vel2mzWDIQ1kDRy.nqbo6wW3CYDe5WbEi'),
('Elena',    'Rodríguez', 'elena.rodriguez@example.com',  '2025-07-05 14:00:00', 'https://example.com/images/elena.jpg',    '$2b$12$hlZBBs27iYhCPmZUmCk.Vel2mzWDIQ1kDRy.nqbo6wW3CYDe5WbEi'),
('Fernando', 'Sánchez',   'fernando.sanchez@example.com', '2025-07-06 15:15:00', 'https://example.com/images/fernando.jpg', '$2b$12$hlZBBs27iYhCPmZUmCk.Vel2mzWDIQ1kDRy.nqbo6wW3CYDe5WbEi'),
('Gabriela', 'Herrera',   'gabriela.herrera@example.com', '2025-07-07 16:30:00', 'https://example.com/images/gabriela.jpg', '$2b$12$hlZBBs27iYhCPmZUmCk.Vel2mzWDIQ1kDRy.nqbo6wW3CYDe5WbEi'),
('Hugo',     'Vargas',    'hugo.vargas@example.com',      '2025-07-08 17:45:00', 'https://example.com/images/hugo.jpg',     '$2b$12$hlZBBs27iYhCPmZUmCk.Vel2mzWDIQ1kDRy.nqbo6wW3CYDe5WbEi'),
('Isabel',   'Morales',   'isabel.morales@example.com',   '2025-07-09 18:55:00', 'https://example.com/images/isabel.jpg',   '$2b$12$hlZBBs27iYhCPmZUmCk.Vel2mzWDIQ1kDRy.nqbo6wW3CYDe5WbEi'),
('Javier',   'Castro',    'javier.castro@example.com',    '2025-07-10 20:00:00', 'https://example.com/images/javier.jpg',   '$2b$12$hlZBBs27iYhCPmZUmCk.Vel2mzWDIQ1kDRy.nqbo6wW3CYDe5WbEi');

-- --------------------------------------------------
-- 10 inserts para el catálogo tipocontenido
-- --------------------------------------------------
INSERT INTO tipocontenido (id, descripcion) VALUES
('texto',            'Mensaje de texto'),
('imagen',           'Mensaje de imagen'),
('archivo',          'Archivo genérico'),
('audio',            'Mensaje de audio'),
('video',            'Mensaje de video'),
('gif',              'Imagen animada GIF'),
('sticker',          'Sticker'),
('ubicacion',        'Compartir ubicación'),
('contacto',         'Compartir contacto');


-- --------------------------------------------------
-- 10 inserts para el catálogo tipoarchivo
-- --------------------------------------------------
INSERT INTO tipoarchivo (id, descripcion) VALUES
('jpg',  'Imagen JPEG'),
('png',  'Imagen PNG'),
('gif',  'Imagen GIF'),
('pdf',  'Documento PDF'),
('docx', 'Documento Word'),
('xlsx', 'Hoja de cálculo Excel'),
('mp3',  'Audio MP3'),
('mp4',  'Video MP4'),
('zip',  'Archivo ZIP'),
('svg',  'Imagen SVG');

-- --------------------------------------------------
-- 10 inserts para la tabla grupo
-- --------------------------------------------------
INSERT INTO grupo (nombre,     creador_id, fecha_creacion,         imagen_url,                                   invite_token) VALUES
('Amigos',         1,          '2025-07-01 09:00:00', 'https://example.com/grupos/amigos.png',         gen_random_uuid()),
('Familia',        2,          '2025-07-02 10:15:00', 'https://example.com/grupos/familia.png',        gen_random_uuid()),
('Trabajo',        3,          '2025-07-03 11:30:00', 'https://example.com/grupos/trabajo.png',        gen_random_uuid()),
('Proyecto X',     4,          '2025-07-04 12:45:00', 'https://example.com/grupos/proyecto_x.png',    gen_random_uuid()),
('Estudio',        5,          '2025-07-05 14:00:00', 'https://example.com/grupos/estudio.png',       gen_random_uuid()),
('Deportes',       6,          '2025-07-06 15:15:00', 'https://example.com/grupos/deportes.png',      gen_random_uuid()),
('Viaje Florencia',7,          '2025-07-07 16:30:00', 'https://example.com/grupos/viaje_florencia.png',gen_random_uuid()),
('Fotografía',     8,          '2025-07-08 17:45:00', 'https://example.com/grupos/fotografia.png',    gen_random_uuid()),
('Código',         9,          '2025-07-09 18:55:00', 'https://example.com/grupos/codigo.png',        gen_random_uuid()),
('Club Lectura',   10,         '2025-07-10 20:00:00','https://example.com/grupos/club_lectura.png', gen_random_uuid());

-- --------------------------------------------------
-- 10 inserts para la tabla amistad
-- --------------------------------------------------
INSERT INTO amistad (usuario_id, amigo_id, estado,     fecha_creacion,          fecha_actualizacion) VALUES
(1,  2,  'accepted', '2025-07-01 09:20:00', '2025-07-01 09:20:00'),
(1,  3,  'pending',  '2025-07-02 10:25:00', '2025-07-02 10:25:00'),
(2,  4,  'accepted', '2025-07-03 11:35:00', '2025-07-03 11:35:00'),
(3,  5,  'accepted', '2025-07-04 12:50:00', '2025-07-04 12:50:00'),
(4,  6,  'pending',  '2025-07-05 14:05:00', '2025-07-05 14:05:00'),
(5,  7,  'accepted', '2025-07-06 15:20:00', '2025-07-06 15:20:00'),
(6,  8,  'accepted', '2025-07-07 16:35:00', '2025-07-07 16:35:00'),
(7,  9,  'pending',  '2025-07-08 17:50:00', '2025-07-08 17:50:00'),
(8,  10, 'accepted', '2025-07-09 18:55:00', '2025-07-09 18:55:00'),
(9,  1,  'accepted', '2025-07-10 20:05:00', '2025-07-10 20:05:00');

-- --------------------------------------------------
-- 10 inserts para la tabla pertenece
-- --------------------------------------------------
INSERT INTO pertenece (grupo_id, usuario_id, role) VALUES
(1, 1, 'owner'),
(1, 2, 'member'),
(2, 2, 'owner'),
(2, 3, 'member'),
(3, 3, 'owner'),
(3, 4, 'member'),
(4, 4, 'owner'),
(4, 5, 'member'),
(5, 5, 'owner'),
(5, 6, 'member');

-- --------------------------------------------------
-- 10 inserts para la tabla mensaje
-- --------------------------------------------------
INSERT INTO mensaje (emisor_id, receptor_id, grupo_id, fecha_envio,           estado_envio,  estado_lectura) VALUES
(1,  2,    NULL,     '2025-07-10 10:00:00', 'enviado',   'leído'),
(2,  1,    NULL,     '2025-07-10 10:05:00', 'entregado','leído'),
(3,  4,    NULL,     '2025-07-10 11:00:00', 'enviado',   'no_leído'),
(4,  3,    NULL,     '2025-07-10 11:05:00', 'enviado',   'leído'),
(5,  6,    NULL,     '2025-07-10 12:00:00', 'enviado',   'no_leído'),
(1,  NULL, 1,        '2025-07-10 12:30:00', 'enviado',   'no_leído'),
(2,  NULL, 2,        '2025-07-10 13:00:00', 'enviado',   'no_leído'),
(3,  NULL, 3,        '2025-07-10 13:30:00', 'enviado',   'no_leído'),
(4,  NULL, 4,        '2025-07-10 14:00:00', 'enviado',   'no_leído'),
(5,  NULL, 5,        '2025-07-10 14:30:00', 'enviado',   'no_leído');

-- --------------------------------------------------
-- 10 inserts para la tabla contenido
-- --------------------------------------------------
INSERT INTO contenido (mensaje_id, tipo_contenido, tipo_archivo, texto,                       archivo_url) VALUES
(1,  'texto',   NULL,    'Hola Bob, ¿cómo estás?',                  NULL),
(2,  'texto',   NULL,    'Bien, Alice. ¿Y tú?',                     NULL),
(3,  'archivo', 'pdf',   NULL,    'https://example.com/files/informe.pdf'),
(4,  'imagen',  'jpg',   NULL,    'https://example.com/images/foto.jpg'),
(5,  'texto',   NULL,    '¿Listo para el partido?',                 NULL),
(6,  'texto',   NULL,    '¡Bienvenidos al grupo Amigos!',           NULL),
(7,  'texto',   NULL,    'Reunión de familia el sábado.',           NULL),
(8,  'texto',   NULL,    'Plan de trabajo actualizado.',           NULL),
(9,  'texto',   NULL,    'Evento de código este viernes.',         NULL),
(10, 'texto',   NULL,    'Vamos al partido este domingo.',          NULL);
