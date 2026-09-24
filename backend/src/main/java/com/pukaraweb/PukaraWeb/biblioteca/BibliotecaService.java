package com.pukaraweb.PukaraWeb.biblioteca;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.pukaraweb.PukaraWeb.biblioteca.BibliotecaDtos.CampamentoDto;
import com.pukaraweb.PukaraWeb.biblioteca.BibliotecaDtos.DocumentoDto;
import com.pukaraweb.PukaraWeb.comun.AlmacenArchivos;
import com.pukaraweb.PukaraWeb.model.Evento;
import com.pukaraweb.PukaraWeb.model.Rama;
import com.pukaraweb.PukaraWeb.repository.EventoRepository;
import com.pukaraweb.PukaraWeb.repository.RamaRepository;

// Documentos públicos de la biblioteca y campamentos que piden autorización.
@Service
public class BibliotecaService {

    private final DocumentoRepository documentoRepository;
    private final RamaRepository ramaRepository;
    private final EventoRepository eventoRepository;
    private final AlmacenArchivos almacen;

    public BibliotecaService(DocumentoRepository documentoRepository, RamaRepository ramaRepository,
            EventoRepository eventoRepository, AlmacenArchivos almacen) {
        this.documentoRepository = documentoRepository;
        this.ramaRepository = ramaRepository;
        this.eventoRepository = eventoRepository;
        this.almacen = almacen;
    }

    @Transactional(readOnly = true)
    public List<DocumentoDto> listarDocumentos() {
        return documentoRepository.findAllByOrderByFechaPublicacionDesc().stream().map(DocumentoDto::de).toList();
    }

    @Transactional(readOnly = true)
    public Documento buscarDocumento(Long id) {
        return documentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Este documento ya no existe."));
    }

    @Transactional
    public DocumentoDto publicar(String titulo, String descripcion, CategoriaDocumento categoria, Long ramaId,
            Long eventoId, MultipartFile archivo) {
        if (titulo == null || titulo.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escribe un título para el documento.");
        }
        Rama rama = ramaId == null ? null : ramaRepository.findById(ramaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "La rama elegida no existe."));
        Evento evento = eventoId == null ? null : eventoRepository.findById(eventoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "El evento elegido no existe."));

        Documento documento = new Documento();
        documento.setTitulo(titulo.trim());
        documento.setDescripcion(descripcion == null || descripcion.isBlank() ? null : descripcion.trim());
        documento.setCategoria(categoria);
        documento.setRama(rama);
        documento.setEvento(evento);
        documento.setArchivo(almacen.guardar(archivo, AlmacenArchivos.TIPOS_DOCUMENTO));
        return DocumentoDto.de(documentoRepository.save(documento));
    }

    @Transactional
    public void eliminar(Long id) {
        Documento documento = buscarDocumento(id);
        documentoRepository.delete(documento);
        almacen.eliminar(documento.getArchivo());
    }

    // Campamentos y salidas que piden autorización y aún no terminan, con su formulario si existe.
    @Transactional(readOnly = true)
    public List<CampamentoDto> campamentosAbiertos() {
        LocalDateTime ahora = LocalDateTime.now();
        return eventoRepository.findAll().stream()
                .filter(e -> Boolean.TRUE.equals(e.getRequiereAutorizacion()))
                .filter(e -> e.getFechaFin() == null || e.getFechaFin().isAfter(ahora))
                .sorted(Comparator.comparing(Evento::getFechaInicio, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(e -> new CampamentoDto(e.getId(), e.getTitulo(), e.getTipo() == null ? null : e.getTipo().name(),
                        e.getFechaInicio(), e.getFechaFin(),
                        e.getRamas() == null ? List.of() : e.getRamas().stream().map(Rama::getNombre).toList(),
                        e.getUbicacion() == null ? null : e.getUbicacion().getNombre(),
                        documentoRepository
                                .findFirstByEventoIdAndCategoriaOrderByFechaPublicacionDesc(e.getId(), CategoriaDocumento.AUTORIZACION)
                                .map(Documento::getId).orElse(null)))
                .toList();
    }
}
