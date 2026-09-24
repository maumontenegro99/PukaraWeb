import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  LoaderCircleIcon,
  MailIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  ServerCrashIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmarEliminar } from '@/components/admin/ConfirmarEliminar';
import { Encabezado } from '@/components/admin/Encabezado';
import { RamaBadge } from '@/components/admin/RamaBadge';
import { api, calcularEdad, incluye, useDatosPanel } from '@/lib/panel';

const NINGUNO = 'NINGUNO';
const NUEVO = 'NUEVO';
const TODAS = 'TODAS';

const MIEMBRO_VACIO = { id: null, nombres: '', apellidos: '', documentoIdentidad: '', fechaNacimiento: '', telefonoApoderado: '', direccion: '', ramaId: '', apoderadoId: NINGUNO };
const APODERADO_VACIO = { id: null, nombres: '', apellidos: '', email: '', telefono: '', direccion: '' };

const COLUMNAS_ORDENABLES = {
  nombre: (m) => `${m.apellidos} ${m.nombres}`.toLowerCase(),
  rama: (m) => m.rama?.nombre ?? '',
  edad: (m) => calcularEdad(m.fechaNacimiento) ?? -1,
  apoderado: (m) => (m.apoderado ? `${m.apoderado.apellidos} ${m.apoderado.nombres}`.toLowerCase() : ''),
};

function CabeceraOrdenable({ columna, orden, onOrdenar, children }) {
  const activa = orden.columna === columna;
  const Icono = !activa ? ArrowUpDownIcon : orden.asc ? ArrowUpIcon : ArrowDownIcon;
  return (
    <TableHead aria-sort={activa ? (orden.asc ? 'ascending' : 'descending') : 'none'}>
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => onOrdenar(columna)}>
        {children}
        <Icono data-icon="inline-end" className={activa ? '' : 'opacity-40'} />
      </Button>
    </TableHead>
  );
}

function FormularioMiembro({ abierto, onCambio, miembro, ramas, apoderados, onGuardado }) {
  const [form, setForm] = useState(MIEMBRO_VACIO);
  const [apoderado, setApoderado] = useState(null); // null = sin formulario de apoderado; objeto = crear/editar
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!abierto) return;
    setError('');
    setApoderado(null);
    setForm(
      miembro
        ? {
            id: miembro.id,
            nombres: miembro.nombres ?? '',
            apellidos: miembro.apellidos ?? '',
            documentoIdentidad: miembro.documentoIdentidad ?? '',
            fechaNacimiento: miembro.fechaNacimiento ?? '',
            telefonoApoderado: miembro.telefonoApoderado ?? '',
            direccion: miembro.direccion ?? '',
            ramaId: miembro.rama ? String(miembro.rama.id) : '',
            apoderadoId: miembro.apoderado ? String(miembro.apoderado.id) : NINGUNO,
          }
        : MIEMBRO_VACIO
    );
  }, [abierto, miembro]);

  const campo = (nombre) => ({
    id: `miembro-${nombre}`,
    value: form[nombre],
    onChange: (e) => setForm((f) => ({ ...f, [nombre]: e.target.value })),
  });
  const campoApoderado = (nombre) => ({
    id: `apoderado-${nombre}`,
    value: apoderado?.[nombre] ?? '',
    onChange: (e) => setApoderado((a) => ({ ...a, [nombre]: e.target.value })),
  });

  const elegirApoderado = (valor) => {
    if (valor === NUEVO) {
      setApoderado(APODERADO_VACIO);
      setForm((f) => ({ ...f, apoderadoId: NINGUNO }));
    } else {
      setApoderado(null);
      setForm((f) => ({ ...f, apoderadoId: valor }));
    }
  };

  const editarApoderadoActual = () => {
    const actual = apoderados.find((a) => String(a.id) === form.apoderadoId);
    if (actual) setApoderado({ ...APODERADO_VACIO, ...actual });
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      let apoderadoId = form.apoderadoId === NINGUNO ? null : Number(form.apoderadoId);
      if (apoderado) {
        const guardado = await api('/api/apoderados', { method: 'POST', body: apoderado });
        apoderadoId = guardado.id;
      }
      await api('/api/miembros', {
        method: 'POST',
        body: {
          ...(form.id && { id: form.id }),
          nombres: form.nombres,
          apellidos: form.apellidos,
          documentoIdentidad: form.documentoIdentidad || null,
          fechaNacimiento: form.fechaNacimiento || null,
          telefonoApoderado: form.telefonoApoderado,
          direccion: form.direccion,
          rama: form.ramaId ? { id: Number(form.ramaId) } : null,
          apoderado: apoderadoId ? { id: apoderadoId } : null,
        },
      });
      toast.success(form.id ? 'Cambios guardados' : `${form.nombres} quedó inscrito`);
      onGuardado();
      onCambio(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const editandoApoderado = apoderado?.id;

  return (
    <Dialog open={abierto} onOpenChange={onCambio}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={guardar} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{form.id ? `Editar a ${miembro?.nombres ?? 'miembro'}` : 'Inscribir miembro'}</DialogTitle>
            <DialogDescription>Los campos de nombre, fecha de nacimiento y rama son obligatorios.</DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="miembro-nombres">Nombres</FieldLabel>
                <Input {...campo('nombres')} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="miembro-apellidos">Apellidos</FieldLabel>
                <Input {...campo('apellidos')} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="miembro-documentoIdentidad">RUT</FieldLabel>
                <Input {...campo('documentoIdentidad')} placeholder="12.345.678-9" />
              </Field>
              <Field>
                <FieldLabel htmlFor="miembro-fechaNacimiento">Fecha de nacimiento</FieldLabel>
                <Input {...campo('fechaNacimiento')} type="date" required />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="miembro-rama">Rama</FieldLabel>
              <Select value={form.ramaId} onValueChange={(v) => setForm((f) => ({ ...f, ramaId: v }))}>
                <SelectTrigger id="miembro-rama">
                  <SelectValue placeholder="Elige una rama" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ramas.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.nombre}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <FieldSet className="rounded-lg border bg-muted/40 p-4">
              <FieldLegend>Apoderado</FieldLegend>
              <div className="flex gap-2">
                <Select value={apoderado && !editandoApoderado ? NUEVO : form.apoderadoId} onValueChange={elegirApoderado}>
                  <SelectTrigger aria-label="Apoderado" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={NINGUNO}>Sin apoderado</SelectItem>
                      <SelectItem value={NUEVO}>Registrar un apoderado nuevo</SelectItem>
                    </SelectGroup>
                    {apoderados.length > 0 && <SelectSeparator />}
                    <SelectGroup>
                      {apoderados.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.nombres} {a.apellidos}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {form.apoderadoId !== NINGUNO && !apoderado && (
                  <Button type="button" variant="outline" onClick={editarApoderadoActual}>
                    <PencilIcon data-icon="inline-start" />
                    Editar datos
                  </Button>
                )}
              </div>

              {apoderado && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <p className="text-sm text-muted-foreground sm:col-span-2">
                    {editandoApoderado ? 'Los cambios se aplican a todos sus hijos inscritos.' : 'Se guardará junto con el miembro.'}
                  </p>
                  <Field>
                    <FieldLabel htmlFor="apoderado-nombres">Nombres</FieldLabel>
                    <Input {...campoApoderado('nombres')} required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="apoderado-apellidos">Apellidos</FieldLabel>
                    <Input {...campoApoderado('apellidos')} required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="apoderado-telefono">Teléfono</FieldLabel>
                    <Input {...campoApoderado('telefono')} type="tel" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="apoderado-email">Correo</FieldLabel>
                    <Input {...campoApoderado('email')} type="email" />
                  </Field>
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="apoderado-direccion">Dirección</FieldLabel>
                    <Input {...campoApoderado('direccion')} />
                  </Field>
                </div>
              )}
            </FieldSet>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="miembro-telefonoApoderado">Teléfono de emergencia</FieldLabel>
                <Input {...campo('telefonoApoderado')} type="tel" />
                <FieldDescription>Si es distinto al del apoderado.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="miembro-direccion">Dirección</FieldLabel>
                <Input {...campo('direccion')} />
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={guardando || !form.nombres || !form.apellidos || !form.fechaNacimiento || !form.ramaId}>
              {guardando && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
              {form.id ? 'Guardar cambios' : 'Inscribir'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const DatoIcono = ({ icono }) => {
  const Icono = icono;
  return <Icono className="mt-0.5 size-4 shrink-0 text-muted-foreground" />;
};

function ContactoApoderado({ apoderado, onCerrar }) {
  const datos = [
    { icono: PhoneIcon, etiqueta: 'Teléfono', valor: apoderado?.telefono, href: apoderado?.telefono && `tel:${apoderado.telefono}` },
    { icono: MailIcon, etiqueta: 'Correo', valor: apoderado?.email, href: apoderado?.email && `mailto:${apoderado.email}` },
    { icono: MapPinIcon, etiqueta: 'Dirección', valor: apoderado?.direccion },
  ];
  return (
    <Dialog open={!!apoderado} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {apoderado?.nombres} {apoderado?.apellidos}
          </DialogTitle>
          <DialogDescription>Datos de contacto del apoderado</DialogDescription>
        </DialogHeader>
        <dl className="flex flex-col gap-4">
          {datos.map(({ icono, etiqueta, valor, href }) => (
            <div key={etiqueta} className="flex items-start gap-3">
              <DatoIcono icono={icono} />
              <div>
                <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
                <dd className="font-medium">
                  {valor ? href ? <a href={href} className="underline underline-offset-4">{valor}</a> : valor : <span className="text-muted-foreground">No registrado</span>}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}

function Miembros() {
  const navigate = useNavigate();
  const location = useLocation();
  const { miembros, ramas, apoderados, estado, recargar } = useDatosPanel({
    miembros: '/api/miembros',
    ramas: '/api/ramas',
    apoderados: '/api/apoderados',
  });

  const [busqueda, setBusqueda] = useState('');
  // Si se llega desde Ramas con una rama elegida, parte filtrado por ella.
  const [ramaFiltro, setRamaFiltro] = useState(() => (location.state?.ramaId ? String(location.state.ramaId) : TODAS));
  const [orden, setOrden] = useState({ columna: 'nombre', asc: true });
  const [editando, setEditando] = useState(null); // null cerrado | {} nuevo | miembro
  const [contacto, setContacto] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const visibles = useMemo(() => {
    const clave = COLUMNAS_ORDENABLES[orden.columna];
    return miembros
      .filter((m) => ramaFiltro === TODAS || String(m.rama?.id) === ramaFiltro)
      .filter((m) => !busqueda || incluye(`${m.nombres} ${m.apellidos} ${m.documentoIdentidad ?? ''}`, busqueda))
      .sort((a, b) => {
        const [x, y] = [clave(a), clave(b)];
        return (x < y ? -1 : x > y ? 1 : 0) * (orden.asc ? 1 : -1);
      });
  }, [miembros, busqueda, ramaFiltro, orden]);

  const ordenar = (columna) => setOrden((o) => ({ columna, asc: o.columna === columna ? !o.asc : true }));

  const eliminar = async () => {
    try {
      await api(`/api/miembros/${aEliminar.id}`, { method: 'DELETE' });
      toast.success(`${aEliminar.nombres} ya no figura como miembro`);
      recargar();
    } catch (err) {
      toast.error(err.message);
    }
    setAEliminar(null);
  };

  const hayFiltros = busqueda || ramaFiltro !== TODAS;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Encabezado titulo="Miembros" descripcion="Niñas, niños y jóvenes inscritos en el grupo, con su rama y apoderado.">
        <Button onClick={() => setEditando({})}>
          <PlusIcon data-icon="inline-start" />
          Inscribir miembro
        </Button>
      </Encabezado>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o RUT"
            aria-label="Buscar miembros"
            className="pl-9"
          />
        </div>
        <Select value={ramaFiltro} onValueChange={setRamaFiltro}>
          <SelectTrigger className="sm:w-52" aria-label="Filtrar por rama">
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
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {estado === 'cargando' && <Skeleton className="h-64 w-full" />}

      {estado === 'error' && (
        <Alert>
          <ServerCrashIcon />
          <AlertTitle>No se pudieron cargar los miembros</AlertTitle>
          <AlertDescription>El servidor no responde. Vuelve a intentarlo en unos minutos.</AlertDescription>
        </Alert>
      )}

      {estado === 'listo' && visibles.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>{hayFiltros ? 'Nadie coincide con la búsqueda' : 'Todavía no hay miembros'}</EmptyTitle>
            <EmptyDescription>
              {hayFiltros ? 'Prueba con otro nombre u otra rama.' : 'Inscribe a la primera niña, niño o joven del grupo.'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {hayFiltros ? (
              <Button variant="outline" onClick={() => { setBusqueda(''); setRamaFiltro(TODAS); }}>
                Quitar filtros
              </Button>
            ) : (
              <Button onClick={() => setEditando({})}>Inscribir miembro</Button>
            )}
          </EmptyContent>
        </Empty>
      )}

      {estado === 'listo' && visibles.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            {visibles.length === miembros.length ? `${miembros.length} miembros` : `${visibles.length} de ${miembros.length} miembros`}
          </p>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <CabeceraOrdenable columna="nombre" orden={orden} onOrdenar={ordenar}>Nombre</CabeceraOrdenable>
                  <CabeceraOrdenable columna="rama" orden={orden} onOrdenar={ordenar}>Rama</CabeceraOrdenable>
                  <CabeceraOrdenable columna="edad" orden={orden} onOrdenar={ordenar}>Edad</CabeceraOrdenable>
                  <CabeceraOrdenable columna="apoderado" orden={orden} onOrdenar={ordenar}>Apoderado</CabeceraOrdenable>
                  <TableHead>Emergencia</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibles.map((m) => {
                  const edad = calcularEdad(m.fechaNacimiento);
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <p className="font-medium">
                          {m.apellidos}, {m.nombres}
                        </p>
                        {m.documentoIdentidad && <p className="text-xs text-muted-foreground tabular-nums">{m.documentoIdentidad}</p>}
                      </TableCell>
                      <TableCell>
                        {m.rama ? (
                          <button
                            type="button"
                            onClick={() => navigate('/admin/ramas', { state: { selectedRamaId: m.rama.id } })}
                            className="rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                            aria-label={`Ver la rama ${m.rama.nombre}`}
                          >
                            <RamaBadge rama={m.rama} className="cursor-pointer gap-1.5 hover:bg-muted" />
                          </button>
                        ) : (
                          <RamaBadge rama={null} />
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums">{edad === null ? '—' : `${edad} años`}</TableCell>
                      <TableCell>
                        {m.apoderado ? (
                          <Button variant="link" className="h-auto p-0" onClick={() => setContacto(m.apoderado)}>
                            {m.apoderado.nombres} {m.apoderado.apellidos}
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums">{m.telefonoApoderado || m.apoderado?.telefono || '—'}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" aria-label={`Editar a ${m.nombres}`} onClick={() => setEditando(m)}>
                            <PencilIcon />
                          </Button>
                          <Button variant="ghost" size="icon" aria-label={`Eliminar a ${m.nombres}`} onClick={() => setAEliminar(m)}>
                            <Trash2Icon />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <FormularioMiembro
        abierto={editando !== null}
        onCambio={(abierto) => !abierto && setEditando(null)}
        miembro={editando?.id ? editando : null}
        ramas={ramas}
        apoderados={apoderados}
        onGuardado={recargar}
      />
      <ContactoApoderado apoderado={contacto} onCerrar={() => setContacto(null)} />
      <ConfirmarEliminar
        abierto={!!aEliminar}
        onCambio={(abierto) => !abierto && setAEliminar(null)}
        titulo={`¿Eliminar a ${aEliminar?.nombres} ${aEliminar?.apellidos}?`}
        descripcion="Se borrará su ficha del grupo. Su apoderado seguirá registrado."
        accion="Eliminar miembro"
        onConfirmar={eliminar}
      />
    </div>
  );
}

export default Miembros;
