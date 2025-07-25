-- ==============================================================
--   Limpieza previa
-- ==============================================================

-- Orden inverso para evitar dependencias
DROP TABLE IF EXISTS CONTENIDO    CASCADE;
DROP TABLE IF EXISTS MENSAJE      CASCADE;
DROP TABLE IF EXISTS PERTENECE    CASCADE;
DROP TABLE IF EXISTS CONFIGRUPO   CASCADE;
DROP TABLE IF EXISTS CONFIUSUARIO CASCADE;
DROP TABLE IF EXISTS AMISTAD      CASCADE;
DROP TABLE IF EXISTS SEGUIR       CASCADE;
DROP TABLE IF EXISTS GRUPO        CASCADE;
DROP TABLE IF EXISTS USUARIO      CASCADE;
DROP TABLE IF EXISTS PROPIEDAD    CASCADE;
DROP TABLE IF EXISTS UBICACION    CASCADE;
DROP TABLE IF EXISTS TIPOUBICA    CASCADE;
DROP TABLE IF EXISTS TIPOCONTENIDO CASCADE;
DROP TABLE IF EXISTS TIPOARCHIVO   CASCADE;

DROP SEQUENCE IF EXISTS seq_consemenSAJE;
DROP SEQUENCE IF EXISTS seq_consecontenido;

-- ==============================================================
--   Tablas
-- ==============================================================

CREATE TABLE AMISTAD (
    usu_consecuser VARCHAR(5) NOT NULL,
    consecuser     VARCHAR(5) NOT NULL,
    CONSTRAINT pk_amistad PRIMARY KEY (usu_consecuser, consecuser)
);

CREATE TABLE CONFIGRUPO (
    codgrupo      INTEGER      NOT NULL,
    nconfigrupo   INTEGER      NOT NULL,
    idpropiedad   VARCHAR(2)   NOT NULL,
    estado        SMALLINT     NOT NULL,
    CONSTRAINT pk_configrupo PRIMARY KEY (codgrupo, nconfigrupo)
);

CREATE TABLE CONFIUSUARIO (
    consecuser     VARCHAR(5)  NOT NULL,
    nconfiusuario  INTEGER     NOT NULL,
    idpropiedad    VARCHAR(2)  NOT NULL,
    estado         SMALLINT,
    valor          NUMERIC(1,0),
    CONSTRAINT pk_confiusuario PRIMARY KEY (consecuser, nconfiusuario)
);

CREATE TABLE GRUPO (
    codgrupo        INTEGER     NOT NULL,
    consecuser      VARCHAR(5)  NOT NULL,
    nomgrupo        VARCHAR(30) NOT NULL,
    fechareggrupo   DATE        NOT NULL,
    imaggrupo       BYTEA       NOT NULL,
    CONSTRAINT pk_grupo PRIMARY KEY (codgrupo)
);

CREATE TABLE MENSAJE (
    usu_consecuser     VARCHAR(5) NOT NULL,
    consecuser         VARCHAR(5) NOT NULL,
    consemensaje       INTEGER    NOT NULL,
    men_usu_consecuser VARCHAR(5),
    men_consecuser     VARCHAR(5),
    men_conseMensaje   INTEGER,
    codgrupo           INTEGER,
    fecharegmen        TIMESTAMP  NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_mensaje PRIMARY KEY (usu_consecuser, consecuser, consemensaje)
);

CREATE TABLE CONTENIDO (
    consecontenido    INTEGER      NOT NULL,
    usu_consecuser    VARCHAR(5)   NOT NULL,
    consecuser        VARCHAR(5)   NOT NULL,
    consemensaje      INTEGER      NOT NULL,
    idtipoarchivo     VARCHAR(2),
    idtipocontenido   VARCHAR(2)   NOT NULL,
    contenidoimag     BYTEA,
    localizacontenido VARCHAR(255),
    CONSTRAINT pk_contenido PRIMARY KEY (consecontenido, usu_consecuser, consecuser, consemensaje)
);

CREATE TABLE PERTENECE (
    codgrupo   INTEGER     NOT NULL,
    consecuser VARCHAR(5)  NOT NULL,
    CONSTRAINT pk_pertenece PRIMARY KEY (codgrupo, consecuser)
);

CREATE TABLE PROPIEDAD (
    idpropiedad     VARCHAR(10)  NOT NULL,
    pro_idpropiedad VARCHAR(10),
    descpropiedad   VARCHAR(100),
    valordefecto    SMALLINT,
    valorpropiedad  VARCHAR(30),
    CONSTRAINT pk_propiedad PRIMARY KEY (idpropiedad)
);

CREATE TABLE SEGUIR (
    usu_consecuser VARCHAR(5) NOT NULL,
    consecuser     VARCHAR(5) NOT NULL,
    CONSTRAINT pk_seguir PRIMARY KEY (usu_consecuser, consecuser)
);

CREATE TABLE TIPOARCHIVO (
    idtipoarchivo    VARCHAR(2)  NOT NULL,
    desctipoarchivo  VARCHAR(30) NOT NULL,
    CONSTRAINT pk_tipoarchivo PRIMARY KEY (idtipoarchivo)
);

CREATE TABLE TIPOCONTENIDO (
    idtipocontenido    VARCHAR(2)  NOT NULL,
    desctipocontenido  VARCHAR(30) NOT NULL,
    CONSTRAINT pk_tipocontenido PRIMARY KEY (idtipocontenido)
);

CREATE TABLE TIPOUBICA (
    codtipoubica   VARCHAR(5)  NOT NULL,
    desctipoubica  VARCHAR(30) NOT NULL,
    CONSTRAINT pk_tipoubica PRIMARY KEY (codtipoubica)
);

CREATE TABLE UBICACION (
    codubica      VARCHAR(4)  NOT NULL,
    ubi_codubica  VARCHAR(4),
    codtipoubica  VARCHAR(5)  NOT NULL,
    nomubica      VARCHAR(30) NOT NULL,
    CONSTRAINT pk_ubicacion PRIMARY KEY (codubica)
);

CREATE TABLE USUARIO (
    consecuser      VARCHAR(5)  NOT NULL,
    codubica        VARCHAR(4)  NOT NULL,
    usu_consecuser  VARCHAR(5),
    nombre          VARCHAR(25) NOT NULL,
    apellido        VARCHAR(25) NOT NULL,
    usuario         VARCHAR(10) NOT NULL,
    fecharegistro   TIMESTAMP   NOT NULL DEFAULT NOW(),
    email           VARCHAR(50) NOT NULL,
    celular         VARCHAR(16) NOT NULL,
    imageuser       BYTEA,
    temauser        BYTEA,
    huellauser      BYTEA,
    CONSTRAINT pk_usuario PRIMARY KEY (consecuser)
);

-- ==============================================================
--   Índices (el "ASC" se omite porque no aporta en PG)
-- ==============================================================

CREATE INDEX amistad_fk      ON amistad (usu_consecuser);
CREATE INDEX amistad2_fk     ON amistad (consecuser);

CREATE INDEX grupo_fk            ON configrupo (codgrupo);
CREATE INDEX propiedadgrupo_fk   ON configrupo (idpropiedad);

CREATE INDEX propiusuario_fk ON confiusuario (idpropiedad);
CREATE INDEX usuario_fk      ON confiusuario (consecuser);

CREATE INDEX mensaje_fk     ON contenido (usu_consecuser, consecuser, consemensaje);
CREATE INDEX tipoarchivo_fk ON contenido (idtipoarchivo);
CREATE INDEX tipoconte_fk   ON contenido (idtipocontenido);

CREATE INDEX creoadministra_fk ON grupo (consecuser);

CREATE INDEX hilo_fk        ON mensaje (men_usu_consecuser, men_consecuser, men_conseMensaje);
CREATE INDEX envia_fk       ON mensaje (consecuser);
CREATE INDEX recibe_fk      ON mensaje (usu_consecuser);
CREATE INDEX grupomensaje_fk ON mensaje (codgrupo);

CREATE INDEX pertenece_fk   ON pertenece (codgrupo);
CREATE INDEX pertenece2_fk  ON pertenece (consecuser);

CREATE INDEX propiedadsup_fk ON propiedad (pro_idpropiedad);

CREATE INDEX seguir_fk   ON seguir (usu_consecuser);
CREATE INDEX seguir2_fk  ON seguir (consecuser);

CREATE INDEX ubicasup_fk  ON ubicacion (ubi_codubica);
CREATE INDEX tipoubica_fk ON ubicacion (codtipoubica);

CREATE INDEX ubica_fk            ON usuario (codubica);
CREATE INDEX actualizaperfil_fk  ON usuario (usu_consecuser);

-- ==============================================================
--   Foreign Keys
-- ==============================================================

ALTER TABLE amistad
  ADD CONSTRAINT fk_amistad_amistad_usuario
  FOREIGN KEY (usu_consecuser) REFERENCES usuario (consecuser);

ALTER TABLE amistad
  ADD CONSTRAINT fk_amistad_amistad2_usuario
  FOREIGN KEY (consecuser) REFERENCES usuario (consecuser);

ALTER TABLE configrupo
  ADD CONSTRAINT fk_configru_grupo_grupo
  FOREIGN KEY (codgrupo) REFERENCES grupo (codgrupo);

ALTER TABLE configrupo
  ADD CONSTRAINT fk_configru_propiedad_propieda
  FOREIGN KEY (idpropiedad) REFERENCES propiedad (idpropiedad);

ALTER TABLE confiusuario
  ADD CONSTRAINT fk_confiusu_propiusua_propieda
  FOREIGN KEY (idpropiedad) REFERENCES propiedad (idpropiedad);

ALTER TABLE confiusuario
  ADD CONSTRAINT fk_confiusu_usuario_usuario
  FOREIGN KEY (consecuser) REFERENCES usuario (consecuser);

ALTER TABLE contenido
  ADD CONSTRAINT fk_contenid_mensaje_mensaje
  FOREIGN KEY (usu_consecuser, consecuser, consemensaje)
  REFERENCES mensaje (usu_consecuser, consecuser, consemensaje);

ALTER TABLE contenido
  ADD CONSTRAINT fk_contenid_tipoarchi_tipoarch
  FOREIGN KEY (idtipoarchivo) REFERENCES tipoarchivo (idtipoarchivo);

ALTER TABLE contenido
  ADD CONSTRAINT fk_contenid_tipoconte_tipocont
  FOREIGN KEY (idtipocontenido) REFERENCES tipocontenido (idtipocontenido);

ALTER TABLE grupo
  ADD CONSTRAINT fk_grupo_creaoadmi_usuario
  FOREIGN KEY (consecuser) REFERENCES usuario (consecuser);

ALTER TABLE mensaje
  ADD CONSTRAINT fk_mensaje_envia_usuario
  FOREIGN KEY (consecuser) REFERENCES usuario (consecuser);

ALTER TABLE mensaje
  ADD CONSTRAINT fk_mensaje_grupomens_grupo
  FOREIGN KEY (codgrupo) REFERENCES grupo (codgrupo);

ALTER TABLE mensaje
  ADD CONSTRAINT fk_mensaje_hilo_mensaje
  FOREIGN KEY (men_usu_consecuser, men_consecuser, men_conseMensaje)
  REFERENCES mensaje (usu_consecuser, consecuser, consemensaje);

ALTER TABLE mensaje
  ADD CONSTRAINT fk_mensaje_recibe_usuario
  FOREIGN KEY (usu_consecuser) REFERENCES usuario (consecuser);

ALTER TABLE pertenece
  ADD CONSTRAINT fk_pertenec_pertenece_grupo
  FOREIGN KEY (codgrupo) REFERENCES grupo (codgrupo);

ALTER TABLE pertenece
  ADD CONSTRAINT fk_pertenec_pertenece_usuario
  FOREIGN KEY (consecuser) REFERENCES usuario (consecuser);

ALTER TABLE propiedad
  ADD CONSTRAINT fk_propieda_propiedad_propieda
  FOREIGN KEY (pro_idpropiedad) REFERENCES propiedad (idpropiedad);

ALTER TABLE seguir
  ADD CONSTRAINT fk_seguir_seguir_usuario
  FOREIGN KEY (usu_consecuser) REFERENCES usuario (consecuser);

ALTER TABLE seguir
  ADD CONSTRAINT fk_seguir_seguir2_usuario
  FOREIGN KEY (consecuser) REFERENCES usuario (consecuser);

ALTER TABLE ubicacion
  ADD CONSTRAINT fk_ubicacio_tipoubica_tipoubic
  FOREIGN KEY (codtipoubica) REFERENCES tipoubica (codtipoubica);

ALTER TABLE ubicacion
  ADD CONSTRAINT fk_ubicacio_ubicasup_ubicacio
  FOREIGN KEY (ubi_codubica) REFERENCES ubicacion (codubica);

ALTER TABLE usuario
  ADD CONSTRAINT fk_usuario_actualiza_usuario
  FOREIGN KEY (usu_consecuser) REFERENCES usuario (consecuser);

ALTER TABLE usuario
  ADD CONSTRAINT fk_usuario_ubica_ubicacio
  FOREIGN KEY (codubica) REFERENCES ubicacion (codubica);

-- ==============================================================
--   Secuencias y defaults para claves autoincrementales
--   (Opcional: puedes omitir si insertarás manualmente)
-- ==============================================================

CREATE SEQUENCE seq_consemenSAJE START 1;
ALTER TABLE mensaje
  ALTER COLUMN consemensaje SET DEFAULT nextval('seq_consemenSAJE');

CREATE SEQUENCE seq_consecontenido START 1;
ALTER TABLE contenido
  ALTER COLUMN consecontenido SET DEFAULT nextval('seq_consecontenido');

-- ==============================================================
--   Inserts
-- ==============================================================

-- TipoUbica
INSERT INTO tipoubica (codtipoubica, desctipoubica) VALUES ('1', 'Pais');
INSERT INTO tipoubica (codtipoubica, desctipoubica) VALUES ('2', 'Departamento');
INSERT INTO tipoubica (codtipoubica, desctipoubica) VALUES ('3', 'Ciudad');
INSERT INTO tipoubica (codtipoubica, desctipoubica) VALUES ('4', 'Area');
INSERT INTO tipoubica (codtipoubica, desctipoubica) VALUES ('5', 'Provincia');

-- Ubicacion
INSERT INTO ubicacion (codubica, nomubica, codtipoubica, ubi_codubica) VALUES ('57', 'Colombia', '1', NULL);
INSERT INTO ubicacion (codubica, nomubica, codtipoubica, ubi_codubica) VALUES ('1',  'E.U',      '1', NULL);
INSERT INTO ubicacion (codubica, nomubica, codtipoubica, ubi_codubica) VALUES ('34', 'Espana',   '1', NULL);
INSERT INTO ubicacion (codubica, nomubica, codtipoubica, ubi_codubica) VALUES ('54', 'Argentina','1', NULL);
INSERT INTO ubicacion (codubica, nomubica, codtipoubica, ubi_codubica) VALUES ('05', 'Antioquia','2', '57');
INSERT INTO ubicacion (codubica, nomubica, codtipoubica, ubi_codubica) VALUES ('81', 'Arauca',   '2', '57');
INSERT INTO ubicacion (codubica, nomubica, codtipoubica, ubi_codubica) VALUES ('11', 'Bogota D.C','2','57');
INSERT INTO ubicacion (codubica, nomubica, codtipoubica, ubi_codubica) VALUES ('15', 'Boyaca',   '2', '57');
INSERT INTO ubicacion (codubica, nomubica, codtipoubica, ubi_codubica) VALUES ('25', 'Cundinamarca','2','57');
INSERT INTO ubicacion (codubica, nomubica, codtipoubica, ubi_codubica) VALUES ('205','Alabama',  '4', '1');
INSERT INTO ubicacion (codubica, nomubica, codtipoubica, ubi_codubica) VALUES ('907','Alaska',   '4', '1');
INSERT INTO ubicacion (codubica, nomubica, codtipoubica, ubi_codubica) VALUES ('209','California','4','1');

-- Usuario
INSERT INTO usuario (consecuser, codubica, nombre, apellido, usuario, fecharegistro, email, celular)
VALUES ('U1', '11', 'William',  'Forero', 'wefo', NOW(), 'weforeron@udistrital.edu.co', '350-690-2188');

INSERT INTO usuario (consecuser, codubica, nombre, apellido, usuario, fecharegistro, email, celular)
VALUES ('U2', '11', 'Gabriela', 'Salazar','gasa', NOW(), 'gabysalazarmelo@gmail.com',   '311-000-0000');

INSERT INTO usuario (consecuser, codubica, nombre, apellido, usuario, fecharegistro, email, celular)
VALUES ('U3', '11', 'Cristian', 'Camilo', 'cricam', NOW(), 'cristian.camilo@email.com', '300-000-0000');

-- Propiedad
INSERT INTO propiedad (idpropiedad, descpropiedad) VALUES ('1','Ajusted de Cuenta');
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('1.1','1','Ajuste Pin de Seguridad',1,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('1.2','1','Bloqueo con huella',0,NULL);
INSERT INTO propiedad (idpropiedad, descpropiedad) VALUES ('2','Ajusted de Privacidad');
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.1','2','Hora Ultima Vez',1,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.1.1','2.1','Todos',1,'true');
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.1.2','2.1','Mis Contactos',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.1.3','2.1','Excepto mis contactos',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.1.4','2.1','Nadie',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.2','2','Estado en Linea',1,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.2.1','2.2','Todos',1,'true');
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.2.2','2.2','Mis Contactos',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.2.3','2.2','Excepto mis contactos',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.2.4','2.2','Nadie',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.3','2','Foto de Perfil',1,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.3.1','2.3','Todos',1,'true');
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.3.2','2.3','Mis Contactos',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.3.3','2.3','Excepto mis contactos',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.3.4','2.3','Nadie',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.4','2','Informacion',1,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.4.1','2.4','Todos',1,'true');
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.4.2','2.4','Mis Contactos',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.4.3','2.4','Excepto mis contactos',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.4.4','2.4','Nadie',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.5','2','Estado',1,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.5.1','2.5','Todos',1,'true');
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.5.2','2.5','Mis Contactos',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.5.3','2.5','Excepto mis contactos',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.5.4','2.5','Nadie',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.6','2','Confirmacion de lectura',1,'true');
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.7','2','Grupos',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.7.1','2.7','Todos',1,'true');
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.7.2','2.7','Mis Contactos',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.7.3','2.7','Excepto mis contactos',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.7.4','2.7','Nadie',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.8','2','Ubicacion en tiempo real',1,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.8.1','2.8','Todos',1,'true');
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.8.2','2.8','Mis Contactos',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.8.3','2.8','Excepto mis contactos',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.8.4','2.8','Nadie',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.9','2','Ajustes de Chat',0,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.9.1','2.9','Arial',1,'true');
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.9.2','2.9','tamaño fuente',1,'12');
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.10','2','Ajustes de almacenamiento y datos',1,'true');
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.10.1','2.10','Espacio',1,'5.40MB');
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.10.2','2.10','Wifi',1,NULL);
INSERT INTO propiedad (idpropiedad, pro_idpropiedad, descpropiedad, valordefecto, valorpropiedad)
VALUES ('2.11','2','Ajustes de ayuda',1,NULL);

-- Amistad
INSERT INTO amistad (usu_consecuser, consecuser) VALUES ('U1','U2');
INSERT INTO amistad (usu_consecuser, consecuser) VALUES ('U2','U1');

-- Grupo
INSERT INTO grupo (codgrupo, consecuser, nomgrupo, fechareggrupo, imaggrupo)
VALUES (1, 'U1', 'Grupo de Prueba', NOW(), decode('', 'hex'));

-- Miembros grupo
INSERT INTO pertenece (codgrupo, consecuser) VALUES (1,'U1');
INSERT INTO pertenece (codgrupo, consecuser) VALUES (1,'U2');
INSERT INTO pertenece (codgrupo, consecuser) VALUES (1,'U3');

-- TipoContenido
INSERT INTO tipocontenido (idtipocontenido, desctipocontenido) VALUES ('1', 'Imagen');
INSERT INTO tipocontenido (idtipocontenido, desctipocontenido) VALUES ('2', 'Texto');
INSERT INTO tipocontenido (idtipocontenido, desctipocontenido) VALUES ('3', 'Emoticons');
INSERT INTO tipocontenido (idtipocontenido, desctipocontenido) VALUES ('4', 'URL');
INSERT INTO tipocontenido (idtipocontenido, desctipocontenido) VALUES ('5', 'Video');
INSERT INTO tipocontenido (idtipocontenido, desctipocontenido) VALUES ('6', 'Documento');
INSERT INTO tipocontenido (idtipocontenido, desctipocontenido) VALUES ('7', 'Audio');

-- TipoArchivo
INSERT INTO tipoarchivo (idtipoarchivo, desctipoarchivo) VALUES ('1', 'PDF Documento Portable');
INSERT INTO tipoarchivo (idtipoarchivo, desctipoarchivo) VALUES ('2', 'DOC Documento');
INSERT INTO tipoarchivo (idtipoarchivo, desctipoarchivo) VALUES ('3', 'XLS Hoja de Calculo');
INSERT INTO tipoarchivo (idtipoarchivo, desctipoarchivo) VALUES ('4', 'GIF Imagen');
INSERT INTO tipoarchivo (idtipoarchivo, desctipoarchivo) VALUES ('5', 'BMP Imagen');
INSERT INTO tipoarchivo (idtipoarchivo, desctipoarchivo) VALUES ('6', 'MP4 Video');
INSERT INTO tipoarchivo (idtipoarchivo, desctipoarchivo) VALUES ('7', 'AVI Video');
INSERT INTO tipoarchivo (idtipoarchivo, desctipoarchivo) VALUES ('8', 'MP3 Musica');
INSERT INTO tipoarchivo (idtipoarchivo, desctipoarchivo) VALUES ('9', 'EXE ejecutable');

-- Mensaje privado
INSERT INTO mensaje (
   usu_consecuser, consecuser, consemensaje,
   men_usu_consecuser, men_consecuser, men_conseMensaje,
   codgrupo, fecharegmen
)
VALUES (
   'U1', 'U2', DEFAULT,
   NULL, NULL, NULL,
   NULL, NOW()
);

-- Contenido mensaje
INSERT INTO contenido (
   consecontenido,  -- DEFAULT secuencia
   usu_consecuser,
   consecuser,
   consemensaje,
   idtipoarchivo,
   idtipocontenido,
   contenidoimag,
   localizacontenido
)
VALUES (
   DEFAULT,
   'U1',
   'U2',
   currval('seq_consemenSAJE'),
   NULL,
   '2',
   NULL,
   'Hola, este es un mensaje de prueba.'
);

-- ==============================================================
--   Consultas de ejemplo (compatibles con PG)
-- ==============================================================

-- Chats de U1
SELECT
    u.consecuser AS "Codigo Chat",
    u.nombre || ' ' || u.apellido AS "Nombre Chat",
    'Amigo' AS "Tipo Chat"
FROM amistad a
JOIN usuario u ON a.consecuser = u.consecuser
WHERE a.usu_consecuser = 'U1'

UNION

SELECT
    p.codgrupo::text AS "Codigo Chat",
    g.nomgrupo       AS "Nombre Chat",
    'Grupo'          AS "Tipo Chat"
FROM pertenece p
JOIN grupo g ON p.codgrupo = g.codgrupo
WHERE p.consecuser = 'U1';

-- Mensajes privados entre U1 y U2
SELECT
    m.conseMensaje      AS id_mensaje,
    m.usu_consecUser    AS emisor,
    m.consecUser        AS receptor,
    m.fechaRegMen       AS fecha,
    c.conseContenido    AS id_contenido,
    c.idTipoContenido   AS tipo_contenido,
    c.idTipoArchivo     AS tipo_archivo,
    c.localizaContenido AS contenido_texto,
    CASE WHEN m.usu_consecUser = 'U1' THEN 'Enviado' ELSE 'Recibido' END AS estado_mensaje
FROM mensaje m
JOIN contenido c
  ON m.conseMensaje   = c.conseMensaje
 AND m.usu_consecUser = c.usu_consecUser
 AND m.consecUser     = c.consecUser
WHERE m.codGrupo IS NULL
  AND ((m.usu_consecUser = 'U1' AND m.consecUser = 'U2')
    OR (m.usu_consecUser = 'U2' AND m.consecUser = 'U1'))
ORDER BY m.fechaRegMen;

-- Mensajes enviados/recibidos por U1 en grupo 1
SELECT
   m.conseMensaje      AS "ID_MENSAJE",
   m.usu_consecUser    AS "EMISOR",
   m.consecUser        AS "RECEPTOR",
   m.fechaRegMen       AS "FECHA",
   c.conseContenido    AS "ID_CONTENIDO",
   c.idTipoContenido   AS "TIPO_CONTENIDO",
   c.idTipoArchivo     AS "TIPO_ARCHIVO",
   c.localizaContenido AS "CONTENIDO_TEXTO",
   'Enviado'           AS "ESTADO_MENSAJE"
FROM mensaje m
JOIN contenido c ON m.conseMensaje = c.conseMensaje
                AND m.usu_consecUser = c.usu_consecUser
                AND m.consecUser = c.consecUser
WHERE m.usu_consecUser = 'U1'
  AND m.codGrupo = 1

UNION

SELECT
   m.conseMensaje      AS "ID_MENSAJE",
   m.usu_consecUser    AS "EMISOR",
   m.consecUser        AS "RECEPTOR",
   m.fechaRegMen       AS "FECHA",
   c.conseContenido    AS "ID_CONTENIDO",
   c.idTipoContenido   AS "TIPO_CONTENIDO",
   c.idTipoArchivo     AS "TIPO_ARCHIVO",
   c.localizaContenido AS "CONTENIDO_TEXTO",
   'Recibido'          AS "ESTADO_MENSAJE"
FROM mensaje m
JOIN contenido c ON m.conseMensaje = c.conseMensaje
                AND m.usu_consecUser = c.usu_consecUser
                AND m.consecUser = c.consecUser
WHERE m.consecUser = 'U1'
  AND m.codGrupo = 1
ORDER BY "FECHA";

-- Verificación rápida
SELECT * FROM tipocontenido;
SELECT * FROM tipoarchivo;
SELECT * FROM usuario;
SELECT * FROM amistad;
SELECT * FROM grupo;
SELECT * FROM pertenece;
SELECT * FROM mensaje;
SELECT * FROM contenido;
SELECT * FROM propiedad;

-- Limpiezas opcionales
-- TRUNCATE TABLE mensaje RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE contenido RESTART IDENTITY CASCADE;

COMMIT;
