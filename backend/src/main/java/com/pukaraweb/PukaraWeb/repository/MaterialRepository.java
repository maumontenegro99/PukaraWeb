package com.pukaraweb.PukaraWeb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pukaraweb.PukaraWeb.model.Material;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    // Aquí podrías agregar métodos como findByCategoria(String categoria) si lo necesitas
}