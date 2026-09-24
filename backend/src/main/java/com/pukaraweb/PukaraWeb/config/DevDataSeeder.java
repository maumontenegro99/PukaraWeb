package com.pukaraweb.PukaraWeb.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.pukaraweb.PukaraWeb.model.Apoderado;
import com.pukaraweb.PukaraWeb.model.Categoria;
import com.pukaraweb.PukaraWeb.model.Dirigente;
import com.pukaraweb.PukaraWeb.model.EstadoMaterial;
import com.pukaraweb.PukaraWeb.model.Evento;
import com.pukaraweb.PukaraWeb.model.Material;
import com.pukaraweb.PukaraWeb.model.Miembro;
import com.pukaraweb.PukaraWeb.model.Noticia;
import com.pukaraweb.PukaraWeb.model.Rama;
import com.pukaraweb.PukaraWeb.model.TipoEvento;
import com.pukaraweb.PukaraWeb.model.TipoNoticia;
import com.pukaraweb.PukaraWeb.model.Ubicacion;
import com.pukaraweb.PukaraWeb.model.UbicacionEvento;
import com.pukaraweb.PukaraWeb.repository.ApoderadoRepository;
import com.pukaraweb.PukaraWeb.repository.CategoriaRepository;
import com.pukaraweb.PukaraWeb.repository.DirigenteRepository;
import com.pukaraweb.PukaraWeb.repository.EventoRepository;
import com.pukaraweb.PukaraWeb.repository.MaterialRepository;
import com.pukaraweb.PukaraWeb.repository.MiembroRepository;
import com.pukaraweb.PukaraWeb.repository.NoticiaRepository;
import com.pukaraweb.PukaraWeb.repository.RamaRepository;
import com.pukaraweb.PukaraWeb.repository.UbicacionEventoRepository;
import com.pukaraweb.PukaraWeb.repository.UbicacionRepository;

// Datos de prueba para el perfil dev. Solo se cargan si la base está vacía (sin ramas),
// así que lo que agregues después desde la app o la consola H2 se conserva entre reinicios.
@Component
@Profile("dev")
@Order(1)
public class DevDataSeeder implements CommandLineRunner {

    private final RamaRepository ramaRepository;
    private final ApoderadoRepository apoderadoRepository;
    private final MiembroRepository miembroRepository;
    private final DirigenteRepository dirigenteRepository;
    private final NoticiaRepository noticiaRepository;
    private final CategoriaRepository categoriaRepository;
    private final UbicacionRepository ubicacionRepository;
    private final MaterialRepository materialRepository;
    private final UbicacionEventoRepository ubicacionEventoRepository;
    private final EventoRepository eventoRepository;

    public DevDataSeeder(RamaRepository ramaRepository, ApoderadoRepository apoderadoRepository,
            MiembroRepository miembroRepository, DirigenteRepository dirigenteRepository,
            NoticiaRepository noticiaRepository, CategoriaRepository categoriaRepository,
            UbicacionRepository ubicacionRepository, MaterialRepository materialRepository,
            UbicacionEventoRepository ubicacionEventoRepository, EventoRepository eventoRepository) {
        this.ramaRepository = ramaRepository;
        this.apoderadoRepository = apoderadoRepository;
        this.miembroRepository = miembroRepository;
        this.dirigenteRepository = dirigenteRepository;
        this.noticiaRepository = noticiaRepository;
        this.categoriaRepository = categoriaRepository;
        this.ubicacionRepository = ubicacionRepository;
        this.materialRepository = materialRepository;
        this.ubicacionEventoRepository = ubicacionEventoRepository;
        this.eventoRepository = eventoRepository;
    }

    @Override
    public void run(String... args) {
        if (ramaRepository.count() > 0) {
            return;
        }

        Rama manada = rama("Manada", "MANADA", 7, 11, "Lobatos del grupo.");
        Rama bandada = rama("Bandada", "BANDADA", 7, 11, "Golondrinas del grupo.");
        Rama tropa = rama("Tropa", "TROPA", 11, 15, "Scouts organizados en patrullas.");
        Rama compania = rama("Compañía", "COMPANIA", 11, 15, "Guías organizadas en patrullas.");
        Rama avanzada = rama("Avanzada", "AVANZADA", 15, 17, "Pioneros y pioneras.");
        Rama clan = rama("Clan", "CLAN", 17, 21, "Caminantes del grupo.");

        Apoderado apoderado1 = apoderado("Carolina", "Muñoz Reyes", "+56 9 8123 4567", "carolina.munoz@example.com");
        Apoderado apoderado2 = apoderado("Jorge", "Pérez Soto", "+56 9 7234 5678", "jorge.perez@example.com");

        miembro("Tomás", "Pérez Muñoz", "25.123.456-7", LocalDate.of(2016, 3, 14), manada, apoderado1);
        miembro("Isidora", "Pérez Muñoz", "24.987.654-3", LocalDate.of(2013, 8, 2), compania, apoderado1);
        miembro("Benjamín", "Pérez Díaz", "24.555.111-2", LocalDate.of(2012, 11, 20), tropa, apoderado2);
        miembro("Antonia", "Rojas Vidal", "23.444.222-1", LocalDate.of(2009, 5, 9), avanzada, apoderado2);

        dirigente("Camila", "Fuentes Lagos", "Responsable de unidad", manada);
        dirigente("Diego", "Araya Contreras", "Asistente", tropa);
        dirigente("Valentina", "Sepúlveda Mora", "Responsable de unidad", compania);

        Categoria campismo = categoria("Campismo", "Carpas, toldos y estacas");
        Categoria cocina = categoria("Cocina", "Ollas, anafes y utensilios");
        Ubicacion bodega = ubicacion("Bodega de la sede", "Sede del grupo");
        material("Carpa iglú 6 personas", campismo, 4, EstadoMaterial.BUENO, bodega);
        material("Olla de aluminio 20 L", cocina, 3, EstadoMaterial.REGULAR, bodega);
        material("Toldo 4x4 m", campismo, 1, EstadoMaterial.EN_REPARACION, bodega);

        UbicacionEvento sede = ubicacionEvento("Sede del grupo", "Punto de encuentro habitual");
        UbicacionEvento campoEscuela = ubicacionEvento("Campo Escuela", "Campamentos de grupo");
        evento("Reunión de sábado", TipoEvento.REUNION, LocalDateTime.now().plusDays(3).withHour(15).withMinute(0),
                LocalDateTime.now().plusDays(3).withHour(18).withMinute(0), List.of(), sede, 0);
        evento("Campamento de invierno", TipoEvento.CAMPAMENTO, LocalDateTime.now().plusDays(30).withHour(9).withMinute(0),
                LocalDateTime.now().plusDays(33).withHour(17).withMinute(0), List.of(tropa, compania), campoEscuela, 25000);

        noticia("Abrimos inscripciones para el nuevo año scout",
                "Recibimos a nuevas familias en todas las ramas. Te contamos cómo sumarte.",
                "<p>Este año queremos recibir a más niñas, niños y jóvenes. Si tu hija o hijo tiene entre 7 y 21 años, puede venir a conocer su rama un sábado cualquiera.</p><p>Escríbenos a <a href=\"mailto:pukaraweche@gmail.com\">pukaraweche@gmail.com</a> con su edad y te contamos los detalles.</p>",
                TipoNoticia.INSTITUCIONAL, "Jefatura de grupo", 1);
        noticia("Campamento de invierno: lista de equipo",
                "Tropa y Compañía salen al Campo Escuela. Revisa qué debe llevar cada scout.",
                "<p>La salida es el viernes a las 9:00 desde la sede.</p><ul><li>Saco de dormir</li><li>Ropa de abrigo y de recambio</li><li>Cantimplora y plato, taza y cubiertos</li></ul>",
                TipoNoticia.EVENTO, "Diego Araya", 3);
        noticia("Suspendemos la reunión por alerta meteorológica",
                "Por el sistema frontal, este sábado no habrá actividades en la sede.",
                "<p>Retomamos las actividades el sábado siguiente en el horario habitual.</p>",
                TipoNoticia.AVISO, "Jefatura de grupo", 6);
    }

    private Rama rama(String nombre, String tipo, int edadMinima, int edadMaxima, String descripcion) {
        Rama rama = new Rama();
        rama.setNombre(nombre);
        rama.setTipo(tipo);
        rama.setEdadMinima(edadMinima);
        rama.setEdadMaxima(edadMaxima);
        rama.setDescripcion(descripcion);
        return ramaRepository.save(rama);
    }

    private Apoderado apoderado(String nombres, String apellidos, String telefono, String email) {
        Apoderado apoderado = new Apoderado();
        apoderado.setNombres(nombres);
        apoderado.setApellidos(apellidos);
        apoderado.setTelefono(telefono);
        apoderado.setEmail(email);
        return apoderadoRepository.save(apoderado);
    }

    private void miembro(String nombres, String apellidos, String documento, LocalDate nacimiento, Rama rama, Apoderado apoderado) {
        Miembro miembro = new Miembro();
        miembro.setNombres(nombres);
        miembro.setApellidos(apellidos);
        miembro.setDocumentoIdentidad(documento);
        miembro.setFechaNacimiento(nacimiento);
        miembro.setTelefonoApoderado(apoderado.getTelefono());
        miembro.setRama(rama);
        miembro.setApoderado(apoderado);
        miembroRepository.save(miembro);
    }

    private void dirigente(String nombres, String apellidos, String cargo, Rama rama) {
        Dirigente dirigente = new Dirigente();
        dirigente.setNombres(nombres);
        dirigente.setApellidos(apellidos);
        dirigente.setCargo(cargo);
        dirigente.setRama(rama);
        dirigente.setDocAntecedentes(true);
        dirigente.setDocInhabilidad(true);
        dirigenteRepository.save(dirigente);
    }

    private Categoria categoria(String nombre, String descripcion) {
        Categoria categoria = new Categoria();
        categoria.setNombre(nombre);
        categoria.setDescripcion(descripcion);
        return categoriaRepository.save(categoria);
    }

    private Ubicacion ubicacion(String nombre, String direccion) {
        Ubicacion ubicacion = new Ubicacion();
        ubicacion.setNombre(nombre);
        ubicacion.setDireccion(direccion);
        return ubicacionRepository.save(ubicacion);
    }

    private void material(String nombre, Categoria categoria, int cantidad, EstadoMaterial estado, Ubicacion ubicacion) {
        Material material = new Material();
        material.setNombre(nombre);
        material.setCategoria(categoria);
        material.setCantidad(cantidad);
        material.setEstado(estado);
        material.setUbicacion(ubicacion);
        materialRepository.save(material);
    }

    private UbicacionEvento ubicacionEvento(String nombre, String direccion) {
        UbicacionEvento ubicacion = new UbicacionEvento();
        ubicacion.setNombre(nombre);
        ubicacion.setDireccion(direccion);
        return ubicacionEventoRepository.save(ubicacion);
    }

    private void evento(String titulo, TipoEvento tipo, LocalDateTime inicio, LocalDateTime fin, List<Rama> ramas,
            UbicacionEvento ubicacion, int costo) {
        Evento evento = new Evento();
        evento.setTitulo(titulo);
        evento.setTipo(tipo);
        evento.setFechaInicio(inicio);
        evento.setFechaFin(fin);
        evento.setRamas(ramas);
        evento.setUbicacion(ubicacion);
        evento.setCosto(costo);
        eventoRepository.save(evento);
    }

    private void noticia(String titulo, String bajada, String contenido, TipoNoticia tipo, String autor, int diasAtras) {
        Noticia noticia = new Noticia();
        noticia.setTitulo(titulo);
        noticia.setBajada(bajada);
        noticia.setContenido(contenido);
        noticia.setTipo(tipo);
        noticia.setAutor(autor);
        noticia.setFechaPublicacion(LocalDateTime.now().minusDays(diasAtras));
        noticiaRepository.save(noticia);
    }
}
