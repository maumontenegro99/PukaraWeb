package com.pukaraweb.PukaraWeb.config;

import com.pukaraweb.PukaraWeb.model.Rol;
import com.pukaraweb.PukaraWeb.model.Usuario;
import com.pukaraweb.PukaraWeb.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// Solo en desarrollo: usuario "dirigente" / "dirigente123" (rol DIRIGENTE_GUIADORA) para probar el panel sin permisos de
// administración. Se crea si no existe, aunque la base ya tenga datos.
@Component
@Profile("dev")
public class UsuariosDevSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuariosDevSeeder(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.findByUsername("dirigente").isPresent()) {
            return;
        }
        Usuario dirigente = new Usuario();
        dirigente.setUsername("dirigente");
        dirigente.setPassword(passwordEncoder.encode("dirigente123"));
        dirigente.setNombreCompleto("Dirigente de prueba");
        dirigente.setRol(Rol.DIRIGENTE_GUIADORA);
        usuarioRepository.save(dirigente);
    }
}
