package com.pukaraweb.PukaraWeb.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pukaraweb.PukaraWeb.model.Rama;
import com.pukaraweb.PukaraWeb.repository.MiembroRepository;
import com.pukaraweb.PukaraWeb.repository.RamaRepository;

@Service
public class RamaService {

    @Autowired
    private RamaRepository repository;

    @Autowired
    private MiembroRepository miembroRepository;

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
        if (miembroRepository.existsByRamaId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La rama tiene miembros. Cámbialos de rama o elimínalos antes de borrarla.");
        }
        repository.deleteById(id);
    }
}