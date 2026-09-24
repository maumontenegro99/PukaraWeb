import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, CircleAlertIcon, CircleCheckIcon, DownloadIcon, LoaderCircleIcon, MapPinIcon, TentIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { apiUrl } from '@/lib/api';
import { formatearRango, mensajeDeError, urlArchivoDocumento, useRecursoPublico } from '@/lib/biblioteca';
import { cn } from '@/lib/utils';

const MAX_BYTES = 10 * 1024 * 1024;

function Paso({ numero, titulo, children }) {
  return (
    <section className="grid gap-4 sm:grid-cols-[3rem_1fr]">
      <span className="flex size-10 items-center justify-center rounded-full bg-grafito font-display text-xl text-white" aria-hidden="true">
        {numero}
      </span>
      <div className="flex min-w-0 flex-col gap-4">
        <h2 className="text-xl font-bold">
          <span className="sr-only">Paso {numero}: </span>
          {titulo}
        </h2>
        {children}
      </div>
    </section>
  );
}

export default function EnviarAutorizacion() {
  const { datos: campamentos, estado } = useRecursoPublico('/api/biblioteca/campamentos');
  const [eventoId, setEventoId] = useState(null);
  const [rut, setRut] = useState('');
  const [apoderado, setApoderado] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [recibida, setRecibida] = useState(null);

  const elegido = campamentos.find((c) => c.id === eventoId) ?? (campamentos.length === 1 ? campamentos[0] : null);

  const elegirArchivo = (e) => {
    const f = e.target.files?.[0] ?? null;
    setError(f && f.size > MAX_BYTES ? 'El archivo supera los 10 MB. Prueba con una foto de menor resolución.' : '');
    setArchivo(f && f.size <= MAX_BYTES ? f : null);
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!elegido || !archivo) return;
    setEnviando(true);
    setError('');
    const datos = new FormData();
    datos.append('eventoId', elegido.id);
    datos.append('rutMiembro', rut);
    datos.append('nombreApoderado', apoderado);
    datos.append('archivo', archivo);
    try {
      const res = await fetch(apiUrl('/api/biblioteca/autorizaciones'), { method: 'POST', body: datos });
      if (!res.ok) {
        setError(await mensajeDeError(res, 'No se pudo enviar la autorización. Vuelve a intentarlo.'));
        return;
      }
      setRecibida(await res.json());
    } catch {
      setError('El servidor no responde. Vuelve a intentarlo en unos minutos.');
    } finally {
      setEnviando(false);
    }
  };

  const reiniciar = () => {
    setRecibida(null);
    setRut('');
    setArchivo(null);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-5xl uppercase sm:text-6xl">Enviar autorización</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Para campamentos y salidas, la dirigencia necesita la autorización firmada de cada apoderado. Solo los dirigentes pueden ver lo que envíes.
      </p>

      <div className="mt-10">
        {estado === 'cargando' && <Skeleton className="h-40 w-full" />}

        {estado === 'error' && (
          <Alert>
            <CircleAlertIcon />
            <AlertTitle>No se pudieron cargar los campamentos</AlertTitle>
            <AlertDescription>El servidor no responde. Vuelve a intentarlo en unos minutos.</AlertDescription>
          </Alert>
        )}

        {estado === 'listo' && campamentos.length === 0 && (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TentIcon />
              </EmptyMedia>
              <EmptyTitle>No hay campamentos pidiendo autorización</EmptyTitle>
              <EmptyDescription>Cuando la dirigencia abra uno, aparecerá aquí con su formulario para descargar.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild variant="outline">
                <Link to="/biblioteca">Ver documentos</Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {recibida && (
          <Empty className="border bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleCheckIcon />
              </EmptyMedia>
              <EmptyTitle>Autorización enviada</EmptyTitle>
              <EmptyDescription>
                La recibimos para {recibida.evento}. La dirigencia la revisará y te contactará si falta algo.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={reiniciar}>Enviar otra autorización</Button>
            </EmptyContent>
          </Empty>
        )}

        {estado === 'listo' && campamentos.length > 0 && !recibida && (
          <form onSubmit={enviar} className="flex flex-col gap-10" noValidate>
            <Paso numero={1} titulo="Elige el campamento">
              <FieldSet>
                <FieldLegend className="sr-only">Campamento</FieldLegend>
                <div className="grid gap-3" role="radiogroup">
                  {campamentos.map((c) => {
                    const activo = elegido?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={activo}
                        onClick={() => setEventoId(c.id)}
                        className={cn(
                          'flex flex-col gap-1 rounded-lg border bg-card p-4 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                          activo && 'border-primary ring-2 ring-primary/40'
                        )}
                      >
                        <span className="text-lg font-semibold">{c.titulo}</span>
                        <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDaysIcon className="size-4" />
                            {formatearRango(c.fechaInicio, c.fechaFin)}
                          </span>
                          {c.lugar && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPinIcon className="size-4" />
                              {c.lugar}
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {c.ramas.length ? `Participan: ${c.ramas.join(', ')}` : 'Participa el grupo completo'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </FieldSet>
            </Paso>

            <Paso numero={2} titulo="Descarga el formulario y fírmalo">
              {elegido?.formularioId ? (
                <div className="flex flex-col gap-3">
                  <p className="text-muted-foreground">
                    Imprímelo, complétalo y fírmalo a mano. Después tómale una foto nítida o escanéalo.
                  </p>
                  <Button asChild variant="outline" className="w-fit">
                    <a href={urlArchivoDocumento(elegido.formularioId)} download>
                      <DownloadIcon data-icon="inline-start" />
                      Descargar formulario
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {elegido
                    ? 'Este campamento aún no tiene formulario publicado. Pídelo a la dirigencia de la rama.'
                    : 'Primero elige un campamento.'}
                </p>
              )}
            </Paso>

            <Paso numero={3} titulo="Súbelo firmado">
              <FieldGroup>
                {error && (
                  <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Field>
                  <FieldLabel htmlFor="rut">RUT de la niña, niño o joven</FieldLabel>
                  <Input id="rut" value={rut} onChange={(e) => setRut(e.target.value)} placeholder="12.345.678-9" inputMode="text" autoComplete="off" required />
                  <FieldDescription>Con él confirmamos que está inscrito en este campamento.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="apoderado">Tu nombre completo</FieldLabel>
                  <Input id="apoderado" value={apoderado} onChange={(e) => setApoderado(e.target.value)} autoComplete="name" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="archivo">Autorización firmada</FieldLabel>
                  <Input id="archivo" type="file" accept="application/pdf,image/jpeg,image/png" onChange={elegirArchivo} required />
                  <FieldDescription>PDF, JPG o PNG de hasta 10 MB.</FieldDescription>
                </Field>
                <Button type="submit" size="lg" className="w-fit" disabled={enviando || !elegido || !rut || !apoderado || !archivo}>
                  {enviando && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
                  Enviar autorización
                </Button>
              </FieldGroup>
            </Paso>
          </form>
        )}
      </div>
    </div>
  );
}
