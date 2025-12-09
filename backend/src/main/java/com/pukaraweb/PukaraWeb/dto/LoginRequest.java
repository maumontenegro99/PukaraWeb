package com.pukaraweb.PukaraWeb.dto;

public class LoginRequest {
    private String username;
    private String password;

    // Constructor vacío
    public LoginRequest() {}

    // Constructor con datos
    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // --- GETTERS Y SETTERS MANUALES (Para que no falle nunca) ---
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}