package com.careone.api.core.especialidad;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EspecialidadRepository extends JpaRepository<Especialidad, Long> {

    Optional<Especialidad> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    List<Especialidad> findAllByActivoTrueOrderByNombreAsc();
}
