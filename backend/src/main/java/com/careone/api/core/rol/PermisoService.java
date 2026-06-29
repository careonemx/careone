package com.careone.api.core.rol;

import com.careone.api.exception.NotFoundException;
import com.careone.api.security.SecurityUtil;
import com.careone.api.util.enums.RolNombre;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Matriz de permisos CONFIGURABLE por clinica.
 * <ul>
 *   <li>Reglas base: filas de rol_permiso con tenant_id NULL (seed V2).</li>
 *   <li>Overrides: filas con el tenant_id de la clinica.</li>
 * </ul>
 * El permiso efectivo de una clinica es: override si existe, si no la regla base.
 * El rol SUPERADMIN se excluye (su poder es global, no configurable por clinica).
 */
@Service
public class PermisoService {

    private final RolRepository rolRepository;
    private final PermisoRepository permisoRepository;
    private final RolPermisoRepository rolPermisoRepository;

    public PermisoService(RolRepository rolRepository,
                          PermisoRepository permisoRepository,
                          RolPermisoRepository rolPermisoRepository) {
        this.rolRepository = rolRepository;
        this.permisoRepository = permisoRepository;
        this.rolPermisoRepository = rolPermisoRepository;
    }

    @Transactional(readOnly = true)
    public PermisoMatrizRecord obtenerMatriz() {
        Long tenantId = SecurityUtil.currentTenantId();

        var roles = rolRepository.findAll().stream()
                .filter(r -> r.getNombre() != RolNombre.SUPERADMIN)
                .map(r -> new PermisoMatrizRecord.RolResumen(r.getId(), r.getNombre().name()))
                .toList();

        var permisos = permisoRepository.findAllByOrderByCodigoAsc().stream()
                .map(p -> new PermisoMatrizRecord.PermisoResumen(p.getId(), p.getCodigo(), p.getDescripcion()))
                .toList();

        // Mapa de reglas base: (rolId|permisoId) -> permitido
        Map<String, Boolean> base = new HashMap<>();
        for (RolPermiso rp : rolPermisoRepository.findByTenantIdIsNull()) {
            base.put(clave(rp.getRol().getId(), rp.getPermiso().getId()), rp.isPermitido());
        }
        // Mapa de overrides de la clinica
        Map<String, Boolean> overrides = new HashMap<>();
        if (tenantId != null) {
            for (RolPermiso rp : rolPermisoRepository.findByTenantId(tenantId)) {
                overrides.put(clave(rp.getRol().getId(), rp.getPermiso().getId()), rp.isPermitido());
            }
        }

        List<PermisoMatrizRecord.Celda> celdas = new ArrayList<>();
        for (var rol : roles) {
            for (var perm : permisos) {
                String k = clave(rol.id(), perm.id());
                boolean esOverride = overrides.containsKey(k);
                boolean permitido = esOverride ? overrides.get(k) : base.getOrDefault(k, false);
                celdas.add(new PermisoMatrizRecord.Celda(rol.id(), perm.id(), permitido, esOverride));
            }
        }
        return new PermisoMatrizRecord(roles, permisos, celdas);
    }

    @Transactional
    public void cambiarPermiso(CambiarPermisoRequest req) {
        Long tenantId = SecurityUtil.currentTenantId();
        if (tenantId == null) {
            throw new NotFoundException("No hay clinica en contexto.");
        }
        Rol rol = rolRepository.findById(req.rolId())
                .orElseThrow(() -> new NotFoundException("El rol no existe."));
        if (rol.getNombre() == RolNombre.SUPERADMIN) {
            throw new NotFoundException("El rol no existe."); // no configurable
        }
        var permiso = permisoRepository.findById(req.permisoId())
                .orElseThrow(() -> new NotFoundException("El permiso no existe."));

        RolPermiso override = rolPermisoRepository
                .findByRolIdAndPermisoIdAndTenantId(rol.getId(), permiso.getId(), tenantId)
                .orElseGet(() -> {
                    RolPermiso nuevo = new RolPermiso();
                    nuevo.setRol(rol);
                    nuevo.setPermiso(permiso);
                    nuevo.setTenantId(tenantId);
                    return nuevo;
                });
        override.setPermitido(req.permitido());
        rolPermisoRepository.save(override);
    }

    private String clave(Long rolId, Long permisoId) {
        return rolId + "|" + permisoId;
    }
}
