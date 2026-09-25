package com.pukaraweb.PukaraWeb.pagos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CobroRepository extends JpaRepository<Cobro, Long> {

    List<Cobro> findAllByOrderByFechaCreacionDesc();
}
