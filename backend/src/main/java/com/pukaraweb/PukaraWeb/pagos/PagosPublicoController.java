package com.pukaraweb.PukaraWeb.pagos;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pukaraweb.PukaraWeb.pagos.PagosDtos.CobroPublicoDto;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.ConfiguracionDto;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.ConsultaRequest;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.EstadoPublicoDto;
import com.pukaraweb.PukaraWeb.pagos.PagosDtos.PagoRecibidoDto;

// Pagos desde la biblioteca (público, ver SecurityConfig): cobros abiertos, datos de transferencia y envío de comprobantes.
@RestController
@RequestMapping("/api/biblioteca/pagos")
public class PagosPublicoController {

    private final PagosService pagosService;

    public PagosPublicoController(PagosService pagosService) {
        this.pagosService = pagosService;
    }

    @GetMapping("/cobros")
    public List<CobroPublicoDto> cobros() {
        return pagosService.cobrosAbiertos();
    }

    @GetMapping("/datos")
    public ConfiguracionDto datos() {
        return pagosService.configuracion();
    }

    // POST y no GET: así el RUT no queda en la URL ni en los registros del servidor.
    @PostMapping("/consulta")
    public List<EstadoPublicoDto> consultar(@RequestBody ConsultaRequest request) {
        return pagosService.consultar(request.rut());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public PagoRecibidoDto enviar(@RequestParam Long cobroId, @RequestParam String rutMiembro,
            @RequestParam String nombreRemitente, @RequestParam Integer monto, @RequestParam MultipartFile comprobante) {
        return pagosService.recibirComprobante(cobroId, rutMiembro, nombreRemitente, monto, comprobante);
    }
}
