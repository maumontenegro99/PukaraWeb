import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLinkIcon, NewspaperIcon, PencilIcon, PenLineIcon, SearchIcon, ServerCrashIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmarEliminar } from '@/components/admin/ConfirmarEliminar';
import { Encabezado } from '@/components/admin/Encabezado';
import { etiquetaTipo } from '@/components/noticias/NoticiaCard';
import { formatearFechaCorta } from '@/lib/biblioteca';
import { api, incluye, useDatosPanel } from '@/lib/panel';
import insignia from '@/assets/insignia.png';

export default function AdminNoticias() {
  const { noticias, estado, recargar } = useDatosPanel({ noticias: '/api/noticias' });
  const [busqueda, setBusqueda] = useState('');
  const [aEliminar, setAEliminar] = useState(null);

  const visibles = useMemo(
    () => noticias.filter((n) => !busqueda || incluye(`${n.titulo} ${n.bajada ?? ''} ${n.autor ?? ''}`, busqueda)),
    [noticias, busqueda]
  );

  const eliminar = async () => {
    try {
      await api(`/api/noticias/${aEliminar.id}`, { method: 'DELETE' });
      toast.success('Noticia eliminada del portal');
      recargar();
    } catch (err) {
      toast.error(err.message);
    }
    setAEliminar(null);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Encabezado titulo="Noticias" descripcion="Lo que publiques aquí aparece en el portal, de la más nueva a la más antigua.">
        <Button asChild variant="outline">
          <Link to="/noticias" target="_blank">
            <ExternalLinkIcon data-icon="inline-start" />
            Ver en el portal
          </Link>
        </Button>
        <Button asChild>
          <Link to="/admin/noticias/nueva">
            <PenLineIcon data-icon="inline-start" />
            Publicar noticia
          </Link>
        </Button>
      </Encabezado>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por título, resumen o autor" aria-label="Buscar noticias" className="pl-9" />
      </div>

      {estado === 'cargando' && <Skeleton className="h-64 w-full" />}

      {estado === 'error' && (
        <Alert>
          <ServerCrashIcon />
          <AlertTitle>No se pudieron cargar las noticias</AlertTitle>
          <AlertDescription>El servidor no responde. Vuelve a intentarlo en unos minutos.</AlertDescription>
        </Alert>
      )}

      {estado === 'listo' && visibles.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <NewspaperIcon />
            </EmptyMedia>
            <EmptyTitle>{busqueda ? 'Ninguna noticia coincide' : 'Todavía no hay noticias'}</EmptyTitle>
            <EmptyDescription>{busqueda ? 'Prueba con otra palabra.' : 'Cuéntales a las familias lo que está pasando en el grupo.'}</EmptyDescription>
          </EmptyHeader>
          {!busqueda && (
            <EmptyContent>
              <Button asChild>
                <Link to="/admin/noticias/nueva">Publicar noticia</Link>
              </Button>
            </EmptyContent>
          )}
        </Empty>
      )}

      {estado === 'listo' && visibles.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Noticia</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Publicada</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibles.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>
                    <div className="flex max-w-md items-center gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-grafito">
                        <img src={n.imagenUrl || insignia} alt="" className={n.imagenUrl ? 'size-full object-cover' : 'h-8'} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{n.titulo}</p>
                        <p className="truncate text-xs text-muted-foreground">{n.bajada}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={n.tipo === 'AVISO' ? 'destructive' : 'secondary'}>{etiquetaTipo(n.tipo)}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{formatearFechaCorta(n.fechaPublicacion)}</TableCell>
                  <TableCell>{n.autor || <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label={`Ver ${n.titulo} en el portal`}>
                        <Link to={`/noticias/${n.id}`} target="_blank">
                          <ExternalLinkIcon />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" aria-label={`Editar ${n.titulo}`}>
                        <Link to={`/admin/noticias/${n.id}`}>
                          <PencilIcon />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Eliminar ${n.titulo}`} onClick={() => setAEliminar(n)}>
                        <Trash2Icon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmarEliminar
        abierto={!!aEliminar}
        onCambio={(abierto) => !abierto && setAEliminar(null)}
        titulo={`¿Eliminar “${aEliminar?.titulo}”?`}
        descripcion="Dejará de aparecer en el portal de inmediato."
        accion="Eliminar noticia"
        onConfirmar={eliminar}
      />
    </div>
  );
}
