package com.pukaraweb.PukaraWeb.comun;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Límite de envíos por IP para los formularios públicos (sin sesión): evita que alguien llene el disco de archivos
// o pruebe RUTs al azar. Los contadores viven en memoria: se reinician al reiniciar el servidor.
@Component
public class LimiteEnvios extends OncePerRequestFilter {

    private record Regla(String ruta, int maximo, String mensaje) {
    }

    private final List<Regla> reglas;
    private final Duration ventana;
    private final ObjectMapper json;
    private final Map<String, Deque<Long>> registros = new ConcurrentHashMap<>();

    public LimiteEnvios(@Value("${pukara.limite.envios:5}") int envios,
            @Value("${pukara.limite.consultas:15}") int consultas,
            @Value("${pukara.limite.ventana-minutos:10}") long minutos, ObjectMapper json) {
        this.ventana = Duration.ofMinutes(minutos);
        this.json = json;
        this.reglas = List.of(
                new Regla("/api/biblioteca/autorizaciones", envios, "Enviaste varias autorizaciones seguidas."),
                new Regla("/api/biblioteca/pagos", envios, "Enviaste varios comprobantes seguidos."),
                new Regla("/api/biblioteca/pagos/consulta", consultas, "Hiciste muchas consultas seguidas."));
    }

    private Regla reglaPara(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return null;
        }
        String ruta = request.getRequestURI().substring(request.getContextPath().length());
        return reglas.stream().filter(r -> r.ruta().equals(ruta)).findFirst().orElse(null);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return reglaPara(request) == null;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Regla regla = reglaPara(request);
        long ahora = System.currentTimeMillis();
        long desde = ahora - ventana.toMillis();
        // Se usa la IP de la conexión y no X-Forwarded-For, que el cliente puede falsificar.
        Deque<Long> envios = registros.computeIfAbsent(regla.ruta() + "|" + request.getRemoteAddr(), k -> new ArrayDeque<>());

        long esperarSegundos = 0;
        synchronized (envios) {
            while (!envios.isEmpty() && envios.peekFirst() < desde) {
                envios.pollFirst();
            }
            if (envios.size() >= regla.maximo()) {
                esperarSegundos = Math.max(1, (envios.peekFirst() - desde) / 1000);
            } else {
                envios.addLast(ahora);
            }
        }
        limpiarSiCrece(desde);

        if (esperarSegundos > 0) {
            long minutos = Math.max(1, (esperarSegundos + 59) / 60);
            ProblemDetail problema = ProblemDetail.forStatusAndDetail(HttpStatus.TOO_MANY_REQUESTS,
                    regla.mensaje() + " Espera " + (minutos == 1 ? "1 minuto" : minutos + " minutos") + " antes de volver a intentarlo.");
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(esperarSegundos));
            response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            json.writeValue(response.getWriter(), problema);
            return;
        }
        chain.doFilter(request, response);
    }

    // Evita que la memoria crezca sin límite con IPs que ya no envían nada.
    private void limpiarSiCrece(long desde) {
        if (registros.size() < 5000) {
            return;
        }
        registros.entrySet().removeIf(e -> {
            synchronized (e.getValue()) {
                return e.getValue().isEmpty() || e.getValue().peekLast() < desde;
            }
        });
    }
}
