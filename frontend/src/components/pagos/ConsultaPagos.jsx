import { useState } from 'react';
import { CircleAlertIcon, ClockIcon, LoaderCircleIcon, SearchIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { apiUrl } from '@/lib/api';
import { mensajeDeError } from '@/lib/biblioteca';
import { ESTADOS_DEUDA, formatearFechaLimite, formatearPesos, porcentaje } from '@/lib/pagos';

// El apoderado consulta con el RUT de su hija o hijo cómo va con cada cobro abierto.
// La respuesta no incluye nombres: solo montos y estados.
export function ConsultaPagos({ onIrAPagar }) {
  const [rut, setRut] = useState('');
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado] = useState(null); // null = aún no consulta
  const [error, setError] = useState('');

  const consultar = async (e) => {
    e.preventDefault();
    setConsultando(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/api/biblioteca/pagos/consulta'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut }),
      });
      if (!res.ok) {
        setError(await mensajeDeError(res, 'No se pudo hacer la consulta. Vuelve a intentarlo.'));
        setResultado(null);
        return;
      }
      setResultado(await res.json());
    } catch {
      setError('El servidor no responde. Vuelve a intentarlo en unos minutos.');
    } finally {
      setConsultando(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={consultar} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <Field className="flex-1">
          <FieldLabel htmlFor="consulta-rut">RUT de la niña, niño o joven</FieldLabel>
          <Input id="consulta-rut" value={rut} onChange={(e) => setRut(e.target.value)} placeholder="12.345.678-9" autoComplete="off" required />
          <FieldDescription>Verás cuánto lleva pagado en cada cobro abierto y si un comprobante sigue en revisión.</FieldDescription>
        </Field>
        <Button type="submit" size="lg" className="sm:mb-7" disabled={consultando || !rut.trim()}>
          {consultando ? <LoaderCircleIcon data-icon="inline-start" className="animate-spin" /> : <SearchIcon data-icon="inline-start" />}
          Consultar
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {resultado && resultado.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon />
            </EmptyMedia>
            <EmptyTitle>No hay cobros abiertos para ese RUT</EmptyTitle>
            <EmptyDescription>Revisa que esté bien escrito. Si crees que es un error, consulta a la dirigencia de su rama.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {resultado && resultado.length > 0 && (
        <ul className="flex flex-col gap-3" aria-label="Estado de los pagos">
          {resultado.map((c) => {
            const estado = ESTADOS_DEUDA[c.estado];
            return (
              <li key={c.cobro} className="flex flex-col gap-3 rounded-lg border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold">{c.cobro}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatearPesos(c.monto)}
                      {c.fechaLimite && `, hasta el ${formatearFechaLimite(c.fechaLimite)}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={estado.variante}>{estado.etiqueta}</Badge>
                    {c.enRevision && (
                      <Badge variant="secondary" className="gap-1">
                        <ClockIcon />
                        Comprobante en revisión
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Progress value={porcentaje(c.pagado, c.monto)} aria-label={`Pagado de ${c.cobro}`} />
                  <p className="text-sm">
                    Pagado <strong className="tabular-nums">{formatearPesos(c.pagado)}</strong>
                    {c.saldo > 0 && (
                      <>
                        . Falta <strong className="tabular-nums">{formatearPesos(c.saldo)}</strong>
                      </>
                    )}
                  </p>
                </div>
                {c.ultimoRechazo && !c.enRevision && (
                  <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertTitle>El último comprobante no fue aceptado</AlertTitle>
                    <AlertDescription>{c.ultimoRechazo} Envía uno nuevo desde la pestaña Pagar.</AlertDescription>
                  </Alert>
                )}
                {c.saldo > 0 && !c.enRevision && (
                  <Button variant="outline" size="sm" className="w-fit" onClick={onIrAPagar}>
                    Pagar lo que falta
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
