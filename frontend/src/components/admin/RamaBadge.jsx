import { Badge } from '@/components/ui/badge';
import { RAMAS } from '@/lib/ramas';

export const colorDeRama = (tipo) => RAMAS.find((r) => r.clave === tipo)?.color ?? 'var(--muted-foreground)';

// Nombre de la rama con un punto del color de su estandarte.
export function RamaBadge({ rama, ...props }) {
  if (!rama) return <span className="text-muted-foreground">Sin rama</span>;
  return (
    <Badge variant="outline" className="gap-1.5" {...props}>
      <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: colorDeRama(rama.tipo) }} />
      {rama.nombre}
    </Badge>
  );
}
