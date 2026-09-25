import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DownloadIcon, EyeIcon, FileSignatureIcon, LibraryIcon, SearchIcon, ServerCrashIcon, WalletIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  CATEGORIAS,
  categoria,
  formatearFechaCorta,
  formatearRango,
  formatearTamano,
  formatoArchivo,
  urlArchivoDocumento,
  useRecursoPublico,
} from '@/lib/biblioteca';
import { RAMAS } from '@/lib/ramas';

const colorRama = (tipo) => RAMAS.find((r) => r.clave === tipo)?.color;

function FilaDocumento({ doc }) {
  const cat = categoria(doc.categoria);
  return (
    <li className="flex overflow-hidden rounded-lg border bg-card">
      {/* Lomo del documento: el color de su categoría, como en una estantería */}
      <span aria-hidden="true" className="w-2 shrink-0" style={{ backgroundColor: cat.color }} />
      <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">{cat.singular}</span>
            {doc.rama && (
              <Badge variant="outline" className="gap-1.5">
                <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: colorRama(doc.rama.tipo) }} />
                {doc.rama.nombre}
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-semibold leading-snug">{doc.titulo}</h3>
          {doc.descripcion && <p className="text-sm text-muted-foreground">{doc.descripcion}</p>}
          <p className="text-xs text-muted-foreground">
            {formatoArchivo(doc.tipoContenido, doc.nombreArchivo)}, {formatearTamano(doc.tamano)}. Publicado el{' '}
            {formatearFechaCorta(doc.fechaPublicacion)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={urlArchivoDocumento(doc.id, true)} target="_blank" rel="noopener noreferrer">
              <EyeIcon data-icon="inline-start" />
              Ver
            </a>
          </Button>
          <Button asChild size="sm">
            <a href={urlArchivoDocumento(doc.id)} download>
              <DownloadIcon data-icon="inline-start" />
              Descargar
            </a>
          </Button>
        </div>
      </div>
    </li>
  );
}

function AvisoCampamentos() {
  const { datos: campamentos } = useRecursoPublico('/api/biblioteca/campamentos');
  if (campamentos.length === 0) return null;

  return (
    <aside className="flex flex-col gap-4 rounded-lg bg-grafito p-5 text-white">
      <FileSignatureIcon className="size-6 text-primary" />
      <h2 className="text-xl font-bold leading-tight">
        {campamentos.length === 1 ? 'Un campamento pide autorización' : `${campamentos.length} campamentos piden autorización`}
      </h2>
      <ul className="flex flex-col gap-2 text-sm text-white/80">
        {campamentos.map((c) => (
          <li key={c.id}>
            <span className="font-medium text-white">{c.titulo}</span>
            <br />
            {formatearRango(c.fechaInicio, c.fechaFin)}
          </li>
        ))}
      </ul>
      <Button asChild className="w-full">
        <Link to="/biblioteca/autorizaciones">Enviar autorización firmada</Link>
      </Button>
    </aside>
  );
}

export default function BibliotecaInicio() {
  const { datos: documentos, estado } = useRecursoPublico('/api/biblioteca/documentos');
  const [busqueda, setBusqueda] = useState('');
  const [cat, setCat] = useState('TODAS');
  const [rama, setRama] = useState('TODAS');

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return documentos.filter(
      (d) =>
        (cat === 'TODAS' || d.categoria === cat) &&
        (rama === 'TODAS' || d.rama?.tipo === rama) &&
        (!texto || `${d.titulo} ${d.descripcion ?? ''}`.toLowerCase().includes(texto))
    );
  }, [documentos, busqueda, cat, rama]);

  const hayFiltros = busqueda || cat !== 'TODAS' || rama !== 'TODAS';
  const limpiar = () => {
    setBusqueda('');
    setCat('TODAS');
    setRama('TODAS');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-5xl uppercase sm:text-7xl">Biblioteca del grupo</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Manuales de rama, formularios y autorizaciones para descargar. Abierta a familias, dirigentes y otros grupos scouts.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por título o tema"
                aria-label="Buscar documentos"
                className="pl-9"
              />
            </div>
            <Select value={rama} onValueChange={setRama}>
              <SelectTrigger className="sm:w-52" aria-label="Filtrar por rama">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="TODAS">Todas las ramas</SelectItem>
                  {RAMAS.map((r) => (
                    <SelectItem key={r.clave} value={r.clave}>
                      {r.nombre}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <ToggleGroup
            type="single"
            variant="outline"
            value={cat}
            onValueChange={(v) => setCat(v || 'TODAS')}
            className="flex-wrap justify-start"
            aria-label="Filtrar por categoría"
          >
            <ToggleGroupItem value="TODAS">Todo</ToggleGroupItem>
            {CATEGORIAS.filter((c) => c.clave !== 'OTRO').map((c) => (
              <ToggleGroupItem key={c.clave} value={c.clave}>
                {c.etiqueta}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {estado === 'cargando' && (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          )}

          {estado === 'error' && (
            <Alert>
              <ServerCrashIcon />
              <AlertTitle>No se pudo cargar la biblioteca</AlertTitle>
              <AlertDescription>El servidor no responde. Vuelve a intentarlo en unos minutos.</AlertDescription>
            </Alert>
          )}

          {estado === 'listo' && filtrados.length === 0 && (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LibraryIcon />
                </EmptyMedia>
                <EmptyTitle>{hayFiltros ? 'Ningún documento coincide' : 'La biblioteca está vacía'}</EmptyTitle>
                <EmptyDescription>
                  {hayFiltros
                    ? 'Prueba con otra palabra, otra rama u otra categoría.'
                    : 'Cuando la dirigencia publique manuales o formularios, aparecerán aquí.'}
                </EmptyDescription>
              </EmptyHeader>
              {hayFiltros && (
                <EmptyContent>
                  <Button variant="outline" onClick={limpiar}>
                    Quitar filtros
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          )}

          {filtrados.length > 0 && (
            <ul className="flex flex-col gap-3" aria-label="Documentos">
              {filtrados.map((d) => (
                <FilaDocumento key={d.id} doc={d} />
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <AvisoCampamentos />
          <aside className="flex flex-col gap-3 rounded-lg border bg-card p-5">
            <WalletIcon className="size-6 text-celeste-ink" />
            <h2 className="text-lg font-bold leading-tight">¿Tienes que pagar una cuota o un campamento?</h2>
            <p className="text-sm text-muted-foreground">Transfiere al grupo y envía el comprobante desde aquí.</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/biblioteca/pagos">Ir a pagos</Link>
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
}
