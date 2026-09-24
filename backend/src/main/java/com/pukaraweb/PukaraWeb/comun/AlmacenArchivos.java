package com.pukaraweb.PukaraWeb.comun;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

// Guarda archivos en disco (pukara.archivos.dir). El tipo se decide por los primeros bytes del archivo,
// no por la extensión ni por el Content-Type que envía el navegador, y el nombre en disco es un UUID.
@Service
public class AlmacenArchivos {

    public enum Tipo {
        PDF("pdf", "application/pdf"),
        PNG("png", "image/png"),
        JPG("jpg", "image/jpeg"),
        DOCX("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
        XLSX("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
        PPTX("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation");

        final String extension;
        final String contentType;

        Tipo(String extension, String contentType) {
            this.extension = extension;
            this.contentType = contentType;
        }
    }

    public static final Set<Tipo> TIPOS_AUTORIZACION = Set.of(Tipo.PDF, Tipo.PNG, Tipo.JPG);
    public static final Set<Tipo> TIPOS_DOCUMENTO = Set.of(Tipo.values());

    private final Path directorio;

    public AlmacenArchivos(@Value("${pukara.archivos.dir}") String directorio) throws IOException {
        this.directorio = Path.of(directorio).toAbsolutePath().normalize();
        Files.createDirectories(this.directorio);
    }

    public ArchivoGuardado guardar(MultipartFile archivo, Set<Tipo> permitidos) {
        if (archivo == null || archivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Adjunta un archivo.");
        }
        Tipo tipo = detectarTipo(archivo);
        if (tipo == null || !permitidos.contains(tipo)) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "El archivo debe ser " + describir(permitidos) + ".");
        }

        String nombreInterno = UUID.randomUUID() + "." + tipo.extension;
        try (InputStream entrada = archivo.getInputStream()) {
            Files.copy(entrada, directorio.resolve(nombreInterno), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar el archivo.", e);
        }
        return new ArchivoGuardado(nombreInterno, limpiarNombre(archivo.getOriginalFilename(), tipo), tipo.contentType,
                archivo.getSize());
    }

    public Resource cargar(ArchivoGuardado archivo) {
        Path ruta = directorio.resolve(archivo.getNombreInterno()).normalize();
        if (!ruta.startsWith(directorio) || !Files.exists(ruta)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El archivo ya no está disponible.");
        }
        return new PathResource(ruta);
    }

    public void eliminar(ArchivoGuardado archivo) {
        try {
            Files.deleteIfExists(directorio.resolve(archivo.getNombreInterno()).normalize());
        } catch (IOException ignored) {
            // Si el archivo no se puede borrar, queda huérfano en disco pero el registro sí se elimina.
        }
    }

    // Uso interno (datos de prueba): guarda bytes ya generados.
    public ArchivoGuardado guardarBytes(byte[] contenido, String nombreOriginal, Tipo tipo) {
        String nombreInterno = UUID.randomUUID() + "." + tipo.extension;
        try {
            Files.write(directorio.resolve(nombreInterno), contenido);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo guardar " + nombreOriginal, e);
        }
        return new ArchivoGuardado(nombreInterno, nombreOriginal, tipo.contentType, contenido.length);
    }

    private Tipo detectarTipo(MultipartFile archivo) {
        byte[] cabecera = new byte[8];
        int leidos;
        try (InputStream entrada = archivo.getInputStream()) {
            leidos = entrada.readNBytes(cabecera, 0, cabecera.length);
        } catch (IOException e) {
            return null;
        }
        if (leidos >= 4 && cabecera[0] == '%' && cabecera[1] == 'P' && cabecera[2] == 'D' && cabecera[3] == 'F') {
            return Tipo.PDF;
        }
        if (leidos >= 8 && (cabecera[0] & 0xFF) == 0x89 && cabecera[1] == 'P' && cabecera[2] == 'N' && cabecera[3] == 'G') {
            return Tipo.PNG;
        }
        if (leidos >= 3 && (cabecera[0] & 0xFF) == 0xFF && (cabecera[1] & 0xFF) == 0xD8 && (cabecera[2] & 0xFF) == 0xFF) {
            return Tipo.JPG;
        }
        if (leidos >= 4 && cabecera[0] == 'P' && cabecera[1] == 'K' && cabecera[2] == 3 && cabecera[3] == 4) {
            // Los formatos de Office son ZIP: se distingue por la extensión declarada.
            String nombre = String.valueOf(archivo.getOriginalFilename()).toLowerCase();
            if (nombre.endsWith(".docx")) return Tipo.DOCX;
            if (nombre.endsWith(".xlsx")) return Tipo.XLSX;
            if (nombre.endsWith(".pptx")) return Tipo.PPTX;
        }
        return null;
    }

    private static String limpiarNombre(String original, Tipo tipo) {
        String nombre = original == null ? "" : Path.of(original.replace('\\', '/')).getFileName().toString();
        nombre = nombre.replaceAll("[^\\p{L}\\p{N} ._()-]", "").trim();
        if (nombre.isBlank()) {
            nombre = "archivo." + tipo.extension;
        }
        return nombre.length() > 120 ? nombre.substring(nombre.length() - 120) : nombre;
    }

    private static String describir(Set<Tipo> tipos) {
        return String.join(", ", Arrays.stream(Tipo.values())
                .filter(tipos::contains)
                .map(t -> t.extension.toUpperCase())
                .toList());
    }
}
