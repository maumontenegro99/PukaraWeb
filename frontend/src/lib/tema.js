// Modo "según la hora": oscuro desde HORA_OSCURO_DESDE hasta HORA_OSCURO_HASTA (hora local del dispositivo).
// index.html repite esta regla para aplicar el tema antes de que cargue React: si cambias las horas, cámbialas también allá.
export const HORA_OSCURO_DESDE = 20;
export const HORA_OSCURO_HASTA = 7;

export const esHoraOscura = (fecha = new Date()) => {
  const hora = fecha.getHours();
  return hora >= HORA_OSCURO_DESDE || hora < HORA_OSCURO_HASTA;
};
