package com.pukaraweb.PukaraWeb.controller;

import com.pukaraweb.PukaraWeb.dto.AuthResponse;
import com.pukaraweb.PukaraWeb.dto.LoginRequest;
import com.pukaraweb.PukaraWeb.security.JwtUtil;
import com.pukaraweb.PukaraWeb.service.UsuarioService; // Usamos esto para cargar detalles
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // 1. Validar usuario y contraseña (Spring Security lo hace por nosotros)
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            // 2. Si pasó, cargamos los datos del usuario
            final UserDetails userDetails = usuarioService.loadUserByUsername(request.getUsername());

            // 3. Generamos el Token
            final String jwt = jwtUtil.generateToken(userDetails);

            // 4. Lo devolvemos
            return ResponseEntity.ok(new AuthResponse(jwt));

        } catch (Exception e) {
            return ResponseEntity.status(403).body("Credenciales Incorrectas");
        }
    }
}