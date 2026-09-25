package com.pukaraweb.PukaraWeb.dto;

import com.pukaraweb.PukaraWeb.model.Rol;
import com.pukaraweb.PukaraWeb.model.Usuario;

// Perfil del usuario con sesión. Nunca incluye la contraseña (ni su hash).
public final class PerfilDtos {

    private PerfilDtos() {
    }

    public record Perfil(Long id, String username, String nombreCompleto, Rol rol) {
        public static Perfil de(Usuario usuario) {
            return new Perfil(usuario.getId(), usuario.getUsername(), usuario.getNombreCompleto(), usuario.getRol());
        }
    }

    // `password` vacío o ausente = no cambiar la contraseña.
    public record ActualizarPerfil(String nombreCompleto, String password) {
    }
}
