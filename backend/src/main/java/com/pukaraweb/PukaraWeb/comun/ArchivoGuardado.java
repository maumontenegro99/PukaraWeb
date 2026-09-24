package com.pukaraweb.PukaraWeb.comun;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// Metadatos de un archivo guardado en disco por AlmacenArchivos.
@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoGuardado {

    // Nombre interno generado (UUID + extensión). Nunca se usa el nombre que envía el usuario para la ruta.
    @Column(nullable = false)
    private String nombreInterno;

    @Column(nullable = false)
    private String nombreOriginal;

    @Column(nullable = false)
    private String tipoContenido;

    private long tamano;
}
