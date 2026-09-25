package com.pukaraweb.PukaraWeb.biblioteca;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.pukaraweb.PukaraWeb.biblioteca.BibliotecaDtos.AutorizacionDto;
import com.pukaraweb.PukaraWeb.biblioteca.BibliotecaDtos.AutorizacionRecibidaDto;
import com.pukaraweb.PukaraWeb.biblioteca.BibliotecaDtos.EstadoIntegranteDto;
import com.pukaraweb.PukaraWeb.biblioteca.BibliotecaDtos.RamaResumen;
import com.pukaraweb.PukaraWeb.comun.AlmacenArchivos;
import com.pukaraweb.PukaraWeb.comun.Rut;
import com.pukaraweb.PukaraWeb.model.Evento;
import com.pukaraweb.PukaraWeb.model.Miembro;
import com.pukaraweb.PukaraWeb.model.Rama;
import com.pukaraweb.PukaraWeb.repository.EventoRepository;
import com.pukaraweb.PukaraWeb.repository.MiembroRepository;

// Autorizaciones firmadas: las envían los apoderados desde la biblioteca y las revisan los dirigentes en el panel.
@Service
public class AutorizacionService {

    private final AutorizacionFirmadaRepository autorizacionRepository;
    private final EventoRepository eventoRepository;
    private final MiembroRepository miembroRepository;
    private final AlmacenArchivos almacen;

    public AutorizacionService(AutorizacionFirmadaRepository autorizacionRepository, EventoRepository eventoRepository,
            MiembroRepository miembroRepository, AlmacenArchivos almacen) {
        this.autorizacionRepository = autorizacionRepository;
        this.eventoRepository = eventoRepository;
        this.miembroRepository = miembroRepository;
        this.almacen = almacen;
    }

    // Envío público. El RUT debe coincidir con un integrante de las ramas convocadas: así nadie puede
    // subir documentos a nombre de un niño que no participa.
    @Transactional
    public AutorizacionRecibidaDto recibir(Long eventoId, String rutMiembro, String nombreApoderado, MultipartFile archivo) {
        Evento evento = eventoRepository.findById(eventoId)
                .filter(e -> Boolean.TRUE.equals(e.getRequiereAutorizacion()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Este campamento no está recibiendo autorizaciones."));
        if (evento.getFechaFin() != null && evento.getFechaFin().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este campamento ya terminó.");
        }
        if (nombreApoderado == null || nombreApoderado.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escribe tu nombre como apoderado.");
        }

        Miembro miembro = convocados(evento).stream()
                .filter(m -> Rut.iguales(rutMiembro, m.getDocumentoIdentidad()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "El RUT no coincide con ningún integrante inscrito en este campamento. Revísalo o consulta a su dirigente."));

        AutorizacionFirmada autorizacion = new AutorizacionFirmada();
        autorizacion.setEvento(evento);
        autorizacion.setMiembro(miembro);
        autorizacion.setNombreApoderado(nombreApoderado.trim());
        autorizacion.setArchivo(almacen.guardar(archivo, AlmacenArchivos.TIPOS_AUTORIZACION));
        AutorizacionFirmada guardada = autorizacionRepository.save(autorizacion);
        return new AutorizacionRecibidaDto(guardada.getId(), evento.getTitulo(), guardada.getFechaEnvio());
    }

    // Panel: todos los integrantes convocados, cada uno con su autorización más reciente (o null si falta).
    @Transactional(readOnly = true)
    public List<EstadoIntegranteDto> estadoPorEvento(Long eventoId) {
        Evento evento = buscarEvento(eventoId);
        Map<Long, AutorizacionFirmada> ultimas = new HashMap<>();
        for (AutorizacionFirmada a : autorizacionRepository.findByEventoIdOrderByFechaEnvioDesc(eventoId)) {
            ultimas.putIfAbsent(a.getMiembro().getId(), a); // viene ordenado: la primera es la más reciente
        }
        return convocados(evento).stream()
                .sorted(Comparator.comparing((Miembro m) -> m.getRama() == null ? "" : m.getRama().getNombre())
                        .thenComparing(Miembro::getApellidos))
                .map(m -> {
                    AutorizacionFirmada a = ultimas.get(m.getId());
                    return new EstadoIntegranteDto(m.getId(), m.getNombres() + " " + m.getApellidos(),
                            m.getDocumentoIdentidad(), RamaResumen.de(m.getRama()),
                            m.getApoderado() == null ? null
                                    : m.getApoderado().getNombres() + " " + m.getApoderado().getApellidos(),
                            a == null ? null : AutorizacionDto.de(a));
                })
                .toList();
    }

    @Transactional
    public AutorizacionDto revisar(Long id, EstadoAutorizacion estado, String observacion) {
        if (estado == null || estado == EstadoAutorizacion.RECIBIDA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Indica si la autorización se aprueba o se rechaza.");
        }
        AutorizacionFirmada autorizacion = buscar(id);
        autorizacion.setEstado(estado);
        autorizacion.setObservacion(observacion == null || observacion.isBlank() ? null : observacion.trim());
        autorizacion.setFechaRevision(LocalDateTime.now());
        return AutorizacionDto.de(autorizacion);
    }

    @Transactional
    public void cambiarRequiere(Long eventoId, boolean requiere) {
        buscarEvento(eventoId).setRequiereAutorizacion(requiere);
    }

    @Transactional(readOnly = true)
    public AutorizacionFirmada buscar(Long id) {
        return autorizacionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Esta autorización ya no existe."));
    }

    private Evento buscarEvento(Long id) {
        return eventoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Este evento ya no existe."));
    }

    // Un evento sin ramas es para el grupo completo.
    private List<Miembro> convocados(Evento evento) {
        if (evento.getRamas() == null || evento.getRamas().isEmpty()) {
            return miembroRepository.findAll();
        }
        return miembroRepository.findByRamaIdIn(evento.getRamas().stream().map(Rama::getId).filter(Objects::nonNull).toList());
    }
}
