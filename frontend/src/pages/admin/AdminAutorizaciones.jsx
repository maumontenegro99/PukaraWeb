import { useEffect, useMemo, useState } from 'react';
import { CheckIcon, EyeIcon, FileSignatureIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { authFetch } from '@/helpers/AuthFetch';
import { apiUrl } from '@/lib/api';
import { ESTADOS_AUTORIZACION, formatearFechaCorta, formatearRango, mensajeDeError } from '@/lib/biblioteca';
import { abrirArchivoProtegido } from '@/lib/panel';

const abrirArchivo = (autorizacionId) =>
  abrirArchivoProtegido(`/api/autorizaciones/${autorizacionId}/archivo`).catch((err) => toast.error(err.message));

function EstadoBadge({ autorizacion }) {
  if (!autorizacion) return <Badge variant="outline">Falta</Badge>;
  const e = ESTADOS_AUTORIZACION[autorizacion.estado];
  return <Badge variant={e.variante}>{e.etiqueta}</Badge>;
}

export default function AdminAutorizaciones() {
  const [eventos, setEventos] = useState([]);
  const [eventoId, setEventoId] = useState('');
  const [datosFilas, setDatosFilas] = useState({ eventoId: null, filas: [] });
  const [version, setVersion] = useState(0);
  const [rechazo, setRechazo] = useState(null); // fila a rechazar
  const [observacion, setObservacion] = useState('');

  useEffect(() => {
    authFetch(apiUrl('/api/eventos'))
      .then((res) => res.json())
      .then((data) => {
        // Próximos primero; los que piden autorización arriba.
        const ordenados = [...data].sort(
          (a, b) =>
            Number(!!b.requiereAutorizacion) - Number(!!a.requiereAutorizacion) ||
            new Date(a.fechaInicio) - new Date(b.fechaInicio)
        );
        setEventos(ordenados);
        if (ordenados[0]) setEventoId(String(ordenados[0].id));
      })
      .catch(() => {});
  }, []);

  const evento = eventos.find((e) => String(e.id) === eventoId);

  useEffect(() => {
    if (!eventoId) return;
    authFetch(apiUrl(`/api/autorizaciones/eventos/${eventoId}`))
      .then((res) => res.json())
      .then((filas) => setDatosFilas({ eventoId, filas }))
      .catch(() => setDatosFilas({ eventoId, filas: [] }));
  }, [eventoId, version]);

  const cargando = !!eventoId && datosFilas.eventoId !== eventoId;
  const filas = cargando ? [] : datosFilas.filas;
  const cargarFilas = () => setVersion((v) => v + 1);

  const resumen = useMemo(() => {
    const cuenta = { falta: 0, RECIBIDA: 0, APROBADA: 0, RECHAZADA: 0 };
    filas.forEach((f) => (f.autorizacion ? cuenta[f.autorizacion.estado]++ : cuenta.falta++));
    return cuenta;
  }, [filas]);

  const cambiarRequiere = async (requiere) => {
    const res = await authFetch(apiUrl(`/api/autorizaciones/eventos/${eventoId}/requiere`), {
      method: 'PUT',
      body: JSON.stringify({ requiere }),
    });
    if (!res.ok) return toast.error('No se pudo cambiar la configuración del evento.');
    setEventos((lista) => lista.map((e) => (String(e.id) === eventoId ? { ...e, requiereAutorizacion: requiere } : e)));
    toast.success(requiere ? 'Los apoderados ya pueden enviar su autorización' : 'El evento dejó de recibir autorizaciones');
  };

  const revisar = async (fila, estado, obs) => {
    const res = await authFetch(apiUrl(`/api/autorizaciones/${fila.autorizacion.id}`), {
      method: 'PATCH',
      body: JSON.stringify({ estado, observacion: obs }),
    });
    if (!res.ok) return toast.error(await mensajeDeError(res, 'No se pudo guardar la revisión.'));
    toast.success(estado === 'APROBADA' ? `Autorización de ${fila.nombre} aprobada` : `Autorización de ${fila.nombre} rechazada`);
    setRechazo(null);
    setObservacion('');
    cargarFilas();
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-display text-5xl uppercase">Autorizaciones</h1>
        <p className="mt-2 text-muted-foreground">
          Las que suben los apoderados desde la biblioteca llegan aquí. Solo los dirigentes pueden verlas.
        </p>
      </div>

      {eventos.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSignatureIcon />
            </EmptyMedia>
            <EmptyTitle>No hay eventos</EmptyTitle>
            <EmptyDescription>Crea un campamento o salida en Eventos para pedir autorizaciones.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
            <Field className="md:max-w-sm">
              <FieldLabel htmlFor="evento">Evento</FieldLabel>
              <Select value={eventoId} onValueChange={setEventoId}>
                <SelectTrigger id="evento">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {eventos.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.titulo}
                        {e.requiereAutorizacion ? ' (pide autorización)' : ''}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {evento && <FieldDescription>{formatearRango(evento.fechaInicio, evento.fechaFin)}</FieldDescription>}
            </Field>
            <div className="flex items-center gap-3">
              <Switch id="requiere" checked={!!evento?.requiereAutorizacion} onCheckedChange={cambiarRequiere} />
              <Label htmlFor="requiere" className="leading-snug">
                Pedir autorización a los apoderados
              </Label>
            </div>
          </div>

          {!cargando && filas.length > 0 && (
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{filas.length - resumen.falta} de {filas.length}</strong> enviadas.{' '}
              {resumen.APROBADA} aprobadas, {resumen.RECIBIDA} por revisar, {resumen.RECHAZADA} rechazadas y {resumen.falta} sin enviar.
            </p>
          )}

          {cargando && <Skeleton className="h-48 w-full" />}

          {!cargando && filas.length === 0 && (
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>Nadie convocado</EmptyTitle>
                <EmptyDescription>Las ramas de este evento no tienen integrantes inscritos.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!cargando && filas.length > 0 && (
            <div className="overflow-hidden rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Integrante</TableHead>
                    <TableHead>Rama</TableHead>
                    <TableHead>Enviada por</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filas.map((f) => (
                    <TableRow key={f.miembroId}>
                      <TableCell>
                        <p className="font-medium">{f.nombre}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">{f.documento}</p>
                      </TableCell>
                      <TableCell>{f.rama?.nombre}</TableCell>
                      <TableCell>
                        {f.autorizacion ? (
                          <>
                            <p>{f.autorizacion.nombreApoderado}</p>
                            <p className="text-xs text-muted-foreground">{formatearFechaCorta(f.autorizacion.fechaEnvio)}</p>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Apoderado: {f.apoderado ?? 'sin registrar'}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          <EstadoBadge autorizacion={f.autorizacion} />
                          {f.autorizacion?.observacion && (
                            <span className="max-w-56 text-xs text-muted-foreground">{f.autorizacion.observacion}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {f.autorizacion && (
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => abrirArchivo(f.autorizacion.id)}>
                              <EyeIcon data-icon="inline-start" />
                              Ver
                            </Button>
                            {f.autorizacion.estado !== 'APROBADA' && (
                              <Button variant="outline" size="sm" onClick={() => revisar(f, 'APROBADA')}>
                                <CheckIcon data-icon="inline-start" />
                                Aprobar
                              </Button>
                            )}
                            {f.autorizacion.estado !== 'RECHAZADA' && (
                              <Button variant="ghost" size="sm" onClick={() => setRechazo(f)}>
                                <XIcon data-icon="inline-start" />
                                Rechazar
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      <Dialog open={!!rechazo} onOpenChange={(abierto) => !abierto && setRechazo(null)}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              revisar(rechazo, 'RECHAZADA', observacion);
            }}
            className="flex flex-col gap-6"
          >
            <DialogHeader>
              <DialogTitle>Rechazar autorización de {rechazo?.nombre}</DialogTitle>
              <DialogDescription>El apoderado tendrá que enviarla de nuevo desde la biblioteca.</DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor="observacion">Motivo</FieldLabel>
              <Textarea
                id="observacion"
                rows={3}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Ej: la foto está borrosa y no se lee la firma"
              />
            </Field>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" variant="destructive">
                Rechazar autorización
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
