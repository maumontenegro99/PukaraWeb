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

import com.pukaraweb.PukaraWeb.model.Apoderado;
import com.pukaraweb.PukaraWeb.service.ApoderadoService;

@RestController
@RequestMapping("/api/apoderados")
@CrossOrigin(origins = "*")
public class ApoderadoController {

    @Autowired
    private ApoderadoService service;

    @GetMapping
    public List<Apoderado> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Apoderado> buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Apoderado guardar(@RequestBody Apoderado apoderado) {
        return service.guardar(apoderado);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}