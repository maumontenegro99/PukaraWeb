import { useEffect, useMemo, useState } from 'react';
import { LoaderCircleIcon, SearchIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { colorDeRama } from '@/components/admin/RamaBadge';
import { RAMAS } from '@/lib/ramas';
import { TIPOS_COBRO } from '@/lib/pagos';
import { api, incluye } from '@/lib/panel';

const ORDEN_RAMAS = RAMAS.map((r) => r.clave);
const VACIO = {
  tipo: 'CUOTA', eventoId: '', nombre: '', descripcion: '', monto: '', fechaLimite: '',
  alcance: 'grupo', ramaIds: [], miembroIds: [], activo: true,
};

function desdeCobro(c) {
  const alcance = c.miembros.length ? 'integrantes' : c.ramas.length ? 'ramas' : 'grupo';
  return {
    tipo: c.tipo,
    eventoId: c.eventoId ? String(c.eventoId) : '',
    nombre: c.nombre,
    descripcion: c.descripcion ?? '',
    monto: String(c.monto),
    fechaLimite: c.fechaLimite ?? '',
    alcance,
    ramaIds: c.ramas.map((r) => String(r.id)),
    miembroIds: c.miembros.map((m) => m.id),
    activo: c.activo,
  };
}

// Crear o editar un cobro. `cobro` es el CobroDto a editar, o null para crear uno nuevo.
export function FormularioCobro({ abierto, onCambio, cobro, onGuardado }) {
  const [form, setForm] = useState(VACIO);
  const [catalogo, setCatalogo] = useState({ ramas: [], eventos: [], miembros: [] });
  const [buscarIntegrante, setBuscarIntegrante] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!abierto) return;
    setForm(cobro ? desdeCobro(cobro) : VACIO);
    setError('');
    setBuscarIntegrante('');
    Promise.all([api('/api/ramas'), api('/api/eventos'), api('/api/miembros')])
      .then(([ramas, eventos, miembros]) =>
        setCatalogo({
          ramas: [...ramas].sort((a, b) => ORDEN_RAMAS.indexOf(a.tipo) - ORDEN_RAMAS.indexOf(b.tipo)),
          eventos: [...eventos].sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio)),
          miembros: [...miembros].sort((a, b) => `${a.apellidos} ${a.nombres}`.localeCompare(`${b.apellidos} ${b.nombres}`, 'es')),
        })
      )
      .catch((err) => setError(err.message));
  }, [abierto, cobro]);

  const cambiar = (campo) => (valor) => setForm((f) => ({ ...f, [campo]: valor }));

  // Al elegir un evento se completan nombre, monto y ramas con sus datos.
  const elegirEvento = (id) => {
    const evento = catalogo.eventos.find((e) => String(e.id) === id);
    setForm((f) => ({
      ...f,
      eventoId: id,
      nombre: evento?.titulo ?? f.nombre,
      monto: evento?.costo ? String(evento.costo) : f.monto,
      alcance: evento?.ramas?.length ? 'ramas' : 'grupo',
      ramaIds: (evento?.ramas ?? []).map((r) => String(r.id)),
    }));
  };

  const alternarIntegrante = (id, marcado) =>
    setForm((f) => ({ ...f, miembroIds: marcado ? [...f.miembroIds, id] : f.miembroIds.filter((x) => x !== id) }));

  const integrantesVisibles = useMemo(
    () => catalogo.miembros.filter((m) => !buscarIntegrante || incluye(`${m.nombres} ${m.apellidos} ${m.rama?.nombre ?? ''}`, buscarIntegrante)),
    [catalogo.miembros, buscarIntegrante]
  );

  const incompleto =
    !form.nombre ||
    !(Number(form.monto) > 0) ||
    (form.tipo === 'EVENTO' && !form.eventoId) ||
    (form.alcance === 'ramas' && form.ramaIds.length === 0) ||
    (form.alcance === 'integrantes' && form.miembroIds.length === 0);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    const cuerpo = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      tipo: form.tipo,
      monto: Number(form.monto),
      fechaLimite: form.fechaLimite || null,
      eventoId: form.tipo === 'EVENTO' ? Number(form.eventoId) : null,
      ramaIds: form.alcance === 'ramas' ? form.ramaIds.map(Number) : [],
      miembroIds: form.alcance === 'integrantes' ? form.miembroIds : [],
      activo: form.activo,
    };
    try {
      const guardado = cobro
        ? await api(`/api/pagos/cobros/${cobro.id}`, { method: 'PUT', body: cuerpo })
        : await api('/api/pagos/cobros', { method: 'POST', body: cuerpo });
      toast.success(cobro ? 'Cobro actualizado' : `${guardado.nombre} quedó abierto para recibir pagos`);
      onGuardado(guardado);
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
            <DialogTitle>{cobro ? `Editar ${cobro.nombre}` : 'Nuevo cobro'}</DialogTitle>
            <DialogDescription>Mientras esté abierto, las familias verán este cobro en la biblioteca y podrán enviar su comprobante.</DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FieldSet>
              <FieldLegend variant="label">Qué se cobra</FieldLegend>
              <ToggleGroup
                type="single"
                variant="outline"
                value={form.tipo}
                onValueChange={(v) => v && setForm((f) => ({ ...f, tipo: v }))}
                className="w-full"
              >
                {TIPOS_COBRO.map((t) => (
                  <ToggleGroupItem key={t.clave} value={t.clave} className="flex-1">
                    {t.etiqueta}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <FieldDescription>{TIPOS_COBRO.find((t) => t.clave === form.tipo)?.ayuda}</FieldDescription>
            </FieldSet>

            {form.tipo === 'EVENTO' && (
              <Field>
                <FieldLabel htmlFor="cobro-evento">Evento</FieldLabel>
                <Select value={form.eventoId} onValueChange={elegirEvento}>
                  <SelectTrigger id="cobro-evento">
                    <SelectValue placeholder="Elige el campamento o salida" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {catalogo.eventos.map((e) => (
                        <SelectItem key={e.id} value={String(e.id)}>
                          {e.titulo}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>Se completan el nombre, el costo y las ramas del evento. Puedes cambiarlos.</FieldDescription>
              </Field>
            )}

            <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
              <Field>
                <FieldLabel htmlFor="cobro-nombre">Nombre</FieldLabel>
                <Input id="cobro-nombre" value={form.nombre} onChange={(e) => cambiar('nombre')(e.target.value)} placeholder="Cuota de noviembre" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="cobro-monto">Monto por integrante</FieldLabel>
                <Input
                  id="cobro-monto"
                  type="number"
                  min="1"
                  step="100"
                  inputMode="numeric"
                  value={form.monto}
                  onChange={(e) => cambiar('monto')(e.target.value)}
                  placeholder="5000"
                  required
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="cobro-descripcion">Descripción</FieldLabel>
              <Textarea
                id="cobro-descripcion"
                rows={2}
                value={form.descripcion}
                onChange={(e) => cambiar('descripcion')(e.target.value)}
                placeholder="Qué incluye, si se puede pagar en abonos…"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="cobro-fecha">Fecha límite</FieldLabel>
              <Input id="cobro-fecha" type="date" value={form.fechaLimite} onChange={(e) => cambiar('fechaLimite')(e.target.value)} />
              <FieldDescription>Opcional. Se muestra a las familias; no bloquea pagos posteriores.</FieldDescription>
            </Field>

            <FieldSet>
              <FieldLegend variant="label">A quién se cobra</FieldLegend>
              <ToggleGroup
                type="single"
                variant="outline"
                value={form.alcance}
                onValueChange={(v) => v && setForm((f) => ({ ...f, alcance: v }))}
                className="w-full"
              >
                <ToggleGroupItem value="grupo" className="flex-1">Todo el grupo</ToggleGroupItem>
                <ToggleGroupItem value="ramas" className="flex-1">Algunas ramas</ToggleGroupItem>
                <ToggleGroupItem value="integrantes" className="flex-1">Integrantes</ToggleGroupItem>
              </ToggleGroup>

              {form.alcance === 'ramas' && (
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  value={form.ramaIds}
                  onValueChange={cambiar('ramaIds')}
                  className="flex-wrap justify-start"
                  aria-label="Ramas a las que se cobra"
                >
                  {catalogo.ramas.map((r) => (
                    <ToggleGroupItem key={r.id} value={String(r.id)} className="gap-1.5">
                      <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: colorDeRama(r.tipo) }} />
                      {r.nombre}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}

              {form.alcance === 'integrantes' && (
                <div className="flex flex-col gap-2 rounded-lg border p-3">
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      value={buscarIntegrante}
                      onChange={(e) => setBuscarIntegrante(e.target.value)}
                      placeholder="Buscar integrante"
                      aria-label="Buscar integrante"
                      className="pl-9"
                    />
                  </div>
                  <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                    {integrantesVisibles.map((m) => (
                      <li key={m.id} className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted">
                        <Checkbox
                          id={`integrante-${m.id}`}
                          checked={form.miembroIds.includes(m.id)}
                          onCheckedChange={(v) => alternarIntegrante(m.id, v === true)}
                        />
                        <Label htmlFor={`integrante-${m.id}`} className="flex-1 font-normal">
                          {m.apellidos}, {m.nombres}
                          {m.rama && <span className="text-muted-foreground"> ({m.rama.nombre})</span>}
                        </Label>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    {form.miembroIds.length === 1 ? '1 integrante elegido' : `${form.miembroIds.length} integrantes elegidos`}
                  </p>
                </div>
              )}
            </FieldSet>

            {cobro && (
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Switch id="cobro-activo" checked={form.activo} onCheckedChange={cambiar('activo')} />
                <Label htmlFor="cobro-activo">Recibiendo pagos</Label>
              </div>
            )}
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={guardando || incompleto}>
              {guardando && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
              {cobro ? 'Guardar cambios' : 'Crear cobro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
