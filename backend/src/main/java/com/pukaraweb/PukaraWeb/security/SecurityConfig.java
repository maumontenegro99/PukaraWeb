package com.pukaraweb.PukaraWeb.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // IMPORTANTE: Agregado para usar GET
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Autowired
    private RespuestasSeguridad respuestas;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Deshabilitar CSRF (No necesario para APIs REST con Token)
            .csrf(csrf -> csrf.disable())
            
            // 2. Activar CORS (Para permitir conexión desde React localhost:5173)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 3. Configurar Rutas (El Semáforo de seguridad)
            .authorizeHttpRequests(auth -> auth
                // ✅ ZONA PÚBLICA: Login y Registro
                .requestMatchers("/api/auth/**").permitAll()

                // ✅ ZONA PÚBLICA: Cualquiera puede LEER noticias (GET) sin token
                .requestMatchers(HttpMethod.GET, "/api/noticias/**").permitAll()

                // ✅ ZONA PÚBLICA: Biblioteca (ver y descargar documentos, enviar autorizaciones firmadas)
                .requestMatchers(HttpMethod.GET, "/api/biblioteca/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/biblioteca/autorizaciones").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/biblioteca/pagos").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/biblioteca/pagos/consulta").permitAll()

                // 🔒 SOLO ADMINISTRACIÓN: pagos (confirmar transferencias, ver comprobantes, crear cobros)
                .requestMatchers("/api/pagos/**").hasRole("ADMIN")

                // 🔒 SOLO ADMINISTRACIÓN: documentación de dirigentes (certificados de antecedentes y otros datos sensibles)
                .requestMatchers("/api/dirigentes/*/documentos/**").hasRole("ADMIN")

                // 🔒 Autorizaciones firmadas: los dirigentes pueden verlas y descargarlas; solo administración las cambia
                .requestMatchers(HttpMethod.GET, "/api/autorizaciones/**").hasAnyRole("ADMIN", "DIRIGENTE_GUIADORA")
                .requestMatchers("/api/autorizaciones/**").hasRole("ADMIN")

                // 🔒 Mi perfil: cualquier usuario con sesión
                .requestMatchers("/api/usuarios/perfil").authenticated()

                // 🔒 ZONA PRIVADA: el resto del panel es para administración y dirigentes (un apoderado no entra al panel)
                .anyRequest().hasAnyRole("ADMIN", "DIRIGENTE_GUIADORA")
            )

            // Sin sesión válida → 401; con sesión pero sin el rol → 403 (por defecto Spring respondería 403 en ambos casos)
            .exceptionHandling(e -> e
                .authenticationEntryPoint(respuestas.sinSesion())
                .accessDeniedHandler(respuestas.sinPermiso())
            )
            
            // 4. No usar sesiones (Stateless)
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 5. Agregar nuestro filtro JWT antes del filtro de usuario/clave estándar
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Configuración para permitir que React (Puerto 5173) hable con Spring Boot
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); // Tu Frontend
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Bean para encriptar contraseñas (BCrypt es el estándar de oro)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Bean para manejar la autenticación
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}