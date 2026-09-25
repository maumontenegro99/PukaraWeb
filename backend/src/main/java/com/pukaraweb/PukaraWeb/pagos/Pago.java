package com.pukaraweb.PukaraWeb.pagos;

import java.time.LocalDateTime;

import com.pukaraweb.PukaraWeb.model.Miembro;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// Un pago de un integrante para un cobro. Puede ser un abono: el total pagado es la suma de los confirmados.
@Entity
@Table(name = "pagos")
@Getter
@Setter
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cobro_id")
    private Cobro cobro;

    @ManyToOne(optional = false)
    @JoinColumn(name = "miembro_id")
    private Miembro miembro;

    @Column(nullable = false)
    private Integer monto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPago estado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrigenPago origen;

    // Null en pagos anteriores a esta columna: se consideran transferencias.
    @Enumerated(EnumType.STRING)
    private MedioPago medio;

    // Quién hizo la transferencia (lo indica el apoderado o el administrador).
    private String nombreRemitente;

    // Solo mientras está en revisión. orphanRemoval borra la fila al dejarlo en null.
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "comprobante_id")
    private ComprobantePago comprobante;

    private LocalDateTime fechaEnvio;

    private LocalDateTime fechaRevision;

    private String revisadoPor;

    @Column(length = 500)
    private String motivoRechazo;

    @PrePersist
    void alRegistrar() {
        if (fechaEnvio == null) {
            fechaEnvio = LocalDateTime.now();
        }
    }
}
