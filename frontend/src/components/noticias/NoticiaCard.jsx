import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Banderines, COLORES_SOBRE_OSCURO } from '@/components/brand/Banderines';
import { cn } from '@/lib/utils';
import insignia from '@/assets/insignia.png';

const TIPOS = {
  INSTITUCIONAL: 'Institucional',
  RAMA: 'Ramas',
  EVENTO: 'Convocatoria',
  AVISO: 'Aviso',
  HISTORIA: 'Historia',
  OTRO: 'General',
};

export const etiquetaTipo = (tipo) => TIPOS[tipo] ?? 'General';

export function formatearFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
}

// `destacada` ocupa más espacio y muestra la bajada completa.
// `compacta` pone una miniatura al costado, para listas secundarias junto a una destacada.
export function NoticiaCard({ noticia, destacada = false, compacta = false, className }) {
  return (
    <Link
      to={`/noticias/${noticia.id}`}
      className={cn(
        'group flex overflow-hidden rounded-lg border bg-card focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
        compacta ? 'flex-row' : 'flex-col',
        className
      )}
    >
      <div
        className={cn(
          'shrink-0 overflow-hidden bg-muted',
          destacada && 'aspect-[16/9]',
          compacta && 'w-32 sm:w-40',
          !destacada && !compacta && 'aspect-[3/2]'
        )}
      >
        {noticia.imagenUrl ? (
          <img src={noticia.imagenUrl} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        ) : (
          // Portada de respaldo cuando la noticia no trae foto
          <div className="flex size-full flex-col bg-grafito">
            <Banderines cantidad={destacada ? 24 : compacta ? 6 : 14} colores={COLORES_SOBRE_OSCURO} />
            <div className="flex flex-1 items-center justify-center">
              <img src={insignia} alt="" className={cn('opacity-90', destacada ? 'h-28' : compacta ? 'h-10' : 'h-16')} />
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={noticia.tipo === 'AVISO' ? 'destructive' : 'secondary'}>{etiquetaTipo(noticia.tipo)}</Badge>
          <time dateTime={noticia.fechaPublicacion}>{formatearFecha(noticia.fechaPublicacion)}</time>
        </div>
        <h3 className={cn('font-bold leading-snug group-hover:underline group-hover:decoration-primary', destacada ? 'text-2xl' : 'text-lg')}>
          {noticia.titulo}
        </h3>
        <p className={cn('text-sm text-muted-foreground', !destacada && 'line-clamp-3')}>{noticia.bajada}</p>
        {noticia.autor && <p className="mt-auto pt-2 text-xs text-muted-foreground">Por {noticia.autor}</p>}
      </div>
    </Link>
  );
}

export function NoticiaCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <Skeleton className="aspect-[3/2] w-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}
