package com.pukaraweb.PukaraWeb.pagos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.pukaraweb.PukaraWeb.biblioteca.BibliotecaDevSeeder;
import com.pukaraweb.PukaraWeb.comun.AlmacenArchivos;
import com.pukaraweb.PukaraWeb.comun.Rut;
import com.pukaraweb.PukaraWeb.model.Evento;
import com.pukaraweb.PukaraWeb.model.Miembro;
import com.pukaraweb.PukaraWeb.repository.EventoRepository;
import com.pukaraweb.PukaraWeb.repository.MiembroRepository;

// Cobros y pagos de prueba para el perfil dev: un cobro cerrado, pagos en distintas fechas, abonos, efectivo,
// rechazos con su motivo y comprobantes por revisar. Solo corre si todavía no hay cobros.
// Los datos bancarios son ficticios.
@Component
@Profile("dev")
@Order(3)
public class PagosDevSeeder implements CommandLineRunner {

    private static final String ADMIN = "Administrador Pukara";

    private final CobroRepository cobroRepository;
    private final PagoRepository pagoRepository;
    private final ConfiguracionPagosRepository configuracionRepository;
    private final EventoRepository eventoRepository;
    private final MiembroRepository miembroRepository;
    private final AlmacenArchivos almacen;

    public PagosDevSeeder(CobroRepository cobroRepository, PagoRepository pagoRepository,
            ConfiguracionPagosRepository configuracionRepository, EventoRepository eventoRepository,
            MiembroRepository miembroRepository, AlmacenArchivos almacen) {
        this.cobroRepository = cobroRepository;
        this.pagoRepository = pagoRepository;
        this.configuracionRepository = configuracionRepository;
        this.eventoRepository = eventoRepository;
        this.miembroRepository = miembroRepository;
        this.almacen = almacen;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (cobroRepository.count() > 0) {
            return;
        }

        ConfiguracionPagos datos = configuracionRepository.findById(ConfiguracionPagos.ID).orElseGet(ConfiguracionPagos::new);
        datos.setTitular("Grupo Scout Pukara Weche (datos de prueba)");
        datos.setRut("11.111.111-1");
        datos.setBanco("Banco de Prueba");
        datos.setTipoCuenta("Cuenta corriente");
        datos.setNumeroCuenta("00-000-00000-0");
        datos.setCorreo("tesoreria@example.com");
        datos.setInstrucciones("En el asunto de la transferencia escribe el nombre del niño, niña o joven.");
        configuracionRepository.save(datos);

        Miembro tomas = porRut("25.123.456-7");
        Miembro isidora = porRut("24.987.654-3");
        Miembro benjamin = porRut("24.555.111-2");
        Miembro antonia = porRut("23.444.222-1");
        if (tomas == null || isidora == null || benjamin == null || antonia == null) {
            return; // Los miembros de prueba fueron modificados: no hay a quién asignar pagos.
        }

        // Cuota de septiembre: cerrada y pagada por todos (con un rechazo antes de pagar bien).
        Cobro septiembre = cobro(TipoCobro.CUOTA, "Cuota de septiembre", "Cuota mensual del grupo.", 5000,
                LocalDate.now().minusDays(20), 45, null);
        septiembre.setActivo(false);
        pago(septiembre, tomas, 5000, EstadoPago.CONFIRMADO, OrigenPago.APODERADO, MedioPago.TRANSFERENCIA, "Carolina Muñoz Reyes", 40, null);
        pago(septiembre, isidora, 5000, EstadoPago.CONFIRMADO, OrigenPago.APODERADO, MedioPago.TRANSFERENCIA, "Carolina Muñoz Reyes", 40, null);
        pago(septiembre, benjamin, 5000, EstadoPago.CONFIRMADO, OrigenPago.PANEL, MedioPago.EFECTIVO, "Jorge Pérez Soto", 33, null);
        pago(septiembre, antonia, 5000, EstadoPago.RECHAZADO, OrigenPago.APODERADO, MedioPago.TRANSFERENCIA, "Jorge Pérez Soto", 30,
                "El comprobante corresponde a otra cuenta de destino.");
        pago(septiembre, antonia, 5000, EstadoPago.CONFIRMADO, OrigenPago.APODERADO, MedioPago.TRANSFERENCIA, "Jorge Pérez Soto", 28, null);

        // Campamento de invierno: pago completo, abonos y un comprobante ilegible.
        Evento campamento = eventoRepository.findAll().stream()
                .filter(e -> "Campamento de invierno".equals(e.getTitulo())).findFirst().orElse(null);
        if (campamento != null) {
            int costo = campamento.getCosto() != null && campamento.getCosto() > 0 ? campamento.getCosto() : 25000;
            Cobro invierno = cobro(TipoCobro.EVENTO, campamento.getTitulo(),
                    "Incluye transporte, alimentación y materiales. Se puede pagar en abonos.", costo,
                    LocalDate.now().plusDays(20), 14, campamento);
            invierno.setRamas(new ArrayList<>(campamento.getRamas()));
            pago(invierno, benjamin, costo, EstadoPago.CONFIRMADO, OrigenPago.PANEL, MedioPago.TRANSFERENCIA, "Jorge Pérez Soto", 12, null);
            pago(invierno, isidora, 10000, EstadoPago.CONFIRMADO, OrigenPago.APODERADO, MedioPago.TRANSFERENCIA, "Carolina Muñoz Reyes", 10, null);
            pago(invierno, isidora, 5000, EstadoPago.RECHAZADO, OrigenPago.APODERADO, MedioPago.TRANSFERENCIA, "Carolina Muñoz Reyes", 4,
                    "La imagen está cortada y no se ve el monto.");
            porRevisar(invierno, isidora, 5000, "Carolina Muñoz Reyes", 1, "Abono campamento Isidora");
        }

        // Cuota de octubre: efectivo, un monto equivocado y un comprobante por revisar.
        Cobro octubre = cobro(TipoCobro.CUOTA, "Cuota de octubre", "Cuota mensual del grupo.", 5000,
                LocalDate.now().plusDays(10), 8, null);
        pago(octubre, tomas, 5000, EstadoPago.CONFIRMADO, OrigenPago.PANEL, MedioPago.EFECTIVO, "Carolina Muñoz Reyes", 6, null);
        pago(octubre, benjamin, 500, EstadoPago.RECHAZADO, OrigenPago.APODERADO, MedioPago.TRANSFERENCIA, "Jorge Pérez Soto", 3,
                "El monto transferido fue $500, no $5.000.");
        porRevisar(octubre, antonia, 5000, "Jorge Pérez Soto", 0, "Cuota octubre Antonia");

        // Cobro personalizado para integrantes específicos.
        Cobro panolin = cobro(TipoCobro.PERSONALIZADO, "Pañolín del grupo", "Pañolín oficial para quienes hicieron su promesa.",
                3500, null, 5, null);
        panolin.setMiembros(new ArrayList<>(List.of(tomas, antonia)));
        pago(panolin, antonia, 3500, EstadoPago.CONFIRMADO, OrigenPago.PANEL, MedioPago.EFECTIVO, "Jorge Pérez Soto", 2, null);
    }

    private Miembro porRut(String rut) {
        return miembroRepository.findAll().stream().filter(m -> Rut.iguales(rut, m.getDocumentoIdentidad())).findFirst().orElse(null);
    }

    private Cobro cobro(TipoCobro tipo, String nombre, String descripcion, int monto, LocalDate fechaLimite, int diasAtras, Evento evento) {
        Cobro c = new Cobro();
        c.setTipo(tipo);
        c.setNombre(nombre);
        c.setDescripcion(descripcion);
        c.setMonto(monto);
        c.setFechaLimite(fechaLimite);
        c.setEvento(evento);
        c.setFechaCreacion(LocalDateTime.now().minusDays(diasAtras));
        return cobroRepository.save(c);
    }

    private void pago(Cobro cobro, Miembro miembro, int monto, EstadoPago estado, OrigenPago origen, MedioPago medio,
            String remitente, int diasAtras, String motivoRechazo) {
        Pago p = new Pago();
        p.setCobro(cobro);
        p.setMiembro(miembro);
        p.setMonto(monto);
        p.setEstado(estado);
        p.setOrigen(origen);
        p.setMedio(medio);
        p.setNombreRemitente(remitente);
        p.setFechaEnvio(LocalDateTime.now().minusDays(diasAtras).withHour(19).withMinute(30));
        p.setFechaRevision(LocalDateTime.now().minusDays(Math.max(0, diasAtras - 1)).withHour(21).withMinute(0));
        p.setRevisadoPor(ADMIN);
        p.setMotivoRechazo(motivoRechazo);
        pagoRepository.save(p);
    }

    private void porRevisar(Cobro cobro, Miembro miembro, int monto, String remitente, int diasAtras, String glosa) {
        Pago p = new Pago();
        p.setCobro(cobro);
        p.setMiembro(miembro);
        p.setMonto(monto);
        p.setEstado(EstadoPago.EN_REVISION);
        p.setOrigen(OrigenPago.APODERADO);
        p.setMedio(MedioPago.TRANSFERENCIA);
        p.setNombreRemitente(remitente);
        p.setFechaEnvio(LocalDateTime.now().minusDays(diasAtras));
        p.setComprobante(new ComprobantePago(almacen.guardarBytes(
                BibliotecaDevSeeder.pdfSimple("Comprobante de transferencia (prueba)", "Monto: $" + monto,
                        "Destino: Grupo Scout Pukara Weche", "Glosa: " + glosa),
                "comprobante-transferencia.pdf", AlmacenArchivos.Tipo.PDF)));
        pagoRepository.save(p);
    }
}
