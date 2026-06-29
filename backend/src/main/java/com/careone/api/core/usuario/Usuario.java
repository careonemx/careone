package com.careone.api.core.usuario;

import com.careone.api.core.rol.Rol;
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
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

/**
 * Usuario que inicia sesion. Una persona = un usuario; los perfiles doctor /
 * recepcionista / ayudante apuntan a el.
 *
 * <p>{@code tenantId == null} SOLO para el SUPERADMIN (global). Para el resto es
 * obligatorio. Define aqui el {@code @FilterDef} "tenantFilter" que reutilizan
 * todas las entidades tenant-aware del sistema.
 */
@Entity
@Table(name = "tbl_usuario")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(TenantEntityListener.class)
@FilterDef(
        name = "tenantFilter",
        parameters = @ParamDef(name = "tenantId", type = Long.class)
)
@Filter(name = "tenantFilter", condition = "fn_tenant_id = :tenantId")
public class Usuario extends Auditable implements TenantAware {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    /** NULL solo para SUPERADMIN. */
    @Column(name = "fn_tenant_id")
    private Long tenantId;

    @Column(name = "s_email", nullable = false, length = 160)
    private String email;

    @Column(name = "s_password_hash", nullable = false, length = 120)
    private String passwordHash;

    @Column(name = "s_nombre", nullable = false, length = 120)
    private String nombre;

    @Column(name = "s_apellidos", length = 120)
    private String apellidos;

    @Column(name = "s_telefono", length = 30)
    private String telefono;

    @Column(name = "b_activo", nullable = false)
    private boolean activo = true;

    @Column(name = "d_ultimo_acceso")
    private Instant ultimoAcceso;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "tbl_usuario_rol",
            joinColumns = @JoinColumn(name = "fn_usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "fn_rol_id")
    )
    private Set<Rol> roles = new HashSet<>();
}
