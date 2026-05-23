package com.pukaraweb.PukaraWeb.controller;

import com.pukaraweb.PukaraWeb.model.Noticia;
import com.pukaraweb.PukaraWeb.service.NoticiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/noticias")
@CrossOrigin(origins = "http://localhost:5173")
public class NoticiaController {

    @Autowired
    private NoticiaService service;

    // GET: Público (Idealmente)
    @GetMapping
    public List<Noticia> listar() {
        return service.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Noticia> buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST: Privado (Solo dirigentes)
    @PostMapping
    public Noticia guardar(@RequestBody Noticia noticia) {
        return service.guardar(noticia);
    }

    // DELETE: Privado
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}