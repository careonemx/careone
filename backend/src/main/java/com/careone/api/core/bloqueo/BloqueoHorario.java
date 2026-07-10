package com.careone.api.core.bloqueo;

import com.careone.api.core.doctor.Doctor;
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
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;

/**
 * Bloqueo de horario: reserva un espacio de tiempo SIN crear una cita (no genera
 * paciente, expediente ni recordatorios). Impide agendar en ese rango. Tenant-aware.
 */
@Entity
@Table(name = "tbl_bloqueo_horario")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(TenantEntityListener.class)
@Filter(name = "tenantFilter", condition = "fn_tenant_id = :tenantId")
public class BloqueoHorario extends Auditable implements TenantAware {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    @Column(name = "fn_tenant_id", nullable = false)
    private Long tenantId;

    // Opcional: bloqueo de un doctor concreto o general para la clinica.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fn_doctor_id")
    private Doctor doctor;

    @Column(name = "d_fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "t_hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "t_hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(name = "s_motivo", length = 200)
    private String motivo;
}
