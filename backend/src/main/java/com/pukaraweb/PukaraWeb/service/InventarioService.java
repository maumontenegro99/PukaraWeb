package com.pukaraweb.PukaraWeb.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pukaraweb.PukaraWeb.model.Inventario;
import com.pukaraweb.PukaraWeb.repository.InventarioRepository;

@Service
public class InventarioService {

    @Autowired
    private InventarioRepository repository;

    public List<Inventario> listarTodos() {
        return repository.findAll();
    }

    public Optional<Inventario> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Inventario guardar(Inventario item) {
        return repository.save(item);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}