package com.careone.api.core.odontograma;

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

/** Estado de un diente (notacion FDI) en el odontograma de un paciente. */
@Entity
@Table(name = "tbl_odontograma_diente")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(TenantEntityListener.class)
@Filter(name = "tenantFilter", condition = "fn_tenant_id = :tenantId")
public class OdontogramaDiente extends Auditable implements TenantAware {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    @Column(name = "fn_tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "fn_paciente_id", nullable = false)
    private Long pacienteId;

    @Column(name = "n_fdi", nullable = false)
    private int fdi;

    @Column(name = "e_estado", nullable = false, length = 20)
    private String estado = "NORMAL";

    @Column(name = "b_brackets", nullable = false)
    private boolean brackets = false;

    @Column(name = "s_nota", length = 200)
    private String nota;
}
