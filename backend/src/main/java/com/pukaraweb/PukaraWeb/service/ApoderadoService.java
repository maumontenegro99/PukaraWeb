package com.pukaraweb.PukaraWeb.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pukaraweb.PukaraWeb.model.Apoderado;
import com.pukaraweb.PukaraWeb.repository.ApoderadoRepository;

@Service
public class ApoderadoService {

    @Autowired
    private ApoderadoRepository repository;

    public List<Apoderado> listarTodos() {
        return repository.findAll();
    }

    public Optional<Apoderado> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Apoderado guardar(Apoderado apoderado) {
        return repository.save(apoderado);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}