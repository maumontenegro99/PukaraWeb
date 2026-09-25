package com.pukaraweb.PukaraWeb.pagos;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.pukaraweb.PukaraWeb.comun.AlmacenArchivos;
import com.pukaraweb.PukaraWeb.comun.ArchivoGuardado;
import com.pukaraweb.PukaraWeb.comun.Rut;
import com.pukaraweb.PukaraWeb.model.Evento;
import com.pukaraweb.PukaraWeb.model.Miembro;
import com.pukaraweb.PukaraWeb.model.Rama;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.CobroDetalleDto;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.CobroDto;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.CobroPublicoDto;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.CobroRequest;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.ConfiguracionDto;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.EstadoIntegranteDto;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.EstadoPublicoDto;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.MiembroRef;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.PagoDto;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.PagoRecibidoDto;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.RamaRef;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.Resumen;
import com.pukaraweb.PukaraWeb.repository.EventoRepository;
import com.pukaraweb.PukaraWeb.repository.MiembroRepository;
import com.pukaraweb.PukaraWeb.repository.RamaRepository;

// Cobros del grupo y pagos por transferencia confirmados a mano por un administrador.
// El comprobante solo existe mientras el pago está en revisión: al confirmarlo o rechazarlo se borra.
@Service
public class PagosService {

    private final CobroRepository cobroRepository;
    private final PagoRepository pagoRepository;
    private final ConfiguracionPagosRepository configuracionRepository;
    private final MiembroRepository miembroRepository;
    private final RamaRepository ramaRepository;
    private final EventoRepository eventoRepository;
    private final AlmacenArchivos almacen;

    public PagosService(CobroRepository cobroRepository, PagoRepository pagoRepository,
            ConfiguracionPagosRepository configuracionRepository, MiembroRepository miembroRepository,
            RamaRepository ramaRepository, EventoRepository eventoRepository, AlmacenArchivos almacen) {
        this.cobroRepository = cobroRepository;
        this.pagoRepository = pagoRepository;
        this.configuracionRepository = configuracionRepository;
        this.miembroRepository = miembroRepository;
        this.ramaRepository = ramaRepository;
        this.eventoRepository = eventoRepository;
        this.almacen = almacen;
    }

    // ---------- Cobros ----------

    @Transactional(readOnly = true)
    public List<CobroDto> listarCobros() {
        return cobroRepository.findAllByOrderByFechaCreacionDesc().stream()
                .map(c -> aDto(c, calcularEstados(c, pagoRepository.findByCobroIdOrderByFechaEnvioDesc(c.getId()))))
                .toList();
    }

    @Transactional(readOnly = true)
    public CobroDetalleDto detalle(Long id) {
        Cobro cobro = buscarCobro(id);
        List<Pago> pagos = pagoRepository.findByCobroIdOrderByFechaEnvioDesc(id);
        List<EstadoIntegranteDto> estados = calcularEstados(cobro, pagos);
        return new CobroDetalleDto(aDto(cobro, estados), estados, pagos.stream().map(PagoDto::de).toList());
    }

    @Transactional
    public CobroDto crearCobro(CobroRequest request) {
        Cobro cobro = new Cobro();
        aplicar(cobro, request);
        Cobro guardado = cobroRepository.save(cobro);
        return aDto(guardado, calcularEstados(guardado, List.of()));
    }

    @Transactional
    public CobroDto actualizarCobro(Long id, CobroRequest request) {
        Cobro cobro = buscarCobro(id);
        aplicar(cobro, request);
        return aDto(cobro, calcularEstados(cobro, pagoRepository.findByCobroIdOrderByFechaEnvioDesc(id)));
    }

    @Transactional
    public void eliminarCobro(Long id) {
        Cobro cobro = buscarCobro(id);
        if (pagoRepository.existsByCobroId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Este cobro ya tiene pagos registrados. Ciérralo en vez de eliminarlo para conservar el historial.");
        }
        cobroRepository.delete(cobro);
    }

    // ---------- Biblioteca (público) ----------

    @Transactional(readOnly = true)
    public List<CobroPublicoDto> cobrosAbiertos() {
        return cobroRepository.findAllByOrderByFechaCreacionDesc().stream()
                .filter(Cobro::isActivo)
                .sorted(Comparator.comparing(Cobro::getFechaLimite, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(c -> new CobroPublicoDto(c.getId(), c.getNombre(), c.getDescripcion(), c.getTipo(), c.getMonto(),
                        c.getFechaLimite(), dirigidoA(c)))
                .toList();
    }

    // Envío público de un comprobante. El RUT debe corresponder a un integrante al que va dirigido el cobro.
    @Transactional
    public PagoRecibidoDto recibirComprobante(Long cobroId, String rutMiembro, String nombreRemitente, Integer monto,
            MultipartFile archivo) {
        Cobro cobro = cobroRepository.findById(cobroId).filter(Cobro::isActivo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Este cobro ya no está recibiendo pagos."));
        if (nombreRemitente == null || nombreRemitente.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escribe el nombre de quien hizo la transferencia.");
        }
        validarMonto(monto);
        Miembro miembro = destinatarios(cobro).stream()
                .filter(m -> Rut.iguales(rutMiembro, m.getDocumentoIdentidad()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "El RUT no coincide con ningún integrante al que va dirigido este cobro. Revísalo o consulta a su dirigente."));

        Pago pago = nuevoPago(cobro, miembro, monto, nombreRemitente, OrigenPago.APODERADO);
        pago.setMedio(MedioPago.TRANSFERENCIA);
        pago.setEstado(EstadoPago.EN_REVISION);
        pago.setComprobante(new ComprobantePago(almacen.guardar(archivo, AlmacenArchivos.TIPOS_AUTORIZACION)));
        Pago guardado = pagoRepository.save(pago);
        return new PagoRecibidoDto(guardado.getId(), cobro.getNombre(), guardado.getMonto(), guardado.getFechaEnvio());
    }

    // Consulta pública con el RUT del niño: estado de sus cobros abiertos. No revela nombres; si el RUT no existe
    // responde una lista vacía, igual que si no tuviera cobros, para no confirmar quién está inscrito.
    @Transactional(readOnly = true)
    public List<EstadoPublicoDto> consultar(String rut) {
        Miembro miembro = miembroRepository.findAll().stream()
                .filter(m -> Rut.iguales(rut, m.getDocumentoIdentidad()))
                .findFirst().orElse(null);
        if (miembro == null) {
            return List.of();
        }
        Map<Long, List<Pago>> suyos = pagoRepository.findByMiembroIdOrderByFechaEnvioDesc(miembro.getId()).stream()
                .collect(Collectors.groupingBy(p -> p.getCobro().getId()));
        return cobroRepository.findAllByOrderByFechaCreacionDesc().stream()
                .filter(Cobro::isActivo)
                .filter(c -> suyos.containsKey(c.getId()) || destinatarios(c).stream().anyMatch(m -> m.getId().equals(miembro.getId())))
                .map(c -> {
                    List<Pago> pagos = suyos.getOrDefault(c.getId(), List.of()); // del más reciente al más antiguo
                    long pagado = pagos.stream().filter(p -> p.getEstado() == EstadoPago.CONFIRMADO).mapToLong(Pago::getMonto).sum();
                    boolean enRevision = pagos.stream().anyMatch(p -> p.getEstado() == EstadoPago.EN_REVISION);
                    // El motivo solo se muestra si lo último que pasó con ese cobro fue un rechazo.
                    String rechazo = !pagos.isEmpty() && pagos.get(0).getEstado() == EstadoPago.RECHAZADO
                            ? pagos.get(0).getMotivoRechazo() : null;
                    EstadoDeuda estado = pagado >= c.getMonto() ? EstadoDeuda.PAGADO
                            : pagado > 0 ? EstadoDeuda.PARCIAL : EstadoDeuda.PENDIENTE;
                    return new EstadoPublicoDto(c.getNombre(), c.getTipo(), c.getMonto(), c.getFechaLimite(), pagado,
                            Math.max(0, c.getMonto() - pagado), estado, enRevision, rechazo);
                })
                .toList();
    }

    // ---------- Revisión (panel, solo administración) ----------

    // Todos los pagos de todos los cobros, del más reciente al más antiguo.
    @Transactional(readOnly = true)
    public List<PagoDto> historial() {
        return pagoRepository.findAllByOrderByFechaEnvioDesc().stream().map(PagoDto::de).toList();
    }

    @Transactional(readOnly = true)
    public List<PagoDto> porRevisar() {
        return pagoRepository.findByEstadoOrderByFechaEnvioAsc(EstadoPago.EN_REVISION).stream().map(PagoDto::de).toList();
    }

    @Transactional(readOnly = true)
    public ArchivoGuardado comprobante(Long pagoId) {
        ComprobantePago comprobante = buscarPago(pagoId).getComprobante();
        if (comprobante == null) {
            throw new ResponseStatusException(HttpStatus.GONE, "El comprobante se eliminó al revisar este pago.");
        }
        return comprobante.getArchivo();
    }

    @Transactional
    public PagoDto confirmar(Long pagoId, String administrador) {
        Pago pago = pagoEnRevision(pagoId);
        pago.setEstado(EstadoPago.CONFIRMADO);
        cerrarRevision(pago, administrador);
        return PagoDto.de(pago);
    }

    @Transactional
    public PagoDto rechazar(Long pagoId, String motivo, String administrador) {
        if (motivo == null || motivo.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escribe el motivo del rechazo para que la familia sepa qué corregir.");
        }
        Pago pago = pagoEnRevision(pagoId);
        pago.setEstado(EstadoPago.RECHAZADO);
        pago.setMotivoRechazo(motivo.trim());
        cerrarRevision(pago, administrador);
        return PagoDto.de(pago);
    }

    // El administrador registra un pago que le llegó por otro medio. Si es transferencia revisa el pantallazo al
    // subirlo; si es efectivo lo recibió en mano. En ambos casos queda confirmado y no se conserva ningún archivo.
    @Transactional
    public PagoDto registrarEnPanel(Long cobroId, Long miembroId, Integer monto, String nombreRemitente, MedioPago medio,
            MultipartFile archivo, String administrador) {
        Cobro cobro = buscarCobro(cobroId);
        Miembro miembro = miembroRepository.findById(miembroId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "El integrante elegido no existe."));
        validarMonto(monto);
        MedioPago medioFinal = medio == null ? MedioPago.TRANSFERENCIA : medio;
        if (medioFinal == MedioPago.TRANSFERENCIA) {
            // Se guarda solo para validar que sea realmente una imagen o un PDF; se borra al terminar la operación.
            ArchivoGuardado verificado = almacen.guardar(archivo, AlmacenArchivos.TIPOS_AUTORIZACION);
            alTerminar(() -> almacen.eliminar(verificado), false);
        }

        Pago pago = nuevoPago(cobro, miembro, monto, nombreRemitente, OrigenPago.PANEL);
        pago.setMedio(medioFinal);
        pago.setEstado(EstadoPago.CONFIRMADO);
        pago.setFechaRevision(LocalDateTime.now());
        pago.setRevisadoPor(administrador);
        return PagoDto.de(pagoRepository.save(pago));
    }

    // Para corregir errores (pago registrado dos veces, integrante equivocado).
    @Transactional
    public void anular(Long pagoId) {
        Pago pago = buscarPago(pagoId);
        ComprobantePago comprobante = pago.getComprobante();
        pagoRepository.delete(pago);
        if (comprobante != null) {
            alTerminar(() -> almacen.eliminar(comprobante.getArchivo()), true);
        }
    }

    // ---------- Datos de transferencia ----------

    @Transactional(readOnly = true)
    public ConfiguracionDto configuracion() {
        return ConfiguracionDto.de(configuracionRepository.findById(ConfiguracionPagos.ID).orElseGet(ConfiguracionPagos::new));
    }

    @Transactional
    public ConfiguracionDto guardarConfiguracion(ConfiguracionDto datos) {
        ConfiguracionPagos c = configuracionRepository.findById(ConfiguracionPagos.ID).orElseGet(ConfiguracionPagos::new);
        c.setTitular(limpio(datos.titular()));
        c.setRut(limpio(datos.rut()));
        c.setBanco(limpio(datos.banco()));
        c.setTipoCuenta(limpio(datos.tipoCuenta()));
        c.setNumeroCuenta(limpio(datos.numeroCuenta()));
        c.setCorreo(limpio(datos.correo()));
        c.setInstrucciones(limpio(datos.instrucciones()));
        return ConfiguracionDto.de(configuracionRepository.save(c));
    }

    // ---------- Cálculos ----------

    // Integrantes a los que va dirigido el cobro, más quienes ya pagaron aunque hayan cambiado de rama
    // (para que ningún pago quede fuera del resumen).
    private List<Miembro> destinatarios(Cobro cobro) {
        if (!cobro.getMiembros().isEmpty()) {
            return new ArrayList<>(cobro.getMiembros());
        }
        if (!cobro.getRamas().isEmpty()) {
            return miembroRepository.findByRamaIdIn(cobro.getRamas().stream().map(Rama::getId).toList());
        }
        return miembroRepository.findAll();
    }

    private List<EstadoIntegranteDto> calcularEstados(Cobro cobro, List<Pago> pagos) {
        Map<Long, Miembro> integrantes = new LinkedHashMap<>();
        destinatarios(cobro).forEach(m -> integrantes.put(m.getId(), m));
        pagos.forEach(p -> integrantes.putIfAbsent(p.getMiembro().getId(), p.getMiembro()));

        Map<Long, List<Pago>> porMiembro = pagos.stream().collect(Collectors.groupingBy(p -> p.getMiembro().getId()));
        return integrantes.values().stream()
                .sorted(Comparator.comparing((Miembro m) -> m.getRama() == null ? "" : m.getRama().getNombre())
                        .thenComparing(Miembro::getApellidos, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(m -> {
                    List<Pago> suyos = porMiembro.getOrDefault(m.getId(), List.of());
                    long pagado = suyos.stream().filter(p -> p.getEstado() == EstadoPago.CONFIRMADO).mapToLong(Pago::getMonto).sum();
                    boolean enRevision = suyos.stream().anyMatch(p -> p.getEstado() == EstadoPago.EN_REVISION);
                    EstadoDeuda estado = pagado >= cobro.getMonto() ? EstadoDeuda.PAGADO
                            : pagado > 0 ? EstadoDeuda.PARCIAL : EstadoDeuda.PENDIENTE;
                    return new EstadoIntegranteDto(MiembroRef.de(m), pagado, Math.max(0, cobro.getMonto() - pagado), estado, enRevision);
                })
                .toList();
    }

    private CobroDto aDto(Cobro c, List<EstadoIntegranteDto> estados) {
        int pagados = (int) estados.stream().filter(e -> e.estado() == EstadoDeuda.PAGADO).count();
        int parciales = (int) estados.stream().filter(e -> e.estado() == EstadoDeuda.PARCIAL).count();
        int enRevision = (int) estados.stream().filter(EstadoIntegranteDto::enRevision).count();
        long recaudado = estados.stream().mapToLong(EstadoIntegranteDto::pagado).sum();
        long esperado = (long) c.getMonto() * estados.size();
        return new CobroDto(c.getId(), c.getNombre(), c.getDescripcion(), c.getTipo(), c.getMonto(), c.getFechaLimite(),
                c.getEvento() == null ? null : c.getEvento().getId(),
                c.getEvento() == null ? null : c.getEvento().getTitulo(),
                c.getRamas().stream().map(RamaRef::de).toList(),
                c.getMiembros().stream().map(MiembroRef::de).toList(),
                c.isActivo(), c.getFechaCreacion(),
                new Resumen(estados.size(), pagados, parciales, enRevision, recaudado, esperado));
    }

    private String dirigidoA(Cobro c) {
        if (!c.getMiembros().isEmpty()) {
            return "Integrantes específicos";
        }
        if (!c.getRamas().isEmpty()) {
            return c.getRamas().stream().map(Rama::getNombre).collect(Collectors.joining(", "));
        }
        return "Todo el grupo";
    }

    // ---------- Apoyo ----------

    private void aplicar(Cobro cobro, CobroRequest r) {
        if (r.tipo() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Elige el tipo de cobro.");
        }
        if (r.nombre() == null || r.nombre().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escribe un nombre para el cobro.");
        }
        validarMonto(r.monto());
        Evento evento = null;
        if (r.tipo() == TipoCobro.EVENTO) {
            if (r.eventoId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Elige el evento que se está cobrando.");
            }
            evento = eventoRepository.findById(r.eventoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "El evento elegido no existe."));
        }
        List<Long> miembroIds = r.miembroIds() == null ? List.of() : r.miembroIds();
        List<Long> ramaIds = r.ramaIds() == null ? List.of() : r.ramaIds();

        cobro.setTipo(r.tipo());
        cobro.setNombre(r.nombre().trim());
        cobro.setDescripcion(limpio(r.descripcion()));
        cobro.setMonto(r.monto());
        cobro.setFechaLimite(r.fechaLimite());
        cobro.setEvento(evento);
        // Si hay integrantes específicos, las ramas no se usan.
        cobro.setMiembros(new ArrayList<>(miembroIds.isEmpty() ? List.of() : miembroRepository.findAllById(miembroIds)));
        cobro.setRamas(new ArrayList<>(miembroIds.isEmpty() && !ramaIds.isEmpty() ? ramaRepository.findAllById(ramaIds) : List.of()));
        if (r.activo() != null) {
            cobro.setActivo(r.activo());
        }
    }

    private Pago nuevoPago(Cobro cobro, Miembro miembro, Integer monto, String nombreRemitente, OrigenPago origen) {
        Pago pago = new Pago();
        pago.setCobro(cobro);
        pago.setMiembro(miembro);
        pago.setMonto(monto);
        pago.setOrigen(origen);
        pago.setNombreRemitente(limpio(nombreRemitente));
        return pago;
    }

    // Marca la revisión y quita el comprobante: el archivo se borra del disco cuando la transacción se confirma.
    private void cerrarRevision(Pago pago, String administrador) {
        pago.setFechaRevision(LocalDateTime.now());
        pago.setRevisadoPor(administrador);
        ComprobantePago comprobante = pago.getComprobante();
        if (comprobante != null) {
            pago.setComprobante(null);
            alTerminar(() -> almacen.eliminar(comprobante.getArchivo()), true);
        }
    }

    // Ejecuta una limpieza de archivos después de la transacción: solo si se confirma, o siempre.
    private void alTerminar(Runnable accion, boolean soloSiSeConfirma) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            accion.run();
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int estado) {
                if (!soloSiSeConfirma || estado == STATUS_COMMITTED) {
                    accion.run();
                }
            }
        });
    }

    private Pago pagoEnRevision(Long id) {
        Pago pago = buscarPago(id);
        if (pago.getEstado() != EstadoPago.EN_REVISION) {
            // Evita confirmar o rechazar dos veces (doble clic o dos administradores a la vez).
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este pago ya fue revisado.");
        }
        return pago;
    }

    private void validarMonto(Integer monto) {
        if (monto == null || monto <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El monto debe ser mayor que cero.");
        }
    }

    private Cobro buscarCobro(Long id) {
        return cobroRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Este cobro ya no existe."));
    }

    private Pago buscarPago(Long id) {
        return pagoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Este pago ya no existe."));
    }

    private static String limpio(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
