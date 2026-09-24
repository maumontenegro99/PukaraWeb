package com.pukaraweb.PukaraWeb.biblioteca;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    List<Documento> findAllByOrderByFechaPublicacionDesc();

    Optional<Documento> findFirstByEventoIdAndCategoriaOrderByFechaPublicacionDesc(Long eventoId, CategoriaDocumento categoria);
}
