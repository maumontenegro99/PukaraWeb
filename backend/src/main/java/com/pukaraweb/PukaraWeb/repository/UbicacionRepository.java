package com.pukaraweb.PukaraWeb.repository;

import com.pukaraweb.PukaraWeb.model.Ubicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UbicacionRepository extends JpaRepository<Ubicacion, Long> {
}