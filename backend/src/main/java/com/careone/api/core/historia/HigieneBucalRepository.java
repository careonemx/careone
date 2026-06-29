package com.careone.api.core.historia;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HigieneBucalRepository extends JpaRepository<HigieneBucal, Long> {
    Optional<HigieneBucal> findByPacienteId(Long pacienteId);
}
