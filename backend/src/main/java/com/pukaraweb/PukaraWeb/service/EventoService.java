package com.pukaraweb.PukaraWeb.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pukaraweb.PukaraWeb.model.Evento;
import com.pukaraweb.PukaraWeb.repository.EventoRepository;

@Service
public class EventoService {

    @Autowired
    private EventoRepository repository;

    public List<Evento> listarTodos() {
        return repository.findAll();
    }

    public Optional<Evento> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Evento guardar(Evento evento) {
        // El formulario de eventos no envía este campo: al editar se conserva el valor guardado.
        if (evento.getRequiereAutorizacion() == null && evento.getId() != null) {
            repository.findById(evento.getId())
                    .ifPresent(actual -> evento.setRequiereAutorizacion(actual.getRequiereAutorizacion()));
        }
        return repository.save(evento);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}