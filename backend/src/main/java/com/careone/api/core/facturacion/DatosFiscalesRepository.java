package com.careone.api.core.facturacion;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DatosFiscalesRepository extends JpaRepository<DatosFiscales, Long> {
    Optional<DatosFiscales> findByPacienteId(Long pacienteId);
}
