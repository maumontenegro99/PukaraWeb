// Etiquetas y formatos del módulo de pagos (deben coincidir con los enums del paquete pagos del backend).

const pesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
export const formatearPesos = (monto) => pesos.format(monto ?? 0);

export const TIPOS_COBRO = [
  { clave: 'EVENTO', etiqueta: 'Evento', ayuda: 'Un campamento o salida de la agenda' },
  { clave: 'CUOTA', etiqueta: 'Cuota', ayuda: 'Cuota mensual o anual del grupo' },
  { clave: 'PERSONALIZADO', etiqueta: 'Personalizado', ayuda: 'Uniforme, pañolín, rifa o lo que necesites' },
];
export const etiquetaTipoCobro = (clave) => TIPOS_COBRO.find((t) => t.clave === clave)?.etiqueta ?? 'Cobro';

export const ESTADOS_DEUDA = {
  PAGADO: { etiqueta: 'Pagado', variante: 'default' },
  PARCIAL: { etiqueta: 'Abono parcial', variante: 'secondary' },
  PENDIENTE: { etiqueta: 'Pendiente', variante: 'outline' },
};

export const ESTADOS_PAGO = {
  EN_REVISION: { etiqueta: 'Por revisar', variante: 'secondary' },
  CONFIRMADO: { etiqueta: 'Confirmado', variante: 'default' },
  RECHAZADO: { etiqueta: 'Rechazado', variante: 'destructive' },
};

export const ORIGENES_PAGO = { APODERADO: 'Biblioteca', PANEL: 'Panel' };

// Las fechas límite llegan como "2026-10-15" (LocalDate): se leen como fecha local, no UTC.
export function formatearFechaLimite(fecha) {
  if (!fecha) return null;
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });
}

export const porcentaje = (parte, total) => (total > 0 ? Math.min(100, Math.round((parte / total) * 100)) : 0);

export const MEDIOS_PAGO = { TRANSFERENCIA: 'Transferencia', EFECTIVO: 'Efectivo' };

// Descarga filas como planilla CSV que Excel abre directo en español: separador ";" y BOM para las tildes.
// `columnas` = [{ titulo, valor: (fila) => texto o número }]
export function descargarPlanilla(nombreArchivo, columnas, filas) {
  const celda = (v) => {
    const texto = v === null || v === undefined ? '' : String(v);
    return /[;"\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  const lineas = [columnas.map((c) => celda(c.titulo)).join(';'), ...filas.map((f) => columnas.map((c) => celda(c.valor(f))).join(';'))];
  const blob = new Blob(['\uFEFF' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Fecha y hora para planillas: "24-09-2026 19:30".
export function fechaPlanilla(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  const dos = (n) => String(n).padStart(2, '0');
  return `${dos(d.getDate())}-${dos(d.getMonth() + 1)}-${d.getFullYear()} ${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

// Nombre de archivo seguro a partir de un texto: "Cuota de octubre" -> "cuota-de-octubre".
export const nombreArchivo = (texto) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
