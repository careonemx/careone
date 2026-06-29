package com.careone.api.core.doctor;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findAllByOrderByIdAsc();

    Optional<Doctor> findByUsuarioId(Long usuarioId);
}
