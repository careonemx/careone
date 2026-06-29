package com.careone.api.core.rol;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Catalogo GLOBAL de permisos atomicos (CITA_CREAR, PAGO_REGISTRAR, ...).
 * La matriz que asocia permisos a roles vive en {@link RolPermiso} y es configurable.
 */
@Entity
@Table(name = "tbl_permiso")
@Getter
@Setter
@NoArgsConstructor
public class Permiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    @Column(name = "s_codigo", nullable = false, unique = true, length = 60)
    private String codigo;

    @Column(name = "s_descripcion", length = 200)
    private String descripcion;
}
