package com.pukaraweb.PukaraWeb.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pukaraweb.PukaraWeb.model.Dirigente;
import com.pukaraweb.PukaraWeb.service.DirigenteService;

@RestController
@RequestMapping("/api/dirigentes")
@CrossOrigin(origins = "http://localhost:5173")
public class DirigenteController {

    @Autowired
    private DirigenteService service;

    @GetMapping
    public List<Dirigente> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dirigente> buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Dirigente guardar(@RequestBody Dirigente dirigente) {
        return service.guardar(dirigente);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}