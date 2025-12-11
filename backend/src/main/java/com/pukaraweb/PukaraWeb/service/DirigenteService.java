package com.pukaraweb.PukaraWeb.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pukaraweb.PukaraWeb.model.Dirigente;
import com.pukaraweb.PukaraWeb.repository.DirigenteRepository;

@Service
public class DirigenteService {

    @Autowired
    private DirigenteRepository repository;

    public List<Dirigente> listarTodos() {
        return repository.findAll();
    }

    public Optional<Dirigente> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Dirigente guardar(Dirigente dirigente) {
        return repository.save(dirigente);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}