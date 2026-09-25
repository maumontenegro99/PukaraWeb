import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarClockIcon, CircleCheckIcon, LandmarkIcon, PlusIcon, ReceiptTextIcon, ServerCrashIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Encabezado } from '@/components/admin/Encabezado';
import { RamaBadge } from '@/components/admin/RamaBadge';
import { DatosTransferencia } from '@/components/pagos/DatosTransferencia';
import { FormularioCobro } from '@/components/pagos/FormularioCobro';
import { HistorialPagos } from '@/components/pagos/HistorialPagos';
import { AccionesRevision } from '@/components/pagos/RevisionPago';
import { formatearFechaCorta } from '@/lib/biblioteca';
import { etiquetaTipoCobro, formatearFechaLimite, formatearPesos, porcentaje } from '@/lib/pagos';
import { useDatosPanel } from '@/lib/panel';

function dirigidoA(cobro) {
  if (cobro.miembros.length) return cobro.miembros.length === 1 ? '1 integrante' : `${cobro.miembros.length} integrantes`;
  if (cobro.ramas.length) return null; // se muestran como insignias
  return 'Todo el grupo';
}

function TarjetaCobro({ cobro }) {
  const { resumen } = cobro;
  const texto = dirigidoA(cobro);
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{etiquetaTipoCobro(cobro.tipo)}</Badge>
          {!cobro.activo && <Badge variant="outline">Cerrado</Badge>}
          {resumen.enRevision > 0 && <Badge>{resumen.enRevision} por revisar</Badge>}
        </div>
        <CardTitle className="text-xl">{cobro.nombre}</CardTitle>
        <CardDescription>
          {formatearPesos(cobro.monto)} por integrante
          {cobro.fechaLimite && `, hasta el ${formatearFechaLimite(cobro.fechaLimite)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {texto ? <Badge variant="outline">{texto}</Badge> : cobro.ramas.map((r) => <RamaBadge key={r.id} rama={r} />)}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span>
              <strong className="tabular-nums">{formatearPesos(resumen.recaudado)}</strong>
              <span className="text-muted-foreground"> de {formatearPesos(resumen.esperado)}</span>
            </span>
            <span className="text-muted-foreground tabular-nums">{porcentaje(resumen.recaudado, resumen.esperado)}%</span>
          </div>
          <Progress value={porcentaje(resumen.recaudado, resumen.esperado)} aria-label={`Recaudado de ${cobro.nombre}`} />
          <p className="text-xs text-muted-foreground">
            {resumen.pagados} de {resumen.destinatarios} pagaron
            {resumen.parciales > 0 && `, ${resumen.parciales} con abono parcial`}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link to={`/admin/pagos/${cobro.id}`}>Ver integrantes y pagos</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AdminPagos() {
  const { cobros, revision, historial, estado, recargar } = useDatosPanel({
    cobros: '/api/pagos/cobros',
    revision: '/api/pagos/revision',
    historial: '/api/pagos',
  });
  // La pestaña queda en la URL (?vista=historial) para poder volver o compartir el enlace.
  const [parametros, setParametros] = useSearchParams();
  const pestana = parametros.get('vista') ?? 'revision';
  const cambiarPestana = (v) => setParametros(v === 'revision' ? {} : { vista: v }, { replace: true });
  const [vista, setVista] = useState('abiertos');
  const [creando, setCreando] = useState(false);
  const [editandoDatos, setEditandoDatos] = useState(false);

  const visibles = useMemo(() => cobros.filter((c) => (vista === 'abiertos' ? c.activo : !c.activo)), [cobros, vista]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <Encabezado titulo="Pagos" descripcion="Cobros del grupo y transferencias por confirmar.">
        <Button variant="outline" onClick={() => setEditandoDatos(true)}>
          <LandmarkIcon data-icon="inline-start" />
          Datos de transferencia
        </Button>
        <Button onClick={() => setCreando(true)}>
          <PlusIcon data-icon="inline-start" />
          Nuevo cobro
        </Button>
      </Encabezado>

      {estado === 'cargando' && <Skeleton className="h-72 w-full" />}

      {estado === 'error' && (
        <Alert>
          <ServerCrashIcon />
          <AlertTitle>No se pudieron cargar los pagos</AlertTitle>
          <AlertDescription>El servidor no responde. Vuelve a intentarlo en unos minutos.</AlertDescription>
        </Alert>
      )}

      {estado === 'listo' && (
        <Tabs value={pestana} onValueChange={cambiarPestana} className="gap-6">
          <TabsList variant="line">
            <TabsTrigger value="revision">
              Por revisar
              {revision.length > 0 && <Badge className="ml-1 h-5 min-w-5 px-1.5 tabular-nums">{revision.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="cobros">Cobros</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="revision" className="flex flex-col gap-3">
            <h2 className="sr-only">Comprobantes por revisar</h2>
            {revision.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CircleCheckIcon className="size-4" />
                No hay comprobantes pendientes. Los que envíen las familias desde la biblioteca aparecerán aquí.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Integrante</TableHead>
                      <TableHead>Cobro</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Enviado por</TableHead>
                      <TableHead className="text-right">
                        <span className="sr-only">Acciones</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revision.map((p) => (
                      <TableRow key={p.id}>
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
                          <p>{p.nombreRemitente}</p>
                          <p className="text-xs text-muted-foreground">{formatearFechaCorta(p.fechaEnvio)}</p>
                        </TableCell>
                        <TableCell>
                          <AccionesRevision pago={p} onRevisado={recargar} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cobros" className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm text-muted-foreground">
                {vista === 'abiertos' ? 'Cobros que reciben pagos' : 'Cobros cerrados, con su historial'}
              </h2>
              <ToggleGroup type="single" variant="outline" value={vista} onValueChange={(v) => v && setVista(v)} aria-label="Qué cobros mostrar">
                <ToggleGroupItem value="abiertos">Abiertos</ToggleGroupItem>
                <ToggleGroupItem value="cerrados">Cerrados</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {visibles.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">{vista === 'abiertos' ? <ReceiptTextIcon /> : <CalendarClockIcon />}</EmptyMedia>
                  <EmptyTitle>{vista === 'abiertos' ? 'No hay cobros abiertos' : 'No hay cobros cerrados'}</EmptyTitle>
                  <EmptyDescription>
                    {vista === 'abiertos'
                      ? 'Crea una cuota, el cobro de un campamento o uno personalizado.'
                      : 'Los cobros que cierres quedarán aquí con su historial.'}
                  </EmptyDescription>
                </EmptyHeader>
                {vista === 'abiertos' && (
                  <EmptyContent>
                    <Button onClick={() => setCreando(true)}>Nuevo cobro</Button>
                  </EmptyContent>
                )}
              </Empty>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibles.map((c) => (
                  <TarjetaCobro key={c.id} cobro={c} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="historial">
            <h2 className="sr-only">Historial de pagos</h2>
            <HistorialPagos pagos={historial} cobros={cobros} onCambio={recargar} />
          </TabsContent>
        </Tabs>
      )}

      <FormularioCobro abierto={creando} onCambio={setCreando} cobro={null} onGuardado={recargar} />
      <DatosTransferencia abierto={editandoDatos} onCambio={setEditandoDatos} />
    </div>
  );
}
