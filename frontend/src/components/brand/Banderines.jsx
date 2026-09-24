import { cn } from '@/lib/utils';

// Guirnalda de banderines celeste, grafito y gris, como la del campamento del grupo.
// `--contraste` es grafito en modo claro y casi blanco en modo oscuro, para que siempre se vea.
const COLORES = ['var(--celeste)', 'var(--contraste)', '#8a959e'];
// Sobre fondos grafito el banderín oscuro desaparece: se reemplaza por uno claro.
export const COLORES_SOBRE_OSCURO = ['var(--celeste)', '#dfe7eb', '#8a959e'];

export function Banderines({ cantidad = 28, className, animado = false, colores = COLORES }) {
  return (
    <div aria-hidden="true" className={cn('relative flex h-5 w-full justify-between overflow-hidden px-1', className)}>
      <span className="absolute inset-x-0 top-0 h-px bg-foreground/30" />
      {Array.from({ length: cantidad }, (_, i) => (
        <span
          key={i}
          className={cn('block h-4 w-3.5 shrink-0 sm:w-4', animado && 'animate-banderin')}
          style={{
            backgroundColor: colores[i % colores.length],
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            animationDelay: animado ? `${i * 25}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
}

// Banderín de una rama: el triángulo en el color de su estandarte, con su logo encima
// (los logos están dibujados para ir sobre ese color, como en los estandartes reales).
export function BanderinRama({ rama, className }) {
  return (
    <div
      className={cn('relative flex h-24 w-20 shrink-0 justify-center pt-2.5', className)}
      style={{ backgroundColor: rama.color, clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
    >
      <img src={rama.logo} alt="" className="size-11 object-contain" />
    </div>
  );
}
