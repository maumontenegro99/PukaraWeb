package com.pukaraweb.PukaraWeb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pukaraweb.PukaraWeb.model.Inventario;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {
}