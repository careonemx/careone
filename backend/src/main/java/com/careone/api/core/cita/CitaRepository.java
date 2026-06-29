package com.careone.api.core.cita;

import com.careone.api.util.enums.EstadoCita;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    /** Citas de un dia (excluye canceladas), ordenadas por hora — para el timeline. */
    @Query("""
        SELECT c FROM Cita c
        WHERE c.fecha = :fecha AND c.estado <> com.careone.api.util.enums.EstadoCita.CANCELADA
        ORDER BY c.horaInicio ASC
        """)
    List<Cita> findDelDia(@Param("fecha") LocalDate fecha);

    /** Citas de un doctor en una fecha (para validar anti-solape), excluye canceladas. */
    @Query("""
        SELECT c FROM Cita c
        WHERE c.doctor.id = :doctorId AND c.fecha = :fecha
          AND c.estado <> com.careone.api.util.enums.EstadoCita.CANCELADA
        """)
    List<Cita> findDelDoctorEnFecha(@Param("doctorId") Long doctorId, @Param("fecha") LocalDate fecha);

    List<Cita> findByPacienteIdAndEstadoNotOrderByFechaDescHoraInicioDesc(Long pacienteId, EstadoCita estado);

    /** Citas del dia de un doctor concreto (timeline filtrado por rol). */
    @Query("""
        SELECT c FROM Cita c
        WHERE c.fecha = :fecha AND c.doctor.id = :doctorId
          AND c.estado <> com.careone.api.util.enums.EstadoCita.CANCELADA
        ORDER BY c.horaInicio ASC
        """)
    List<Cita> findDelDiaPorDoctor(@Param("fecha") LocalDate fecha, @Param("doctorId") Long doctorId);

    /** Citas en un rango de fechas (vistas semanal/mensual). doctorId opcional (filtro por rol). */
    @Query("""
        SELECT c FROM Cita c
        WHERE c.fecha BETWEEN :desde AND :hasta
          AND c.estado <> com.careone.api.util.enums.EstadoCita.CANCELADA
          AND (:doctorId IS NULL OR c.doctor.id = :doctorId)
        ORDER BY c.fecha ASC, c.horaInicio ASC
        """)
    List<Cita> findEnRango(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta,
                           @Param("doctorId") Long doctorId);

    /** Cobranza vencida: citas COMPLETADA con monto, anteriores a hoy. (saldo se valida en servicio) */
    @Query("""
        SELECT c FROM Cita c
        WHERE c.estado = com.careone.api.util.enums.EstadoCita.COMPLETADA
          AND c.monto IS NOT NULL AND c.fecha < :hoy
          AND (:doctorId IS NULL OR c.doctor.id = :doctorId)
        ORDER BY c.monto DESC, c.fecha ASC
        """)
    List<Cita> findCobranzaVencida(@Param("hoy") LocalDate hoy, @Param("doctorId") Long doctorId);

    /** Inasistencias: citas NO_ASISTIO (el servicio filtra las que no tienen cita futura). */
    @Query("""
        SELECT c FROM Cita c
        WHERE c.estado = com.careone.api.util.enums.EstadoCita.NO_ASISTIO
          AND (:doctorId IS NULL OR c.doctor.id = :doctorId)
        ORDER BY c.fecha DESC
        """)
    List<Cita> findInasistencias(@Param("doctorId") Long doctorId);

    /** Cuenta citas futuras (no canceladas) de un paciente — para saber si una inasistencia ya se reagendo. */
    @Query("""
        SELECT COUNT(c) FROM Cita c
        WHERE c.paciente.id = :pacienteId AND c.fecha >= :hoy
          AND c.estado <> com.careone.api.util.enums.EstadoCita.CANCELADA
          AND c.estado <> com.careone.api.util.enums.EstadoCita.NO_ASISTIO
        """)
    long countCitasFuturas(@Param("pacienteId") Long pacienteId, @Param("hoy") LocalDate hoy);

    /** Revisiones proximas: citas en [hoy, hoy+7] cuyo tipo se llama 'Revision'. */
    @Query("""
        SELECT c FROM Cita c
        WHERE c.fecha BETWEEN :hoy AND :hasta
          AND c.estado <> com.careone.api.util.enums.EstadoCita.CANCELADA
          AND c.tipoCita IS NOT NULL AND lower(c.tipoCita.nombre) LIKE 'revis%'
          AND (:doctorId IS NULL OR c.doctor.id = :doctorId)
        ORDER BY c.fecha ASC
        """)
    List<Cita> findRevisionesProximas(@Param("hoy") LocalDate hoy, @Param("hasta") LocalDate hasta,
                                      @Param("doctorId") Long doctorId);
}
