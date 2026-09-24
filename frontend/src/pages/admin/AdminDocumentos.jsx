import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLinkIcon, EyeIcon, FileUpIcon, LibraryIcon, LoaderCircleIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { authFetch } from '@/helpers/AuthFetch';
import { apiUrl } from '@/lib/api';
import {
  CATEGORIAS,
  categoria,
  formatearFechaCorta,
  formatearTamano,
  mensajeDeError,
  urlArchivoDocumento,
  useRecursoPublico,
} from '@/lib/biblioteca';

const SIN = 'NINGUNA';
const FORM_VACIO = { titulo: '', descripcion: '', categoria: 'MANUAL', ramaId: SIN, eventoId: SIN, archivo: null };

function SubirDocumento({ abierto, onCambio, onPublicado }) {
  const [form, setForm] = useState(FORM_VACIO);
  const [ramas, setRamas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!abierto) return;
    setForm(FORM_VACIO);
    setError('');
    Promise.all([authFetch(apiUrl('/api/ramas')), authFetch(apiUrl('/api/eventos'))])
      .then(([r, e]) => Promise.all([r.json(), e.json()]))
      .then(([r, e]) => {
        setRamas(r);
        setEventos(e);
      })
      .catch(() => {});
  }, [abierto]);

  const cambiar = (campo) => (valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const publicar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    const datos = new FormData();
    datos.append('titulo', form.titulo);
    datos.append('descripcion', form.descripcion);
    datos.append('categoria', form.categoria);
    if (form.ramaId !== SIN) datos.append('ramaId', form.ramaId);
    if (form.categoria === 'AUTORIZACION' && form.eventoId !== SIN) datos.append('eventoId', form.eventoId);
    datos.append('archivo', form.archivo);
    try {
      const res = await authFetch(apiUrl('/api/biblioteca/documentos'), { method: 'POST', body: datos });
      if (!res.ok) {
        setError(await mensajeDeError(res, 'No se pudo publicar el documento.'));
        return;
      }
      toast.success('Documento publicado en la biblioteca');
      onPublicado();
      onCambio(false);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={onCambio}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={publicar} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Publicar documento</DialogTitle>
            <DialogDescription>Quedará visible para cualquiera en la biblioteca pública.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="doc-titulo">Título</FieldLabel>
              <Input id="doc-titulo" value={form.titulo} onChange={(e) => cambiar('titulo')(e.target.value)} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="doc-descripcion">Descripción</FieldLabel>
              <Textarea id="doc-descripcion" rows={2} value={form.descripcion} onChange={(e) => cambiar('descripcion')(e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="doc-categoria">Categoría</FieldLabel>
                <Select value={form.categoria} onValueChange={cambiar('categoria')}>
                  <SelectTrigger id="doc-categoria">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {CATEGORIAS.map((c) => (
                        <SelectItem key={c.clave} value={c.clave}>
                          {c.singular}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="doc-rama">Rama</FieldLabel>
                <Select value={String(form.ramaId)} onValueChange={cambiar('ramaId')}>
                  <SelectTrigger id="doc-rama">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={SIN}>Todo el grupo</SelectItem>
                      {ramas.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.nombre}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            {form.categoria === 'AUTORIZACION' && (
              <Field>
                <FieldLabel htmlFor="doc-evento">Campamento o salida</FieldLabel>
                <Select value={String(form.eventoId)} onValueChange={cambiar('eventoId')}>
                  <SelectTrigger id="doc-evento">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={SIN}>Sin evento asociado</SelectItem>
                      {eventos.map((ev) => (
                        <SelectItem key={ev.id} value={String(ev.id)}>
                          {ev.titulo}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>Los apoderados lo descargarán al enviar la autorización de ese evento.</FieldDescription>
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="doc-archivo">Archivo</FieldLabel>
              <Input
                id="doc-archivo"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.pptx"
                onChange={(e) => cambiar('archivo')(e.target.files?.[0] ?? null)}
                required
              />
              <FieldDescription>PDF, imagen o documento de Office de hasta 10 MB.</FieldDescription>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={enviando || !form.titulo || !form.archivo}>
              {enviando && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
              Publicar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDocumentos() {
  const { datos: documentos, estado, recargar } = useRecursoPublico('/api/biblioteca/documentos');
  const [subiendo, setSubiendo] = useState(false);
  const [aEliminar, setAEliminar] = useState(null);

  const eliminar = async () => {
    const res = await authFetch(apiUrl(`/api/biblioteca/documentos/${aEliminar.id}`), { method: 'DELETE' });
    if (res.ok) {
      toast.success('Documento eliminado');
      recargar();
    } else {
      toast.error(await mensajeDeError(res, 'No se pudo eliminar el documento.'));
    }
    setAEliminar(null);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl uppercase">Documentos</h1>
          <p className="mt-2 text-muted-foreground">Lo que publiques aquí aparece en la biblioteca pública.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/biblioteca" target="_blank">
              <ExternalLinkIcon data-icon="inline-start" />
              Ver biblioteca
            </Link>
          </Button>
          <Button onClick={() => setSubiendo(true)}>
            <FileUpIcon data-icon="inline-start" />
            Publicar documento
          </Button>
        </div>
      </div>

      {estado === 'cargando' && <Skeleton className="h-48 w-full" />}

      {estado === 'listo' && documentos.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LibraryIcon />
            </EmptyMedia>
            <EmptyTitle>Todavía no hay documentos</EmptyTitle>
            <EmptyDescription>Publica el primer manual o formulario para las familias.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setSubiendo(true)}>Publicar documento</Button>
          </EmptyContent>
        </Empty>
      )}

      {documentos.length > 0 && (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Rama</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Publicado</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="max-w-72">
                    <p className="truncate font-medium">{d.titulo}</p>
                    <p className="truncate text-xs text-muted-foreground">{d.nombreArchivo}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{categoria(d.categoria).singular}</Badge>
                  </TableCell>
                  <TableCell>{d.rama?.nombre ?? <span className="text-muted-foreground">Todo el grupo</span>}</TableCell>
                  <TableCell className="tabular-nums">{formatearTamano(d.tamano)}</TableCell>
                  <TableCell className="tabular-nums">{formatearFechaCorta(d.fechaPublicacion)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label={`Ver ${d.titulo}`}>
                        <a href={urlArchivoDocumento(d.id, true)} target="_blank" rel="noopener noreferrer">
                          <EyeIcon />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Eliminar ${d.titulo}`} onClick={() => setAEliminar(d)}>
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

      <SubirDocumento abierto={subiendo} onCambio={setSubiendo} onPublicado={recargar} />

      <AlertDialog open={!!aEliminar} onOpenChange={(abierto) => !abierto && setAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar “{aEliminar?.titulo}”?</AlertDialogTitle>
            <AlertDialogDescription>Dejará de estar en la biblioteca y el archivo se borrará. No se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={eliminar}>
              Eliminar documento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
