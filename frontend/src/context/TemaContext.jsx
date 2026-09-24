import { createContext, useContext, useEffect, useState } from 'react';

// Tema de la interfaz: 'claro', 'oscuro' o 'sistema' (sigue la preferencia del dispositivo).
// index.html aplica el tema guardado antes de que cargue React, para que no haya destello.
const TemaContext = createContext({ tema: 'sistema', oscuro: false, cambiarTema: () => {} });

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

  useEffect(() => {
    const medios = consulta();
    const alCambiar = (e) => setSistemaOscuro(e.matches);
    medios.addEventListener('change', alCambiar);
    return () => medios.removeEventListener('change', alCambiar);
  }, []);

  const oscuro = tema === 'oscuro' || (tema === 'sistema' && sistemaOscuro);

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
    setTema(nuevo);
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch {
      // Sin almacenamiento (modo privado): el tema vale solo para esta visita.
    }
  };

  return <TemaContext.Provider value={{ tema, oscuro, cambiarTema }}>{children}</TemaContext.Provider>;
}

export const useTema = () => useContext(TemaContext);
