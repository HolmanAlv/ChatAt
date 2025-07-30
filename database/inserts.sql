-- --------------------------------------------------
-- 10 inserts para la tabla usuario
-- --------------------------------------------------
-- contra: Password123!
INSERT INTO usuario (nombre, apellido, email, fecha_registro, image_url, contrasena_hash) VALUES
('Alice',    'García',    'alice.garcia@example.com',     '2025-07-01 09:15:00', 'https://example.com/images/alice.jpg',    '$2b$12$eQiq3U6py1JZlZmMk9bd2uY9b6JHpi3nynhyuvlLzkhX5u4T6v9e'),
('Bob',      'Martínez',  'bob.martinez@example.com',     '2025-07-02 10:20:00', 'https://example.com/images/bob.jpg',      '$2b$12$eQiq3U6py1JZlZmMk9bd2uY9b6JHpi3nynhyuvlLzkhX5u4T6v9e'),
('Carolina', 'López',     'carolina.lopez@example.com',   '2025-07-03 11:30:00', 'https://example.com/images/carolina.jpg','$2b$12$eQiq3U6py1JZlZmMk9bd2uY9b6JHpi3nynhyuvlLzkhX5u4T6v9e'),
('Diego',    'Fernández', 'diego.fernandez@example.com',  '2025-07-04 12:45:00', 'https://example.com/images/diego.jpg',    '$2b$12$eQiq3U6py1JZlZmMk9bd2uY9b6JHpi3nynhyuvlLzkhX5u4T6v9e'),
('Elena',    'Rodríguez', 'elena.rodriguez@example.com',  '2025-07-05 14:00:00', 'https://example.com/images/elena.jpg',    '$2b$12$eQiq3U6py1JZlZmMk9bd2uY9b6JHpi3nynhyuvlLzkhX5u4T6v9e'),
('Fernando', 'Sánchez',   'fernando.sanchez@example.com', '2025-07-06 15:15:00', 'https://example.com/images/fernando.jpg','$2b$12$eQiq3U6py1JZlZmMk9bd2uY9b6JHpi3nynhyuvlLzkhX5u4T6v9e'),
('Gabriela', 'Herrera',   'gabriela.herrera@example.com', '2025-07-07 16:30:00', 'https://example.com/images/gabriela.jpg','$2b$12$eQiq3U6py1JZlZmMk9bd2uY9b6JHpi3nynhyuvlLzkhX5u4T6v9e'),
('Hugo',     'Vargas',    'hugo.vargas@example.com',      '2025-07-08 17:45:00', 'https://example.com/images/hugo.jpg',      '$2b$12$eQiq3U6py1JZlZmMk9bd2uY9b6JHpi3nynhyuvlLzkhX5u4T6v9e'),
('Isabel',   'Morales',   'isabel.morales@example.com',   '2025-07-09 18:55:00', 'https://example.com/images/isabel.jpg',   '$2b$12$eQiq3U6py1JZlZmMk9bd2uY9b6JHpi3nynhyuvlLzkhX5u4T6v9e'),
('Javier',   'Castro',    'javier.castro@example.com',    '2025-07-10 20:00:00', 'https://example.com/images/javier.jpg',    '$2b$12$eQiq3U6py1JZlZmMk9bd2uY9b6JHpi3nynhyuvlLzkhX5u4T6v9e');

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
