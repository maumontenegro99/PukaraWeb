package com.pukaraweb.PukaraWeb.repository;

import com.pukaraweb.PukaraWeb.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}