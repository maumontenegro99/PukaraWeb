package com.pukaraweb.PukaraWeb.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pukaraweb.PukaraWeb.model.Rama;
import com.pukaraweb.PukaraWeb.repository.RamaRepository;

@Service
public class RamaService {

    @Autowired
    private RamaRepository repository;

    public List<Rama> listarTodas() {
        return repository.findAll();
    }

    public Optional<Rama> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Rama guardar(Rama rama) {
        return repository.save(rama);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}