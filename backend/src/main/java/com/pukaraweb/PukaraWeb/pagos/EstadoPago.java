package com.pukaraweb.PukaraWeb.pagos;

// Estado de un pago individual. La deuda de cada integrante se calcula aparte (ver EstadoDeuda).
public enum EstadoPago {
    EN_REVISION, // El apoderado subió un comprobante y un administrador aún no lo revisa
    CONFIRMADO,  // Un administrador verificó la transferencia; suma al total pagado
    RECHAZADO    // El comprobante no correspondía; no suma y el integrante sigue debiendo
}
