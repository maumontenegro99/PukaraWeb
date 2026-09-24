import { useCallback, useEffect, useState } from 'react';
import { apiUrl } from '@/lib/api';

// Categorías de documentos (deben coincidir con CategoriaDocumento en el backend).
// `color` pinta el lomo de cada documento en la estantería.
export const CATEGORIAS = [
  { clave: 'MANUAL', etiqueta: 'Manuales', singular: 'Manual', color: 'var(--celeste)' },
  { clave: 'AUTORIZACION', etiqueta: 'Autorizaciones', singular: 'Autorización', color: 'var(--contraste)' },
  { clave: 'FORMULARIO', etiqueta: 'Formularios', singular: 'Formulario', color: '#8a959e' },
  { clave: 'REGLAMENTO', etiqueta: 'Reglamentos', singular: 'Reglamento', color: 'var(--celeste-ink)' },
  { clave: 'RECURSO', etiqueta: 'Recursos', singular: 'Recurso', color: 'var(--color-rama-tropa)' },
  { clave: 'OTRO', etiqueta: 'Otros', singular: 'Documento', color: '#b8c1c8' },
];

export const categoria = (clave) => CATEGORIAS.find((c) => c.clave === clave) ?? CATEGORIAS.at(-1);

export const ESTADOS_AUTORIZACION = {
  RECIBIDA: { etiqueta: 'Por revisar', variante: 'secondary' },
  APROBADA: { etiqueta: 'Aprobada', variante: 'default' },
  RECHAZADA: { etiqueta: 'Rechazada', variante: 'destructive' },
};

export function formatearTamano(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

export function formatoArchivo(tipoContenido = '', nombre = '') {
  if (tipoContenido.includes('pdf')) return 'PDF';
  if (tipoContenido.includes('png')) return 'PNG';
  if (tipoContenido.includes('jpeg')) return 'JPG';
  return nombre.split('.').pop()?.toUpperCase() ?? '';
}

export function formatearFechaCorta(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatearRango(inicio, fin) {
  if (!inicio) return '';
  const opciones = { weekday: 'short', day: 'numeric', month: 'long' };
  const desde = new Date(inicio).toLocaleDateString('es-CL', opciones);
  if (!fin) return desde;
  const hasta = new Date(fin).toLocaleDateString('es-CL', opciones);
  return desde === hasta ? desde : `${desde} al ${hasta}`;
}

export const urlArchivoDocumento = (id, enLinea = false) =>
  apiUrl(`/api/biblioteca/documentos/${id}/archivo${enLinea ? '?enLinea=true' : ''}`);

// Lee el mensaje de un error ProblemDetail del backend, o devuelve uno genérico.
export async function mensajeDeError(res, porDefecto = 'Algo salió mal. Vuelve a intentarlo.') {
  try {
    const cuerpo = await res.json();
    return cuerpo.detail || porDefecto;
  } catch {
    return porDefecto;
  }
}

// GET público con estados de carga. `recargar` vuelve a pedir los datos.
export function useRecursoPublico(ruta) {
  const [datos, setDatos] = useState([]);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(apiUrl(ruta), { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setDatos(data);
        setEstado('listo');
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setEstado('error');
      });
    return () => controller.abort();
  }, [ruta, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  return { datos, estado, recargar };
}
