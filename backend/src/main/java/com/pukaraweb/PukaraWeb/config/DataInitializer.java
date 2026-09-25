package com.pukaraweb.PukaraWeb.config;

import com.pukaraweb.PukaraWeb.model.Rol;
import com.pukaraweb.PukaraWeb.model.Usuario;
import com.pukaraweb.PukaraWeb.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// Crea el usuario "admin" en el primer arranque con la clave de pukara.admin.clave-inicial (variable ADMIN_CLAVE_INICIAL).
// La clave nunca se escribe en el registro.
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String claveInicial;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
            @Value("${pukara.admin.clave-inicial:}") String claveInicial) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.claveInicial = claveInicial;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.findByUsername("admin").isPresent()) {
            return;
        }
        if (claveInicial == null || claveInicial.isBlank()) {
            log.warn("No existe el usuario 'admin' y no se definió ADMIN_CLAVE_INICIAL: no se creó ningún administrador.");
            return;
        }

        Usuario admin = new Usuario();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode(claveInicial));
        admin.setNombreCompleto("Administrador Pukara");
        admin.setRol(Rol.ADMIN);
        usuarioRepository.save(admin);
        log.info("Usuario 'admin' creado con la clave de ADMIN_CLAVE_INICIAL. Cámbiala desde \"Mi perfil\".");
    }
}
