package com.pukaraweb.PukaraWeb.biblioteca;

import java.time.LocalDateTime;
import java.util.List;

import com.pukaraweb.PukaraWeb.model.Rama;

// Contratos de la API de biblioteca. Las entidades nunca salen directo al cliente.
public final class BibliotecaDtos {

    private BibliotecaDtos() {
    }

    public record RamaResumen(Long id, String nombre, String tipo) {
        static RamaResumen de(Rama rama) {
            return rama == null ? null : new RamaResumen(rama.getId(), rama.getNombre(), rama.getTipo());
        }
    }

    public record DocumentoDto(Long id, String titulo, String descripcion, CategoriaDocumento categoria,
            RamaResumen rama, Long eventoId, String nombreArchivo, String tipoContenido, long tamano,
            LocalDateTime fechaPublicacion) {

        static DocumentoDto de(Documento d) {
            return new DocumentoDto(d.getId(), d.getTitulo(), d.getDescripcion(), d.getCategoria(),
                    RamaResumen.de(d.getRama()), d.getEvento() == null ? null : d.getEvento().getId(),
                    d.getArchivo().getNombreOriginal(), d.getArchivo().getTipoContenido(), d.getArchivo().getTamano(),
                    d.getFechaPublicacion());
        }
    }

    // Campamento o salida que pide autorización, tal como lo ve un apoderado en la biblioteca.
    public record CampamentoDto(Long id, String titulo, String tipo, LocalDateTime fechaInicio,
            LocalDateTime fechaFin, List<String> ramas, String lugar, Long formularioId) {
    }

    // Respuesta pública al subir una autorización: solo confirma, sin exponer datos del integrante.
    public record AutorizacionRecibidaDto(Long id, String evento, LocalDateTime fechaEnvio) {
    }

    // Una fila del panel: cada integrante convocado y su última autorización (o null si falta).
    public record EstadoIntegranteDto(Long miembroId, String nombre, String documento, RamaResumen rama,
            String apoderado, AutorizacionDto autorizacion) {
    }

    public record AutorizacionDto(Long id, EstadoAutorizacion estado, String nombreApoderado,
            String nombreArchivo, String tipoContenido, LocalDateTime fechaEnvio, LocalDateTime fechaRevision,
            String observacion) {

        static AutorizacionDto de(AutorizacionFirmada a) {
            return new AutorizacionDto(a.getId(), a.getEstado(), a.getNombreApoderado(),
                    a.getArchivo().getNombreOriginal(), a.getArchivo().getTipoContenido(), a.getFechaEnvio(),
                    a.getFechaRevision(), a.getObservacion());
        }
    }

    public record RevisionRequest(EstadoAutorizacion estado, String observacion) {
    }

    public record RequiereAutorizacionRequest(boolean requiere) {
    }
}
