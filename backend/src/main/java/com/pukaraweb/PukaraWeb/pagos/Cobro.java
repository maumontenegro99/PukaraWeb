package com.pukaraweb.PukaraWeb.pagos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.pukaraweb.PukaraWeb.model.Evento;
import com.pukaraweb.PukaraWeb.model.Miembro;
import com.pukaraweb.PukaraWeb.model.Rama;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// Algo que el grupo cobra: un campamento, una cuota o un cobro personalizado.
// Destinatarios: los integrantes elegidos; si no hay, las ramas elegidas; si tampoco hay, todo el grupo.
@Entity
@Table(name = "cobros")
@Getter
@Setter
public class Cobro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(length = 1000)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCobro tipo;

    // Monto en pesos chilenos por integrante.
    @Column(nullable = false)
    private Integer monto;

    private LocalDate fechaLimite;

    @ManyToOne
    @JoinColumn(name = "evento_id")
    private Evento evento;

    // List y no Set: Rama y Miembro usan @Data y su hashCode recorre relaciones.
    @ManyToMany
    @JoinTable(name = "cobro_ramas", joinColumns = @JoinColumn(name = "cobro_id"), inverseJoinColumns = @JoinColumn(name = "rama_id"))
    private List<Rama> ramas = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "cobro_miembros", joinColumns = @JoinColumn(name = "cobro_id"), inverseJoinColumns = @JoinColumn(name = "miembro_id"))
    private List<Miembro> miembros = new ArrayList<>();

    // Un cobro cerrado deja de aparecer en la biblioteca y no recibe comprobantes nuevos.
    private boolean activo = true;

    private LocalDateTime fechaCreacion;

    @PrePersist
    void alCrear() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
    }
}
