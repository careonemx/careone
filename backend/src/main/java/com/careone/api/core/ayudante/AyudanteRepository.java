package com.careone.api.core.ayudante;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AyudanteRepository extends JpaRepository<Ayudante, Long> {

    List<Ayudante> findAllByOrderByIdAsc();
}
