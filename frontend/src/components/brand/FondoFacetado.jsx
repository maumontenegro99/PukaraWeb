import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import fotoDifuminada from '@/assets/fondo-scout-difuminado.jpg';

// Foto del grupo vista a través de un "vidrio de banderines": un mosaico de triángulos que refracta
// la luz, un reflejo que barre la superficie y grano de película. La foto ya viene difuminada desde
// el archivo (fondo-scout-difuminado.jpg), así que los rostros no se pueden recuperar desde el navegador.

const ANCHO = 1600;
const ALTO = 1000;
const LADO = 110; // ancho de cada triángulo
const FILA = LADO * 0.866; // alto de un triángulo equilátero

// Pseudoaleatorio determinista: el mosaico es igual en cada render y entre servidor y cliente.
const ruido = (i) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

function useFacetas() {
  return useMemo(() => {
    const facetas = [];
    const filas = Math.ceil(ALTO / FILA) + 1;
    const columnas = Math.ceil(ANCHO / (LADO / 2)) + 2;
    let i = 0;
    for (let f = 0; f < filas; f++) {
      const y = f * FILA;
      for (let c = -1; c < columnas; c++) {
        const x = c * (LADO / 2);
        const haciaAbajo = (c + f) % 2 === 0; // alterna banderines hacia abajo y hacia arriba
        const puntos = haciaAbajo
          ? `${x},${y} ${x + LADO},${y} ${x + LADO / 2},${y + FILA}`
          : `${x + LADO / 2},${y} ${x + LADO},${y + FILA} ${x},${y + FILA}`;
        const r = ruido(++i);
        facetas.push({ puntos, claro: r > 0.5, opacidad: 0.03 + (r > 0.5 ? r - 0.5 : r) * 0.22 });
      }
    }
    return facetas;
  }, []);
}

export function FondoFacetado({ className }) {
  const facetas = useFacetas();

  return (
    <div aria-hidden="true" className={cn('absolute inset-0 -z-10 overflow-hidden bg-grafito', className)}>
      <img src={fotoDifuminada} alt="" className="fondo-deriva absolute inset-0 size-full object-cover" />

      <svg
        className="absolute inset-0 size-full mix-blend-overlay"
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {facetas.map((f, i) => (
          <polygon key={i} points={f.puntos} fill={f.claro ? '#fff' : '#000'} fillOpacity={f.opacidad} />
        ))}
      </svg>

      <div className="fondo-reflejo absolute inset-0 mix-blend-soft-light" />
      <div className="fondo-grano absolute -inset-[50%] opacity-[0.16] mix-blend-overlay" />
    </div>
  );
}
