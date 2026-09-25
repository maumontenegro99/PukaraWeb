package com.pukaraweb.PukaraWeb.pagos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByCobroIdOrderByFechaEnvioDesc(Long cobroId);

    List<Pago> findAllByOrderByFechaEnvioDesc();

    List<Pago> findByMiembroIdOrderByFechaEnvioDesc(Long miembroId);

    List<Pago> findByEstadoOrderByFechaEnvioAsc(EstadoPago estado);

    boolean existsByCobroId(Long cobroId);
}
