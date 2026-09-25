import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, FileSpreadsheetIcon, PencilIcon, PlusIcon, SearchXIcon, ServerCrashIcon, Trash2Icon, Undo2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ConfirmarEliminar } from '@/components/admin/ConfirmarEliminar';
import { RamaBadge } from '@/components/admin/RamaBadge';
import { FormularioCobro } from '@/components/pagos/FormularioCobro';
import { DetallePago } from '@/components/pagos/HistorialPagos';
import { RegistrarPago } from '@/components/pagos/RegistrarPago';
import { AccionesRevision } from '@/components/pagos/RevisionPago';
import { formatearFechaCorta } from '@/lib/biblioteca';
import {
  ESTADOS_DEUDA,
  ESTADOS_PAGO,
  descargarPlanilla,
  etiquetaTipoCobro,
  formatearFechaLimite,
  formatearPesos,
  nombreArchivo,
  porcentaje,
} from '@/lib/pagos';
import { api } from '@/lib/panel';

function Dato({ etiqueta, children }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card p-4">
      <dt className="text-sm text-muted-foreground">{etiqueta}</dt>
      <dd className="text-2xl font-semibold tabular-nums">{children}</dd>
    </div>
  );
}

export default function AdminCobro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [respuesta, setRespuesta] = useState({ id: null, detalle: null, estado: 'cargando' });
  const [version, setVersion] = useState(0);
  const [filtro, setFiltro] = useState('todos');
  const [editando, setEditando] = useState(false);
  const [registrarDe, setRegistrarDe] = useState(null);
  const [anularPago, setAnularPago] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    api(`/api/pagos/cobros/${id}`)
      .then((detalle) => setRespuesta({ id, detalle, estado: 'listo' }))
      .catch((err) => setRespuesta({ id, detalle: null, estado: err.message.includes('ya no existe') ? 'no-existe' : 'error' }));
  }, [id, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  const estado = respuesta.id === id ? respuesta.estado : 'cargando';
  const detalle = respuesta.id === id ? respuesta.detalle : null;
  const cobro = detalle?.cobro;

  const integrantes = useMemo(() => {
    const lista = detalle?.integrantes ?? [];
    if (filtro === 'pendientes') return lista.filter((i) => i.estado !== 'PAGADO');
    if (filtro === 'pagados') return lista.filter((i) => i.estado === 'PAGADO');
    return lista;
  }, [detalle, filtro]);

  const cambiarActivo = async () => {
    try {
      await api(`/api/pagos/cobros/${cobro.id}`, {
        method: 'PUT',
        body: {
          nombre: cobro.nombre,
          descripcion: cobro.descripcion,
          tipo: cobro.tipo,
          monto: cobro.monto,
          fechaLimite: cobro.fechaLimite,
          eventoId: cobro.eventoId,
          ramaIds: cobro.ramas.map((r) => r.id),
          miembroIds: cobro.miembros.map((m) => m.id),
          activo: !cobro.activo,
        },
      });
      toast.success(cobro.activo ? 'Cobro cerrado: ya no aparece en la biblioteca' : 'Cobro reabierto');
      recargar();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const eliminar = async () => {
    try {
      await api(`/api/pagos/cobros/${cobro.id}`, { method: 'DELETE' });
      toast.success('Cobro eliminado');
      navigate('/admin/pagos');
    } catch (err) {
      toast.error(err.message);
    }
    setEliminando(false);
  };

  const anular = async () => {
    try {
      await api(`/api/pagos/${anularPago.id}`, { method: 'DELETE' });
      toast.success('Pago anulado');
      recargar();
    } catch (err) {
      toast.error(err.message);
    }
    setAnularPago(null);
  };

  const volver = (
    <Button asChild variant="ghost" className="-ml-3 w-fit">
      <Link to="/admin/pagos">
        <ArrowLeftIcon data-icon="inline-start" />
        Todos los cobros
      </Link>
    </Button>
  );

  if (estado === 'cargando') return <Skeleton className="mx-auto h-96 w-full max-w-6xl" />;

  if (estado !== 'listo') {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {volver}
        {estado === 'no-existe' ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchXIcon />
              </EmptyMedia>
              <EmptyTitle>Este cobro ya no existe</EmptyTitle>
              <EmptyDescription>Puede que otro administrador lo haya eliminado.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link to="/admin/pagos">Ver los cobros</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <Alert>
            <ServerCrashIcon />
            <AlertTitle>No se pudo cargar el cobro</AlertTitle>
            <AlertDescription>El servidor no responde. Vuelve a intentarlo en unos minutos.</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  const { resumen } = cobro;
  const pendientes = detalle.integrantes.filter((i) => i.estado !== 'PAGADO').length;

  const descargarIntegrantes = () =>
    descargarPlanilla(
      `${nombreArchivo(cobro.nombre)}.csv`,
      [
        { titulo: 'Integrante', valor: (i) => i.miembro.nombre },
        { titulo: 'RUT', valor: (i) => i.miembro.documento },
        { titulo: 'Rama', valor: (i) => i.miembro.rama?.nombre },
        { titulo: 'Estado', valor: (i) => ESTADOS_DEUDA[i.estado].etiqueta },
        { titulo: 'Pagado', valor: (i) => i.pagado },
        { titulo: 'Falta', valor: (i) => i.saldo },
        { titulo: 'Comprobante por revisar', valor: (i) => (i.enRevision ? 'Sí' : 'No') },
      ],
      detalle.integrantes
    );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {volver}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{etiquetaTipoCobro(cobro.tipo)}</Badge>
            <Badge variant={cobro.activo ? 'default' : 'outline'}>{cobro.activo ? 'Recibiendo pagos' : 'Cerrado'}</Badge>
            {cobro.ramas.map((r) => (
              <RamaBadge key={r.id} rama={r} />
            ))}
            {!cobro.ramas.length && <Badge variant="outline">{cobro.miembros.length ? 'Integrantes específicos' : 'Todo el grupo'}</Badge>}
          </div>
          <h1 className="font-display text-5xl uppercase">{cobro.nombre}</h1>
          <p className="max-w-2xl text-muted-foreground">
            {cobro.descripcion}
            {cobro.fechaLimite && ` Fecha límite: ${formatearFechaLimite(cobro.fechaLimite)}.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditando(true)}>
            <PencilIcon data-icon="inline-start" />
            Editar
          </Button>
          <Button variant="outline" onClick={cambiarActivo}>
            {cobro.activo ? 'Cerrar cobro' : 'Reabrir cobro'}
          </Button>
          {detalle.pagos.length === 0 && (
            <Button variant="ghost" onClick={() => setEliminando(true)}>
              <Trash2Icon data-icon="inline-start" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Dato etiqueta="Por integrante">{formatearPesos(cobro.monto)}</Dato>
        <Dato etiqueta="Pagaron">
          {resumen.pagados} <span className="text-base font-normal text-muted-foreground">de {resumen.destinatarios}</span>
        </Dato>
        <Dato etiqueta="Por revisar">{resumen.enRevision}</Dato>
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
          <dt className="text-sm text-muted-foreground">Recaudado</dt>
          <dd className="flex flex-col gap-2">
            <span className="text-2xl font-semibold tabular-nums">{formatearPesos(resumen.recaudado)}</span>
            <Progress value={porcentaje(resumen.recaudado, resumen.esperado)} aria-label="Porcentaje recaudado" />
            <span className="text-xs text-muted-foreground">de {formatearPesos(resumen.esperado)} esperados</span>
          </dd>
        </div>
      </dl>

      <section className="flex flex-col gap-3" aria-labelledby="titulo-integrantes">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titulo-integrantes" className="font-display text-2xl uppercase">
            Integrantes
          </h2>
          <div className="flex flex-wrap gap-2">
            <ToggleGroup type="single" variant="outline" value={filtro} onValueChange={(v) => v && setFiltro(v)} aria-label="Filtrar integrantes">
              <ToggleGroupItem value="todos">Todos</ToggleGroupItem>
              <ToggleGroupItem value="pendientes">Deben ({pendientes})</ToggleGroupItem>
              <ToggleGroupItem value="pagados">Pagaron</ToggleGroupItem>
            </ToggleGroup>
            <Button variant="outline" onClick={descargarIntegrantes} disabled={detalle.integrantes.length === 0}>
              <FileSpreadsheetIcon data-icon="inline-start" />
              Descargar planilla
            </Button>
          </div>
        </div>
        {integrantes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {detalle.integrantes.length === 0 ? 'Este cobro no tiene integrantes a quienes cobrar.' : 'Nadie en esta lista.'}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Integrante</TableHead>
                  <TableHead>Rama</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Pagado</TableHead>
                  <TableHead className="text-right">Falta</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrantes.map((i) => (
                  <TableRow key={i.miembro.id}>
                    <TableCell>
                      <p className="font-medium">{i.miembro.nombre}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">{i.miembro.documento}</p>
                    </TableCell>
                    <TableCell>{i.miembro.rama ? <RamaBadge rama={i.miembro.rama} /> : '—'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={ESTADOS_DEUDA[i.estado].variante}>{ESTADOS_DEUDA[i.estado].etiqueta}</Badge>
                        {i.enRevision && <Badge variant="secondary">Comprobante por revisar</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatearPesos(i.pagado)}</TableCell>
                    <TableCell className="text-right tabular-nums">{i.saldo ? formatearPesos(i.saldo) : '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setRegistrarDe(i)}>
                        <PlusIcon data-icon="inline-start" />
                        Registrar pago
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="titulo-historial">
        <h2 id="titulo-historial" className="font-display text-2xl uppercase">
          Historial de pagos
        </h2>
        {detalle.pagos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay pagos para este cobro.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Integrante</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detalle.pagos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="tabular-nums">{formatearFechaCorta(p.fechaEnvio)}</TableCell>
                    <TableCell className="font-medium">{p.miembro.nombre}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatearPesos(p.monto)}</TableCell>
                    <TableCell>
                      <Badge variant={ESTADOS_PAGO[p.estado].variante}>{ESTADOS_PAGO[p.estado].etiqueta}</Badge>
                    </TableCell>
                    <TableCell>
                      <DetallePago pago={p} />
                    </TableCell>
                    <TableCell>
                      {p.estado === 'EN_REVISION' ? (
                        <AccionesRevision pago={p} onRevisado={recargar} />
                      ) : (
                        p.estado === 'CONFIRMADO' && (
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setAnularPago(p)}>
                              <Undo2Icon data-icon="inline-start" />
                              Anular
                            </Button>
                          </div>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <FormularioCobro abierto={editando} onCambio={setEditando} cobro={cobro} onGuardado={recargar} />
      <RegistrarPago cobro={cobro} integrante={registrarDe} onCerrar={() => setRegistrarDe(null)} onRegistrado={recargar} />
      <ConfirmarEliminar
        abierto={!!anularPago}
        onCambio={(abierto) => !abierto && setAnularPago(null)}
        titulo={`¿Anular el pago de ${anularPago ? formatearPesos(anularPago.monto) : ''} de ${anularPago?.miembro.nombre}?`}
        descripcion="Úsalo solo para corregir errores, como un pago registrado dos veces. El registro se borra y deja de sumar."
        accion="Anular pago"
        onConfirmar={anular}
      />
      <ConfirmarEliminar
        abierto={eliminando}
        onCambio={setEliminando}
        titulo={`¿Eliminar ${cobro.nombre}?`}
        descripcion="Dejará de aparecer en la biblioteca y en el panel."
        accion="Eliminar cobro"
        onConfirmar={eliminar}
      />
    </div>
  );
}
