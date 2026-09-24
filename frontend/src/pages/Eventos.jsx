import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ClockIcon,
  FileSignatureIcon,
  LoaderCircleIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  ServerCrashIcon,
  Trash2Icon,
} from 'lucide-react';
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
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ConfirmarEliminar } from '@/components/admin/ConfirmarEliminar';
import { Encabezado } from '@/components/admin/Encabezado';
import { RamaBadge, colorDeRama } from '@/components/admin/RamaBadge';
import { NINGUNA, NUEVA, SelectConNuevo } from '@/components/admin/SelectConNuevo';
import { RAMAS } from '@/lib/ramas';
import { api, incluye, useDatosPanel } from '@/lib/panel';

// Deben coincidir con TipoEvento en el backend.
const TIPOS = [
  { clave: 'REUNION', etiqueta: 'Reunión' },
  { clave: 'CAMPAMENTO', etiqueta: 'Campamento' },
  { clave: 'PASEO', etiqueta: 'Salida' },
  { clave: 'CEREMONIA', etiqueta: 'Ceremonia' },
  { clave: 'SERVICIO', etiqueta: 'Servicio' },
  { clave: 'DISTRITAL', etiqueta: 'Distrital' },
  { clave: 'OTRO', etiqueta: 'Otro' },
];
const etiquetaTipo = (clave) => TIPOS.find((t) => t.clave === clave)?.etiqueta ?? 'Evento';
const ORDEN_RAMAS = RAMAS.map((r) => r.clave);

const VACIO = { id: null, titulo: '', tipo: 'REUNION', fechaInicio: '', fechaFin: '', ramaIds: [], ubicacionId: NINGUNA, costo: '', descripcion: '', requiereAutorizacion: false };

const hora = (fecha) => new Date(fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
const diaLargo = (fecha) => new Date(fecha).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

function horario(inicio, fin) {
  if (!inicio) return 'Sin fecha';
  if (!fin) return `${diaLargo(inicio)}, ${hora(inicio)}`;
  const mismoDia = new Date(inicio).toDateString() === new Date(fin).toDateString();
  return mismoDia ? `${hora(inicio)} a ${hora(fin)}` : `Hasta el ${diaLargo(fin)}, ${hora(fin)}`;
}

function FormularioEvento({ abierto, onCambio, evento, ramas, ubicaciones, onGuardado }) {
  const [form, setForm] = useState(VACIO);
  const [nuevaUbicacion, setNuevaUbicacion] = useState({ nombre: '', direccion: '' });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!abierto) return;
    setError('');
    setNuevaUbicacion({ nombre: '', direccion: '' });
    setForm(
      evento
        ? {
            id: evento.id,
            titulo: evento.titulo ?? '',
            tipo: evento.tipo ?? 'REUNION',
            fechaInicio: evento.fechaInicio?.slice(0, 16) ?? '',
            fechaFin: evento.fechaFin?.slice(0, 16) ?? '',
            ramaIds: (evento.ramas ?? []).map((r) => String(r.id)),
            ubicacionId: evento.ubicacion ? String(evento.ubicacion.id) : NINGUNA,
            costo: evento.costo ? String(evento.costo) : '',
            descripcion: evento.descripcion ?? '',
            requiereAutorizacion: !!evento.requiereAutorizacion,
          }
        : VACIO
    );
  }, [abierto, evento]);

  const campo = (nombre) => ({
    id: `evento-${nombre}`,
    value: form[nombre],
    onChange: (e) => setForm((f) => ({ ...f, [nombre]: e.target.value })),
  });

  const finAntesDeInicio = form.fechaInicio && form.fechaFin && form.fechaFin < form.fechaInicio;

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      let ubicacionId = form.ubicacionId;
      if (ubicacionId === NUEVA) {
        ubicacionId = (await api('/api/ubicaciones-eventos', { method: 'POST', body: nuevaUbicacion })).id;
      }
      await api('/api/eventos', {
        method: 'POST',
        body: {
          ...(form.id && { id: form.id }),
          titulo: form.titulo,
          tipo: form.tipo,
          fechaInicio: form.fechaInicio || null,
          fechaFin: form.fechaFin || null,
          ramas: form.ramaIds.map((id) => ({ id: Number(id) })),
          ubicacion: ubicacionId === NINGUNA ? null : { id: Number(ubicacionId) },
          costo: Number(form.costo) || 0,
          descripcion: form.descripcion,
          requiereAutorizacion: form.requiereAutorizacion,
        },
      });
      toast.success(form.id ? 'Cambios guardados' : `${form.titulo} quedó en la agenda`);
      onGuardado();
      onCambio(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={onCambio}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={guardar} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{form.id ? `Editar ${evento?.titulo}` : 'Agendar evento'}</DialogTitle>
            <DialogDescription>Reuniones, salidas y campamentos del grupo o de ramas específicas.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
              <Field>
                <FieldLabel htmlFor="evento-titulo">Nombre</FieldLabel>
                <Input {...campo('titulo')} placeholder="Campamento de invierno" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="evento-tipo">Tipo</FieldLabel>
                <Select value={form.tipo} onValueChange={(v) => setForm((f) => ({ ...f, tipo: v }))}>
                  <SelectTrigger id="evento-tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {TIPOS.map((t) => (
                        <SelectItem key={t.clave} value={t.clave}>
                          {t.etiqueta}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="evento-fechaInicio">Empieza</FieldLabel>
                <Input {...campo('fechaInicio')} type="datetime-local" required />
              </Field>
              <Field data-invalid={finAntesDeInicio || undefined}>
                <FieldLabel htmlFor="evento-fechaFin">Termina</FieldLabel>
                <Input {...campo('fechaFin')} type="datetime-local" min={form.fechaInicio} aria-invalid={finAntesDeInicio || undefined} />
                {finAntesDeInicio && <FieldDescription>Debe ser después del inicio.</FieldDescription>}
              </Field>
            </div>

            <FieldSet>
              <FieldLegend variant="label">Ramas que participan</FieldLegend>
              <FieldDescription>Si no eliges ninguna, es para el grupo completo.</FieldDescription>
              <ToggleGroup
                type="multiple"
                variant="outline"
                value={form.ramaIds}
                onValueChange={(ids) => setForm((f) => ({ ...f, ramaIds: ids }))}
                className="flex-wrap justify-start"
              >
                {ramas.map((r) => (
                  <ToggleGroupItem key={r.id} value={String(r.id)} className="gap-1.5">
                    <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: colorDeRama(r.tipo) }} />
                    {r.nombre}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FieldSet>

            <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
              <Field>
                <FieldLabel htmlFor="evento-ubicacion">Lugar</FieldLabel>
                <SelectConNuevo
                  id="evento-ubicacion"
                  valor={form.ubicacionId}
                  onCambio={(v) => setForm((f) => ({ ...f, ubicacionId: v }))}
                  opciones={ubicaciones}
                  vacio="Por definir"
                  nuevo="Registrar lugar nuevo"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="evento-costo">Costo por persona</FieldLabel>
                <Input {...campo('costo')} type="number" min="0" step="500" inputMode="numeric" placeholder="0" />
              </Field>
            </div>
            {form.ubicacionId === NUEVA && (
              <div className="grid gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="nuevo-lugar">Nombre del lugar</FieldLabel>
                  <Input id="nuevo-lugar" value={nuevaUbicacion.nombre} onChange={(e) => setNuevaUbicacion((u) => ({ ...u, nombre: e.target.value }))} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="nueva-direccion-lugar">Dirección</FieldLabel>
                  <Input id="nueva-direccion-lugar" value={nuevaUbicacion.direccion} onChange={(e) => setNuevaUbicacion((u) => ({ ...u, direccion: e.target.value }))} />
                </Field>
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="evento-descripcion">Descripción</FieldLabel>
              <Textarea {...campo('descripcion')} rows={3} placeholder="Qué llevar, punto de encuentro, horarios…" />
            </Field>

            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Switch
                id="evento-autorizacion"
                checked={form.requiereAutorizacion}
                onCheckedChange={(v) => setForm((f) => ({ ...f, requiereAutorizacion: v }))}
              />
              <div className="flex flex-col gap-1">
                <Label htmlFor="evento-autorizacion">Pedir autorización a los apoderados</Label>
                <p className="text-sm text-muted-foreground">
                  Aparecerá en la biblioteca para que suban el formulario firmado. Publica el formulario en Biblioteca, Documentos.
                </p>
              </div>
            </div>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={guardando || !form.titulo || !form.fechaInicio || finAntesDeInicio || (form.ubicacionId === NUEVA && !nuevaUbicacion.nombre)}
            >
              {guardando && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
              {form.id ? 'Guardar cambios' : 'Agendar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FilaEvento({ evento, onEditar, onEliminar }) {
  const inicio = evento.fechaInicio ? new Date(evento.fechaInicio) : null;
  const ramas = [...(evento.ramas ?? [])].sort((a, b) => ORDEN_RAMAS.indexOf(a.tipo) - ORDEN_RAMAS.indexOf(b.tipo));

  return (
    <li className="flex gap-4 rounded-lg border bg-card p-4">
      <div className="flex w-14 shrink-0 flex-col items-center rounded-md bg-grafito py-2 text-white" aria-hidden="true">
        <span className="text-xs uppercase">{inicio?.toLocaleDateString('es-CL', { weekday: 'short' }).replace('.', '')}</span>
        <span className="font-display text-3xl leading-none">{inicio?.getDate() ?? '?'}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold leading-tight">{evento.titulo}</h3>
          <Badge variant="secondary">{etiquetaTipo(evento.tipo)}</Badge>
          {evento.requiereAutorizacion && (
            <Badge asChild variant="outline" className="gap-1">
              <Link to="/admin/autorizaciones">
                <FileSignatureIcon />
                Pide autorización
              </Link>
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="size-4" />
            {horario(evento.fechaInicio, evento.fechaFin)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPinIcon className="size-4" />
            {evento.ubicacion?.nombre ?? 'Lugar por definir'}
          </span>
          {evento.costo > 0 && <span className="tabular-nums">${evento.costo.toLocaleString('es-CL')} por persona</span>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ramas.length ? ramas.map((r) => <RamaBadge key={r.id} rama={r} />) : <Badge variant="outline">Grupo completo</Badge>}
        </div>
        {evento.descripcion && <p className="line-clamp-2 text-sm text-muted-foreground">{evento.descripcion}</p>}
      </div>
      <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-start">
        <Button variant="ghost" size="icon" aria-label={`Editar ${evento.titulo}`} onClick={() => onEditar(evento)}>
          <PencilIcon />
        </Button>
        <Button variant="ghost" size="icon" aria-label={`Eliminar ${evento.titulo}`} onClick={() => onEliminar(evento)}>
          <Trash2Icon />
        </Button>
      </div>
    </li>
  );
}

function Eventos() {
  const { eventos, ramas, ubicaciones, estado, recargar } = useDatosPanel({
    eventos: '/api/eventos',
    ramas: '/api/ramas',
    ubicaciones: '/api/ubicaciones-eventos',
  });
  const [cuando, setCuando] = useState('proximos');
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const ramasOrdenadas = useMemo(() => [...ramas].sort((a, b) => ORDEN_RAMAS.indexOf(a.tipo) - ORDEN_RAMAS.indexOf(b.tipo)), [ramas]);

  // Agrupa por mes. Próximos: del más cercano al más lejano; pasados: del más reciente al más antiguo.
  const meses = useMemo(() => {
    const ahora = new Date();
    const terminado = (e) => new Date(e.fechaFin ?? e.fechaInicio) < ahora;
    const lista = eventos
      .filter((e) => e.fechaInicio)
      .filter((e) => (cuando === 'proximos' ? !terminado(e) : terminado(e)))
      .filter((e) => !busqueda || incluye(`${e.titulo} ${e.ubicacion?.nombre ?? ''} ${e.descripcion ?? ''}`, busqueda))
      .sort((a, b) => (new Date(a.fechaInicio) - new Date(b.fechaInicio)) * (cuando === 'proximos' ? 1 : -1));
    const grupos = new Map();
    lista.forEach((e) => {
      const mes = new Date(e.fechaInicio).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
      grupos.set(mes, [...(grupos.get(mes) ?? []), e]);
    });
    return [...grupos.entries()];
  }, [eventos, cuando, busqueda]);

  const eliminar = async () => {
    try {
      await api(`/api/eventos/${aEliminar.id}`, { method: 'DELETE' });
      toast.success(`${aEliminar.titulo} salió de la agenda`);
      recargar();
    } catch (err) {
      toast.error(err.message);
    }
    setAEliminar(null);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Encabezado titulo="Eventos" descripcion="La agenda del grupo: reuniones, salidas y campamentos.">
        <Button onClick={() => setEditando({})}>
          <PlusIcon data-icon="inline-start" />
          Agendar evento
        </Button>
      </Encabezado>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <ToggleGroup type="single" variant="outline" value={cuando} onValueChange={(v) => v && setCuando(v)} aria-label="Qué eventos mostrar">
          <ToggleGroupItem value="proximos">Próximos</ToggleGroupItem>
          <ToggleGroupItem value="pasados">Pasados</ToggleGroupItem>
        </ToggleGroup>
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o lugar" aria-label="Buscar eventos" className="pl-9" />
        </div>
      </div>

      {estado === 'cargando' && <Skeleton className="h-64 w-full" />}

      {estado === 'error' && (
        <Alert>
          <ServerCrashIcon />
          <AlertTitle>No se pudo cargar la agenda</AlertTitle>
          <AlertDescription>El servidor no responde. Vuelve a intentarlo en unos minutos.</AlertDescription>
        </Alert>
      )}

      {estado === 'listo' && meses.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarDaysIcon />
            </EmptyMedia>
            <EmptyTitle>
              {busqueda ? 'Ningún evento coincide' : cuando === 'proximos' ? 'No hay eventos próximos' : 'No hay eventos pasados'}
            </EmptyTitle>
            <EmptyDescription>{cuando === 'proximos' ? 'Agenda la próxima reunión o salida del grupo.' : 'Aquí quedarán los eventos que ya terminaron.'}</EmptyDescription>
          </EmptyHeader>
          {cuando === 'proximos' && !busqueda && (
            <EmptyContent>
              <Button onClick={() => setEditando({})}>Agendar evento</Button>
            </EmptyContent>
          )}
        </Empty>
      )}

      {meses.map(([mes, lista]) => (
        <section key={mes} className="flex flex-col gap-3">
          <h2 className="font-display text-2xl uppercase text-muted-foreground">{mes}</h2>
          <ul className="flex flex-col gap-3">
            {lista.map((e) => (
              <FilaEvento key={e.id} evento={e} onEditar={setEditando} onEliminar={setAEliminar} />
            ))}
          </ul>
        </section>
      ))}

      <FormularioEvento
        abierto={editando !== null}
        onCambio={(abierto) => !abierto && setEditando(null)}
        evento={editando?.id ? editando : null}
        ramas={ramasOrdenadas}
        ubicaciones={ubicaciones}
        onGuardado={recargar}
      />
      <ConfirmarEliminar
        abierto={!!aEliminar}
        onCambio={(abierto) => !abierto && setAEliminar(null)}
        titulo={`¿Eliminar ${aEliminar?.titulo}?`}
        descripcion="Saldrá de la agenda del grupo."
        accion="Eliminar evento"
        onConfirmar={eliminar}
      />
    </div>
  );
}

export default Eventos;
