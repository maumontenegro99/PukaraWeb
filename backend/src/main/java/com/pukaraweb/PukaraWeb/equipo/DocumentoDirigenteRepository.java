package com.pukaraweb.PukaraWeb.equipo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentoDirigenteRepository extends JpaRepository<DocumentoDirigente, Long> {

    List<DocumentoDirigente> findByDirigenteId(Long dirigenteId);

    Optional<DocumentoDirigente> findByDirigenteIdAndTipo(Long dirigenteId, TipoDocumentoDirigente tipo);
}
