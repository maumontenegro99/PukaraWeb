package com.pukaraweb.PukaraWeb.biblioteca;

import java.time.LocalDateTime;

import com.pukaraweb.PukaraWeb.comun.ArchivoGuardado;
import com.pukaraweb.PukaraWeb.model.Evento;
import com.pukaraweb.PukaraWeb.model.Miembro;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// Autorización firmada a mano que un apoderado sube desde la biblioteca.
// Es privada: solo se consulta desde el panel del grupo.
@Entity
@Table(name = "autorizaciones_firmadas")
@Getter
@Setter
public class AutorizacionFirmada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "evento_id")
    private Evento evento;

    @ManyToOne(optional = false)
    @JoinColumn(name = "miembro_id")
    private Miembro miembro;

    @Column(nullable = false)
    private String nombreApoderado;

    @Embedded
    private ArchivoGuardado archivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoAutorizacion estado;

    @Column(length = 500)
    private String observacion;

    private LocalDateTime fechaEnvio;

    private LocalDateTime fechaRevision;

    @PrePersist
    void alRecibir() {
        if (fechaEnvio == null) {
            fechaEnvio = LocalDateTime.now();
        }
        if (estado == null) {
            estado = EstadoAutorizacion.RECIBIDA;
        }
    }
}
