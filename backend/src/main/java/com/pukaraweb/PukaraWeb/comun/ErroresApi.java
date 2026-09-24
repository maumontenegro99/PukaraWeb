package com.pukaraweb.PukaraWeb.comun;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.server.ResponseStatusException;

// Errores de los módulos biblioteca y equipo en formato ProblemDetail (RFC 9457), respondidos directamente para que las rutas
// públicas no terminen en /error (que exige sesión) y el mensaje llegue legible al frontend.
@RestControllerAdvice(basePackages = { "com.pukaraweb.PukaraWeb.biblioteca", "com.pukaraweb.PukaraWeb.equipo" })
public class ErroresApi {

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ProblemDetail> estado(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(ProblemDetail.forStatusAndDetail(e.getStatusCode(), e.getReason()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<ProblemDetail> muyGrande() {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ProblemDetail.forStatusAndDetail(HttpStatus.PAYLOAD_TOO_LARGE, "El archivo supera los 10 MB."));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<ProblemDetail> datoInvalido(MethodArgumentTypeMismatchException e) {
        return ResponseEntity.badRequest()
                .body(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "El valor de '" + e.getName() + "' no es válido."));
    }

    @ExceptionHandler({ MissingServletRequestParameterException.class, MissingServletRequestPartException.class })
    ResponseEntity<ProblemDetail> faltaDato() {
        return ResponseEntity.badRequest()
                .body(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Completa todos los campos obligatorios."));
    }
}
