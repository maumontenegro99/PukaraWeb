package com.pukaraweb.PukaraWeb.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inventario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre; // Ej: "Hacha de mano", "Olla común"

    private String descripcion; // Ej: "Mango rojo, marca Stanley"

    @Column(nullable = false)
    private Integer cantidad;

    private String estado; // Ej: "BUENO", "MALO", "EN_REPARACION"

    private String ubicacion; // Ej: "Bodega 1", "Cajón Tropa"

    // RELACIÓN: ¿De quién es este equipo? (Opcional)
    @ManyToOne
    @JoinColumn(name = "rama_id")
    private Rama rama; 
}