package com.pukaraweb.PukaraWeb.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

// Respuestas de Spring Security en el mismo formato que el resto de la API (ProblemDetail).
// 401 = no hay sesión válida (el frontend lleva al login); 403 = hay sesión pero el rol no alcanza (el frontend avisa y no expulsa).
@Component
public class RespuestasSeguridad {

    private final ObjectMapper objectMapper;

    public RespuestasSeguridad(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public AuthenticationEntryPoint sinSesion() {
        return (request, response, e) -> escribir(response, HttpStatus.UNAUTHORIZED,
                "Tu sesión no es válida o venció. Vuelve a iniciar sesión.");
    }

    public AccessDeniedHandler sinPermiso() {
        return (request, response, e) -> escribir(response, HttpStatus.FORBIDDEN,
                "No tienes permiso para esta acción. Pídesela a un administrador del grupo.");
    }

    private void escribir(HttpServletResponse response, HttpStatus estado, String detalle) throws IOException {
        response.setStatus(estado.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(response.getOutputStream(), ProblemDetail.forStatusAndDetail(estado, detalle));
    }
}
