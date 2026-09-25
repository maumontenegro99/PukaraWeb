package com.pukaraweb.PukaraWeb.biblioteca;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.pukaraweb.PukaraWeb.comun.AlmacenArchivos;
import com.pukaraweb.PukaraWeb.model.Evento;
import com.pukaraweb.PukaraWeb.model.Rama;
import com.pukaraweb.PukaraWeb.repository.EventoRepository;
import com.pukaraweb.PukaraWeb.repository.RamaRepository;

// Documentos de prueba para el perfil dev. Corre después de DevDataSeeder (necesita ramas y eventos)
// y solo si la biblioteca está vacía.
@Component
@Profile("dev")
@Order(2)
public class BibliotecaDevSeeder implements CommandLineRunner {

    private final DocumentoRepository documentoRepository;
    private final RamaRepository ramaRepository;
    private final EventoRepository eventoRepository;
    private final AlmacenArchivos almacen;

    public BibliotecaDevSeeder(DocumentoRepository documentoRepository, RamaRepository ramaRepository,
            EventoRepository eventoRepository, AlmacenArchivos almacen) {
        this.documentoRepository = documentoRepository;
        this.ramaRepository = ramaRepository;
        this.eventoRepository = eventoRepository;
        this.almacen = almacen;
    }

    @Override
    public void run(String... args) {
        if (documentoRepository.count() > 0) {
            return;
        }
        Rama tropa = rama("TROPA");
        Rama manada = rama("MANADA");
        Evento campamento = eventoRepository.findAll().stream()
                .filter(e -> "Campamento de invierno".equals(e.getTitulo()))
                .findFirst().orElse(null);

        documento("Manual de la Tropa", "Organización en patrullas, progresión y especialidades.",
                CategoriaDocumento.MANUAL, tropa, null, "manual-tropa.pdf",
                "Manual de la Tropa", "Documento de prueba generado para el entorno de desarrollo.");
        documento("Manual de la Manada", "Ceremonias, ley de la manada y juegos para lobatos.",
                CategoriaDocumento.MANUAL, manada, null, "manual-manada.pdf",
                "Manual de la Manada", "Documento de prueba generado para el entorno de desarrollo.");
        documento("Ficha médica", "Complétala una vez al año y entrégala a la dirigencia de la rama.",
                CategoriaDocumento.FORMULARIO, null, null, "ficha-medica.pdf",
                "Ficha medica", "Nombre:", "RUT:", "Alergias:", "Medicamentos:", "Contacto de emergencia:");

        if (campamento != null) {
            campamento.setRequiereAutorizacion(true);
            eventoRepository.save(campamento);
            documento("Autorización: Campamento de invierno",
                    "Imprímela, fírmala y súbela escaneada o fotografiada desde la sección Autorizaciones.",
                    CategoriaDocumento.AUTORIZACION, null, campamento, "autorizacion-campamento-invierno.pdf",
                    "Autorizacion - Campamento de invierno",
                    "Yo, ______________________, RUT ____________,",
                    "autorizo a ______________________, RUT ____________,",
                    "a participar en el Campamento de invierno del Grupo Scout Pukara Weche.",
                    "", "Firma: ______________________     Fecha: ____________");
        }
    }

    private Rama rama(String tipo) {
        return ramaRepository.findAll().stream().filter(r -> tipo.equals(r.getTipo())).findFirst().orElse(null);
    }

    private void documento(String titulo, String descripcion, CategoriaDocumento categoria, Rama rama, Evento evento,
            String nombreArchivo, String... lineasPdf) {
        Documento documento = new Documento();
        documento.setTitulo(titulo);
        documento.setDescripcion(descripcion);
        documento.setCategoria(categoria);
        documento.setRama(rama);
        documento.setEvento(evento);
        documento.setArchivo(almacen.guardarBytes(pdfSimple(lineasPdf), nombreArchivo, AlmacenArchivos.Tipo.PDF));
        documentoRepository.save(documento);
    }

    // PDF mínimo de una página con líneas de texto (Helvetica). Solo para datos de prueba.
    public static byte[] pdfSimple(String... lineas) {
        StringBuilder texto = new StringBuilder("BT /F1 13 Tf 72 760 Td 18 TL\n");
        for (String linea : lineas) {
            texto.append('(').append(linea.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")).append(") Tj T*\n");
        }
        texto.append("ET");
        byte[] contenido = texto.toString().getBytes(StandardCharsets.ISO_8859_1);

        List<String> objetos = List.of(
                "<< /Type /Catalog /Pages 2 0 R >>",
                "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
                "<< /Length " + contenido.length + " >>\nstream\n" + new String(contenido, StandardCharsets.ISO_8859_1) + "\nendstream",
                "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");

        ByteArrayOutputStream salida = new ByteArrayOutputStream();
        List<Integer> posiciones = new ArrayList<>();
        escribir(salida, "%PDF-1.4\n");
        for (int i = 0; i < objetos.size(); i++) {
            posiciones.add(salida.size());
            escribir(salida, (i + 1) + " 0 obj\n" + objetos.get(i) + "\nendobj\n");
        }
        int xref = salida.size();
        StringBuilder tabla = new StringBuilder("xref\n0 " + (objetos.size() + 1) + "\n0000000000 65535 f \n");
        posiciones.forEach(p -> tabla.append(String.format("%010d 00000 n \n", p)));
        tabla.append("trailer\n<< /Size ").append(objetos.size() + 1).append(" /Root 1 0 R >>\nstartxref\n").append(xref).append("\n%%EOF\n");
        escribir(salida, tabla.toString());
        return salida.toByteArray();
    }

    private static void escribir(ByteArrayOutputStream salida, String texto) {
        salida.writeBytes(texto.getBytes(StandardCharsets.ISO_8859_1));
    }
}
