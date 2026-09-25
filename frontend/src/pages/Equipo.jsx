import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CircleAlertIcon, CircleCheckIcon, FolderOpenIcon, LoaderCircleIcon, PencilIcon, PlusIcon, SearchIcon, ServerCrashIcon, Trash2Icon, UserCogIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmarEliminar } from '@/components/admin/ConfirmarEliminar';
import { DocumentacionDirigente } from '@/components/admin/DocumentacionDirigente';
import { Encabezado } from '@/components/admin/Encabezado';
import { RamaBadge } from '@/components/admin/RamaBadge';
import { DOCUMENTOS, faltantes } from '@/lib/documentacion';
import { api, incluye, useDatosPanel } from '@/lib/panel';
import { cn } from '@/lib/utils';
import { usePerfil } from '@/context/PerfilContext';

const SIN_RAMA = 'SIN_RAMA';
const TODAS = 'TODAS';
const VACIO = {
  id: null, nombres: '', apellidos: '', email: '', telefono: '', cargo: '', fechaNacimiento: '', ramaId: SIN_RAMA,
  ...Object.fromEntries(DOCUMENTOS.map((d) => [d.campo, false])),
};

// Sin `onAbrir` (quien no es administrador no ve los archivos) el estado se muestra sin botón.
function EstadoDocumentos({ dirigente, onAbrir }) {
  const faltan = faltantes(dirigente);
  const Elemento = onAbrir ? 'button' : 'span';
  const accion = onAbrir ? { type: 'button', onClick: onAbrir } : {};
  if (faltan.length === 0) {
    return (
      <Badge asChild variant="secondary" className={cn('gap-1', onAbrir && 'cursor-pointer')}>
        <Elemento {...accion}>
          <CircleCheckIcon />
          Completa
        </Elemento>
      </Badge>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge asChild variant="outline" className={cn('gap-1 border-destructive/40 text-destructive', onAbrir && 'cursor-pointer')}>
          <Elemento {...accion}>
            <CircleAlertIcon />
            Faltan {faltan.length} de {DOCUMENTOS.length}
          </Elemento>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <ul>
          {faltan.map((d) => (
            <li key={d.campo}>{d.etiqueta}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

function FormularioDirigente({ abierto, onCambio, dirigente, ramas, onGuardado }) {
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!abierto) return;
    setError('');
    setForm(
      dirigente
        ? {
            ...VACIO,
            ...Object.fromEntries(Object.keys(VACIO).map((k) => [k, dirigente[k] ?? VACIO[k]])),
            ramaId: dirigente.rama ? String(dirigente.rama.id) : SIN_RAMA,
          }
        : VACIO
    );
  }, [abierto, dirigente]);

  const campo = (nombre) => ({
    id: `dirigente-${nombre}`,
    value: form[nombre],
    onChange: (e) => setForm((f) => ({ ...f, [nombre]: e.target.value })),
  });

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    const { ramaId, ...datos } = form;
    try {
      await api('/api/dirigentes', {
        method: 'POST',
        body: {
          ...datos,
          id: form.id ?? undefined,
          fechaNacimiento: form.fechaNacimiento || null,
          rama: ramaId === SIN_RAMA ? null : { id: Number(ramaId) },
        },
      });
      toast.success(form.id ? 'Cambios guardados' : `${form.nombres} se sumó al equipo`);
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
            <DialogTitle>{form.id ? `Editar a ${dirigente?.nombres}` : 'Agregar dirigente'}</DialogTitle>
            <DialogDescription>Marca lo que entregó en papel. Los archivos se suben desde Documentos.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="dirigente-nombres">Nombres</FieldLabel>
                <Input {...campo('nombres')} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="dirigente-apellidos">Apellidos</FieldLabel>
                <Input {...campo('apellidos')} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="dirigente-cargo">Cargo</FieldLabel>
                <Input {...campo('cargo')} placeholder="Responsable de unidad" />
              </Field>
              <Field>
                <FieldLabel htmlFor="dirigente-rama">Rama</FieldLabel>
                <Select value={form.ramaId} onValueChange={(v) => setForm((f) => ({ ...f, ramaId: v }))}>
                  <SelectTrigger id="dirigente-rama">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={SIN_RAMA}>Sin rama (grupo)</SelectItem>
                      {ramas.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.nombre}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="dirigente-email">Correo</FieldLabel>
                <Input {...campo('email')} type="email" />
              </Field>
              <Field>
                <FieldLabel htmlFor="dirigente-telefono">Teléfono</FieldLabel>
                <Input {...campo('telefono')} type="tel" />
              </Field>
              <Field>
                <FieldLabel htmlFor="dirigente-fechaNacimiento">Fecha de nacimiento</FieldLabel>
                <Input {...campo('fechaNacimiento')} type="date" />
              </Field>
            </div>
            <FieldSet className="rounded-lg border bg-muted/40 p-4">
              <FieldLegend>Documentación entregada</FieldLegend>
              <div className="grid gap-3 sm:grid-cols-2">
                {DOCUMENTOS.map((d) => (
                  <div key={d.campo} className="flex items-center gap-2">
                    <Checkbox
                      id={`doc-${d.campo}`}
                      checked={!!form[d.campo]}
                      onCheckedChange={(v) => setForm((f) => ({ ...f, [d.campo]: v === true }))}
                    />
                    <Label htmlFor={`doc-${d.campo}`} className="font-normal">
                      {d.etiqueta}
                    </Label>
                  </div>
                ))}
              </div>
            </FieldSet>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={guardando || !form.nombres || !form.apellidos}>
              {guardando && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
              {form.id ? 'Guardar cambios' : 'Agregar al equipo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Equipo() {
  const location = useLocation();
  const { esAdmin } = usePerfil();
  const { dirigentes, ramas, estado, recargar } = useDatosPanel({ dirigentes: '/api/dirigentes', ramas: '/api/ramas' });
  const [busqueda, setBusqueda] = useState('');
  const [soloPendientes, setSoloPendientes] = useState(false);
  // Si se llega desde Ramas ("Equipo de unidad"), parte filtrado por esa rama.
  const [ramaFiltro, setRamaFiltro] = useState(() => (location.state?.ramaId ? String(location.state.ramaId) : TODAS));
  // Se guarda el id y se lee de la lista recargada, para que el panel muestre siempre los datos al día.
  const [documentosDe, setDocumentosDe] = useState(null);
  const [editando, setEditando] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const pendientes = dirigentes.filter((d) => faltantes(d).length > 0).length;

  const visibles = useMemo(
    () =>
      dirigentes
        .filter((d) => ramaFiltro === TODAS || (ramaFiltro === SIN_RAMA ? !d.rama : String(d.rama?.id) === ramaFiltro))
        .filter((d) => !soloPendientes || faltantes(d).length > 0)
        .filter((d) => !busqueda || incluye(`${d.nombres} ${d.apellidos} ${d.cargo ?? ''} ${d.rama?.nombre ?? ''}`, busqueda))
        .sort((a, b) => `${a.apellidos} ${a.nombres}`.localeCompare(`${b.apellidos} ${b.nombres}`, 'es')),
    [dirigentes, busqueda, soloPendientes, ramaFiltro]
  );

  const eliminar = async () => {
    try {
      await api(`/api/dirigentes/${aEliminar.id}`, { method: 'DELETE' });
      toast.success(`${aEliminar.nombres} salió del equipo`);
      recargar();
    } catch (err) {
      toast.error(err.message);
    }
    setAEliminar(null);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Encabezado titulo="Dirigentes" descripcion="El equipo adulto del grupo y el estado de su documentación.">
        <Button onClick={() => setEditando({})}>
          <PlusIcon data-icon="inline-start" />
          Agregar dirigente
        </Button>
      </Encabezado>

      {estado === 'listo' && pendientes > 0 && (
        <Alert>
          <CircleAlertIcon />
          <AlertTitle>
            {pendientes === 1 ? '1 dirigente tiene documentación pendiente' : `${pendientes} dirigentes tienen documentación pendiente`}
          </AlertTitle>
          <AlertDescription>Los certificados de antecedentes e inhabilidades son obligatorios para trabajar con menores.</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, cargo o rama"
            aria-label="Buscar dirigentes"
            className="pl-9"
          />
        </div>
        <Select value={ramaFiltro} onValueChange={setRamaFiltro}>
          <SelectTrigger className="sm:w-48" aria-label="Filtrar por rama">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={TODAS}>Todas las ramas</SelectItem>
              {ramas.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.nombre}
                </SelectItem>
              ))}
              <SelectItem value={SIN_RAMA}>Sin rama (grupo)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch id="solo-pendientes" checked={soloPendientes} onCheckedChange={setSoloPendientes} />
          <Label htmlFor="solo-pendientes">Solo con documentación pendiente</Label>
        </div>
      </div>

      {estado === 'cargando' && <Skeleton className="h-64 w-full" />}

      {estado === 'error' && (
        <Alert>
          <ServerCrashIcon />
          <AlertTitle>No se pudo cargar el equipo</AlertTitle>
          <AlertDescription>El servidor no responde. Vuelve a intentarlo en unos minutos.</AlertDescription>
        </Alert>
      )}

      {estado === 'listo' && visibles.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserCogIcon />
            </EmptyMedia>
            <EmptyTitle>{dirigentes.length ? 'Nadie coincide' : 'Todavía no hay dirigentes'}</EmptyTitle>
            <EmptyDescription>
              {dirigentes.length ? 'Prueba con otra búsqueda, otra rama o quita el filtro.' : 'Agrega al primer integrante del equipo adulto.'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {dirigentes.length ? (
              <Button variant="outline" onClick={() => { setBusqueda(''); setRamaFiltro(TODAS); setSoloPendientes(false); }}>
                Quitar filtros
              </Button>
            ) : (
              <Button onClick={() => setEditando({})}>Agregar dirigente</Button>
            )}
          </EmptyContent>
        </Empty>
      )}

      {estado === 'listo' && visibles.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rama</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Documentación</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibles.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <p className="font-medium">
                      {d.nombres} {d.apellidos}
                    </p>
                    <p className="text-xs text-muted-foreground">{d.cargo || 'Sin cargo'}</p>
                  </TableCell>
                  <TableCell>{d.rama ? <RamaBadge rama={d.rama} /> : <span className="text-muted-foreground">Grupo</span>}</TableCell>
                  <TableCell className="text-sm">
                    {d.email || d.telefono ? (
                      <>
                        {d.email && <p>{d.email}</p>}
                        {d.telefono && <p className="tabular-nums text-muted-foreground">{d.telefono}</p>}
                      </>
                    ) : (
                      <span className="text-muted-foreground">Sin datos</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <EstadoDocumentos dirigente={d} onAbrir={esAdmin ? () => setDocumentosDe(d.id) : undefined} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {esAdmin && (
                        <Button variant="ghost" size="sm" onClick={() => setDocumentosDe(d.id)}>
                          <FolderOpenIcon data-icon="inline-start" />
                          Documentos
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" aria-label={`Editar a ${d.nombres}`} onClick={() => setEditando(d)}>
                        <PencilIcon />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Eliminar a ${d.nombres}`} onClick={() => setAEliminar(d)}>
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

      <FormularioDirigente
        abierto={editando !== null}
        onCambio={(abierto) => !abierto && setEditando(null)}
        dirigente={editando?.id ? editando : null}
        ramas={ramas}
        onGuardado={recargar}
      />
      <DocumentacionDirigente
        dirigente={dirigentes.find((d) => d.id === documentosDe) ?? null}
        onCerrar={() => setDocumentosDe(null)}
        onCambio={recargar}
      />
      <ConfirmarEliminar
        abierto={!!aEliminar}
        onCambio={(abierto) => !abierto && setAEliminar(null)}
        titulo={`¿Quitar a ${aEliminar?.nombres} ${aEliminar?.apellidos} del equipo?`}
        descripcion="Se borrará su ficha y todos los archivos de su documentación."
        accion="Quitar del equipo"
        onConfirmar={eliminar}
      />
    </div>
  );
}

export default Equipo;
