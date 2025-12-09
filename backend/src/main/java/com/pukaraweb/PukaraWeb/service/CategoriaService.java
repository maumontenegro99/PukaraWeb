package com.pukaraweb.PukaraWeb.service;

import com.pukaraweb.PukaraWeb.model.Categoria;
import com.pukaraweb.PukaraWeb.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository repository;

    public List<Categoria> listarTodas() {
        return repository.findAll();
    }

    public Categoria guardar(Categoria categoria) {
        return repository.save(categoria);
    }
    
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}