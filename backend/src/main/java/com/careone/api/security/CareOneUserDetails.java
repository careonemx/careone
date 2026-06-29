package com.careone.api.security;

import com.careone.api.core.usuario.Usuario;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Principal autenticado de CareOne. Ademas de las credenciales, expone el
 * {@code tenantId} (null para SUPERADMIN), del que se deriva el aislamiento.
 */
public class CareOneUserDetails implements UserDetails {

    private final Long usuarioId;
    private final Long tenantId;
    private final String username;
    private final String passwordHash;
    private final boolean activo;
    private final List<GrantedAuthority> authorities;

    public CareOneUserDetails(Usuario usuario) {
        this.usuarioId = usuario.getId();
        this.tenantId = usuario.getTenantId();
        this.username = usuario.getEmail();
        this.passwordHash = usuario.getPasswordHash();
        this.activo = usuario.isActivo();
        this.authorities = usuario.getRoles().stream()
                .map(r -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + r.getNombre().name()))
                .toList();
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    /** Tenant del usuario; null para SUPERADMIN. */
    public Long getTenantId() {
        return tenantId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return activo;
    }
}
