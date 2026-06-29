package com.careone.api.core.pago;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByPacienteIdOrderByFechaDesc(Long pacienteId);

    @Query("SELECT COALESCE(SUM(p.monto),0) FROM Pago p WHERE p.tratamiento.id = :tratamientoId")
    BigDecimal totalPagadoTratamiento(@Param("tratamientoId") Long tratamientoId);

    @Query("SELECT COALESCE(SUM(p.monto),0) FROM Pago p WHERE p.fecha = :fecha")
    BigDecimal totalCobradoEnFecha(@Param("fecha") LocalDate fecha);

    @Query("SELECT COALESCE(SUM(p.monto),0) FROM Pago p WHERE p.citaId = :citaId")
    BigDecimal totalPagadoCita(@Param("citaId") Long citaId);
}
