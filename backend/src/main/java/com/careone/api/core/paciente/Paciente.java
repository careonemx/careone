package com.careone.api.core.paciente;

import com.careone.api.core.doctor.Doctor;
import com.careone.api.tenant.TenantAware;
import com.careone.api.tenant.TenantEntityListener;
import com.careone.api.util.Auditable;
import com.careone.api.util.enums.Sexo;
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
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;

/** Paciente de una clinica. Tenant-aware. */
@Entity
@Table(name = "tbl_paciente")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(TenantEntityListener.class)
@Filter(name = "tenantFilter", condition = "fn_tenant_id = :tenantId")
public class Paciente extends Auditable implements TenantAware {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    @Column(name = "fn_tenant_id", nullable = false)
    private Long tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fn_doctor_id")
    private Doctor doctor;

    @Column(name = "s_nombre", nullable = false, length = 120)
    private String nombre;

    @Column(name = "s_apellidos", length = 120)
    private String apellidos;

    @Column(name = "s_telefono", length = 30)
    private String telefono;

    @Column(name = "s_email", length = 160)
    private String email;

    @Column(name = "d_fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Enumerated(EnumType.STRING)
    @Column(name = "e_sexo", length = 20)
    private Sexo sexo;

    @Column(name = "s_ocupacion", length = 120)
    private String ocupacion;

    @Column(name = "s_tipo_sangre", length = 8)
    private String tipoSangre;

    @Column(name = "s_direccion", length = 400)
    private String direccion;

    @Column(name = "s_alergias", length = 600)
    private String alergias;

    @Column(name = "s_notas", length = 1000)
    private String notas;

    @Column(name = "s_emergencia_nombre", length = 160)
    private String emergenciaNombre;

    @Column(name = "s_emergencia_parentesco", length = 60)
    private String emergenciaParentesco;

    @Column(name = "s_emergencia_telefono", length = 30)
    private String emergenciaTelefono;

    @Column(name = "b_activo", nullable = false)
    private boolean activo = true;
}
