package com.careone.api.core.rol;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import com.careone.api.util.enums.RolNombre;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Catalogo GLOBAL de roles. Sembrado en V1.
 */
@Entity
@Table(name = "tbl_rol")
@Getter
@Setter
@NoArgsConstructor
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "e_nombre", nullable = false, unique = true, length = 40)
    private RolNombre nombre;

    @Column(name = "s_descripcion", length = 200)
    private String descripcion;
}
