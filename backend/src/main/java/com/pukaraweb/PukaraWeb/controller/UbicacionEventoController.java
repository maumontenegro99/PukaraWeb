package com.pukaraweb.PukaraWeb.controller;

import com.pukaraweb.PukaraWeb.model.UbicacionEvento;
import com.pukaraweb.PukaraWeb.service.UbicacionEventoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ubicaciones-eventos") // Endpoint diferenciado
@CrossOrigin(origins = "http://localhost:5173")
public class UbicacionEventoController {

    @Autowired
    private UbicacionEventoService service;

    @GetMapping
    public List<UbicacionEvento> listar() {
        return service.listarTodas();
    }

    @PostMapping
    public UbicacionEvento guardar(@RequestBody UbicacionEvento ubicacion) {
        return service.guardar(ubicacion);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}