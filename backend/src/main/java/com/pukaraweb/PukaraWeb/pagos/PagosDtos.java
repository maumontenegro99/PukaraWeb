package com.pukaraweb.PukaraWeb.pagos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.pukaraweb.PukaraWeb.model.Miembro;
import com.pukaraweb.PukaraWeb.model.Rama;

// Contratos de la API de pagos. Las entidades nunca salen directo al cliente.
public final class PagosDtos {

    private PagosDtos() {
    }

    public record RamaRef(Long id, String nombre, String tipo) {
        static RamaRef de(Rama r) {
            return r == null ? null : new RamaRef(r.getId(), r.getNombre(), r.getTipo());
        }
    }

    public record MiembroRef(Long id, String nombre, String documento, RamaRef rama) {
        static MiembroRef de(Miembro m) {
            return new MiembroRef(m.getId(), m.getNombres() + " " + m.getApellidos(), m.getDocumentoIdentidad(),
                    RamaRef.de(m.getRama()));
        }
    }

    // Avance de un cobro: cuántos pagaron y cuánto se ha recaudado.
    public record Resumen(int destinatarios, int pagados, int parciales, int enRevision, long recaudado, long esperado) {
    }

    public record CobroDto(Long id, String nombre, String descripcion, TipoCobro tipo, int monto, LocalDate fechaLimite,
            Long eventoId, String eventoTitulo, List<RamaRef> ramas, List<MiembroRef> miembros, boolean activo,
            LocalDateTime fechaCreacion, Resumen resumen) {
    }

    // Lo que ve cualquiera en la biblioteca: sin datos de integrantes.
    public record CobroPublicoDto(Long id, String nombre, String descripcion, TipoCobro tipo, int monto,
            LocalDate fechaLimite, String dirigidoA) {
    }

    public record PagoDto(Long id, Long cobroId, String cobroNombre, MiembroRef miembro, int monto, EstadoPago estado,
            OrigenPago origen, MedioPago medio, String nombreRemitente, boolean tieneComprobante, String tipoComprobante,
            LocalDateTime fechaEnvio, LocalDateTime fechaRevision, String revisadoPor, String motivoRechazo) {

        static PagoDto de(Pago p) {
            var c = p.getComprobante();
            return new PagoDto(p.getId(), p.getCobro().getId(), p.getCobro().getNombre(), MiembroRef.de(p.getMiembro()),
                    p.getMonto(), p.getEstado(), p.getOrigen(),
                    p.getMedio() == null ? MedioPago.TRANSFERENCIA : p.getMedio(), p.getNombreRemitente(), c != null,
                    c == null ? null : c.getArchivo().getTipoContenido(), p.getFechaEnvio(), p.getFechaRevision(),
                    p.getRevisadoPor(), p.getMotivoRechazo());
        }
    }

    // Situación de un integrante frente a un cobro.
    public record EstadoIntegranteDto(MiembroRef miembro, long pagado, long saldo, EstadoDeuda estado, boolean enRevision) {
    }

    public record CobroDetalleDto(CobroDto cobro, List<EstadoIntegranteDto> integrantes, List<PagoDto> pagos) {
    }

    public record CobroRequest(String nombre, String descripcion, TipoCobro tipo, Integer monto, LocalDate fechaLimite,
            Long eventoId, List<Long> ramaIds, List<Long> miembroIds, Boolean activo) {
    }

    public record RechazoRequest(String motivo) {
    }

    public record ConsultaRequest(String rut) {
    }

    // Lo que ve un apoderado al consultar con el RUT de su hija o hijo: sin nombres ni datos de otros integrantes.
    public record EstadoPublicoDto(String cobro, TipoCobro tipo, int monto, LocalDate fechaLimite, long pagado,
            long saldo, EstadoDeuda estado, boolean enRevision, String ultimoRechazo) {
    }

    public record ConfiguracionDto(String titular, String rut, String banco, String tipoCuenta, String numeroCuenta,
            String correo, String instrucciones) {

        static ConfiguracionDto de(ConfiguracionPagos c) {
            return new ConfiguracionDto(c.getTitular(), c.getRut(), c.getBanco(), c.getTipoCuenta(), c.getNumeroCuenta(),
                    c.getCorreo(), c.getInstrucciones());
        }
    }

    // Respuesta pública al enviar un comprobante: solo confirma que llegó.
    public record PagoRecibidoDto(Long id, String cobro, int monto, LocalDateTime fechaEnvio) {
    }
}
