// Este "fetch mejorado" revisa si tienes token y lo pega en la petición
export const authFetch = async (url, options = {}) => {
    // 1. Recuperamos el token del bolsillo
    const token = localStorage.getItem('token');
    
    // 2. Preparamos las cabeceras (headers)
    const headers = options.headers || {};
    
    if (token) {
        // Aquí es donde mostramos la credencial al Guardia del Backend
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Si no se especificó tipo de contenido, asumimos JSON (útil para POST/PUT)
    if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    // 3. Ejecutamos la petición original pero con las cabeceras nuevas
    const response = await fetch(url, { ...options, headers });

    // 4. Medida de seguridad: Si el token venció (401 o 403), nos expulsa
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login'; // Nos manda al login a la fuerza
        return Promise.reject("Sesión expirada");
    }

    return response;
};