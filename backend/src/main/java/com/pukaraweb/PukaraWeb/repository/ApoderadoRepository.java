package com.pukaraweb.PukaraWeb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pukaraweb.PukaraWeb.model.Apoderado;

@Repository
public interface ApoderadoRepository extends JpaRepository<Apoderado, Long> {
}