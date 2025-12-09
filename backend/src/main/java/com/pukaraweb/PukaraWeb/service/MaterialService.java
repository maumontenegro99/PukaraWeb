package com.pukaraweb.PukaraWeb.service;

import com.pukaraweb.PukaraWeb.model.Material;
import com.pukaraweb.PukaraWeb.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository repository;

    public List<Material> listarTodos() {
        return repository.findAll();
    }

    public Optional<Material> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Material guardar(Material material) {
        return repository.save(material);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}