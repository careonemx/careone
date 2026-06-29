-- ============================================================================
-- CareOne - V1: tablas nucleo. Convencion de nomenclatura por prefijos:
--   tbl_ = tabla
--   pn_  = primary key numerica       fn_ = foreign key numerica
--   s_   = string/varchar             b_  = boolean
--   d_   = date/timestamp             t_  = time
--   e_   = enum (string)              n_  = numerico no-clave
-- Multi-tenant: fn_tenant_id (= clinica) en cada tabla de NEGOCIO.
-- Catalogos globales (especialidad, rol, permiso) NO llevan tenant.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- CATALOGO GLOBAL: especialidad
-- ---------------------------------------------------------------------------
CREATE TABLE tbl_especialidad (
    pn_id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    s_codigo        VARCHAR(40)  NOT NULL,
    s_nombre        VARCHAR(120) NOT NULL,
    b_activo        BOOLEAN      NOT NULL DEFAULT TRUE,
    d_creado_en     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_especialidad_codigo UNIQUE (s_codigo)
);

-- ---------------------------------------------------------------------------
-- TENANT RAIZ: clinica
-- ---------------------------------------------------------------------------
CREATE TABLE tbl_clinica (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_especialidad_id BIGINT     NOT NULL,
    s_nombre         VARCHAR(160) NOT NULL,
    s_rfc            VARCHAR(20),
    s_telefono       VARCHAR(30),
    s_email          VARCHAR(160),
    s_direccion      VARCHAR(400),
    t_hora_apertura  TIME         NOT NULL DEFAULT '08:00',
    t_hora_cierre    TIME         NOT NULL DEFAULT '18:00',
    b_activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    -- ---- Fase final: WhatsApp (solo estructura, sin logica) ----
    s_whatsapp_numero VARCHAR(30),
    b_whatsapp_activo BOOLEAN     NOT NULL DEFAULT FALSE,
    d_creado_en      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_clinica_especialidad FOREIGN KEY (fn_especialidad_id)
        REFERENCES tbl_especialidad (pn_id)
);
CREATE INDEX ix_clinica_especialidad ON tbl_clinica (fn_especialidad_id);
CREATE INDEX ix_clinica_activo       ON tbl_clinica (b_activo);

-- ---------------------------------------------------------------------------
-- CATALOGO GLOBAL: rol
-- ---------------------------------------------------------------------------
CREATE TABLE tbl_rol (
    pn_id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    e_nombre        VARCHAR(40)  NOT NULL,
    s_descripcion   VARCHAR(200),
    CONSTRAINT uq_rol_nombre UNIQUE (e_nombre)
);

-- ---------------------------------------------------------------------------
-- CATALOGO GLOBAL: permiso
-- ---------------------------------------------------------------------------
CREATE TABLE tbl_permiso (
    pn_id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    s_codigo        VARCHAR(60)  NOT NULL,
    s_descripcion   VARCHAR(200),
    CONSTRAINT uq_permiso_codigo UNIQUE (s_codigo)
);

-- ---------------------------------------------------------------------------
-- MATRIZ DE PERMISOS (configurable):
--   fn_tenant_id NULL -> regla BASE; valor -> override por clinica
-- ---------------------------------------------------------------------------
CREATE TABLE tbl_rol_permiso (
    pn_id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_rol_id       BIGINT  NOT NULL,
    fn_permiso_id   BIGINT  NOT NULL,
    fn_tenant_id    BIGINT,
    b_permitido     BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_rolperm_rol     FOREIGN KEY (fn_rol_id)     REFERENCES tbl_rol (pn_id),
    CONSTRAINT fk_rolperm_permiso FOREIGN KEY (fn_permiso_id) REFERENCES tbl_permiso (pn_id),
    CONSTRAINT fk_rolperm_tenant  FOREIGN KEY (fn_tenant_id)  REFERENCES tbl_clinica (pn_id)
);
CREATE UNIQUE INDEX uq_rolperm_base
    ON tbl_rol_permiso (fn_rol_id, fn_permiso_id) WHERE fn_tenant_id IS NULL;
CREATE UNIQUE INDEX uq_rolperm_tenant
    ON tbl_rol_permiso (fn_rol_id, fn_permiso_id, fn_tenant_id) WHERE fn_tenant_id IS NOT NULL;
CREATE INDEX ix_rolperm_tenant ON tbl_rol_permiso (fn_tenant_id);

-- ---------------------------------------------------------------------------
-- usuario (login). fn_tenant_id NULL solo para SUPERADMIN (global).
-- ---------------------------------------------------------------------------
CREATE TABLE tbl_usuario (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT,
    s_email          VARCHAR(160) NOT NULL,
    s_password_hash  VARCHAR(120) NOT NULL,
    s_nombre         VARCHAR(120) NOT NULL,
    s_apellidos      VARCHAR(120),
    s_telefono       VARCHAR(30),
    b_activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    d_ultimo_acceso  TIMESTAMPTZ,
    d_creado_en      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_usuario_tenant FOREIGN KEY (fn_tenant_id) REFERENCES tbl_clinica (pn_id)
);
CREATE UNIQUE INDEX uq_usuario_email_tenant
    ON tbl_usuario (fn_tenant_id, lower(s_email)) WHERE fn_tenant_id IS NOT NULL;
CREATE UNIQUE INDEX uq_usuario_email_global
    ON tbl_usuario (lower(s_email)) WHERE fn_tenant_id IS NULL;
CREATE INDEX ix_usuario_tenant ON tbl_usuario (fn_tenant_id);

-- ---------------------------------------------------------------------------
-- usuario_rol (N:M)
-- ---------------------------------------------------------------------------
CREATE TABLE tbl_usuario_rol (
    fn_usuario_id  BIGINT NOT NULL,
    fn_rol_id      BIGINT NOT NULL,
    CONSTRAINT pk_usuario_rol PRIMARY KEY (fn_usuario_id, fn_rol_id),
    CONSTRAINT fk_usuariorol_usuario FOREIGN KEY (fn_usuario_id) REFERENCES tbl_usuario (pn_id) ON DELETE CASCADE,
    CONSTRAINT fk_usuariorol_rol     FOREIGN KEY (fn_rol_id)     REFERENCES tbl_rol (pn_id)
);
CREATE INDEX ix_usuariorol_rol ON tbl_usuario_rol (fn_rol_id);

-- ---------------------------------------------------------------------------
-- doctor (perfil 1:1 con usuario)
-- ---------------------------------------------------------------------------
CREATE TABLE tbl_doctor (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT      NOT NULL,
    fn_usuario_id    BIGINT      NOT NULL,
    s_cedula         VARCHAR(40),
    fn_especialidad_id BIGINT,
    b_activo         BOOLEAN     NOT NULL DEFAULT TRUE,
    d_creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_doctor_tenant       FOREIGN KEY (fn_tenant_id)       REFERENCES tbl_clinica (pn_id),
    CONSTRAINT fk_doctor_usuario      FOREIGN KEY (fn_usuario_id)      REFERENCES tbl_usuario (pn_id),
    CONSTRAINT fk_doctor_especialidad FOREIGN KEY (fn_especialidad_id) REFERENCES tbl_especialidad (pn_id),
    CONSTRAINT uq_doctor_usuario      UNIQUE (fn_usuario_id)
);
CREATE INDEX ix_doctor_tenant ON tbl_doctor (fn_tenant_id);

-- ---------------------------------------------------------------------------
-- recepcionista (1:1 con usuario). fn_doctor_id NULL = compartida.
-- ---------------------------------------------------------------------------
CREATE TABLE tbl_recepcionista (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT      NOT NULL,
    fn_usuario_id    BIGINT      NOT NULL,
    fn_doctor_id     BIGINT,
    b_activo         BOOLEAN     NOT NULL DEFAULT TRUE,
    d_creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_recep_tenant  FOREIGN KEY (fn_tenant_id)  REFERENCES tbl_clinica (pn_id),
    CONSTRAINT fk_recep_usuario FOREIGN KEY (fn_usuario_id) REFERENCES tbl_usuario (pn_id),
    CONSTRAINT fk_recep_doctor  FOREIGN KEY (fn_doctor_id)  REFERENCES tbl_doctor (pn_id),
    CONSTRAINT uq_recep_usuario UNIQUE (fn_usuario_id)
);
CREATE INDEX ix_recep_tenant ON tbl_recepcionista (fn_tenant_id);
CREATE INDEX ix_recep_doctor ON tbl_recepcionista (fn_doctor_id);

-- ---------------------------------------------------------------------------
-- ayudante (1:1 con usuario, SIEMPRE ligado a un doctor)
-- ---------------------------------------------------------------------------
CREATE TABLE tbl_ayudante (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT      NOT NULL,
    fn_usuario_id    BIGINT      NOT NULL,
    fn_doctor_id     BIGINT      NOT NULL,
    b_activo         BOOLEAN     NOT NULL DEFAULT TRUE,
    d_creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_ayud_tenant  FOREIGN KEY (fn_tenant_id)  REFERENCES tbl_clinica (pn_id),
    CONSTRAINT fk_ayud_usuario FOREIGN KEY (fn_usuario_id) REFERENCES tbl_usuario (pn_id),
    CONSTRAINT fk_ayud_doctor  FOREIGN KEY (fn_doctor_id)  REFERENCES tbl_doctor (pn_id),
    CONSTRAINT uq_ayud_usuario UNIQUE (fn_usuario_id)
);
CREATE INDEX ix_ayud_tenant ON tbl_ayudante (fn_tenant_id);
CREATE INDEX ix_ayud_doctor ON tbl_ayudante (fn_doctor_id);

-- ============================================================================
-- SEED de catalogos base
-- ============================================================================
INSERT INTO tbl_especialidad (s_codigo, s_nombre) VALUES
    ('ODONTOLOGIA', 'Odontologia'),
    ('PSICOLOGIA',  'Psicologia'),
    ('FISIOTERAPIA','Fisioterapia'),
    ('MEDICINA_GENERAL', 'Medicina general');

INSERT INTO tbl_rol (e_nombre, s_descripcion) VALUES
    ('SUPERADMIN',     'Administrador global del sistema (desarrollador)'),
    ('ADMIN_CLINICA',  'Dueno/responsable de una clinica'),
    ('DOCTOR',         'Profesional que atiende pacientes'),
    ('RECEPCIONISTA',  'Agenda, confirma y cobra'),
    ('AYUDANTE',       'Apoyo del doctor, permisos limitados');

INSERT INTO tbl_permiso (s_codigo, s_descripcion) VALUES
    ('CITA_VER',            'Ver citas del dia'),
    ('CITA_CREAR',          'Crear cita nueva'),
    ('CITA_CONFIRMAR',      'Confirmar una cita'),
    ('CITA_CANCELAR',       'Cancelar una cita'),
    ('CITA_NO_ASISTIO',     'Marcar que el paciente no asistio'),
    ('CITA_FINALIZAR',      'Finalizar una consulta'),
    ('PAGO_REGISTRAR',      'Cobrar / registrar un pago'),
    ('PAGO_VER_SALDO',      'Ver cuanto debe el paciente'),
    ('PACIENTE_VER',        'Ver pacientes'),
    ('PACIENTE_EDITAR',     'Crear/editar pacientes'),
    ('EXPEDIENTE_VER',      'Ver el expediente completo'),
    ('EXPEDIENTE_BASICO',   'Ver solo datos basicos del paciente'),
    ('ALERTA_MEDICA_VER',   'Ver alertas medicas del paciente');
