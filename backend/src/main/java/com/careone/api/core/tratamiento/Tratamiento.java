package com.careone.api.core.tratamiento;

import com.careone.api.core.doctor.Doctor;
import com.careone.api.core.paciente.Paciente;
import com.careone.api.tenant.TenantAware;
import com.careone.api.tenant.TenantEntityListener;
import com.careone.api.util.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;

/** Plan de tratamiento con progreso por sesiones y monto total. Tenant-aware. */
@Entity
@Table(name = "tbl_tratamiento")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(TenantEntityListener.class)
@Filter(name = "tenantFilter", condition = "fn_tenant_id = :tenantId")
public class Tratamiento extends Auditable implements TenantAware {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    @Column(name = "fn_tenant_id", nullable = false)
    private Long tenantId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fn_paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fn_doctor_id")
    private Doctor doctor;

    @Column(name = "s_nombre", nullable = false, length = 200)
    private String nombre;

    @Column(name = "n_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "n_sesiones_total", nullable = false)
    private int sesionesTotal = 1;

    @Column(name = "n_sesiones_hechas", nullable = false)
    private int sesionesHechas = 0;

    @Column(name = "e_estado", nullable = false, length = 20)
    private String estado = "ACTIVO";

    @Column(name = "d_inicio")
    private LocalDate inicio;

    @Column(name = "s_notas", length = 600)
    private String notas;
}
