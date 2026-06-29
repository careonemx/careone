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

/** Higiene bucal (extension dental). 1:1 con paciente. */
@Entity
@Table(name = "tbl_higiene_bucal")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(TenantEntityListener.class)
@Filter(name = "tenantFilter", condition = "fn_tenant_id = :tenantId")
public class HigieneBucal extends Auditable implements TenantAware {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    @Column(name = "fn_tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "fn_paciente_id", nullable = false)
    private Long pacienteId;

    @Column(name = "n_cepillados_dia") private Integer cepilladosDia;
    @Column(name = "s_tipo_cepillo", length = 40) private String tipoCepillo;
    @Column(name = "b_usa_hilo", nullable = false) private boolean usaHilo;
    @Column(name = "b_usa_enjuague", nullable = false) private boolean usaEnjuague;
}
