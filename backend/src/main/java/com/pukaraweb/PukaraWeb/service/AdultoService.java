package com.pukaraweb.PukaraWeb.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pukaraweb.PukaraWeb.model.Adulto;
import com.pukaraweb.PukaraWeb.repository.AdultoRepository;

@Service
public class AdultoService {

    @Autowired
    private AdultoRepository adultoRepository;

    // Listar todos
    public List<Adulto> findAll() {
        return adultoRepository.findAll();
    }

    // Buscar por ID
    public Optional<Adulto> findById(Long id) {
        return adultoRepository.findById(id);
    }

    // Buscar por Rama
    public List<Adulto> findByRama(Long ramaId) {
        return adultoRepository.findByRamaId(ramaId);
    }

    // Guardar (Crear o Editar)
    public Adulto save(Adulto adulto) {
        return adultoRepository.save(adulto);
    }

    // Eliminar
    public void deleteById(Long id) {
        adultoRepository.deleteById(id);
    }
}