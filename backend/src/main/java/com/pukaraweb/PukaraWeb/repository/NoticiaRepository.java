package com.pukaraweb.PukaraWeb.repository;

import com.pukaraweb.PukaraWeb.model.Noticia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoticiaRepository extends JpaRepository<Noticia, Long> {
    // Método mágico para traer todo ordenado por fecha (de más nuevo a más viejo)
    List<Noticia> findAllByOrderByFechaPublicacionDesc();
}