package com.pukaraweb.PukaraWeb.biblioteca;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.pukaraweb.PukaraWeb.biblioteca.BibliotecaDtos.AutorizacionDto;
import com.pukaraweb.PukaraWeb.biblioteca.BibliotecaDtos.EstadoIntegranteDto;
import com.pukaraweb.PukaraWeb.biblioteca.BibliotecaDtos.RequiereAutorizacionRequest;
import com.pukaraweb.PukaraWeb.biblioteca.BibliotecaDtos.RevisionRequest;
import com.pukaraweb.PukaraWeb.comun.AlmacenArchivos;
import com.pukaraweb.PukaraWeb.comun.Descargas;

// Panel del grupo: revisión de autorizaciones firmadas. Todo exige sesión.
@RestController
@RequestMapping("/api/autorizaciones")
public class AutorizacionesController {

    private final AutorizacionService autorizacionService;
    private final AlmacenArchivos almacen;

    public AutorizacionesController(AutorizacionService autorizacionService, AlmacenArchivos almacen) {
        this.autorizacionService = autorizacionService;
        this.almacen = almacen;
    }

    @GetMapping("/eventos/{eventoId}")
    public List<EstadoIntegranteDto> estado(@PathVariable Long eventoId) {
        return autorizacionService.estadoPorEvento(eventoId);
    }

    @PutMapping("/eventos/{eventoId}/requiere")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void requiere(@PathVariable Long eventoId, @RequestBody RequiereAutorizacionRequest request) {
        autorizacionService.cambiarRequiere(eventoId, request.requiere());
    }

    @PatchMapping("/{id}")
    public AutorizacionDto revisar(@PathVariable Long id, @RequestBody RevisionRequest request) {
        return autorizacionService.revisar(id, request.estado(), request.observacion());
    }

    @GetMapping("/{id}/archivo")
    public ResponseEntity<Resource> archivo(@PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean enLinea) {
        AutorizacionFirmada autorizacion = autorizacionService.buscar(id);
        return Descargas.responder(autorizacion.getArchivo(), almacen.cargar(autorizacion.getArchivo()), enLinea);
    }
}
