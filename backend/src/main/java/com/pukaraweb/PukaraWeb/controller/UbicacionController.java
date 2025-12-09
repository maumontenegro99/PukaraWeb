package com.pukaraweb.PukaraWeb.controller;

import com.pukaraweb.PukaraWeb.model.Ubicacion;
import com.pukaraweb.PukaraWeb.service.UbicacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ubicaciones")
@CrossOrigin(origins = "http://localhost:5173")
public class UbicacionController {

    @Autowired
    private UbicacionService service;

    @GetMapping
    public List<Ubicacion> listar() {
        return service.listarTodas();
    }

    @PostMapping
    public Ubicacion guardar(@RequestBody Ubicacion ubicacion) {
        return service.guardar(ubicacion);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}