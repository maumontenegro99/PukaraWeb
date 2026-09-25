package com.pukaraweb.PukaraWeb.comun;

public final class Rut {

    private Rut() {
    }

    // "12.345.678-k" y "12345678K" son el mismo RUT.
    public static String normalizar(String rut) {
        return rut == null ? "" : rut.replaceAll("[^0-9kK]", "").toUpperCase();
    }

    // Compara dos RUT ignorando puntos, guion y mayúsculas. Un RUT vacío nunca coincide.
    public static boolean iguales(String a, String b) {
        String x = normalizar(a);
        return x.length() > 1 && x.equals(normalizar(b));
    }
}
