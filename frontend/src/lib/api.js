// URL base del backend. En producción se define VITE_API_URL en el .env del frontend.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export const apiUrl = (path) => `${API_URL}${path}`;
