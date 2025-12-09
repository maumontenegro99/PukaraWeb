package com.pukaraweb.PukaraWeb.controller;

import com.pukaraweb.PukaraWeb.model.Usuario;
import com.pukaraweb.PukaraWeb.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1. OBTENER MI PERFIL (El token me dice quién soy)
    @GetMapping("/perfil")
    public Usuario getMiPerfil(@AuthenticationPrincipal UserDetails userDetails) {
        // userDetails viene inyectado automáticamente gracias al Token
        return (Usuario) usuarioService.loadUserByUsername(userDetails.getUsername());
    }

    // 2. ACTUALIZAR MI PERFIL
    @PutMapping("/perfil")
    public Usuario updateMiPerfil(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Usuario usuarioActualizado) {
        Usuario usuario = (Usuario) usuarioService.loadUserByUsername(userDetails.getUsername());
        
        usuario.setNombreCompleto(usuarioActualizado.getNombreCompleto());
        
        // Solo cambiamos la contraseña si viene algo nuevo (y no está vacía)
        if (usuarioActualizado.getPassword() != null && !usuarioActualizado.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuarioActualizado.getPassword()));
        }
        
        return usuarioService.save(usuario);
    }
}