package com.careone.api.core.historia;

import com.careone.api.tenant.TenantAware;
import com.careone.api.tenant.TenantEntityListener;
import com.careone.api.util.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;

/**
 * Historia clinica (1:1 con paciente). 27 condiciones + antecedentes personales.
 * Booleans explicitos para consultar alertas directamente.
 */
@Entity
@Table(name = "tbl_historia_clinica")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(TenantEntityListener.class)
@Filter(name = "tenantFilter", condition = "fn_tenant_id = :tenantId")
public class HistoriaClinica extends Auditable implements TenantAware {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    @Column(name = "fn_tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "fn_paciente_id", nullable = false)
    private Long pacienteId;

    // ---- 27 condiciones ----
    @Column(name = "b_trastorno_cardiaco", nullable = false) private boolean trastornoCardiaco;
    @Column(name = "b_infarto", nullable = false) private boolean infarto;
    @Column(name = "b_soplos", nullable = false) private boolean soplos;
    @Column(name = "b_hipertension", nullable = false) private boolean hipertension;
    @Column(name = "b_hipotension", nullable = false) private boolean hipotension;
    @Column(name = "b_sinusitis", nullable = false) private boolean sinusitis;
    @Column(name = "b_trastornos_psiq", nullable = false) private boolean trastornosPsiq;
    @Column(name = "b_depresion", nullable = false) private boolean depresion;
    @Column(name = "b_problemas_higado", nullable = false) private boolean problemasHigado;
    @Column(name = "b_asma", nullable = false) private boolean asma;
    @Column(name = "b_bradipnea", nullable = false) private boolean bradipnea;
    @Column(name = "b_tuberculosis", nullable = false) private boolean tuberculosis;
    @Column(name = "b_bronquitis", nullable = false) private boolean bronquitis;
    @Column(name = "b_anemia", nullable = false) private boolean anemia;
    @Column(name = "b_leucemia", nullable = false) private boolean leucemia;
    @Column(name = "b_gastritis", nullable = false) private boolean gastritis;
    @Column(name = "b_colitis", nullable = false) private boolean colitis;
    @Column(name = "b_diabetes", nullable = false) private boolean diabetes;
    @Column(name = "b_artritis", nullable = false) private boolean artritis;
    @Column(name = "b_apoplejia", nullable = false) private boolean apoplejia;
    @Column(name = "b_epilepsia", nullable = false) private boolean epilepsia;
    @Column(name = "b_convulsiones", nullable = false) private boolean convulsiones;
    @Column(name = "b_hipertiroidismo", nullable = false) private boolean hipertiroidismo;
    @Column(name = "b_hipotiroidismo", nullable = false) private boolean hipotiroidismo;
    @Column(name = "b_ets", nullable = false) private boolean ets;
    @Column(name = "b_cancer", nullable = false) private boolean cancer;
    @Column(name = "b_problemas_renales", nullable = false) private boolean problemasRenales;

    // ---- antecedentes personales ----
    @Column(name = "b_hospitalizacion", nullable = false) private boolean hospitalizacion;
    @Column(name = "b_atencion_medica_6m", nullable = false) private boolean atencionMedica6m;
    @Column(name = "b_atencion_odon_6m", nullable = false) private boolean atencionOdon6m;
    @Column(name = "b_problema_anestesia", nullable = false) private boolean problemaAnestesia;
    @Column(name = "b_problema_coagulacion", nullable = false) private boolean problemaCoagulacion;
    @Column(name = "b_habitos_adicciones", nullable = false) private boolean habitosAdicciones;
    @Column(name = "b_alergia_medicamentos", nullable = false) private boolean alergiaMedicamentos;
    @Column(name = "b_toma_medicamentos", nullable = false) private boolean tomaMedicamentos;
    @Column(name = "b_bajo_cuidado_medico", nullable = false) private boolean bajoCuidadoMedico;
    @Column(name = "b_embarazo", nullable = false) private boolean embarazo;

    @Column(name = "s_observaciones", length = 1000) private String observaciones;
    @Column(name = "b_completada", nullable = false) private boolean completada;
}
