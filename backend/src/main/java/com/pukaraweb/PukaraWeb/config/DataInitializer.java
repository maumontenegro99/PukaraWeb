package com.pukaraweb.PukaraWeb.config;

import com.pukaraweb.PukaraWeb.model.Rol;
import com.pukaraweb.PukaraWeb.model.Usuario;
import com.pukaraweb.PukaraWeb.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Verificar si existe el usuario admin
        if (usuarioRepository.findByUsername("admin").isEmpty()) {
            Usuario admin = new Usuario();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123")); // <--- CONTRASEÑA INICIAL
            admin.setNombreCompleto("Administrador Pukara");
            admin.setRol(Rol.ADMIN);
            
            usuarioRepository.save(admin);
            System.out.println(">>> USUARIO ADMIN CREADO: admin / admin123 <<<");
        }
    }
}