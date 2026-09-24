import { NewspaperIcon, ServerCrashIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { NoticiaCard, NoticiaCardSkeleton } from '@/components/noticias/NoticiaCard';
import { useNoticias } from '@/hooks/use-noticias';

export default function Noticias() {
  const { noticias, estado } = useNoticias();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-5xl uppercase sm:text-6xl">Noticias</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Avisos, convocatorias y crónicas del grupo, para familias, amigos y otros grupos scouts.
      </p>

      <div className="mt-10">
        {estado === 'cargando' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <NoticiaCardSkeleton key={i} />
            ))}
          </div>
        )}

        {estado === 'error' && (
          <Alert>
            <ServerCrashIcon />
            <AlertTitle>No se pudieron cargar las noticias</AlertTitle>
            <AlertDescription>El servidor no responde. Vuelve a intentarlo en unos minutos.</AlertDescription>
          </Alert>
        )}

        {estado === 'listo' && noticias.length === 0 && (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <NewspaperIcon />
              </EmptyMedia>
              <EmptyTitle>Todavía no hay noticias</EmptyTitle>
              <EmptyDescription>Cuando los dirigentes publiquen una novedad, aparecerá aquí.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {noticias.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {noticias.map((n) => (
              <NoticiaCard key={n.id} noticia={n} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
