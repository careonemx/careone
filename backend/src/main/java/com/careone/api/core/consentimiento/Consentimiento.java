package com.careone.api.core.consentimiento;

import com.careone.api.tenant.TenantAware;
import com.careone.api.tenant.TenantEntityListener;
import com.careone.api.util.Auditable;
import com.careone.api.util.enums.EstadoConsentimiento;
import com.careone.api.util.enums.TipoConsentimiento;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;

/** Consentimiento informado de un paciente. Entidad independiente. Tenant-aware. */
@Entity
@Table(name = "tbl_consentimiento")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(TenantEntityListener.class)
@Filter(name = "tenantFilter", condition = "fn_tenant_id = :tenantId")
public class Consentimiento extends Auditable implements TenantAware {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    @Column(name = "fn_tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "fn_paciente_id", nullable = false)
    private Long pacienteId;

    @Enumerated(EnumType.STRING)
    @Column(name = "e_tipo", nullable = false, length = 20)
    private TipoConsentimiento tipo;

    @Enumerated(EnumType.STRING)
    @Column(name = "e_estado", nullable = false, length = 20)
    private EstadoConsentimiento estado = EstadoConsentimiento.PENDIENTE;

    @Column(name = "s_archivo_nombre", length = 200)
    private String archivoNombre;

    @Column(name = "s_archivo_ruta", length = 400)
    private String archivoRuta;

    @Column(name = "d_firmado_en")
    private Instant firmadoEn;

    @Column(name = "s_notas", length = 400)
    private String notas;
}
