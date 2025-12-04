package com.pukaraweb.PukaraWeb.controller;

import com.pukaraweb.PukaraWeb.model.Miembro;
import com.pukaraweb.PukaraWeb.service.MiembroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/miembros")
@CrossOrigin(origins = "*")
public class MiembroController {

    @Autowired
    private MiembroService service;

    @GetMapping
    public List<Miembro> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Miembro> buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Miembro guardar(@RequestBody Miembro miembro) {
        // OJO: Aquí en el JSON deberás enviar la rama y el apoderado
        return service.guardar(miembro);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}