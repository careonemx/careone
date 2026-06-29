package com.careone.api.core.tipocita;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoCitaRepository extends JpaRepository<TipoCita, Long> {
    List<TipoCita> findAllByOrderByNombreAsc();
    List<TipoCita> findAllByActivoTrueOrderByNombreAsc();
}
