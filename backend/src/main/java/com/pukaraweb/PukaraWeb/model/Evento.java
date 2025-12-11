package com.pukaraweb.PukaraWeb.model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated; // Importante para la lista de ramas
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "eventos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    // Asegúrate de que TipoEvento.java existe en el mismo paquete 'model'
    @Enumerated(EnumType.STRING)
    private TipoEvento tipo;

    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;

    // CAMBIO IMPORTANTE: Ahora pueden ser VARIAS ramas
    // Usamos @ManyToMany para que un evento pueda tener muchas ramas
    @ManyToMany
    @JoinTable(
        name = "evento_ramas", // Nombre de la tabla intermedia
        joinColumns = @JoinColumn(name = "evento_id"),
        inverseJoinColumns = @JoinColumn(name = "rama_id")
    )
    private List<Rama> ramas; // Lista de ramas participantes

    @ManyToOne
    @JoinColumn(name = "ubicacion_evento_id")
    private UbicacionEvento ubicacion;

    @Column(length = 1000)
    private String descripcion;
    
    private Integer costo;
}