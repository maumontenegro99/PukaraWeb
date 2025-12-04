package com.pukaraweb.PukaraWeb.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pukaraweb.PukaraWeb.model.Miembro;
import com.pukaraweb.PukaraWeb.repository.MiembroRepository;

@Service
public class MiembroService {

    @Autowired
    private MiembroRepository repository;

    public List<Miembro> listarTodos() {
        return repository.findAll();
    }

    public Optional<Miembro> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Miembro guardar(Miembro miembro) {
        return repository.save(miembro);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}