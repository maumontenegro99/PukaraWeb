package com.pukaraweb.PukaraWeb;

import com.pukaraweb.PukaraWeb.model.Miembro;
import com.pukaraweb.PukaraWeb.model.Rama;
import com.pukaraweb.PukaraWeb.model.Rol;
import com.pukaraweb.PukaraWeb.model.Usuario;
import com.pukaraweb.PukaraWeb.repository.MiembroRepository;
import com.pukaraweb.PukaraWeb.repository.RamaRepository;
import com.pukaraweb.PukaraWeb.repository.UsuarioRepository;
import com.pukaraweb.PukaraWeb.security.JwtUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SeguridadTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    JwtUtil jwtUtil;

    @Autowired
    UsuarioRepository usuarios;

    @Autowired
    RamaRepository ramas;

    @Autowired
    MiembroRepository miembros;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Value("${pukara.jwt.secreto}")
    String secreto;

    private String tokenDe(String username, Rol rol) {
        Usuario usuario = usuarios.findByUsername(username).orElseGet(() -> {
            Usuario nuevo = new Usuario();
            nuevo.setUsername(username);
            nuevo.setPassword(passwordEncoder.encode("clave-de-prueba"));
            nuevo.setNombreCompleto("Prueba " + username);
            nuevo.setRol(rol);
            return usuarios.save(nuevo);
        });
        return "Bearer " + jwtUtil.generateToken(usuario);
    }

    @Test
    void elPerfilNoIncluyeLaContrasena() throws Exception {
        mvc.perform(get("/api/usuarios/perfil").header("Authorization", tokenDe("admin", Rol.ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.rol").value("ADMIN"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void cambiarElPerfilExigeUnaContrasenaLarga() throws Exception {
        String token = tokenDe("clave-corta", Rol.DIRIGENTE_GUIADORA);
        mvc.perform(put("/api/usuarios/perfil").header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombreCompleto\":\"Otro nombre\",\"password\":\"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").exists());

        mvc.perform(put("/api/usuarios/perfil").header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombreCompleto\":\"Otro nombre\",\"password\":\"\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombreCompleto").value("Otro nombre"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void loginConClaveIncorrectaResponde401() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"incorrecta\"}"))
                .andExpect(status().isUnauthorized());

        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void sinSesionOTokenInvalidoResponde401() throws Exception {
        mvc.perform(get("/api/miembros")).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").exists());
        mvc.perform(get("/api/miembros").header("Authorization", "Bearer esto-no-es-un-token"))
                .andExpect(status().isUnauthorized());

        String vencido = Jwts.builder().setSubject("admin")
                .setIssuedAt(new Date(System.currentTimeMillis() - 7_200_000))
                .setExpiration(new Date(System.currentTimeMillis() - 3_600_000))
                .signWith(Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8)))
                .compact();
        mvc.perform(get("/api/miembros").header("Authorization", "Bearer " + vencido))
                .andExpect(status().isUnauthorized());

        String otraFirma = Jwts.builder().setSubject("admin").setExpiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(Keys.hmacShaKeyFor("una-clave-distinta-de-la-configurada-123".getBytes(StandardCharsets.UTF_8)))
                .compact();
        mvc.perform(get("/api/miembros").header("Authorization", "Bearer " + otraFirma))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unTokenVencidoNoImpideLasRutasPublicas() throws Exception {
        mvc.perform(get("/api/noticias").header("Authorization", "Bearer esto-no-es-un-token"))
                .andExpect(status().isOk());
    }

    @Test
    void elDirigenteVeAutorizacionesPeroNoDocumentacionNiPagos() throws Exception {
        String token = tokenDe("dirigente", Rol.DIRIGENTE_GUIADORA);

        mvc.perform(get("/api/miembros").header("Authorization", token)).andExpect(status().isOk());
        mvc.perform(get("/api/autorizaciones/eventos/999").header("Authorization", token))
                .andExpect(result -> {
                    int estado = result.getResponse().getStatus();
                    if (estado == 401 || estado == 403) {
                        throw new AssertionError("El dirigente debería poder leer autorizaciones, respondió " + estado);
                    }
                });

        mvc.perform(patch("/api/autorizaciones/1").header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").exists());
        mvc.perform(put("/api/autorizaciones/eventos/1/requiere").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/dirigentes/1/documentos").header("Authorization", token)).andExpect(status().isForbidden());
        mvc.perform(get("/api/dirigentes/1/documentos/CERTIFICADO_ANTECEDENTES/archivo").header("Authorization", token))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/pagos").header("Authorization", token)).andExpect(status().isForbidden());
    }

    @Test
    void soloAdministracionMarcaUnEventoConAutorizacion() throws Exception {
        String evento = "{\"titulo\":\"Salida de prueba\",\"requiereAutorizacion\":true}";
        mvc.perform(post("/api/eventos").header("Authorization", tokenDe("dirigente", Rol.DIRIGENTE_GUIADORA))
                        .contentType(MediaType.APPLICATION_JSON).content(evento))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiereAutorizacion").doesNotExist());
        mvc.perform(post("/api/eventos").header("Authorization", tokenDe("admin", Rol.ADMIN))
                        .contentType(MediaType.APPLICATION_JSON).content(evento))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiereAutorizacion").value(true));
    }

    @Test
    void unApoderadoNoEntraAlPanel() throws Exception {
        String token = tokenDe("apoderado", Rol.APODERADO);
        mvc.perform(get("/api/miembros").header("Authorization", token)).andExpect(status().isForbidden());
        mvc.perform(get("/api/usuarios/perfil").header("Authorization", token)).andExpect(status().isOk());
    }

    @Test
    void borrarUnaRamaConMiembrosNoBorraALosMiembros() throws Exception {
        Rama rama = new Rama();
        rama.setNombre("Rama de prueba de borrado");
        rama.setTipo("MIXTA");
        rama = ramas.save(rama);

        Miembro miembro = new Miembro();
        miembro.setNombres("Niña");
        miembro.setApellidos("De Prueba");
        miembro.setRama(rama);
        miembro = miembros.save(miembro);

        mvc.perform(delete("/api/ramas/" + rama.getId()).header("Authorization", tokenDe("admin", Rol.ADMIN)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").exists());

        if (!miembros.existsById(miembro.getId()) || !ramas.existsById(rama.getId())) {
            throw new AssertionError("La rama o el miembro se borraron");
        }
    }
}
