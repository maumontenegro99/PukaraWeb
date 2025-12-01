package com.pukaraweb.PukaraWeb.model; // <--- Aquí también ajustado a model

import java.time.LocalDate;

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
@Table(name = "miembros")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Miembro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombres;

    @Column(nullable = false)
    private String apellidos;

    @Column(unique = true)
    private String documentoIdentidad;

    private LocalDate fechaNacimiento;

    private String telefonoApoderado;
    
    private String direccion;

    @ManyToOne
    @JoinColumn(name = "rama_id")
    private Rama rama;

    @ManyToOne
    @JoinColumn(name = "apoderado_id")
    private Apoderado apoderado;
    
}