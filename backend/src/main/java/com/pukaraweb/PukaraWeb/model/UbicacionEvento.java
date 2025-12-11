package com.pukaraweb.PukaraWeb.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ubicaciones_eventos") // Tabla separada
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UbicacionEvento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre; // Ej: "Campo Escuela Callejones", "Parque O'Higgins"

    private String direccion; // Ej: "Graneros, Región de O'Higgins"

}