import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { ArrowLeftIcon, SearchXIcon, ServerCrashIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { etiquetaTipo, formatearFecha } from '@/components/noticias/NoticiaCard';
import SocialEmbed from '@/components/SocialEmbed';
import { useNoticia } from '@/hooks/use-noticias';

export default function NoticiaDetalle() {
  const { id } = useParams();
  const { noticia, estado } = useNoticia(id);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Button asChild variant="ghost" className="-ml-3 mb-6">
        <Link to="/noticias">
          <ArrowLeftIcon data-icon="inline-start" />
          Todas las noticias
        </Link>
      </Button>

      {estado === 'cargando' && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="aspect-[16/9] w-full" />
        </div>
      )}

      {estado === 'error' && (
        <Alert>
          <ServerCrashIcon />
          <AlertTitle>No se pudo cargar la noticia</AlertTitle>
          <AlertDescription>El servidor no responde. Vuelve a intentarlo en unos minutos.</AlertDescription>
        </Alert>
      )}

      {estado === 'no-encontrada' && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>Esta noticia ya no existe</EmptyTitle>
            <EmptyDescription>Puede que la hayan eliminado o que el enlace esté incompleto.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/noticias">Ver las noticias publicadas</Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {estado === 'listo' && noticia && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={noticia.tipo === 'AVISO' ? 'destructive' : 'secondary'}>{etiquetaTipo(noticia.tipo)}</Badge>
            <time dateTime={noticia.fechaPublicacion}>{formatearFecha(noticia.fechaPublicacion)}</time>
            {noticia.autor && <span>Por {noticia.autor}</span>}
          </div>
          <h1 className="mt-4 font-display text-5xl uppercase sm:text-6xl">{noticia.titulo}</h1>
          <p className="mt-4 text-xl text-muted-foreground">{noticia.bajada}</p>

          {noticia.imagenUrl && (
            <img src={noticia.imagenUrl} alt="" className="mt-8 aspect-[16/9] w-full rounded-lg object-cover" />
          )}

          <div className="prose-noticia mt-8" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(noticia.contenido ?? '') }} />

          {noticia.enlaceSocial && <SocialEmbed url={noticia.enlaceSocial} />}
        </>
      )}
    </article>
  );
}
