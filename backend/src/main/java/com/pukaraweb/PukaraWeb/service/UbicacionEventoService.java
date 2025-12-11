package com.pukaraweb.PukaraWeb.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pukaraweb.PukaraWeb.model.UbicacionEvento;
import com.pukaraweb.PukaraWeb.repository.UbicacionEventoRepository;

@Service
public class UbicacionEventoService {

    @Autowired
    private UbicacionEventoRepository repository;

    public List<UbicacionEvento> listarTodas() {
        return repository.findAll();
    }

    public UbicacionEvento guardar(UbicacionEvento ubicacion) {
        return repository.save(ubicacion);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}