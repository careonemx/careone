package com.careone.api.core.recepcionista;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecepcionistaRepository extends JpaRepository<Recepcionista, Long> {

    List<Recepcionista> findAllByOrderByIdAsc();
}
