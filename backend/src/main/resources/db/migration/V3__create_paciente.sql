-- ============================================================================
-- CareOne - V3: paciente. Tenant-aware (fn_tenant_id). Puede ligarse a un doctor.
-- ============================================================================
CREATE TABLE tbl_paciente (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT       NOT NULL,
    fn_doctor_id     BIGINT,                       -- doctor responsable (opcional)
    s_nombre         VARCHAR(120) NOT NULL,
    s_apellidos      VARCHAR(120),
    s_telefono       VARCHAR(30),
    s_email          VARCHAR(160),
    d_fecha_nacimiento DATE,
    e_sexo           VARCHAR(20),                  -- MASCULINO/FEMENINO/OTRO
    s_ocupacion      VARCHAR(120),
    s_tipo_sangre    VARCHAR(8),
    s_direccion      VARCHAR(400),
    s_alergias       VARCHAR(600),                 -- alertas medicas (texto)
    s_notas          VARCHAR(1000),
    -- contacto de emergencia
    s_emergencia_nombre     VARCHAR(160),
    s_emergencia_parentesco VARCHAR(60),
    s_emergencia_telefono   VARCHAR(30),
    b_activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    d_creado_en      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_paciente_tenant FOREIGN KEY (fn_tenant_id) REFERENCES tbl_clinica (pn_id),
    CONSTRAINT fk_paciente_doctor FOREIGN KEY (fn_doctor_id) REFERENCES tbl_doctor (pn_id)
);
CREATE INDEX ix_paciente_tenant ON tbl_paciente (fn_tenant_id);
CREATE INDEX ix_paciente_doctor ON tbl_paciente (fn_doctor_id);
CREATE INDEX ix_paciente_nombre ON tbl_paciente (fn_tenant_id, lower(s_nombre));
