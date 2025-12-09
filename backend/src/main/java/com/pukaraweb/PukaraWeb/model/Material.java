package com.pukaraweb.PukaraWeb.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "materiales")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre; 

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria; 

    private Integer cantidad; 

    @Enumerated(EnumType.STRING)
    private EstadoMaterial estado; 

    // CAMBIO AQUÍ: Ahora es una relación con Ubicacion
    @ManyToOne
    @JoinColumn(name = "ubicacion_id")
    private Ubicacion ubicacion; 

    private LocalDate fechaAdquisicion;
    
    private String descripcion; 
}