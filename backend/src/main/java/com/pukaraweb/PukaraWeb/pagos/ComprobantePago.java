package com.pukaraweb.PukaraWeb.pagos;

import com.pukaraweb.PukaraWeb.comun.ArchivoGuardado;

import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

// Imagen o PDF de la transferencia. Existe solo mientras el pago está en revisión:
// al confirmarlo o rechazarlo se borran este registro y el archivo.
@Entity
@Table(name = "comprobantes_pago")
@Getter
@NoArgsConstructor
public class ComprobantePago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Embedded
    private ArchivoGuardado archivo;

    public ComprobantePago(ArchivoGuardado archivo) {
        this.archivo = archivo;
    }
}
