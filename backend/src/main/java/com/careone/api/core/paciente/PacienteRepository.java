package com.careone.api.core.paciente;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    /**
     * Busca por nombre, apellidos O telefono (para el alta rapida / agendamiento).
     * HQL: el @Filter de tenant SI aplica aqui (a diferencia de findById).
     */
    @Query("""
            SELECT p FROM Paciente p
            WHERE lower(p.nombre) LIKE lower(concat('%', :q, '%'))
               OR lower(p.apellidos) LIKE lower(concat('%', :q, '%'))
               OR p.telefono LIKE concat('%', :q, '%')
            """)
    Page<Paciente> buscar(@Param("q") String q, Pageable pageable);
}
