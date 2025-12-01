package com.pukaraweb.PukaraWeb.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
@Table(name = "apoderados")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Apoderado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombres;
    private String apellidos;
    private String telefono;
    private String email;
    private String direccion;

    // Un apoderado puede tener varios hijos scouts
    @OneToMany(mappedBy = "apoderado")
    @JsonIgnore
    private List<Miembro> hijos;
}