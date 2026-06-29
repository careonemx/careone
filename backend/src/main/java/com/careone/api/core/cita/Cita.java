package com.careone.api.core.cita;

import com.careone.api.core.doctor.Doctor;
import com.careone.api.core.paciente.Paciente;
import com.careone.api.tenant.TenantAware;
import com.careone.api.tenant.TenantEntityListener;
import com.careone.api.util.Auditable;
import com.careone.api.util.enums.EstadoCita;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;

/** Cita de la agenda. Tenant-aware. */
@Entity
@Table(name = "tbl_cita")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(TenantEntityListener.class)
@Filter(name = "tenantFilter", condition = "fn_tenant_id = :tenantId")
public class Cita extends Auditable implements TenantAware {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    @Column(name = "fn_tenant_id", nullable = false)
    private Long tenantId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fn_paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fn_doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fn_tipo_cita_id")
    private com.careone.api.core.tipocita.TipoCita tipoCita;

    @Column(name = "s_tratamiento", nullable = false, length = 200)
    private String tratamiento;

    /** Motivo libre de la cita (spec v1.0). */
    @Column(name = "s_motivo", length = 400)
    private String motivo;

    /** Canal de confirmacion (solo dato; envio = fase final). */
    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    @Column(name = "e_canal_confirmacion", length = 20)
    private com.careone.api.util.enums.CanalConfirmacion canalConfirmacion;

    @Column(name = "d_fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "t_hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "t_hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(name = "n_duracion_min", nullable = false)
    private int duracionMin = 45;

    @Enumerated(EnumType.STRING)
    @Column(name = "e_estado", nullable = false, length = 20)
    private EstadoCita estado = EstadoCita.AGENDADA;

    @Column(name = "n_monto", precision = 12, scale = 2)
    private BigDecimal monto;

    @Column(name = "b_primera_vez", nullable = false)
    private boolean primeraVez = false;

    @Column(name = "b_recordatorio_whatsapp", nullable = false)
    private boolean recordatorioWhatsapp = true;

    @Column(name = "s_notas", length = 600)
    private String notas;
}
