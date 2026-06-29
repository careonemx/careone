package com.careone.api.core.consentimiento;

import com.careone.api.util.enums.EstadoConsentimiento;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsentimientoRepository extends JpaRepository<Consentimiento, Long> {
    List<Consentimiento> findByPacienteIdOrderByIdDesc(Long pacienteId);
    long countByPacienteIdAndEstado(Long pacienteId, EstadoConsentimiento estado);
}
