package com.pukaraweb.PukaraWeb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pukaraweb.PukaraWeb.model.Rama;

@Repository
public interface RamaRepository extends JpaRepository<Rama, Long> {
    // Aquí puedes agregar búsquedas personalizadas en el futuro
    // Ej: List<Rama> findByTipo(String tipo);
}