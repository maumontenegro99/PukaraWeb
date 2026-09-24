package com.pukaraweb.PukaraWeb.biblioteca;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AutorizacionFirmadaRepository extends JpaRepository<AutorizacionFirmada, Long> {

    List<AutorizacionFirmada> findByEventoIdOrderByFechaEnvioDesc(Long eventoId);
}
