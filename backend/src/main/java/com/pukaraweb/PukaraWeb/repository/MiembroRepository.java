package com.pukaraweb.PukaraWeb.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pukaraweb.PukaraWeb.model.Miembro;

@Repository
public interface MiembroRepository extends JpaRepository<Miembro, Long> {

    List<Miembro> findByRamaIdIn(Collection<Long> ramaIds);

    boolean existsByRamaId(Long ramaId);
}