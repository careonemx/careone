-- ============================================================================
-- CareOne - V8: catalogo de tipos de cita, configurable por clinica (tenant).
-- Spec: Primera vez, Seguimiento, Revision, Urgencia (editables por la clinica).
-- ============================================================================
CREATE TABLE tbl_tipo_cita (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT       NOT NULL,
    s_nombre         VARCHAR(80)  NOT NULL,
    n_duracion_def   INTEGER,                       -- duracion sugerida (min), opcional
    b_activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    d_creado_en      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_tipocita_tenant FOREIGN KEY (fn_tenant_id) REFERENCES tbl_clinica (pn_id)
);
CREATE INDEX ix_tipocita_tenant ON tbl_tipo_cita (fn_tenant_id);

-- La cita referencia un tipo (opcional para no romper citas existentes).
ALTER TABLE tbl_cita ADD COLUMN fn_tipo_cita_id BIGINT;
ALTER TABLE tbl_cita ADD CONSTRAINT fk_cita_tipo
    FOREIGN KEY (fn_tipo_cita_id) REFERENCES tbl_tipo_cita (pn_id);
CREATE INDEX ix_cita_tipo ON tbl_cita (fn_tipo_cita_id);

-- Backfill: sembrar los 4 tipos por defecto para cada clinica existente.
INSERT INTO tbl_tipo_cita (fn_tenant_id, s_nombre, n_duracion_def)
SELECT c.pn_id, t.nombre, t.dur
FROM tbl_clinica c
CROSS JOIN (VALUES
    ('Primera vez', 60),
    ('Seguimiento', 30),
    ('Revision', 30),
    ('Urgencia', 45)
) AS t(nombre, dur);
