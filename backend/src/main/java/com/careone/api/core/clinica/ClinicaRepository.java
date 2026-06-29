package com.careone.api.core.clinica;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClinicaRepository extends JpaRepository<Clinica, Long> {

    Page<Clinica> findAllByNombreContainingIgnoreCase(String nombre, Pageable pageable);
}
