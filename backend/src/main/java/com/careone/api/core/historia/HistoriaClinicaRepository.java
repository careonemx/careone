package com.careone.api.core.historia;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoriaClinicaRepository extends JpaRepository<HistoriaClinica, Long> {
    Optional<HistoriaClinica> findByPacienteId(Long pacienteId);

    /** Historias de varios pacientes en una sola query (evita N+1 en la agenda). */
    List<HistoriaClinica> findByPacienteIdIn(Collection<Long> pacienteIds);
}
