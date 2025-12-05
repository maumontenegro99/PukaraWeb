package com.pukaraweb.PukaraWeb.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pukaraweb.PukaraWeb.model.Adulto;
import com.pukaraweb.PukaraWeb.service.AdultoService;

@RestController
@RequestMapping("/api/adultos")
@CrossOrigin(origins = "http://localhost:5173") // Permite conexión con React
public class AdultoController {

    @Autowired
    private AdultoService adultoService;

    // 1. Obtener todos los adultos
    @GetMapping
    public List<Adulto> getAllAdultos() {
        return adultoService.findAll();
    }

    // 2. Obtener adulto por ID
    @GetMapping("/{id}")
    public ResponseEntity<Adulto> getAdultoById(@PathVariable Long id) {
        return adultoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // 3. Obtener adultos por Rama (Ej: /api/adultos/rama/1)
    @GetMapping("/rama/{ramaId}")
    public List<Adulto> getAdultosByRama(@PathVariable Long ramaId) {
        return adultoService.findByRama(ramaId);
    }

    // 4. Crear un nuevo adulto
    @PostMapping
    public Adulto createAdulto(@RequestBody Adulto adulto) {
        return adultoService.save(adulto);
    }

    // 5. Actualizar adulto existente
    @PutMapping("/{id}")
    public ResponseEntity<Adulto> updateAdulto(@PathVariable Long id, @RequestBody Adulto adultoDetails) {
        return adultoService.findById(id)
                .map(adulto -> {
                    adulto.setNombre(adultoDetails.getNombre());
                    adulto.setApellido(adultoDetails.getApellido());
                    adulto.setRut(adultoDetails.getRut());
                    adulto.setEmail(adultoDetails.getEmail());
                    adulto.setTelefono(adultoDetails.getTelefono());
                    adulto.setCargo(adultoDetails.getCargo());
                    adulto.setNivelFormacion(adultoDetails.getNivelFormacion());
                    adulto.setFechaNacimiento(adultoDetails.getFechaNacimiento());
                    adulto.setRama(adultoDetails.getRama());
                    
                    Adulto updatedAdulto = adultoService.save(adulto);
                    return ResponseEntity.ok(updatedAdulto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. Eliminar adulto
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdulto(@PathVariable Long id) {
        if (adultoService.findById(id).isPresent()) {
            adultoService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}