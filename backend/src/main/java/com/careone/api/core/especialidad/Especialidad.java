package com.careone.api.core.especialidad;

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
 * Catalogo GLOBAL de especialidades (Odontologia, Psicologia, ...).
 * No lleva tenant: es compartido por todas las clinicas y lo administra el SUPERADMIN.
 */
@Entity
@Table(name = "tbl_especialidad")
@Getter
@Setter
@NoArgsConstructor
public class Especialidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    @Column(name = "s_codigo", nullable = false, unique = true, length = 40)
    private String codigo;

    @Column(name = "s_nombre", nullable = false, length = 120)
    private String nombre;

    @Column(name = "b_activo", nullable = false)
    private boolean activo = true;
}
