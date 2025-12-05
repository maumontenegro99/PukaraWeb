package com.pukaraweb.PukaraWeb.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pukaraweb.PukaraWeb.model.Adulto;

@Repository
public interface AdultoRepository extends JpaRepository<Adulto, Long> {
    // Buscar todos los dirigentes de una rama específica
    List<Adulto> findByRamaId(Long ramaId);
}