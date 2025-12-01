package com.pukaraweb.PukaraWeb.model;

import java.time.LocalDateTime;

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
@Table(name = "eventos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo; // Ej: "Campamento de Invierno", "Reunión Sábado"

    @Column(nullable = false)
    private LocalDateTime fechaInicio; // Usa LocalDateTime para tener Hora también

    @Column(nullable = false)
    private LocalDateTime fechaFin;

    private String lugar; // Ej: "Parque Mahuida", "Sede Local"

    private Double costo; // Ej: 15000.0 (Si es gratis, va 0)

    private String tipo; // Ej: "CAMPAMENTO", "REUNION", "SALIDA"

    // RELACIÓN: ¿Quién organiza?
    @ManyToOne
    @JoinColumn(name = "rama_id")
    private Rama rama;
}