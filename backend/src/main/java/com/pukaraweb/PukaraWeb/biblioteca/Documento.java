package com.pukaraweb.PukaraWeb.biblioteca;

import java.time.LocalDateTime;

import com.pukaraweb.PukaraWeb.comun.ArchivoGuardado;
import com.pukaraweb.PukaraWeb.model.Evento;
import com.pukaraweb.PukaraWeb.model.Rama;

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

// Documento público de la biblioteca: manuales, formularios en blanco, reglamentos.
@Entity
@Table(name = "documentos")
@Getter
@Setter
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 1000)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaDocumento categoria;

    // Opcional: si el documento es propio de una rama (ej. manual de la Tropa).
    @ManyToOne
    @JoinColumn(name = "rama_id")
    private Rama rama;

    // Opcional: si es el formulario de autorización de un campamento concreto.
    @ManyToOne
    @JoinColumn(name = "evento_id")
    private Evento evento;

    @Embedded
    private ArchivoGuardado archivo;

    private LocalDateTime fechaPublicacion;

    @PrePersist
    void alPublicar() {
        if (fechaPublicacion == null) {
            fechaPublicacion = LocalDateTime.now();
        }
    }
}
