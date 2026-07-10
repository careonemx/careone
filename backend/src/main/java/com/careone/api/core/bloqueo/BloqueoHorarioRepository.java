package com.careone.api.core.bloqueo;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BloqueoHorarioRepository extends JpaRepository<BloqueoHorario, Long> {

    List<BloqueoHorario> findByFechaOrderByHoraInicioAsc(LocalDate fecha);

    List<BloqueoHorario> findByFechaBetweenOrderByFechaAscHoraInicioAsc(LocalDate desde, LocalDate hasta);

    /**
     * Bloqueos que se solapan con [inicio, fin) en una fecha. Si doctorId es null,
     * cuenta cualquier bloqueo del dia; si viene, los generales + los de ese doctor.
     */
    @Query("""
            SELECT b FROM BloqueoHorario b
            WHERE b.fecha = :fecha
              AND b.horaInicio < :fin
              AND b.horaFin > :inicio
              AND (b.doctor IS NULL OR :doctorId IS NULL OR b.doctor.id = :doctorId)
            """)
    List<BloqueoHorario> findSolapados(@Param("fecha") LocalDate fecha,
                                       @Param("inicio") LocalTime inicio,
                                       @Param("fin") LocalTime fin,
                                       @Param("doctorId") Long doctorId);
}
