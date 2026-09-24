import { useCallback, useEffect, useState } from 'react';
import { authFetch } from '@/helpers/AuthFetch';
import { apiUrl } from '@/lib/api';
import { mensajeDeError } from '@/lib/biblioteca';

// Llamada autenticada que devuelve JSON (o null si no hay cuerpo) y lanza Error con el mensaje del backend.
export async function api(ruta, { method = 'GET', body } = {}) {
  const res = await authFetch(apiUrl(ruta), {
    method,
    body: body === undefined || body instanceof FormData ? body : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await mensajeDeError(res, 'No se pudo completar la acción. Vuelve a intentarlo.'));
  const texto = await res.text();
  return texto ? JSON.parse(texto) : null;
}

// Carga varias rutas del panel a la vez: useDatosPanel({ miembros: '/api/miembros', ramas: '/api/ramas' }).
export function useDatosPanel(rutas) {
  const clave = JSON.stringify(rutas);
  const [datos, setDatos] = useState(() => Object.fromEntries(Object.keys(rutas).map((k) => [k, []])));
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error

  const cargar = useCallback(() => {
    const entradas = Object.entries(JSON.parse(clave));
    return Promise.all(entradas.map(([, ruta]) => api(ruta)))
      .then((resultados) => {
        setDatos(Object.fromEntries(entradas.map(([k], i) => [k, resultados[i] ?? []])));
        setEstado('listo');
      })
      .catch(() => setEstado('error'));
  }, [clave]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { ...datos, estado, recargar: cargar };
}

// Abre en otra pestaña un archivo que exige sesión (lo descarga con el token y lo muestra como blob).
// La pestaña se abre antes de la descarga para que el navegador no la bloquee como ventana emergente.
export async function abrirArchivoProtegido(ruta) {
  const ventana = window.open('', '_blank');
  const res = await authFetch(apiUrl(ruta));
  if (!res.ok) {
    ventana?.close();
    throw new Error('No se pudo abrir el archivo.');
  }
  const url = URL.createObjectURL(await res.blob());
  if (ventana) ventana.location.href = url;
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function calcularEdad(fecha) {
  if (!fecha) return null;
  const hoy = new Date();
  const nacimiento = new Date(`${fecha}T00:00:00`);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

// Compara textos en español ignorando mayúsculas y tildes.
export const incluye = (texto, busqueda) =>
  (texto ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .includes(busqueda.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase());
