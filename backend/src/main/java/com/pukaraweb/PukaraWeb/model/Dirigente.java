package com.pukaraweb.PukaraWeb.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
@Table(name = "dirigentes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dirigente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombres;
    
    @Column(nullable = false)
    private String apellidos;

    private String email;
    private String telefono;
    
    private String cargo; // Ej: Responsable, Asistente, Colaborador

    private LocalDate fechaNacimiento;

    // --- DOCUMENTACIÓN (Checklist) ---
    private boolean docAntecedentes; // Cert. Antecedentes
    private boolean docInhabilidad;  // Cert. Inhabilidad (Registro Civil)
    private boolean docCurriculum;   // CV Personal
    private boolean docCurriculumScout; // CV Scout
    private boolean docNacimiento;   // Cert. Nacimiento

    // --- RELACIÓN CON RAMA ---
    @ManyToOne
    @JoinColumn(name = "rama_id")
    @JsonIgnoreProperties("equipo") // Evita bucle infinito al pedir datos
    private Rama rama;
}