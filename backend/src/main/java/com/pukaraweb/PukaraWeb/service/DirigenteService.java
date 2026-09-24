package com.pukaraweb.PukaraWeb.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pukaraweb.PukaraWeb.equipo.DocumentacionService;
import com.pukaraweb.PukaraWeb.model.Dirigente;
import com.pukaraweb.PukaraWeb.repository.DirigenteRepository;

@Service
public class DirigenteService {

    @Autowired
    private DirigenteRepository repository;

    @Autowired
    private DocumentacionService documentacionService;

    public List<Dirigente> listarTodos() {
        return repository.findAll();
    }

    public Optional<Dirigente> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Dirigente guardar(Dirigente dirigente) {
        return repository.save(dirigente);
    }

    @Transactional
    public void eliminar(Long id) {
        documentacionService.eliminarTodo(id);
        repository.deleteById(id);
    }
}