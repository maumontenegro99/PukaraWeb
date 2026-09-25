package com.pukaraweb.PukaraWeb.pagos;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pukaraweb.PukaraWeb.comun.AlmacenArchivos;
import com.pukaraweb.PukaraWeb.comun.ArchivoGuardado;
import com.pukaraweb.PukaraWeb.comun.Descargas;
import com.pukaraweb.PukaraWeb.model.Usuario;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.CobroDetalleDto;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.CobroDto;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.CobroRequest;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.ConfiguracionDto;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.PagoDto;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.RechazoRequest;

// Pagos en el panel. Solo administración (rol ADMIN, ver SecurityConfig).
@RestController
@RequestMapping("/api/pagos")
public class PagosController {

    private final PagosService pagosService;
    private final AlmacenArchivos almacen;

    public PagosController(PagosService pagosService, AlmacenArchivos almacen) {
        this.pagosService = pagosService;
        this.almacen = almacen;
    }

    @GetMapping("/cobros")
    public List<CobroDto> cobros() {
        return pagosService.listarCobros();
    }

    @GetMapping("/cobros/{id}")
    public CobroDetalleDto cobro(@PathVariable Long id) {
        return pagosService.detalle(id);
    }

    @PostMapping("/cobros")
    @ResponseStatus(HttpStatus.CREATED)
    public CobroDto crear(@RequestBody CobroRequest request) {
        return pagosService.crearCobro(request);
    }

    @PutMapping("/cobros/{id}")
    public CobroDto actualizar(@PathVariable Long id, @RequestBody CobroRequest request) {
        return pagosService.actualizarCobro(id, request);
    }

    @DeleteMapping("/cobros/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        pagosService.eliminarCobro(id);
    }

    @GetMapping("/revision")
    public List<PagoDto> porRevisar() {
        return pagosService.porRevisar();
    }

    @GetMapping
    public List<PagoDto> historial() {
        return pagosService.historial();
    }

    @GetMapping("/{id}/comprobante")
    public ResponseEntity<Resource> comprobante(@PathVariable Long id) {
        ArchivoGuardado archivo = pagosService.comprobante(id);
        return Descargas.responder(archivo, almacen.cargar(archivo), true);
    }

    @PostMapping("/{id}/confirmar")
    public PagoDto confirmar(@PathVariable Long id, @AuthenticationPrincipal UserDetails usuario) {
        return pagosService.confirmar(id, nombre(usuario));
    }

    @PostMapping("/{id}/rechazar")
    public PagoDto rechazar(@PathVariable Long id, @RequestBody RechazoRequest request,
            @AuthenticationPrincipal UserDetails usuario) {
        return pagosService.rechazar(id, request.motivo(), nombre(usuario));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public PagoDto registrar(@RequestParam Long cobroId, @RequestParam Long miembroId, @RequestParam Integer monto,
            @RequestParam(required = false) String nombreRemitente,
            @RequestParam(defaultValue = "TRANSFERENCIA") MedioPago medio,
            @RequestParam(required = false) MultipartFile comprobante, @AuthenticationPrincipal UserDetails usuario) {
        return pagosService.registrarEnPanel(cobroId, miembroId, monto, nombreRemitente, medio, comprobante, nombre(usuario));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void anular(@PathVariable Long id) {
        pagosService.anular(id);
    }

    @GetMapping("/configuracion")
    public ConfiguracionDto configuracion() {
        return pagosService.configuracion();
    }

    @PutMapping("/configuracion")
    public ConfiguracionDto guardarConfiguracion(@RequestBody ConfiguracionDto datos) {
        return pagosService.guardarConfiguracion(datos);
    }

    private static String nombre(UserDetails usuario) {
        if (usuario instanceof Usuario u && u.getNombreCompleto() != null && !u.getNombreCompleto().isBlank()) {
            return u.getNombreCompleto();
        }
        return usuario == null ? null : usuario.getUsername();
    }
}
