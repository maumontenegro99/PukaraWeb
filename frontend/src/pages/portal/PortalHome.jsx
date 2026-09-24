import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MailIcon, NewspaperIcon, ServerCrashIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { BanderinRama } from '@/components/brand/Banderines';
import { NoticiaCard, NoticiaCardSkeleton } from '@/components/noticias/NoticiaCard';
import { useNoticias } from '@/hooks/use-noticias';
import { RAMAS } from '@/lib/ramas';
import { FondoFacetado } from '@/components/brand/FondoFacetado';

function useScrollAlAncla() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);
}

function SeccionNoticias() {
  const { noticias, estado } = useNoticias();
  const [principal, ...resto] = noticias;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-4xl uppercase sm:text-5xl">Lo último del grupo</h2>
        {noticias.length > 0 && (
          <Button asChild variant="outline">
            <Link to="/noticias">Ver todas las noticias</Link>
          </Button>
        )}
      </div>

      {estado === 'cargando' && (
        <div className="grid gap-6 md:grid-cols-3">
          <NoticiaCardSkeleton />
          <NoticiaCardSkeleton />
          <NoticiaCardSkeleton />
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
            <EmptyDescription>Aquí aparecerán los avisos y las novedades que publiquen los dirigentes.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {principal && (
        <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
          <NoticiaCard noticia={principal} destacada />
          <div className="flex flex-col gap-4">
            {resto.slice(0, 3).map((n) => (
              <NoticiaCard key={n.id} noticia={n} compacta />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function PortalHome() {
  useScrollAlAncla();

  return (
    <>
      <section className="relative isolate flex min-h-[72svh] items-end overflow-hidden">
        <FondoFacetado />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-grafito via-grafito/40 to-transparent" />
        <div className="mx-auto w-full max-w-6xl px-4 pt-32 pb-12 text-white">
          <h1 className="font-display text-[clamp(3.5rem,12vw,9rem)] uppercase">Pukara Weche</h1>
          <p className="mt-4 max-w-xl text-lg text-white/90 sm:text-xl">
            Grupo guía y scout. Niñas, niños y jóvenes que aprenden a vivir en la naturaleza, en comunidad y al servicio de los demás.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/#unete">Quiero sumarme</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link to="/#ramas">Conocer las ramas</Link>
            </Button>
          </div>
        </div>
      </section>

      <SeccionNoticias />

      <section id="ramas" className="scroll-mt-20 border-y bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-4xl uppercase sm:text-5xl">Nuestras ramas</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Cada rama reúne a un tramo de edad y tiene su propio estandarte. Se avanza de una a otra al crecer.
          </p>
          <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {RAMAS.map((rama) => (
              <li key={rama.clave} className="flex items-start gap-4">
                <BanderinRama rama={rama} />
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold">{rama.nombre}</h3>
                  <p className="text-sm text-muted-foreground">
                    {rama.integrantes}, {rama.edades}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="unete" className="scroll-mt-20 bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-[1.5fr_1fr] md:items-end">
          <div>
            <h2 className="font-display text-4xl uppercase sm:text-6xl">¿Tu hija o hijo quiere ser scout?</h2>
            <p className="mt-4 max-w-xl text-lg">
              Recibimos nuevas familias durante todo el año. Escríbenos con la edad de tu hija o hijo y te contamos cuándo puede venir a conocer su rama.
            </p>
          </div>
          <Button asChild size="lg" className="w-fit bg-grafito text-white hover:bg-grafito/85 md:justify-self-end">
            <a href="mailto:pukaraweche@gmail.com?subject=Quiero%20sumarme%20al%20grupo">
              <MailIcon data-icon="inline-start" />
              Escribir al grupo
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}
