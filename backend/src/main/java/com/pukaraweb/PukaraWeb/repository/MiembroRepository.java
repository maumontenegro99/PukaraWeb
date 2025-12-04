package com.pukaraweb.PukaraWeb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pukaraweb.PukaraWeb.model.Miembro;

@Repository
public interface MiembroRepository extends JpaRepository<Miembro, Long> {
}