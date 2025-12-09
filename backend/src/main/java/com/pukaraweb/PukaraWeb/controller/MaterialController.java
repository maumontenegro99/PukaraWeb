package com.pukaraweb.PukaraWeb.controller;

import com.pukaraweb.PukaraWeb.model.Material;
import com.pukaraweb.PukaraWeb.service.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/materiales")
@CrossOrigin(origins = "http://localhost:5173")
public class MaterialController {

    @Autowired
    private MaterialService service;

    @GetMapping
    public List<Material> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Material> buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Material guardar(@RequestBody Material material) {
        return service.guardar(material);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}