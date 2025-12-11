package com.pukaraweb.PukaraWeb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pukaraweb.PukaraWeb.model.Dirigente;

@Repository
public interface DirigenteRepository extends JpaRepository<Dirigente, Long> {
}