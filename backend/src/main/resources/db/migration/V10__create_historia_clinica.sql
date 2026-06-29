-- ============================================================================
-- CareOne - V10: historia clinica del paciente (spec v1.0).
--   tbl_historia_clinica: 27 condiciones + antecedentes personales (1:1 paciente)
--   tbl_gineco_obstetrico: solo si sexo femenino (1:1 paciente)
--   tbl_higiene_bucal: extension dental (1:1 paciente)
-- Booleans por condicion para consulta directa de alertas (no EAV).
-- ============================================================================

CREATE TABLE tbl_historia_clinica (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT      NOT NULL,
    fn_paciente_id   BIGINT      NOT NULL,
    -- ---- 27 condiciones (padece o ha padecido de) ----
    b_trastorno_cardiaco   BOOLEAN NOT NULL DEFAULT FALSE,
    b_infarto              BOOLEAN NOT NULL DEFAULT FALSE,
    b_soplos               BOOLEAN NOT NULL DEFAULT FALSE,
    b_hipertension         BOOLEAN NOT NULL DEFAULT FALSE,
    b_hipotension          BOOLEAN NOT NULL DEFAULT FALSE,
    b_sinusitis            BOOLEAN NOT NULL DEFAULT FALSE,
    b_trastornos_psiq      BOOLEAN NOT NULL DEFAULT FALSE,
    b_depresion            BOOLEAN NOT NULL DEFAULT FALSE,
    b_problemas_higado     BOOLEAN NOT NULL DEFAULT FALSE,
    b_asma                 BOOLEAN NOT NULL DEFAULT FALSE,
    b_bradipnea            BOOLEAN NOT NULL DEFAULT FALSE,
    b_tuberculosis         BOOLEAN NOT NULL DEFAULT FALSE,
    b_bronquitis           BOOLEAN NOT NULL DEFAULT FALSE,
    b_anemia               BOOLEAN NOT NULL DEFAULT FALSE,
    b_leucemia             BOOLEAN NOT NULL DEFAULT FALSE,
    b_gastritis            BOOLEAN NOT NULL DEFAULT FALSE,
    b_colitis              BOOLEAN NOT NULL DEFAULT FALSE,
    b_diabetes             BOOLEAN NOT NULL DEFAULT FALSE,
    b_artritis             BOOLEAN NOT NULL DEFAULT FALSE,
    b_apoplejia            BOOLEAN NOT NULL DEFAULT FALSE,
    b_epilepsia            BOOLEAN NOT NULL DEFAULT FALSE,
    b_convulsiones         BOOLEAN NOT NULL DEFAULT FALSE,
    b_hipertiroidismo      BOOLEAN NOT NULL DEFAULT FALSE,
    b_hipotiroidismo       BOOLEAN NOT NULL DEFAULT FALSE,
    b_ets                  BOOLEAN NOT NULL DEFAULT FALSE,
    b_cancer               BOOLEAN NOT NULL DEFAULT FALSE,
    b_problemas_renales    BOOLEAN NOT NULL DEFAULT FALSE,
    -- ---- antecedentes personales (Si/No) ----
    b_hospitalizacion      BOOLEAN NOT NULL DEFAULT FALSE,
    b_atencion_medica_6m   BOOLEAN NOT NULL DEFAULT FALSE,
    b_atencion_odon_6m     BOOLEAN NOT NULL DEFAULT FALSE,
    b_problema_anestesia   BOOLEAN NOT NULL DEFAULT FALSE,
    b_problema_coagulacion BOOLEAN NOT NULL DEFAULT FALSE,
    b_habitos_adicciones   BOOLEAN NOT NULL DEFAULT FALSE,
    b_alergia_medicamentos BOOLEAN NOT NULL DEFAULT FALSE,
    b_toma_medicamentos    BOOLEAN NOT NULL DEFAULT FALSE,
    b_bajo_cuidado_medico  BOOLEAN NOT NULL DEFAULT FALSE,
    b_embarazo             BOOLEAN NOT NULL DEFAULT FALSE,
    s_observaciones        VARCHAR(1000),
    b_completada           BOOLEAN NOT NULL DEFAULT FALSE,
    d_creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_hist_tenant   FOREIGN KEY (fn_tenant_id)   REFERENCES tbl_clinica (pn_id),
    CONSTRAINT fk_hist_paciente FOREIGN KEY (fn_paciente_id) REFERENCES tbl_paciente (pn_id),
    CONSTRAINT uq_hist_paciente UNIQUE (fn_paciente_id)
);
CREATE INDEX ix_hist_tenant ON tbl_historia_clinica (fn_tenant_id);

CREATE TABLE tbl_gineco_obstetrico (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT      NOT NULL,
    fn_paciente_id   BIGINT      NOT NULL,
    n_gestas         INTEGER     NOT NULL DEFAULT 0,
    n_partos         INTEGER     NOT NULL DEFAULT 0,
    n_abortos        INTEGER     NOT NULL DEFAULT 0,
    s_tiempo_gestacion VARCHAR(60),
    s_metodo_planificacion VARCHAR(120),
    d_creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_gineco_tenant   FOREIGN KEY (fn_tenant_id)   REFERENCES tbl_clinica (pn_id),
    CONSTRAINT fk_gineco_paciente FOREIGN KEY (fn_paciente_id) REFERENCES tbl_paciente (pn_id),
    CONSTRAINT uq_gineco_paciente UNIQUE (fn_paciente_id)
);
CREATE INDEX ix_gineco_tenant ON tbl_gineco_obstetrico (fn_tenant_id);

CREATE TABLE tbl_higiene_bucal (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT      NOT NULL,
    fn_paciente_id   BIGINT      NOT NULL,
    n_cepillados_dia INTEGER,
    s_tipo_cepillo   VARCHAR(40),
    b_usa_hilo       BOOLEAN     NOT NULL DEFAULT FALSE,
    b_usa_enjuague   BOOLEAN     NOT NULL DEFAULT FALSE,
    d_creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_hig_tenant   FOREIGN KEY (fn_tenant_id)   REFERENCES tbl_clinica (pn_id),
    CONSTRAINT fk_hig_paciente FOREIGN KEY (fn_paciente_id) REFERENCES tbl_paciente (pn_id),
    CONSTRAINT uq_hig_paciente UNIQUE (fn_paciente_id)
);
CREATE INDEX ix_hig_tenant ON tbl_higiene_bucal (fn_tenant_id);
