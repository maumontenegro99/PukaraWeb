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

    // Si no se especificó tipo de contenido, asumimos JSON (útil para POST/PUT).
    // Con FormData (subida de archivos) el navegador pone el Content-Type con su boundary.
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // 3. Ejecutamos la petición original pero con las cabeceras nuevas
    const response = await fetch(url, { ...options, headers });

    // 4. 401 = no hay sesión válida (token vencido o inválido): se cierra la sesión y se vuelve al login.
    //    Un 403 (sesión válida sin permiso para esa acción) no expulsa: la respuesta sigue y quien llamó muestra
    //    el mensaje del backend ("No tienes permiso…").
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login'; // Nos manda al login a la fuerza
        return Promise.reject(new Error('Tu sesión venció. Vuelve a iniciar sesión.'));
    }

    return response;
};
