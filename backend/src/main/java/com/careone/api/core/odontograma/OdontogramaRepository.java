package com.careone.api.core.odontograma;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OdontogramaRepository extends JpaRepository<OdontogramaDiente, Long> {
    List<OdontogramaDiente> findByPacienteIdOrderByFdiAsc(Long pacienteId);
    Optional<OdontogramaDiente> findByPacienteIdAndFdi(Long pacienteId, int fdi);
}
