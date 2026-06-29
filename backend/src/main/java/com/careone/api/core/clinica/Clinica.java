package com.careone.api.core.clinica;

import com.careone.api.core.especialidad.Especialidad;
import com.careone.api.util.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Tenant raiz del sistema. Su {@code id} ES el tenant_id de todas las tablas de
 * negocio. La clinica NO se filtra a si misma por tenant (un usuario solo accede
 * a su clinica via su token; el SUPERADMIN la administra globalmente).
 */
@Entity
@Table(name = "tbl_clinica")
@Getter
@Setter
@NoArgsConstructor
public class Clinica extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fn_especialidad_id", nullable = false)
    private Especialidad especialidad;

    @Column(name = "s_nombre", nullable = false, length = 160)
    private String nombre;

    @Column(name = "s_rfc", length = 20)
    private String rfc;

    @Column(name = "s_telefono", length = 30)
    private String telefono;

    @Column(name = "s_email", length = 160)
    private String email;

    @Column(name = "s_direccion", length = 400)
    private String direccion;

    @Column(name = "t_hora_apertura", nullable = false)
    private LocalTime horaApertura = LocalTime.of(8, 0);

    @Column(name = "t_hora_cierre", nullable = false)
    private LocalTime horaCierre = LocalTime.of(18, 0);

    @Column(name = "b_activo", nullable = false)
    private boolean activo = true;

    // ---- Fase final: WhatsApp (solo estructura, sin logica) ----
    @Column(name = "s_whatsapp_numero", length = 30)
    private String whatsappNumero;

    @Column(name = "b_whatsapp_activo", nullable = false)
    private boolean whatsappActivo = false;
}
