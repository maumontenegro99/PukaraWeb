package com.pukaraweb.PukaraWeb.comun;

import java.nio.charset.StandardCharsets;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

public final class Descargas {

    private Descargas() {
    }

    // `enLinea` abre el archivo en el navegador (vista previa); si no, se descarga.
    public static ResponseEntity<Resource> responder(ArchivoGuardado archivo, Resource recurso, boolean enLinea) {
        ContentDisposition disposicion = (enLinea ? ContentDisposition.inline() : ContentDisposition.attachment())
                .filename(archivo.getNombreOriginal(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(archivo.getTipoContenido()))
                .contentLength(archivo.getTamano())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposicion.toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(recurso);
    }
}
