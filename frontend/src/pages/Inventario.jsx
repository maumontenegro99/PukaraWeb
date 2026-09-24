import { useEffect, useMemo, useState } from 'react';
import { CircleAlertIcon, LoaderCircleIcon, MapPinIcon, PackageIcon, PencilIcon, PlusIcon, SearchIcon, ServerCrashIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmarEliminar } from '@/components/admin/ConfirmarEliminar';
import { Encabezado } from '@/components/admin/Encabezado';
import { NINGUNA, NUEVA, SelectConNuevo } from '@/components/admin/SelectConNuevo';
import { formatearFechaCorta } from '@/lib/biblioteca';
import { api, incluye, useDatosPanel } from '@/lib/panel';

// Deben coincidir con EstadoMaterial en el backend. `atencion` marca lo que hay que revisar o reponer.
const ESTADOS = [
  { clave: 'NUEVO', etiqueta: 'Nuevo', color: 'var(--color-rama-tropa)' },
  { clave: 'BUENO', etiqueta: 'Bueno', color: 'var(--color-rama-tropa)' },
  { clave: 'REGULAR', etiqueta: 'Regular', color: '#d4a106' },
  { clave: 'EN_REPARACION', etiqueta: 'En reparación', color: 'var(--celeste)', atencion: true },
  { clave: 'MALO', etiqueta: 'Malo', color: 'var(--destructive)', atencion: true },
  { clave: 'BAJA', etiqueta: 'De baja', color: '#8a959e' },
];
const estado = (clave) => ESTADOS.find((e) => e.clave === clave);

const TODAS = 'TODAS';
const ATENCION = 'ATENCION';
const VACIO = { id: null, nombre: '', cantidad: '1', estado: 'BUENO', categoriaId: NINGUNA, ubicacionId: NINGUNA, fechaAdquisicion: '', descripcion: '' };

const urlMaps = (direccion) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;

function EstadoBadge({ clave }) {
  const e = estado(clave);
  if (!e) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge variant="outline" className="gap-1.5">
      <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: e.color }} />
      {e.etiqueta}
    </Badge>
  );
}

function FormularioMaterial({ abierto, onCambio, material, categorias, ubicaciones, onGuardado }) {
  const [form, setForm] = useState(VACIO);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [nuevaUbicacion, setNuevaUbicacion] = useState({ nombre: '', direccion: '' });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!abierto) return;
    setError('');
    setNuevaCategoria('');
    setNuevaUbicacion({ nombre: '', direccion: '' });
    setForm(
      material
        ? {
            id: material.id,
            nombre: material.nombre ?? '',
            cantidad: String(material.cantidad ?? 1),
            estado: material.estado ?? 'BUENO',
            categoriaId: material.categoria ? String(material.categoria.id) : NINGUNA,
            ubicacionId: material.ubicacion ? String(material.ubicacion.id) : NINGUNA,
            fechaAdquisicion: material.fechaAdquisicion ?? '',
            descripcion: material.descripcion ?? '',
          }
        : VACIO
    );
  }, [abierto, material]);

  const campo = (nombre) => ({
    id: `material-${nombre}`,
    value: form[nombre],
    onChange: (e) => setForm((f) => ({ ...f, [nombre]: e.target.value })),
  });

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      let categoriaId = form.categoriaId;
      let ubicacionId = form.ubicacionId;
      if (categoriaId === NUEVA) {
        categoriaId = (await api('/api/categorias', { method: 'POST', body: { nombre: nuevaCategoria } })).id;
      }
      if (ubicacionId === NUEVA) {
        ubicacionId = (await api('/api/ubicaciones', { method: 'POST', body: nuevaUbicacion })).id;
      }
      const referencia = (valor) => (valor === NINGUNA ? null : { id: Number(valor) });
      await api('/api/materiales', {
        method: 'POST',
        body: {
          ...(form.id && { id: form.id }),
          nombre: form.nombre,
          cantidad: Number(form.cantidad) || 0,
          estado: form.estado,
          categoria: referencia(categoriaId),
          ubicacion: referencia(ubicacionId),
          fechaAdquisicion: form.fechaAdquisicion || null,
          descripcion: form.descripcion,
        },
      });
      toast.success(form.id ? 'Cambios guardados' : `${form.nombre} quedó en el inventario`);
      onGuardado();
      onCambio(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const incompleto =
    !form.nombre ||
    (form.categoriaId === NUEVA && !nuevaCategoria) ||
    (form.ubicacionId === NUEVA && !nuevaUbicacion.nombre);

  return (
    <Dialog open={abierto} onOpenChange={onCambio}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={guardar} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{form.id ? `Editar ${material?.nombre}` : 'Agregar material'}</DialogTitle>
            <DialogDescription>Registra qué es, cuántos hay, en qué estado están y dónde se guardan.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="material-nombre">Nombre</FieldLabel>
              <Input {...campo('nombre')} placeholder="Carpa iglú 6 personas" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="material-cantidad">Cantidad</FieldLabel>
                <Input {...campo('cantidad')} type="number" min="0" inputMode="numeric" />
              </Field>
              <Field>
                <FieldLabel htmlFor="material-estado">Estado</FieldLabel>
                <Select value={form.estado} onValueChange={(v) => setForm((f) => ({ ...f, estado: v }))}>
                  <SelectTrigger id="material-estado">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {ESTADOS.map((e) => (
                        <SelectItem key={e.clave} value={e.clave}>
                          {e.etiqueta}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="material-categoria">Categoría</FieldLabel>
                <SelectConNuevo
                  id="material-categoria"
                  valor={form.categoriaId}
                  onCambio={(v) => setForm((f) => ({ ...f, categoriaId: v }))}
                  opciones={categorias}
                  vacio="Sin categoría"
                  nuevo="Crear categoría nueva"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="material-ubicacion">Dónde se guarda</FieldLabel>
                <SelectConNuevo
                  id="material-ubicacion"
                  valor={form.ubicacionId}
                  onCambio={(v) => setForm((f) => ({ ...f, ubicacionId: v }))}
                  opciones={ubicaciones}
                  vacio="Sin ubicación"
                  nuevo="Registrar ubicación nueva"
                />
              </Field>
            </div>

            {form.categoriaId === NUEVA && (
              <Field>
                <FieldLabel htmlFor="nueva-categoria">Nombre de la categoría nueva</FieldLabel>
                <Input id="nueva-categoria" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} placeholder="Campismo" />
              </Field>
            )}
            {form.ubicacionId === NUEVA && (
              <div className="grid gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="nueva-ubicacion">Nombre del lugar</FieldLabel>
                  <Input
                    id="nueva-ubicacion"
                    value={nuevaUbicacion.nombre}
                    onChange={(e) => setNuevaUbicacion((u) => ({ ...u, nombre: e.target.value }))}
                    placeholder="Bodega de la sede"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="nueva-direccion">Dirección</FieldLabel>
                  <Input
                    id="nueva-direccion"
                    value={nuevaUbicacion.direccion}
                    onChange={(e) => setNuevaUbicacion((u) => ({ ...u, direccion: e.target.value }))}
                  />
                </Field>
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="material-fechaAdquisicion">Fecha de adquisición</FieldLabel>
              <Input {...campo('fechaAdquisicion')} type="date" />
            </Field>
            <Field>
              <FieldLabel htmlFor="material-descripcion">Notas</FieldLabel>
              <Textarea {...campo('descripcion')} rows={2} placeholder="Marca, color, piezas que le faltan…" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={guardando || incompleto}>
              {guardando && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
              {form.id ? 'Guardar cambios' : 'Agregar al inventario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Inventario() {
  const { materiales, categorias, ubicaciones, estado: carga, recargar } = useDatosPanel({
    materiales: '/api/materiales',
    categorias: '/api/categorias',
    ubicaciones: '/api/ubicaciones',
  });
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState(TODAS);
  const [estadoFiltro, setEstadoFiltro] = useState(TODAS);
  const [editando, setEditando] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const requierenAtencion = materiales.filter((m) => estado(m.estado)?.atencion).length;

  const visibles = useMemo(
    () =>
      materiales
        .filter((m) => categoriaFiltro === TODAS || String(m.categoria?.id) === categoriaFiltro)
        .filter((m) => estadoFiltro === TODAS || (estadoFiltro === ATENCION ? estado(m.estado)?.atencion : m.estado === estadoFiltro))
        .filter((m) => !busqueda || incluye(`${m.nombre} ${m.descripcion ?? ''}`, busqueda))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [materiales, busqueda, categoriaFiltro, estadoFiltro]
  );

  const eliminar = async () => {
    try {
      await api(`/api/materiales/${aEliminar.id}`, { method: 'DELETE' });
      toast.success(`${aEliminar.nombre} salió del inventario`);
      recargar();
    } catch (err) {
      toast.error(err.message);
    }
    setAEliminar(null);
  };

  const hayFiltros = busqueda || categoriaFiltro !== TODAS || estadoFiltro !== TODAS;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Encabezado titulo="Inventario" descripcion="El equipo del grupo: qué hay, en qué estado está y dónde se guarda.">
        <Button onClick={() => setEditando({})}>
          <PlusIcon data-icon="inline-start" />
          Agregar material
        </Button>
      </Encabezado>

      {carga === 'listo' && requierenAtencion > 0 && (
        <Alert>
          <CircleAlertIcon />
          <AlertTitle>{requierenAtencion === 1 ? '1 material necesita atención' : `${requierenAtencion} materiales necesitan atención`}</AlertTitle>
          <AlertDescription>
            Están en mal estado o en reparación.{' '}
            <Button variant="link" className="h-auto p-0" onClick={() => setEstadoFiltro(ATENCION)}>
              Ver cuáles son
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar material" aria-label="Buscar material" className="pl-9" />
        </div>
        <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
          <SelectTrigger className="md:w-48" aria-label="Filtrar por categoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={TODAS}>Todas las categorías</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
          <SelectTrigger className="md:w-44" aria-label="Filtrar por estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={TODAS}>Todos los estados</SelectItem>
              <SelectItem value={ATENCION}>Necesitan atención</SelectItem>
              {ESTADOS.map((e) => (
                <SelectItem key={e.clave} value={e.clave}>
                  {e.etiqueta}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {carga === 'cargando' && <Skeleton className="h-64 w-full" />}

      {carga === 'error' && (
        <Alert>
          <ServerCrashIcon />
          <AlertTitle>No se pudo cargar el inventario</AlertTitle>
          <AlertDescription>El servidor no responde. Vuelve a intentarlo en unos minutos.</AlertDescription>
        </Alert>
      )}

      {carga === 'listo' && visibles.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageIcon />
            </EmptyMedia>
            <EmptyTitle>{hayFiltros ? 'Ningún material coincide' : 'El inventario está vacío'}</EmptyTitle>
            <EmptyDescription>{hayFiltros ? 'Prueba con otra búsqueda o quita los filtros.' : 'Registra la primera carpa, olla o herramienta del grupo.'}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {hayFiltros ? (
              <Button variant="outline" onClick={() => { setBusqueda(''); setCategoriaFiltro(TODAS); setEstadoFiltro(TODAS); }}>
                Quitar filtros
              </Button>
            ) : (
              <Button onClick={() => setEditando({})}>Agregar material</Button>
            )}
          </EmptyContent>
        </Empty>
      )}

      {carga === 'listo' && visibles.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Dónde está</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibles.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="max-w-72">
                    <p className="font-medium">{m.nombre}</p>
                    {(m.descripcion || m.fechaAdquisicion) && (
                      <p className="truncate text-xs text-muted-foreground">
                        {[m.descripcion, m.fechaAdquisicion && `comprado el ${formatearFechaCorta(`${m.fechaAdquisicion}T00:00:00`)}`].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{m.categoria?.nombre ?? <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="text-right tabular-nums">{m.cantidad ?? 0}</TableCell>
                  <TableCell>
                    <EstadoBadge clave={m.estado} />
                  </TableCell>
                  <TableCell>
                    {m.ubicacion ? (
                      m.ubicacion.direccion ? (
                        <a
                          href={urlMaps(m.ubicacion.direccion)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                          title={m.ubicacion.direccion}
                        >
                          <MapPinIcon className="size-3.5 text-muted-foreground" />
                          {m.ubicacion.nombre}
                        </a>
                      ) : (
                        m.ubicacion.nombre
                      )
                    ) : (
                      <span className="text-muted-foreground">Sin registrar</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label={`Editar ${m.nombre}`} onClick={() => setEditando(m)}>
                        <PencilIcon />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Eliminar ${m.nombre}`} onClick={() => setAEliminar(m)}>
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

      <FormularioMaterial
        abierto={editando !== null}
        onCambio={(abierto) => !abierto && setEditando(null)}
        material={editando?.id ? editando : null}
        categorias={categorias}
        ubicaciones={ubicaciones}
        onGuardado={recargar}
      />
      <ConfirmarEliminar
        abierto={!!aEliminar}
        onCambio={(abierto) => !abierto && setAEliminar(null)}
        titulo={`¿Eliminar ${aEliminar?.nombre} del inventario?`}
        descripcion="Si solo se echó a perder, considera marcarlo como “De baja” para conservar el registro."
        accion="Eliminar material"
        onConfirmar={eliminar}
      />
    </div>
  );
}

export default Inventario;
