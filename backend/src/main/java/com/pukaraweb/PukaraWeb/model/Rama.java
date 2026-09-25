package com.pukaraweb.PukaraWeb.model; // <--- Fíjate que ahora apunta a tu carpeta model

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ramas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rama {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre; 

    @Column(nullable = false)
    private String tipo; 

    private Integer edadMinima;
    private Integer edadMaxima;

    private String descripcion;

    @OneToMany(mappedBy = "rama") // Sin cascada: borrar una rama no debe borrar a sus miembros
    @JsonIgnore 
    private List<Miembro> miembros;

    @OneToMany(mappedBy = "rama")
    @JsonIgnoreProperties("rama") // Evita bucle infinito
    private java.util.List<Dirigente> equipo;
}