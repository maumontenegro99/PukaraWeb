import { createContext, useContext, useEffect, useState } from 'react';
import { esHoraOscura } from '@/lib/tema';

// Tema de la interfaz: 'claro', 'oscuro', 'horario' (oscuro de noche, ver lib/tema.js) o 'sistema' (sigue la preferencia
// del dispositivo; es el valor inicial mientras la persona no elige otro).
// index.html aplica el tema guardado antes de que cargue React, para que no haya destello.
const TemaContext = createContext({ tema: 'sistema', oscuro: false, cambiarTema: () => {}, alternar: () => {} });

const CLAVE = 'tema';
const consulta = () => window.matchMedia('(prefers-color-scheme: dark)');

function leerTema() {
  try {
    return localStorage.getItem(CLAVE) || 'sistema';
  } catch {
    return 'sistema';
  }
}

export function TemaProvider({ children }) {
  const [tema, setTema] = useState(leerTema);
  const [sistemaOscuro, setSistemaOscuro] = useState(() => consulta().matches);
  const [nocturno, setNocturno] = useState(() => esHoraOscura());

  useEffect(() => {
    const medios = consulta();
    const alCambiar = (e) => setSistemaOscuro(e.matches);
    medios.addEventListener('change', alCambiar);
    return () => medios.removeEventListener('change', alCambiar);
  }, []);

  // En modo horario se revisa la hora cada minuto para cambiar solo al llegar la noche o la mañana.
  useEffect(() => {
    if (tema !== 'horario') return;
    const revisar = () => setNocturno(esHoraOscura());
    const intervalo = setInterval(revisar, 60_000);
    return () => clearInterval(intervalo);
  }, [tema]);

  const oscuro =
    tema === 'oscuro' || (tema === 'sistema' && sistemaOscuro) || (tema === 'horario' && nocturno);

  useEffect(() => {
    const raiz = document.documentElement;
    if (raiz.classList.contains('dark') === oscuro) return;
    // Fundido breve de colores al cambiar, en vez de un salto seco.
    raiz.classList.add('cambiando-tema');
    raiz.classList.toggle('dark', oscuro);
    const t = setTimeout(() => raiz.classList.remove('cambiando-tema'), 250);
    return () => clearTimeout(t);
  }, [oscuro]);

  const cambiarTema = (nuevo) => {
    if (nuevo === 'horario') setNocturno(esHoraOscura());
    setTema(nuevo);
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch {
      // Sin almacenamiento (modo privado): el tema vale solo para esta visita.
    }
  };

  // Cambia al modo contrario del que se ve ahora (y deja de seguir la hora o el dispositivo).
  const alternar = () => cambiarTema(oscuro ? 'claro' : 'oscuro');

  return <TemaContext.Provider value={{ tema, oscuro, cambiarTema, alternar }}>{children}</TemaContext.Provider>;
}

export const useTema = () => useContext(TemaContext);
