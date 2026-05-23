package com.pukaraweb.PukaraWeb.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "noticias")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Noticia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, length = 500)
    private String bajada; // Un resumen corto para la tarjeta (antes de entrar a leer)

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido; // El cuerpo completo de la noticia (acepta HTML o texto largo)

    @Column(columnDefinition = "LONGTEXT") // ¡Esto permite guardar fotos convertidas a texto!
    private String imagenUrl;

    private String enlaceSocial;

    private LocalDateTime fechaPublicacion;

    private String autor; // Nombre del dirigente que escribe (ej: "Akela")

    @Enumerated(EnumType.STRING)
    private TipoNoticia tipo;

    // Se ejecuta automáticamente antes de guardar si no viene fecha
    @PrePersist
    public void prePersist() {
        if (this.fechaPublicacion == null) {
            this.fechaPublicacion = LocalDateTime.now();
        }
    }
}