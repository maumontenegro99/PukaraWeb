package com.pukaraweb.PukaraWeb.equipo;

import java.util.function.BiConsumer;

import com.pukaraweb.PukaraWeb.model.Dirigente;

// Documentos que cada dirigente debe entregar. `marcar` actualiza la casilla correspondiente en Dirigente,
// para que la lista de "entregados" y los archivos subidos siempre coincidan.
public enum TipoDocumentoDirigente {
    ANTECEDENTES(Dirigente::setDocAntecedentes),
    INHABILIDAD(Dirigente::setDocInhabilidad),
    CURRICULUM(Dirigente::setDocCurriculum),
    CURRICULUM_SCOUT(Dirigente::setDocCurriculumScout),
    NACIMIENTO(Dirigente::setDocNacimiento);

    private final BiConsumer<Dirigente, Boolean> marcador;

    TipoDocumentoDirigente(BiConsumer<Dirigente, Boolean> marcador) {
        this.marcador = marcador;
    }

    void marcar(Dirigente dirigente, boolean entregado) {
        marcador.accept(dirigente, entregado);
    }
}
