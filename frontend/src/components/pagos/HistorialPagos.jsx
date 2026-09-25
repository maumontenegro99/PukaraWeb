import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheetIcon, HistoryIcon, SearchIcon, Undo2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ConfirmarEliminar } from '@/components/admin/ConfirmarEliminar';
import { RamaBadge } from '@/components/admin/RamaBadge';
import { AccionesRevision } from '@/components/pagos/RevisionPago';
import { formatearFechaCorta } from '@/lib/biblioteca';
import { ESTADOS_PAGO, MEDIOS_PAGO, ORIGENES_PAGO, descargarPlanilla, fechaPlanilla, formatearPesos, nombreArchivo } from '@/lib/pagos';
import { api, incluye } from '@/lib/panel';

const TODOS = 'TODOS';

const COLUMNAS_PLANILLA = [
  { titulo: 'Fecha', valor: (p) => fechaPlanilla(p.fechaEnvio) },
  { titulo: 'Integrante', valor: (p) => p.miembro.nombre },
  { titulo: 'RUT', valor: (p) => p.miembro.documento },
  { titulo: 'Rama', valor: (p) => p.miembro.rama?.nombre },
  { titulo: 'Cobro', valor: (p) => p.cobroNombre },
  { titulo: 'Monto', valor: (p) => p.monto },
  { titulo: 'Medio', valor: (p) => MEDIOS_PAGO[p.medio] },
  { titulo: 'Estado', valor: (p) => ESTADOS_PAGO[p.estado].etiqueta },
  { titulo: 'Registrado desde', valor: (p) => ORIGENES_PAGO[p.origen] },
  { titulo: 'Pagado por', valor: (p) => p.nombreRemitente },
  { titulo: 'Revisado por', valor: (p) => p.revisadoPor },
  { titulo: 'Fecha de revisión', valor: (p) => fechaPlanilla(p.fechaRevision) },
  { titulo: 'Motivo del rechazo', valor: (p) => p.motivoRechazo },
];

// Detalle de un pago en una celda: medio, quién pagó, quién lo revisó y el motivo si se rechazó.
export function DetallePago({ pago }) {
  return (
    <div className="max-w-72 min-w-56 text-sm whitespace-normal">
      <p>
        {MEDIOS_PAGO[pago.medio]}, desde {ORIGENES_PAGO[pago.origen].toLowerCase()}
        {pago.nombreRemitente && `. Pagó ${pago.nombreRemitente}`}
      </p>
      {pago.revisadoPor && <p className="text-xs text-muted-foreground">Revisado por {pago.revisadoPor}</p>}
      {pago.motivoRechazo && <p className="text-xs text-destructive">{pago.motivoRechazo}</p>}
    </div>
  );
}

// Todos los pagos de todos los cobros: confirmados, rechazados y por revisar.
export function HistorialPagos({ pagos, cobros, onCambio }) {
  const [estado, setEstado] = useState(TODOS);
  const [cobroId, setCobroId] = useState(TODOS);
  const [busqueda, setBusqueda] = useState('');
  const [anular, setAnular] = useState(null);

  const visibles = useMemo(
    () =>
      pagos
        .filter((p) => estado === TODOS || p.estado === estado)
        .filter((p) => cobroId === TODOS || String(p.cobroId) === cobroId)
        .filter((p) => !busqueda || incluye(`${p.miembro.nombre} ${p.miembro.documento ?? ''} ${p.nombreRemitente ?? ''}`, busqueda)),
    [pagos, estado, cobroId, busqueda]
  );

  const confirmados = visibles.filter((p) => p.estado === 'CONFIRMADO');
  const total = confirmados.reduce((suma, p) => suma + p.monto, 0);
  const hayFiltros = estado !== TODOS || cobroId !== TODOS || busqueda;

  const descargar = () => {
    const cobro = cobros.find((c) => String(c.id) === cobroId);
    descargarPlanilla(`${nombreArchivo(cobro ? `pagos ${cobro.nombre}` : 'pagos')}.csv`, COLUMNAS_PLANILLA, visibles);
  };

  const confirmarAnulacion = async () => {
    try {
      await api(`/api/pagos/${anular.id}`, { method: 'DELETE' });
      toast.success('Pago anulado');
      onCambio();
    } catch (err) {
      toast.error(err.message);
    }
    setAnular(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <ToggleGroup type="single" variant="outline" value={estado} onValueChange={(v) => v && setEstado(v)} aria-label="Filtrar por estado">
          <ToggleGroupItem value={TODOS}>Todos</ToggleGroupItem>
          <ToggleGroupItem value="CONFIRMADO">Confirmados</ToggleGroupItem>
          <ToggleGroupItem value="RECHAZADO">Rechazados</ToggleGroupItem>
          <ToggleGroupItem value="EN_REVISION">Por revisar</ToggleGroupItem>
        </ToggleGroup>
        <Select value={cobroId} onValueChange={setCobroId}>
          <SelectTrigger className="lg:w-56" aria-label="Filtrar por cobro">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={TODOS}>Todos los cobros</SelectItem>
              {cobros.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar integrante o quien pagó"
            aria-label="Buscar pagos"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {visibles.length === 1 ? '1 pago' : `${visibles.length} pagos`}
          {confirmados.length > 0 && (
            <>
              . Confirmado: <strong className="text-foreground tabular-nums">{formatearPesos(total)}</strong>
            </>
          )}
        </p>
        <Button variant="outline" size="sm" onClick={descargar} disabled={visibles.length === 0}>
          <FileSpreadsheetIcon data-icon="inline-start" />
          Descargar planilla
        </Button>
      </div>

      {visibles.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HistoryIcon />
            </EmptyMedia>
            <EmptyTitle>{hayFiltros ? 'Ningún pago coincide' : 'Todavía no hay pagos'}</EmptyTitle>
            <EmptyDescription>
              {hayFiltros ? 'Prueba con otro estado, otro cobro u otra búsqueda.' : 'Aquí quedará el registro de cada pago confirmado o rechazado.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Integrante</TableHead>
                <TableHead>Cobro</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="tabular-nums">{formatearFechaCorta(p.fechaEnvio)}</TableCell>
                  <TableCell>
                    <p className="font-medium">{p.miembro.nombre}</p>
                    {p.miembro.rama && <RamaBadge rama={p.miembro.rama} className="mt-1 gap-1.5" />}
                  </TableCell>
                  <TableCell>
                    <Link to={`/admin/pagos/${p.cobroId}`} className="underline-offset-4 hover:underline">
                      {p.cobroNombre}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{formatearPesos(p.monto)}</TableCell>
                  <TableCell>
                    <Badge variant={ESTADOS_PAGO[p.estado].variante}>{ESTADOS_PAGO[p.estado].etiqueta}</Badge>
                  </TableCell>
                  <TableCell>
                    <DetallePago pago={p} />
                  </TableCell>
                  <TableCell>
                    {p.estado === 'EN_REVISION' && <AccionesRevision pago={p} onRevisado={onCambio} />}
                    {p.estado === 'CONFIRMADO' && (
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setAnular(p)}>
                          <Undo2Icon data-icon="inline-start" />
                          Anular
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmarEliminar
        abierto={!!anular}
        onCambio={(abierto) => !abierto && setAnular(null)}
        titulo={`¿Anular el pago de ${anular ? formatearPesos(anular.monto) : ''} de ${anular?.miembro.nombre}?`}
        descripcion="Úsalo solo para corregir errores, como un pago registrado dos veces. El registro se borra y deja de sumar."
        accion="Anular pago"
        onConfirmar={confirmarAnulacion}
      />
    </div>
  );
}
