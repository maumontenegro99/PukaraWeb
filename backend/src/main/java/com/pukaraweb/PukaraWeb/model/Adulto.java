package com.pukaraweb.PukaraWeb.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue; // Importante para las fechas
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "adultos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Adulto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    private String rut;
    private String email;
    private String telefono;
    
    // Nuevos campos solicitados
    private String cargo; // Ej: Responsable, Asistente
    private String nivelFormacion; // Ej: Inicial, Medio, Avanzado, Insignia de Madera
    private LocalDate fechaNacimiento;

    // Relación con Rama (Un adulto pertenece a una Rama)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rama_id")
    @JsonIgnoreProperties("miembros") 
    private Rama rama;
}