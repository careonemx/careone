-- ============================================================================
-- CareOne - V11: consentimientos (entidad independiente, spec v1.0).
--   Tipos: GENERAL, CIRUGIA, IMPLANTES, ORTODONCIA, ENDODONCIA
--   Estados: PENDIENTE / FIRMADO_DIGITAL / FIRMADO_FISICO
-- La firma en iPad es UI futura; aqui se soporta subir PDF (firmado fisico)
-- y marcar firmado. Tenant-aware.
-- ============================================================================
CREATE TABLE tbl_consentimiento (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT       NOT NULL,
    fn_paciente_id   BIGINT       NOT NULL,
    e_tipo           VARCHAR(20)  NOT NULL,                  -- GENERAL/CIRUGIA/...
    e_estado         VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE',
    s_archivo_nombre VARCHAR(200),                           -- nombre original del PDF subido
    s_archivo_ruta   VARCHAR(400),                           -- ruta relativa en el volumen
    d_firmado_en     TIMESTAMPTZ,
    s_notas          VARCHAR(400),
    d_creado_en      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_consent_tenant   FOREIGN KEY (fn_tenant_id)   REFERENCES tbl_clinica (pn_id),
    CONSTRAINT fk_consent_paciente FOREIGN KEY (fn_paciente_id) REFERENCES tbl_paciente (pn_id)
);
CREATE INDEX ix_consent_tenant   ON tbl_consentimiento (fn_tenant_id);
CREATE INDEX ix_consent_paciente ON tbl_consentimiento (fn_paciente_id);
