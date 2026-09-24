package com.pukaraweb.PukaraWeb.biblioteca;

public enum EstadoAutorizacion {
    RECIBIDA,   // Subida por el apoderado, pendiente de revisión
    APROBADA,   // Revisada por un dirigente
    RECHAZADA   // Ilegible, sin firma o con datos incorrectos: el apoderado debe enviarla de nuevo
}
