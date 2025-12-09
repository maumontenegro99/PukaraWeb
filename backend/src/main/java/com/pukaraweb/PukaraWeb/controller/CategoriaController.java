package com.pukaraweb.PukaraWeb.controller;

import com.pukaraweb.PukaraWeb.model.Categoria;
import com.pukaraweb.PukaraWeb.service.CategoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoriaController {

    @Autowired
    private CategoriaService service;

    @GetMapping
    public List<Categoria> listar() {
        return service.listarTodas();
    }

    @PostMapping
    public Categoria guardar(@RequestBody Categoria categoria) {
        return service.guardar(categoria);
    }
    
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}