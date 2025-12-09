package com.pukaraweb.PukaraWeb.service;

import com.pukaraweb.PukaraWeb.model.Ubicacion;
import com.pukaraweb.PukaraWeb.repository.UbicacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UbicacionService {

    @Autowired
    private UbicacionRepository repository;

    public List<Ubicacion> listarTodas() {
        return repository.findAll();
    }

    public Ubicacion guardar(Ubicacion ubicacion) {
        return repository.save(ubicacion);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}