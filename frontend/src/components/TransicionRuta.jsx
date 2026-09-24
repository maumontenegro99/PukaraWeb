import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Envuelve el contenido de un layout: al cambiar de ruta se vuelve a montar con una aparición suave.
// Solo cuenta el pathname: los anclas del portal (/#ramas) desplazan la página sin repetir la animación.
export function TransicionRuta({ children, className }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className={cn('animate-aparecer', className)}>
      {children}
    </div>
  );
}
