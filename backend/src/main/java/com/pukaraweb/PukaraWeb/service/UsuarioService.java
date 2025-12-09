package com.pukaraweb.PukaraWeb.service;

import com.pukaraweb.PukaraWeb.model.Usuario;
import com.pukaraweb.PukaraWeb.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Buscamos el usuario en la BD
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
    }
    
    // Método extra para guardar usuarios (encriptaremos la clave más adelante)
    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
}