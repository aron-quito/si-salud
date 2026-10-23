-- ============================================================
--  SI-SALUD · Script Completo MySQL 8.x
--  Sistema Integral de Citas Médicas
--  Generado para Entrega Unidad 1 · Octubre 2026
-- ============================================================
--  INSTRUCCIONES DE USO:
--    1. Abrir MySQL Workbench
--    2. File > Open SQL Script > seleccionar este archivo
--    3. Ctrl+Shift+Enter  (ejecutar todo el script)
--    4. Verificar: USE si_salud; SHOW TABLES;  → debe listar 16 tablas
-- ============================================================

-- ██████████████████████████████████████████████████████████
--   BLOQUE 1 · DDL — Definición de la Estructura de Datos
-- ██████████████████████████████████████████████████████████

DROP DATABASE IF EXISTS si_salud;
CREATE DATABASE si_salud
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE si_salud;

-- ─────────────────────────────────────────
-- 1. USUARIO
--    Autenticación y control de acceso
-- ─────────────────────────────────────────
CREATE TABLE USUARIO (
    id       INT          NOT NULL AUTO_INCREMENT,
    email    VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña',
    rol      ENUM('Paciente','Medico','Cajero','Admin') NOT NULL,
    estado   ENUM('Activo','Bloqueado') NOT NULL DEFAULT 'Activo',
    PRIMARY KEY (id),
    UNIQUE  KEY uq_usuario_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Autenticación y roles del sistema';

-- ─────────────────────────────────────────
-- 2. PACIENTE
--    Perfil clínico-personal del paciente
-- ─────────────────────────────────────────
CREATE TABLE PACIENTE (
    id            INT          NOT NULL AUTO_INCREMENT,
    usuario_id    INT          NOT NULL,
    dni           VARCHAR(20)  NOT NULL COMMENT 'Documento de identidad nacional',
    fecha_nacimiento DATE      NOT NULL,
    telefono      VARCHAR(20)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_paciente_usuario (usuario_id),
    UNIQUE KEY uq_paciente_dni    (dni),
    CONSTRAINT fk_paciente_usuario FOREIGN KEY (usuario_id)
        REFERENCES USUARIO(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Perfil clínico del usuario con rol Paciente';

-- ─────────────────────────────────────────
-- 3. MEDICO
--    Perfil profesional médico
-- ─────────────────────────────────────────
CREATE TABLE MEDICO (
    id         INT          NOT NULL AUTO_INCREMENT,
    usuario_id INT          NOT NULL,
    cmp        VARCHAR(20)  NOT NULL COMMENT 'Colegio Médico del Perú u homólogo',
    nombres    VARCHAR(100) NOT NULL,
    apellidos  VARCHAR(100) NOT NULL,
    jerarquia  VARCHAR(100) NULL     COMMENT 'Cargo o nivel de experiencia',
    PRIMARY KEY (id),
    UNIQUE KEY uq_medico_usuario (usuario_id),
    UNIQUE KEY uq_medico_cmp    (cmp),
    CONSTRAINT fk_medico_usuario FOREIGN KEY (usuario_id)
        REFERENCES USUARIO(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Perfil profesional del usuario con rol Médico';

-- ─────────────────────────────────────────
-- 4. SEDE
--    Ubicaciones físicas de la clínica
-- ─────────────────────────────────────────
CREATE TABLE SEDE (
    id        INT          NOT NULL AUTO_INCREMENT,
    nombre    VARCHAR(150) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    activa    TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Sedes o sucursales de la clínica';

-- ─────────────────────────────────────────
-- 5. CONSULTORIO
--    Espacios físicos dentro de una Sede
-- ─────────────────────────────────────────
CREATE TABLE CONSULTORIO (
    id            INT          NOT NULL AUTO_INCREMENT,
    sede_id       INT          NOT NULL,
    numero_nombre VARCHAR(50)  NOT NULL COMMENT 'Ej: Consultorio 104A',
    activo        TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    CONSTRAINT fk_consultorio_sede FOREIGN KEY (sede_id)
        REFERENCES SEDE(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Consultorios físicos por sede';

-- ─────────────────────────────────────────
-- 6. ESPECIALIDAD
--    Áreas médicas ofertadas
-- ─────────────────────────────────────────
CREATE TABLE ESPECIALIDAD (
    id          INT          NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(100) NOT NULL,
    descripcion TEXT         CHARACTER SET utf8mb4 NULL,
    activa      TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Especialidades médicas disponibles';

-- ─────────────────────────────────────────
-- 7. MEDICO_ESPECIALIDAD
--    Pivote N:M Médico ↔ Especialidad
-- ─────────────────────────────────────────
CREATE TABLE MEDICO_ESPECIALIDAD (
    medico_id       INT NOT NULL,
    especialidad_id INT NOT NULL,
    PRIMARY KEY (medico_id, especialidad_id),
    CONSTRAINT fk_me_medico FOREIGN KEY (medico_id)
        REFERENCES MEDICO(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_me_especialidad FOREIGN KEY (especialidad_id)
        REFERENCES ESPECIALIDAD(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Relación N:M médico - especialidades';

-- ─────────────────────────────────────────
-- 8. TIPO_CONSULTA
--    Tipo de cita y duración base
-- ─────────────────────────────────────────
CREATE TABLE TIPO_CONSULTA (
    id                    INT          NOT NULL AUTO_INCREMENT,
    nombre                VARCHAR(100) NOT NULL,
    duracion_base_minutos INT          NOT NULL DEFAULT 30,
    activo                TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Tipos de consulta médica y su duración base en minutos';

-- ─────────────────────────────────────────
-- 9. ASEGURADORA
--    Entidades prestadoras de salud
-- ─────────────────────────────────────────
CREATE TABLE ASEGURADORA (
    id     INT          NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    tipo   VARCHAR(50)  NOT NULL COMMENT 'EPS, Privado, Público, etc.',
    activa TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Aseguradoras o modalidades de cobertura médica';

-- ─────────────────────────────────────────
-- 10. BLOQUE_HORARIO
--     Core del Smart Slotting - fragmento de tiempo
-- ─────────────────────────────────────────
CREATE TABLE BLOQUE_HORARIO (
    id             INT     NOT NULL AUTO_INCREMENT,
    medico_id      INT     NOT NULL,
    consultorio_id INT     NOT NULL,
    fecha          DATE    NOT NULL,
    hora_inicio    TIME    NOT NULL,
    hora_fin       TIME    NOT NULL,
    estado         ENUM('Libre','Ocupado','Bloqueado') NOT NULL DEFAULT 'Libre',
    PRIMARY KEY (id),
    INDEX idx_bh_medico_fecha (medico_id, fecha),
    INDEX idx_bh_estado       (estado),
    CONSTRAINT fk_bh_medico      FOREIGN KEY (medico_id)
        REFERENCES MEDICO(id)       ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bh_consultorio FOREIGN KEY (consultorio_id)
        REFERENCES CONSULTORIO(id)  ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Bloques de tiempo disponibles por médico y consultorio (Smart Slotting)';

-- ─────────────────────────────────────────
-- 11. SOLICITUD_TRIAJE
--     Formularios asíncronos de síntomas
-- ─────────────────────────────────────────
CREATE TABLE SOLICITUD_TRIAJE (
    id                  INT          NOT NULL AUTO_INCREMENT,
    paciente_id         INT          NOT NULL,
    especialidad_id     INT          NOT NULL,
    sintomas            TEXT         CHARACTER SET utf8mb4 NOT NULL,
    preferencia_horario VARCHAR(50)  NULL    COMMENT 'Mañanas, Tardes, Sin preferencia',
    score_urgencia      INT          NULL    COMMENT 'Puntuación IA: 1 (leve) a 10 (crítico)',
    modalidad           ENUM('Presencial','Meet','Llamada') NOT NULL DEFAULT 'Presencial',
    estado              ENUM('Pendiente','Agendado','Cancelado') NOT NULL DEFAULT 'Pendiente',
    PRIMARY KEY (id),
    CONSTRAINT fk_st_paciente     FOREIGN KEY (paciente_id)
        REFERENCES PACIENTE(id)     ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_st_especialidad FOREIGN KEY (especialidad_id)
        REFERENCES ESPECIALIDAD(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Solicitudes de triaje enviadas a la bolsa de espera para análisis IA';

-- ─────────────────────────────────────────
-- 12. LISTA_ESPERA
--     Cola de pacientes sin cupo
-- ─────────────────────────────────────────
CREATE TABLE LISTA_ESPERA (
    id              INT      NOT NULL AUTO_INCREMENT,
    paciente_id     INT      NOT NULL,
    especialidad_id INT      NOT NULL,
    fecha_ingreso   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    prioridad       INT      NOT NULL DEFAULT 1 COMMENT 'Mayor = más urgente',
    estado          ENUM('En Espera','Atendido') NOT NULL DEFAULT 'En Espera',
    PRIMARY KEY (id),
    INDEX idx_le_esp_prioridad (especialidad_id, prioridad DESC),
    CONSTRAINT fk_le_paciente     FOREIGN KEY (paciente_id)
        REFERENCES PACIENTE(id)     ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_le_especialidad FOREIGN KEY (especialidad_id)
        REFERENCES ESPECIALIDAD(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Cola de pacientes que esperan cupo por cancelaciones reactivas';

-- ─────────────────────────────────────────
-- 13. CITA
--     Confirmación formal de atención
-- ─────────────────────────────────────────
CREATE TABLE CITA (
    id                INT  NOT NULL AUTO_INCREMENT,
    paciente_id       INT  NOT NULL,
    medico_id         INT  NOT NULL,
    bloque_horario_id INT  NOT NULL,
    tipo_consulta_id  INT  NOT NULL,
    solicitud_id      INT  NULL     COMMENT 'Nullable: puede crearse sin triaje previo',
    aseguradora_id    INT  NULL     COMMENT 'Nullable: Particular no requiere aseguradora',
    estado            ENUM('Programada','Pagada','Atendida','Cancelada','Reprogramada')
                          NOT NULL DEFAULT 'Programada',
    PRIMARY KEY (id),
    UNIQUE KEY uq_cita_bloque (bloque_horario_id) COMMENT 'Un bloque = una sola cita activa',
    INDEX idx_cita_paciente (paciente_id),
    INDEX idx_cita_medico   (medico_id),
    CONSTRAINT fk_cita_paciente   FOREIGN KEY (paciente_id)
        REFERENCES PACIENTE(id)       ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cita_medico     FOREIGN KEY (medico_id)
        REFERENCES MEDICO(id)         ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cita_bloque     FOREIGN KEY (bloque_horario_id)
        REFERENCES BLOQUE_HORARIO(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cita_tipo       FOREIGN KEY (tipo_consulta_id)
        REFERENCES TIPO_CONSULTA(id)  ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cita_solicitud  FOREIGN KEY (solicitud_id)
        REFERENCES SOLICITUD_TRIAJE(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_cita_aseguradora FOREIGN KEY (aseguradora_id)
        REFERENCES ASEGURADORA(id)    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Citas médicas confirmadas. UNIQUE en bloque_horario_id garantiza no-doble-booking';

-- ─────────────────────────────────────────
-- 14. HISTORIAL_REPROGRAMACION
--     Auditoría de cambios en citas
-- ─────────────────────────────────────────
CREATE TABLE HISTORIAL_REPROGRAMACION (
    id                INT          NOT NULL AUTO_INCREMENT,
    cita_id           INT          NOT NULL,
    motivo_cambio     VARCHAR(500) NOT NULL,
    fecha_transaccion DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado            VARCHAR(50)  NOT NULL DEFAULT 'Valido'
                      COMMENT 'Valido | Justificado (bypass admin)',
    PRIMARY KEY (id),
    INDEX idx_hr_cita (cita_id),
    CONSTRAINT fk_hr_cita FOREIGN KEY (cita_id)
        REFERENCES CITA(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Registro de auditoría de reprogramaciones por cita. Activa bloqueo al superar límite';

-- ─────────────────────────────────────────
-- 15. TICKET_ASISTENCIA
--     Check-in físico en recepción
-- ─────────────────────────────────────────
CREATE TABLE TICKET_ASISTENCIA (
    id               INT          NOT NULL AUTO_INCREMENT,
    cita_id          INT          NOT NULL,
    fecha_generacion DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    codigo_turno     VARCHAR(10)  NOT NULL COMMENT 'Ej: C-042 (pantallas sala espera)',
    estado           ENUM('Impreso','Llamado','Finalizado') NOT NULL DEFAULT 'Impreso',
    PRIMARY KEY (id),
    UNIQUE KEY uq_ticket_cita (cita_id),
    CONSTRAINT fk_ta_cita FOREIGN KEY (cita_id)
        REFERENCES CITA(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Ticket emitido al presentarse el paciente en recepción';

-- ─────────────────────────────────────────
-- 16. PAGO_VOUCHER
--     Comprobante de pago subido por paciente
-- ─────────────────────────────────────────
CREATE TABLE PAGO_VOUCHER (
    id               INT            NOT NULL AUTO_INCREMENT,
    cita_id          INT            NOT NULL,
    url_imagen       VARCHAR(500)   NULL     COMMENT 'URL S3/bucket de la imagen del voucher',
    monto            DECIMAL(10,2)  NOT NULL,
    estado_auditoria ENUM('Pendiente','Aprobado','Rechazado') NOT NULL DEFAULT 'Pendiente',
    PRIMARY KEY (id),
    UNIQUE KEY uq_voucher_cita (cita_id),
    CONSTRAINT fk_pv_cita FOREIGN KEY (cita_id)
        REFERENCES CITA(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Comprobantes de pago con estado de auditoría manual/automática';


-- ██████████████████████████████████████████████████████████
--   BLOQUE 2 · DML — Datos Semilla Representativos
-- ██████████████████████████████████████████████████████████

-- ─── Sedes ───────────────────────────────
INSERT INTO SEDE (nombre, direccion, activa) VALUES
    ('Sede Central Lima',  'Av. Javier Prado Este 4200, San Borja, Lima', 1),
    ('Sede Norte Comas',   'Av. Universitaria 7650, Comas, Lima',         1);

-- ─── Consultorios ────────────────────────
INSERT INTO CONSULTORIO (sede_id, numero_nombre, activo) VALUES
    (1, 'Consultorio 101-A', 1),
    (1, 'Consultorio 102-B', 1),
    (2, 'Consultorio 201-A', 1),
    (2, 'Consultorio 202-B', 1);

-- ─── Especialidades ──────────────────────
INSERT INTO ESPECIALIDAD (nombre, descripcion, activa) VALUES
    ('Medicina General',  'Atención primaria, diagnóstico y tratamiento de enfermedades comunes.',              1),
    ('Pediatría',         'Atención médica especializada en niños de 0 a 18 años.',                            1),
    ('Cardiología',       'Diagnóstico y tratamiento de enfermedades del corazón y sistema circulatorio.',     1),
    ('Neurología',        'Enfermedades del sistema nervioso central y periférico.',                           1),
    ('Traumatología',     'Lesiones musculoesqueléticas, fracturas y patologías ortopédicas.',                 1);

-- ─── Aseguradoras ────────────────────────
INSERT INTO ASEGURADORA (nombre, tipo, activa) VALUES
    ('EsSalud',    'Público',   1),
    ('SIS',        'Público',   1),
    ('Particular', 'Privado',   1);

-- ─── Tipos de Consulta ───────────────────
INSERT INTO TIPO_CONSULTA (nombre, duracion_base_minutos, activo) VALUES
    ('Primera Vez',    30, 1),
    ('Control',        15, 1),
    ('Procedimiento',  45, 1);

-- ─── Usuarios (passwords son mock-hash bcrypt) ─
INSERT INTO USUARIO (email, password, rol, estado) VALUES
    -- Admin
    ('admin@sisalud.pe',          '$2b$12$adminHashMock001', 'Admin',    'Activo'),
    -- Médicos
    ('dr.torres@sisalud.pe',      '$2b$12$medicoHash001',   'Medico',   'Activo'),
    ('dra.quispe@sisalud.pe',     '$2b$12$medicoHash002',   'Medico',   'Activo'),
    ('dr.vargas@sisalud.pe',      '$2b$12$medicoHash003',   'Medico',   'Activo'),
    -- Cajero
    ('caja.central@sisalud.pe',   '$2b$12$cajeroHash001',   'Cajero',   'Activo'),
    -- Pacientes
    ('juan.perez@gmail.com',      '$2b$12$pacienteHash001', 'Paciente', 'Activo'),
    ('maria.lopez@gmail.com',     '$2b$12$pacienteHash002', 'Paciente', 'Activo'),
    ('carlos.mendoza@gmail.com',  '$2b$12$pacienteHash003', 'Paciente', 'Activo'),
    ('ana.flores@gmail.com',      '$2b$12$pacienteHash004', 'Paciente', 'Activo'),
    ('luis.garcia@gmail.com',     '$2b$12$pacienteHash005', 'Paciente', 'Activo');

-- ─── Médicos ─────────────────────────────
INSERT INTO MEDICO (usuario_id, cmp, nombres, apellidos, jerarquia) VALUES
    (2, 'CMP-48721', 'Roberto',  'Torres Salas',    'Médico Especialista'),
    (3, 'CMP-52103', 'Patricia', 'Quispe Ramos',    'Médico Jefe de Área'),
    (4, 'CMP-63894', 'Alejandro','Vargas Mendoza',  'Médico Residente');

-- ─── Asignación Médico ↔ Especialidad ────
INSERT INTO MEDICO_ESPECIALIDAD (medico_id, especialidad_id) VALUES
    (1, 1), -- Dr. Torres → Medicina General
    (1, 3), -- Dr. Torres → Cardiología
    (2, 2), -- Dra. Quispe → Pediatría
    (2, 1), -- Dra. Quispe → Medicina General
    (3, 4), -- Dr. Vargas → Neurología
    (3, 5); -- Dr. Vargas → Traumatología

-- ─── Pacientes ───────────────────────────
INSERT INTO PACIENTE (usuario_id, dni, fecha_nacimiento, telefono) VALUES
    (6,  '45231987', '1990-03-15', '987654321'),
    (7,  '52108743', '1985-07-22', '976543210'),
    (8,  '67342198', '1978-11-10', '965432109'),
    (9,  '43218976', '2001-01-05', '954321098'),
    (10, '71234098', '1995-09-30', '943210987');

-- ─── Bloques Horarios (agenda de 3 días para 2 médicos) ─
-- Día 1: 2026-10-28 · Dr. Torres (medico_id=1) · Consultorio 101-A (id=1)
INSERT INTO BLOQUE_HORARIO (medico_id, consultorio_id, fecha, hora_inicio, hora_fin, estado) VALUES
    (1, 1, '2026-10-28', '08:00', '08:30', 'Libre'),
    (1, 1, '2026-10-28', '08:30', '09:00', 'Libre'),
    (1, 1, '2026-10-28', '09:00', '09:30', 'Libre'),
    (1, 1, '2026-10-28', '09:30', '10:00', 'Libre'),
    (1, 1, '2026-10-28', '10:00', '10:30', 'Libre'),
    (1, 1, '2026-10-28', '10:30', '11:00', 'Libre'),
    (1, 1, '2026-10-28', '11:00', '11:30', 'Libre'),
    (1, 1, '2026-10-28', '11:30', '12:00', 'Libre');

-- Día 1: 2026-10-28 · Dra. Quispe (medico_id=2) · Consultorio 102-B (id=2)
INSERT INTO BLOQUE_HORARIO (medico_id, consultorio_id, fecha, hora_inicio, hora_fin, estado) VALUES
    (2, 2, '2026-10-28', '08:00', '08:30', 'Libre'),
    (2, 2, '2026-10-28', '08:30', '09:00', 'Libre'),
    (2, 2, '2026-10-28', '09:00', '09:30', 'Libre'),
    (2, 2, '2026-10-28', '09:30', '10:00', 'Libre'),
    (2, 2, '2026-10-28', '10:00', '10:30', 'Libre'),
    (2, 2, '2026-10-28', '10:30', '11:00', 'Libre'),
    (2, 2, '2026-10-28', '11:00', '11:30', 'Libre'),
    (2, 2, '2026-10-28', '11:30', '12:00', 'Libre');

-- Día 2: 2026-10-29 · Dr. Torres
INSERT INTO BLOQUE_HORARIO (medico_id, consultorio_id, fecha, hora_inicio, hora_fin, estado) VALUES
    (1, 1, '2026-10-29', '08:00', '08:30', 'Libre'),
    (1, 1, '2026-10-29', '08:30', '09:00', 'Libre'),
    (1, 1, '2026-10-29', '09:00', '09:30', 'Libre'),
    (1, 1, '2026-10-29', '09:30', '10:00', 'Libre'),
    (1, 1, '2026-10-29', '10:00', '10:30', 'Libre'),
    (1, 1, '2026-10-29', '10:30', '11:00', 'Libre'),
    (1, 1, '2026-10-29', '11:00', '11:30', 'Libre'),
    (1, 1, '2026-10-29', '11:30', '12:00', 'Libre');

-- Día 3: 2026-10-30 · Dr. Vargas (medico_id=3) · Consultorio 201-A (id=3)
INSERT INTO BLOQUE_HORARIO (medico_id, consultorio_id, fecha, hora_inicio, hora_fin, estado) VALUES
    (3, 3, '2026-10-30', '14:00', '14:30', 'Libre'),
    (3, 3, '2026-10-30', '14:30', '15:00', 'Libre'),
    (3, 3, '2026-10-30', '15:00', '15:30', 'Libre'),
    (3, 3, '2026-10-30', '15:30', '16:00', 'Libre'),
    (3, 3, '2026-10-30', '16:00', '16:30', 'Libre'),
    (3, 3, '2026-10-30', '16:30', '17:00', 'Libre'),
    (3, 3, '2026-10-30', '17:00', '17:30', 'Libre'),
    (3, 3, '2026-10-30', '17:30', '18:00', 'Libre');

-- ─── Solicitudes de Triaje en la Bolsa ───
INSERT INTO SOLICITUD_TRIAJE (paciente_id, especialidad_id, sintomas, preferencia_horario, score_urgencia, modalidad, estado) VALUES
    (1, 1, 'Fiebre alta persistente por 3 días, tos seca y dificultad para respirar.',
     'Mañanas', 8, 'Presencial', 'Pendiente'),
    (2, 2, 'Mi hijo de 5 años lleva una semana con diarrea intensa y no quiere comer.',
     'Mañanas', 9, 'Presencial', 'Pendiente'),
    (3, 3, 'Dolor en el pecho al caminar rápido, palpitaciones irregulares ocasionales.',
     'Tardes',  7, 'Presencial', 'Pendiente'),
    (4, 4, 'Cefaleas intensas recurrentes por las tardes, visión borrosa ocasional.',
     'Tardes',  5, 'Meet',       'Pendiente');

-- ─── Lista de Espera ─────────────────────
INSERT INTO LISTA_ESPERA (paciente_id, especialidad_id, prioridad, estado) VALUES
    (5, 3, 8, 'En Espera'),
    (1, 2, 5, 'En Espera');


-- ██████████████████████████████████████████████████████████
--   BLOQUE 3 · STORED PROCEDURES
-- ██████████████████████████████████████████████████████████

DELIMITER //

-- ─────────────────────────────────────────────────────────────
-- SP 1: sp_registrar_cita_medica
--   Registra una cita con bloqueo pesimista (FOR UPDATE).
--   Fuente: diccionario_secuencias.md §1 pasos 10-11 y
--            secuencia.mmd pasos 10-12
-- ─────────────────────────────────────────────────────────────
CREATE PROCEDURE sp_registrar_cita_medica(
    IN  p_paciente_id      INT,
    IN  p_bloque_id        INT,
    IN  p_tipo_consulta_id INT,
    IN  p_aseguradora_id   INT,
    IN  p_solicitud_id     INT,        -- NULL si no viene de triaje
    OUT p_cita_id          INT,
    OUT p_mensaje          VARCHAR(255)
)
BEGIN
    DECLARE v_estado_bloque   VARCHAR(20);
    DECLARE v_medico_id       INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_cita_id = -1;
        SET p_mensaje = 'Error: fallo interno al registrar la cita';
    END;

    START TRANSACTION;

    -- Bloqueo pesimista: ninguna otra sesión puede leer este bloque hasta COMMIT/ROLLBACK
    SELECT estado, medico_id
      INTO v_estado_bloque, v_medico_id
      FROM BLOQUE_HORARIO
     WHERE id = p_bloque_id
       FOR UPDATE;

    IF v_estado_bloque = 'Libre' THEN
        -- Crear la cita
        INSERT INTO CITA (paciente_id, medico_id, bloque_horario_id,
                          tipo_consulta_id, solicitud_id, aseguradora_id, estado)
        VALUES (p_paciente_id, v_medico_id, p_bloque_id,
                p_tipo_consulta_id, p_solicitud_id, p_aseguradora_id, 'Programada');

        SET p_cita_id = LAST_INSERT_ID();

        -- Marcar bloque como ocupado
        UPDATE BLOQUE_HORARIO
           SET estado = 'Ocupado'
         WHERE id = p_bloque_id;

        -- Si viene de triaje, marcar solicitud como Agendado
        IF p_solicitud_id IS NOT NULL THEN
            UPDATE SOLICITUD_TRIAJE
               SET estado = 'Agendado'
             WHERE id = p_solicitud_id;
        END IF;

        COMMIT;
        SET p_mensaje = 'Cita registrada exitosamente';
    ELSE
        ROLLBACK;
        SET p_cita_id = -1;
        SET p_mensaje = 'Error: Slot no disponible';
    END IF;
END //


-- ─────────────────────────────────────────────────────────────
-- SP 2: sp_cancelar_cita_reactiva
--   Cancela la cita, libera el bloque, registra en historial,
--   penaliza al paciente si acumula >= 3 cancelaciones,
--   y devuelve el primer candidato de la lista de espera.
--   Fuente: secuencia_reactiva.mmd pasos 3-8 y
--            diccionario_secuencias.md §2
-- ─────────────────────────────────────────────────────────────
CREATE PROCEDURE sp_cancelar_cita_reactiva(
    IN  p_cita_id          INT,
    IN  p_motivo           VARCHAR(500),
    OUT p_paciente_espera_id INT
)
BEGIN
    DECLARE v_bloque_id     INT;
    DECLARE v_paciente_id   INT;
    DECLARE v_usuario_id    INT;
    DECLARE v_cancelaciones INT DEFAULT 0;
    DECLARE v_espera_id     INT DEFAULT -1;
    DECLARE v_especialidad_id INT;

    -- Obtener datos de la cita
    SELECT c.bloque_horario_id, c.paciente_id, p.usuario_id,
           bh.medico_id
      INTO v_bloque_id, v_paciente_id, v_usuario_id,
           @v_medico_id
      FROM CITA c
      JOIN PACIENTE p  ON p.id = c.paciente_id
      JOIN BLOQUE_HORARIO bh ON bh.id = c.bloque_horario_id
     WHERE c.id = p_cita_id
     LIMIT 1;

    -- Obtener la especialidad a partir del médico (primera especialidad asignada)
    SELECT especialidad_id INTO v_especialidad_id
      FROM MEDICO_ESPECIALIDAD
     WHERE medico_id = @v_medico_id
     LIMIT 1;

    -- Cancelar la cita
    UPDATE CITA
       SET estado = 'Cancelada'
     WHERE id = p_cita_id;

    -- Liberar el bloque horario
    UPDATE BLOQUE_HORARIO
       SET estado = 'Libre'
     WHERE id = v_bloque_id;

    -- Registrar en historial de auditoría
    INSERT INTO HISTORIAL_REPROGRAMACION (cita_id, motivo_cambio, estado)
    VALUES (p_cita_id, p_motivo, 'Valido');

    -- Contar cancelaciones totales del paciente
    SELECT COUNT(*) INTO v_cancelaciones
      FROM HISTORIAL_REPROGRAMACION hr
      JOIN CITA c ON c.id = hr.cita_id
     WHERE c.paciente_id = v_paciente_id;

    -- Penalizar si acumula 3 o más cancelaciones
    IF v_cancelaciones >= 3 THEN
        UPDATE USUARIO
           SET estado = 'Bloqueado'
         WHERE id = v_usuario_id;
    END IF;

    -- Buscar candidato de lista de espera (mayor prioridad, misma especialidad)
    SELECT id INTO v_espera_id
      FROM LISTA_ESPERA
     WHERE especialidad_id = v_especialidad_id
       AND estado = 'En Espera'
     ORDER BY prioridad DESC, fecha_ingreso ASC
     LIMIT 1;

    SET p_paciente_espera_id = IFNULL(v_espera_id, -1);
END //


-- ─────────────────────────────────────────────────────────────
-- SP 3: sp_crear_bloques_horarios
--   Generador masivo de bloques de agenda para un médico
--   en intervalos configurables.
--   Fuente: backlog_tareas_jira.md §HU-08
-- ─────────────────────────────────────────────────────────────
CREATE PROCEDURE sp_crear_bloques_horarios(
    IN  p_medico_id          INT,
    IN  p_consultorio_id     INT,
    IN  p_fecha              DATE,
    IN  p_hora_inicio        TIME,
    IN  p_hora_fin           TIME,
    IN  p_intervalo_minutos  INT,
    OUT p_bloques_creados    INT
)
BEGIN
    DECLARE v_hora_actual   TIME;
    DECLARE v_hora_bloque_fin TIME;
    DECLARE v_existe        INT DEFAULT 0;

    SET p_bloques_creados = 0;
    SET v_hora_actual     = p_hora_inicio;

    WHILE v_hora_actual < p_hora_fin DO
        SET v_hora_bloque_fin = ADDTIME(v_hora_actual,
                                    SEC_TO_TIME(p_intervalo_minutos * 60));

        -- Verificar que no haya solapamiento para este médico en esta fecha/hora
        SELECT COUNT(*) INTO v_existe
          FROM BLOQUE_HORARIO
         WHERE medico_id   = p_medico_id
           AND fecha        = p_fecha
           AND hora_inicio  = v_hora_actual;

        IF v_existe = 0 THEN
            INSERT INTO BLOQUE_HORARIO
                (medico_id, consultorio_id, fecha, hora_inicio, hora_fin, estado)
            VALUES
                (p_medico_id, p_consultorio_id, p_fecha,
                 v_hora_actual, v_hora_bloque_fin, 'Libre');
            SET p_bloques_creados = p_bloques_creados + 1;
        END IF;

        SET v_hora_actual = v_hora_bloque_fin;
    END WHILE;
END //


-- ─────────────────────────────────────────────────────────────
-- SP 4: sp_registrar_asistencia_ticket
--   Check-in físico: genera el ticket de turno para sala de espera.
--   Fuente: diccionario_casos_de_uso.md §Módulo 7 — Registrar asistencia
--            backlog_tareas_jira.md §HU-09
-- ─────────────────────────────────────────────────────────────
CREATE PROCEDURE sp_registrar_asistencia_ticket(
    IN  p_cita_id      INT,
    OUT p_codigo_turno VARCHAR(10)
)
BEGIN
    DECLARE v_estado_cita VARCHAR(20);
    DECLARE v_ya_existe   INT DEFAULT 0;

    -- Verificar que la cita existe y está en estado válido
    SELECT estado INTO v_estado_cita
      FROM CITA
     WHERE id = p_cita_id
     LIMIT 1;

    -- Verificar que no se haya generado ticket ya
    SELECT COUNT(*) INTO v_ya_existe
      FROM TICKET_ASISTENCIA
     WHERE cita_id = p_cita_id;

    IF (v_estado_cita IN ('Programada','Pagada')) AND v_ya_existe = 0 THEN
        -- Generar código de turno: C-XXX (con ceros a la izquierda)
        SET p_codigo_turno = CONCAT('C-', LPAD(p_cita_id, 3, '0'));

        INSERT INTO TICKET_ASISTENCIA (cita_id, codigo_turno, estado)
        VALUES (p_cita_id, p_codigo_turno, 'Impreso');
    ELSEIF v_ya_existe > 0 THEN
        -- Ya existe: retornar el código existente
        SELECT codigo_turno INTO p_codigo_turno
          FROM TICKET_ASISTENCIA
         WHERE cita_id = p_cita_id
         LIMIT 1;
    ELSE
        SET p_codigo_turno = 'ERROR';
    END IF;
END //


-- ─────────────────────────────────────────────────────────────
-- SP 5: sp_reprogramar_cita
--   Reprograma una cita a un nuevo bloque horario.
--   Si el historial >= 3 reprogramaciones: bloquea la cuenta.
--   Fuente: secuencia_reprogramacion.mmd y diccionario_secuencias.md §3
-- ─────────────────────────────────────────────────────────────
CREATE PROCEDURE sp_reprogramar_cita(
    IN  p_cita_id         INT,
    IN  p_nuevo_bloque_id INT,
    IN  p_motivo          VARCHAR(500),
    OUT p_mensaje         VARCHAR(255)
)
BEGIN
    DECLARE v_count          INT DEFAULT 0;
    DECLARE v_bloque_actual  INT;
    DECLARE v_paciente_id    INT;
    DECLARE v_usuario_id     INT;
    DECLARE v_estado_nuevo   VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_mensaje = 'Error interno al reprogramar la cita';
    END;

    -- Contar reprogramaciones previas de esta cita
    SELECT COUNT(*) INTO v_count
      FROM HISTORIAL_REPROGRAMACION
     WHERE cita_id = p_cita_id;

    -- Obtener datos actuales de la cita
    SELECT bloque_horario_id, paciente_id
      INTO v_bloque_actual, v_paciente_id
      FROM CITA
     WHERE id = p_cita_id
     LIMIT 1;

    SELECT usuario_id INTO v_usuario_id
      FROM PACIENTE
     WHERE id = v_paciente_id
     LIMIT 1;

    IF v_count >= 3 THEN
        -- Bloquear cuenta del usuario y rechazar
        UPDATE USUARIO
           SET estado = 'Bloqueado'
         WHERE id = v_usuario_id;
        SET p_mensaje = 'Error 403: Límite de reprogramaciones excedido. Cuenta suspendida.';
    ELSE
        -- Verificar que el nuevo bloque esté libre
        SELECT estado INTO v_estado_nuevo
          FROM BLOQUE_HORARIO
         WHERE id = p_nuevo_bloque_id
           FOR UPDATE;

        IF v_estado_nuevo != 'Libre' THEN
            SET p_mensaje = 'Error: El nuevo bloque horario no está disponible';
        ELSE
            START TRANSACTION;

            -- Liberar bloque anterior
            UPDATE BLOQUE_HORARIO
               SET estado = 'Libre'
             WHERE id = v_bloque_actual;

            -- Registrar en historial
            INSERT INTO HISTORIAL_REPROGRAMACION (cita_id, motivo_cambio, estado)
            VALUES (p_cita_id, p_motivo, 'Valido');

            -- Actualizar cita con nuevo bloque
            UPDATE CITA
               SET bloque_horario_id = p_nuevo_bloque_id,
                   estado            = 'Reprogramada'
             WHERE id = p_cita_id;

            -- Marcar nuevo bloque como ocupado
            UPDATE BLOQUE_HORARIO
               SET estado = 'Ocupado'
             WHERE id = p_nuevo_bloque_id;

            COMMIT;
            SET p_mensaje = '200 OK: Cita reprogramada exitosamente';
        END IF;
    END IF;
END //


-- ██████████████████████████████████████████████████████████
--   BLOQUE 4 · FUNCIONES AUXILIARES
-- ██████████████████████████████████████████████████████████

-- ─────────────────────────────────────────────────────────────
-- FN 1: fn_calcular_edad
--   Calcula la edad exacta en años a partir de la fecha de nacimiento.
--   Usada en validaciones de Pediatría (edad máx 18) y módulo de triaje.
-- ─────────────────────────────────────────────────────────────
CREATE FUNCTION fn_calcular_edad(p_fecha_nacimiento DATE)
RETURNS INT
DETERMINISTIC
BEGIN
    RETURN TIMESTAMPDIFF(YEAR, p_fecha_nacimiento, CURDATE());
END //


-- ─────────────────────────────────────────────────────────────
-- FN 2: fn_verificar_slot_libre
--   Retorna TRUE (1) si el bloque horario dado está disponible.
--   Usada por el motor de agendamiento antes de ejecutar la reserva.
-- ─────────────────────────────────────────────────────────────
CREATE FUNCTION fn_verificar_slot_libre(p_bloque_id INT)
RETURNS TINYINT(1)
READS SQL DATA
BEGIN
    DECLARE v_estado VARCHAR(20);
    SELECT estado INTO v_estado
      FROM BLOQUE_HORARIO
     WHERE id = p_bloque_id
     LIMIT 1;
    RETURN IF(v_estado = 'Libre', 1, 0);
END //

DELIMITER ;


-- ─────────────────────────────────────────────────────────────
-- VERIFICACIÓN RÁPIDA — Ejecutar para confirmar instalación
-- ─────────────────────────────────────────────────────────────
-- SHOW TABLES;                      -- Debe listar 16 tablas
-- SELECT COUNT(*) FROM USUARIO;     -- Debe retornar 10
-- SELECT COUNT(*) FROM BLOQUE_HORARIO; -- Debe retornar 32
-- SELECT fn_calcular_edad('1990-03-15'); -- Debe retornar 36 (aprox)
-- SELECT fn_verificar_slot_libre(1);    -- Debe retornar 1 (Libre)
