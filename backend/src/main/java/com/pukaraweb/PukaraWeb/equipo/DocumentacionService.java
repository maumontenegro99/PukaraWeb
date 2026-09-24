package com.pukaraweb.PukaraWeb.equipo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.pukaraweb.PukaraWeb.comun.AlmacenArchivos;
import com.pukaraweb.PukaraWeb.comun.ArchivoGuardado;
import com.pukaraweb.PukaraWeb.model.Dirigente;
import com.pukaraweb.PukaraWeb.repository.DirigenteRepository;

// Archivos de la documentación obligatoria de cada dirigente.
@Service
public class DocumentacionService {

    public record DocumentoDto(TipoDocumentoDirigente tipo, String nombreArchivo, String tipoContenido, long tamano,
            LocalDateTime fechaSubida) {

        static DocumentoDto de(DocumentoDirigente d) {
            ArchivoGuardado a = d.getArchivo();
            return new DocumentoDto(d.getTipo(), a.getNombreOriginal(), a.getTipoContenido(), a.getTamano(), d.getFechaSubida());
        }
    }

    private final DocumentoDirigenteRepository documentoRepository;
    private final DirigenteRepository dirigenteRepository;
    private final AlmacenArchivos almacen;

    public DocumentacionService(DocumentoDirigenteRepository documentoRepository, DirigenteRepository dirigenteRepository,
            AlmacenArchivos almacen) {
        this.documentoRepository = documentoRepository;
        this.dirigenteRepository = dirigenteRepository;
        this.almacen = almacen;
    }

    @Transactional(readOnly = true)
    public List<DocumentoDto> listar(Long dirigenteId) {
        buscarDirigente(dirigenteId);
        return documentoRepository.findByDirigenteId(dirigenteId).stream().map(DocumentoDto::de).toList();
    }

    // Guarda el archivo (PDF o foto) y marca el documento como entregado. Si ya había uno de ese tipo, lo reemplaza.
    @Transactional
    public DocumentoDto subir(Long dirigenteId, TipoDocumentoDirigente tipo, MultipartFile archivo) {
        Dirigente dirigente = buscarDirigente(dirigenteId);
        ArchivoGuardado nuevo = almacen.guardar(archivo, AlmacenArchivos.TIPOS_AUTORIZACION);

        DocumentoDirigente documento = documentoRepository.findByDirigenteIdAndTipo(dirigenteId, tipo).orElseGet(() -> {
            DocumentoDirigente d = new DocumentoDirigente();
            d.setDirigente(dirigente);
            d.setTipo(tipo);
            return d;
        });
        ArchivoGuardado anterior = documento.getArchivo();
        documento.setArchivo(nuevo);
        documento.setFechaSubida(LocalDateTime.now());
        DocumentoDirigente guardado = documentoRepository.save(documento);

        tipo.marcar(dirigente, true);
        if (anterior != null) {
            almacen.eliminar(anterior);
        }
        return DocumentoDto.de(guardado);
    }

    @Transactional(readOnly = true)
    public ArchivoGuardado archivo(Long dirigenteId, TipoDocumentoDirigente tipo) {
        return buscarDocumento(dirigenteId, tipo).getArchivo();
    }

    // Borra el archivo y desmarca el documento como entregado.
    @Transactional
    public void eliminar(Long dirigenteId, TipoDocumentoDirigente tipo) {
        DocumentoDirigente documento = buscarDocumento(dirigenteId, tipo);
        documentoRepository.delete(documento);
        tipo.marcar(documento.getDirigente(), false);
        almacen.eliminar(documento.getArchivo());
    }

    // Antes de eliminar a un dirigente: borra todos sus archivos.
    @Transactional
    public void eliminarTodo(Long dirigenteId) {
        List<DocumentoDirigente> documentos = documentoRepository.findByDirigenteId(dirigenteId);
        documentoRepository.deleteAll(documentos);
        documentoRepository.flush();
        documentos.forEach(d -> almacen.eliminar(d.getArchivo()));
    }

    private Dirigente buscarDirigente(Long id) {
        return dirigenteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Este dirigente ya no existe."));
    }

    private DocumentoDirigente buscarDocumento(Long dirigenteId, TipoDocumentoDirigente tipo) {
        return documentoRepository.findByDirigenteIdAndTipo(dirigenteId, tipo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Este documento todavía no se ha subido."));
    }
}
