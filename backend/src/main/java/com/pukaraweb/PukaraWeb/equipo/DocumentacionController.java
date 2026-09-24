package com.pukaraweb.PukaraWeb.equipo;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pukaraweb.PukaraWeb.comun.AlmacenArchivos;
import com.pukaraweb.PukaraWeb.comun.ArchivoGuardado;
import com.pukaraweb.PukaraWeb.comun.Descargas;
import com.pukaraweb.PukaraWeb.equipo.DocumentacionService.DocumentoDto;

// Documentación de cada dirigente (panel, exige sesión). Un archivo por tipo: PUT lo crea o lo reemplaza.
@RestController
@RequestMapping("/api/dirigentes/{dirigenteId}/documentos")
public class DocumentacionController {

    private final DocumentacionService documentacionService;
    private final AlmacenArchivos almacen;

    public DocumentacionController(DocumentacionService documentacionService, AlmacenArchivos almacen) {
        this.documentacionService = documentacionService;
        this.almacen = almacen;
    }

    @GetMapping
    public List<DocumentoDto> listar(@PathVariable Long dirigenteId) {
        return documentacionService.listar(dirigenteId);
    }

    @PutMapping(value = "/{tipo}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentoDto subir(@PathVariable Long dirigenteId, @PathVariable TipoDocumentoDirigente tipo,
            @RequestParam MultipartFile archivo) {
        return documentacionService.subir(dirigenteId, tipo, archivo);
    }

    @GetMapping("/{tipo}/archivo")
    public ResponseEntity<Resource> archivo(@PathVariable Long dirigenteId, @PathVariable TipoDocumentoDirigente tipo,
            @RequestParam(defaultValue = "true") boolean enLinea) {
        ArchivoGuardado archivo = documentacionService.archivo(dirigenteId, tipo);
        return Descargas.responder(archivo, almacen.cargar(archivo), enLinea);
    }

    @DeleteMapping("/{tipo}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long dirigenteId, @PathVariable TipoDocumentoDirigente tipo) {
        documentacionService.eliminar(dirigenteId, tipo);
    }
}
