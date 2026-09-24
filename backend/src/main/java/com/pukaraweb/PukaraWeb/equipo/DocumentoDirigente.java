package com.pukaraweb.PukaraWeb.equipo;

import java.time.LocalDateTime;

import com.pukaraweb.PukaraWeb.comun.ArchivoGuardado;
import com.pukaraweb.PukaraWeb.model.Dirigente;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

// Archivo de un documento de un dirigente (certificado de antecedentes, CV, etc.). Hay a lo más uno por tipo:
// subir otro reemplaza al anterior. Son datos sensibles: solo se consultan desde el panel.
@Entity
@Table(name = "documentos_dirigentes", uniqueConstraints = @UniqueConstraint(columnNames = { "dirigente_id", "tipo" }))
@Getter
@Setter
public class DocumentoDirigente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "dirigente_id")
    private Dirigente dirigente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoDocumentoDirigente tipo;

    @Embedded
    private ArchivoGuardado archivo;

    private LocalDateTime fechaSubida;
}
