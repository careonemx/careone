package com.careone.api.core.rol;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Matriz de permisos CONFIGURABLE.
 * <ul>
 *   <li>{@code tenantId == null} -> regla BASE del sistema para ese (rol, permiso).</li>
 *   <li>{@code tenantId != null} -> override de una clinica concreta.</li>
 * </ul>
 * No es {@code Auditable} ni {@code TenantAware} clasico: el tenant aqui es
 * opcional por diseno (las reglas base son globales), por eso se gestiona a mano
 * en el servicio de permisos (Fase 4), sin el filtro automatico.
 */
@Entity
@Table(name = "tbl_rol_permiso")
@Getter
@Setter
@NoArgsConstructor
public class RolPermiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fn_rol_id", nullable = false)
    private Rol rol;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fn_permiso_id", nullable = false)
    private Permiso permiso;

    /** NULL = regla base; valor = override de esa clinica. */
    @Column(name = "fn_tenant_id")
    private Long tenantId;

    @Column(name = "b_permitido", nullable = false)
    private boolean permitido = true;
}
