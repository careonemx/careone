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

/** Antecedentes gineco-obstetricos (solo paciente femenino). 1:1 con paciente. */
@Entity
@Table(name = "tbl_gineco_obstetrico")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(TenantEntityListener.class)
@Filter(name = "tenantFilter", condition = "fn_tenant_id = :tenantId")
public class GinecoObstetrico extends Auditable implements TenantAware {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    @Column(name = "fn_tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "fn_paciente_id", nullable = false)
    private Long pacienteId;

    @Column(name = "n_gestas", nullable = false) private int gestas;
    @Column(name = "n_partos", nullable = false) private int partos;
    @Column(name = "n_abortos", nullable = false) private int abortos;
    @Column(name = "s_tiempo_gestacion", length = 60) private String tiempoGestacion;
    @Column(name = "s_metodo_planificacion", length = 120) private String metodoPlanificacion;
}
