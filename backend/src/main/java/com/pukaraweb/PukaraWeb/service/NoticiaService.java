package com.pukaraweb.PukaraWeb.service;

import com.pukaraweb.PukaraWeb.model.Noticia;
import com.pukaraweb.PukaraWeb.repository.NoticiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class NoticiaService {

    @Autowired
    private NoticiaRepository repository;

    public List<Noticia> listarTodas() {
        return repository.findAllByOrderByFechaPublicacionDesc();
    }

    public Optional<Noticia> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Noticia guardar(Noticia noticia) {
        return repository.save(noticia);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}