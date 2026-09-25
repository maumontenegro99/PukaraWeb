package com.pukaraweb.PukaraWeb.controller;

import com.pukaraweb.PukaraWeb.dto.PerfilDtos.ActualizarPerfil;
import com.pukaraweb.PukaraWeb.dto.PerfilDtos.Perfil;
import com.pukaraweb.PukaraWeb.model.Usuario;
import com.pukaraweb.PukaraWeb.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private static final int LARGO_MINIMO_CLAVE = 8;

    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioService usuarioService, PasswordEncoder passwordEncoder) {
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
    }

    // Perfil de quien tiene la sesión (el token dice quién es).
    @GetMapping("/perfil")
    public Perfil getMiPerfil(@AuthenticationPrincipal UserDetails userDetails) {
        return Perfil.de(usuarioActual(userDetails));
    }

    @PutMapping("/perfil")
    public ResponseEntity<?> updateMiPerfil(@AuthenticationPrincipal UserDetails userDetails, @RequestBody ActualizarPerfil cambios) {
        Usuario usuario = usuarioActual(userDetails);

        String clave = cambios.password();
        if (clave != null && !clave.isEmpty()) {
            if (clave.length() < LARGO_MINIMO_CLAVE) {
                return ResponseEntity.badRequest().body(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
                        "La contraseña debe tener al menos " + LARGO_MINIMO_CLAVE + " caracteres."));
            }
            usuario.setPassword(passwordEncoder.encode(clave));
        }
        usuario.setNombreCompleto(cambios.nombreCompleto());

        return ResponseEntity.ok(Perfil.de(usuarioService.save(usuario)));
    }

    private Usuario usuarioActual(UserDetails userDetails) {
        return (Usuario) usuarioService.loadUserByUsername(userDetails.getUsername());
    }
}
