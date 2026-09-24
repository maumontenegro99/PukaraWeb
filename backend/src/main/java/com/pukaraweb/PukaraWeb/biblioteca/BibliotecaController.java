package com.pukaraweb.PukaraWeb.biblioteca;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pukaraweb.PukaraWeb.biblioteca.BibliotecaDtos.AutorizacionRecibidaDto;
import com.pukaraweb.PukaraWeb.biblioteca.BibliotecaDtos.CampamentoDto;
import com.pukaraweb.PukaraWeb.biblioteca.BibliotecaDtos.DocumentoDto;
import com.pukaraweb.PukaraWeb.comun.AlmacenArchivos;
import com.pukaraweb.PukaraWeb.comun.Descargas;

// Biblioteca del grupo. Los GET y el envío de autorizaciones son públicos (ver SecurityConfig);
// publicar y eliminar documentos exige sesión de dirigente.
@RestController
@RequestMapping("/api/biblioteca")
public class BibliotecaController {

    private final BibliotecaService bibliotecaService;
    private final AutorizacionService autorizacionService;
    private final AlmacenArchivos almacen;

    public BibliotecaController(BibliotecaService bibliotecaService, AutorizacionService autorizacionService,
            AlmacenArchivos almacen) {
        this.bibliotecaService = bibliotecaService;
        this.autorizacionService = autorizacionService;
        this.almacen = almacen;
    }

    @GetMapping("/documentos")
    public List<DocumentoDto> documentos() {
        return bibliotecaService.listarDocumentos();
    }

    @GetMapping("/documentos/{id}/archivo")
    public ResponseEntity<Resource> descargar(@PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean enLinea) {
        Documento documento = bibliotecaService.buscarDocumento(id);
        return Descargas.responder(documento.getArchivo(), almacen.cargar(documento.getArchivo()), enLinea);
    }

    @PostMapping(value = "/documentos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentoDto publicar(@RequestParam String titulo,
            @RequestParam(required = false) String descripcion,
            @RequestParam CategoriaDocumento categoria,
            @RequestParam(required = false) Long ramaId,
            @RequestParam(required = false) Long eventoId,
            @RequestParam MultipartFile archivo) {
        return bibliotecaService.publicar(titulo, descripcion, categoria, ramaId, eventoId, archivo);
    }

    @DeleteMapping("/documentos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        bibliotecaService.eliminar(id);
    }

    @GetMapping("/campamentos")
    public List<CampamentoDto> campamentos() {
        return bibliotecaService.campamentosAbiertos();
    }

    @PostMapping(value = "/autorizaciones", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public AutorizacionRecibidaDto enviarAutorizacion(@RequestParam Long eventoId,
            @RequestParam String rutMiembro,
            @RequestParam String nombreApoderado,
            @RequestParam MultipartFile archivo) {
        return autorizacionService.recibir(eventoId, rutMiembro, nombreApoderado, archivo);
    }
}
