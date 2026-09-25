package com.pukaraweb.PukaraWeb.pagos;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// Datos de la cuenta del grupo para transferir. Hay una sola fila (id = 1).
@Entity
@Table(name = "configuracion_pagos")
@Getter
@Setter
public class ConfiguracionPagos {

    public static final long ID = 1L;

    @Id
    private Long id = ID;

    private String titular;
    private String rut;
    private String banco;
    private String tipoCuenta;
    private String numeroCuenta;
    private String correo;

    @Column(length = 1000)
    private String instrucciones;
}
