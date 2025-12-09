package com.pukaraweb.PukaraWeb.dto;

public class AuthResponse {
    private String token;

    // Constructor vacío
    public AuthResponse() {}

    // --- CONSTRUCTOR QUE FALTABA (El que recibe el token) ---
    public AuthResponse(String token) {
        this.token = token;
    }

    // Getters y Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}