import { useState } from 'react';
import { CalendarClockIcon, CircleAlertIcon, CircleCheckIcon, CopyIcon, LoaderCircleIcon, ReceiptTextIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsultaPagos } from '@/components/pagos/ConsultaPagos';
import { CAMPOS_TRANSFERENCIA } from '@/components/pagos/DatosTransferencia';
import { apiUrl } from '@/lib/api';
import { mensajeDeError, useRecursoPublico } from '@/lib/biblioteca';
import { formatearFechaLimite, formatearPesos } from '@/lib/pagos';
import { cn } from '@/lib/utils';

const MAX_BYTES = 10 * 1024 * 1024;

function Paso({ numero, titulo, children }) {
  return (
    <section className="grid gap-4 sm:grid-cols-[3rem_1fr]">
      <span
        className="flex size-10 items-center justify-center rounded-full bg-grafito font-display text-xl text-white"
        aria-hidden="true"
      >
        {numero}
      </span>
      <div className="flex min-w-0 flex-col gap-4">
        <h2 className="text-xl font-bold">
          <span className="sr-only">Paso {numero}: </span>
          {titulo}
        </h2>
        {children}
      </div>
    </section>
  );
}

function copiar(texto, etiqueta) {
  navigator.clipboard
    ?.writeText(texto)
    .then(() => toast.success(`${etiqueta} copiado`))
    .catch(() => toast.error('No se pudo copiar. Selecciona el texto y cópialo a mano.'));
}

function DatosCuenta({ datos }) {
  const campos = CAMPOS_TRANSFERENCIA.filter((c) => datos[c.clave]);
  if (campos.length === 0) {
    return (
      <Alert>
        <CircleAlertIcon />
        <AlertTitle>Aún no hay datos de transferencia publicados</AlertTitle>
        <AlertDescription>Pídelos a la dirigencia de la rama o escribe a pukaraweche@gmail.com.</AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <dl className="divide-y rounded-lg border bg-card">
        {campos.map((c) => (
          <div key={c.clave} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{c.etiqueta}</dt>
              <dd className="truncate font-medium">{datos[c.clave]}</dd>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Copiar ${c.etiqueta.toLowerCase()}`}
              onClick={() => copiar(datos[c.clave], c.etiqueta)}
            >
              <CopyIcon />
            </Button>
          </div>
        ))}
      </dl>
      {datos.instrucciones && <p className="text-sm text-muted-foreground">{datos.instrucciones}</p>}
    </div>
  );
}

export default function Pagar() {
  const { datos: cobros, estado } = useRecursoPublico('/api/biblioteca/pagos/cobros');
  const { datos: cuenta, estado: estadoCuenta } = useRecursoPublico('/api/biblioteca/pagos/datos');
  const [cobroId, setCobroId] = useState(null);
  const [rut, setRut] = useState('');
  const [remitente, setRemitente] = useState('');
  const [monto, setMonto] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [recibido, setRecibido] = useState(null);
  const [pestana, setPestana] = useState('pagar');

  const elegido = cobros.find((c) => c.id === cobroId) ?? (cobros.length === 1 ? cobros[0] : null);

  const elegirCobro = (c) => {
    setCobroId(c.id);
    setMonto(String(c.monto));
  };

  const elegirArchivo = (e) => {
    const f = e.target.files?.[0] ?? null;
    setError(f && f.size > MAX_BYTES ? 'El archivo supera los 10 MB. Prueba con una captura más liviana.' : '');
    setArchivo(f && f.size <= MAX_BYTES ? f : null);
  };

  const montoFinal = monto || (elegido ? String(elegido.monto) : '');

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    const datos = new FormData();
    datos.append('cobroId', elegido.id);
    datos.append('rutMiembro', rut);
    datos.append('nombreRemitente', remitente);
    datos.append('monto', Number(montoFinal));
    datos.append('comprobante', archivo);
    try {
      const res = await fetch(apiUrl('/api/biblioteca/pagos'), { method: 'POST', body: datos });
      if (!res.ok) {
        setError(await mensajeDeError(res, 'No se pudo enviar el comprobante. Vuelve a intentarlo.'));
        return;
      }
      setRecibido(await res.json());
    } catch {
      setError('El servidor no responde. Vuelve a intentarlo en unos minutos.');
    } finally {
      setEnviando(false);
    }
  };

  const reiniciar = () => {
    setRecibido(null);
    setRut('');
    setArchivo(null);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-5xl uppercase sm:text-6xl">Pagos del grupo</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Cuotas, campamentos y otros cobros se pagan por transferencia. Envíanos el comprobante y la dirigencia confirmará el pago.
      </p>

      <Tabs value={pestana} onValueChange={setPestana} className="mt-8 gap-8">
        <TabsList variant="line">
          <TabsTrigger value="pagar">Pagar</TabsTrigger>
          <TabsTrigger value="consultar">Consultar mis pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="consultar">
          <ConsultaPagos onIrAPagar={() => setPestana('pagar')} />
        </TabsContent>

        <TabsContent value="pagar">
          {estado === 'cargando' && <Skeleton className="h-40 w-full" />}

          {estado === 'error' && (
            <Alert>
              <CircleAlertIcon />
              <AlertTitle>No se pudieron cargar los cobros</AlertTitle>
              <AlertDescription>El servidor no responde. Vuelve a intentarlo en unos minutos.</AlertDescription>
            </Alert>
          )}

          {estado === 'listo' && cobros.length === 0 && (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ReceiptTextIcon />
                </EmptyMedia>
                <EmptyTitle>No hay cobros abiertos</EmptyTitle>
                <EmptyDescription>
                  Cuando la dirigencia abra una cuota o el pago de un campamento, aparecerá aquí.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {recibido && (
            <Empty className="border bg-card">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CircleCheckIcon />
                </EmptyMedia>
                <EmptyTitle>Comprobante enviado</EmptyTitle>
                <EmptyDescription>
                  Recibimos tu pago de {formatearPesos(recibido.monto)} para {recibido.cobro}. La dirigencia lo confirmará y el
                  comprobante se eliminará una vez revisado.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={reiniciar}>Enviar otro comprobante</Button>
              </EmptyContent>
            </Empty>
          )}

          {estado === 'listo' && cobros.length > 0 && !recibido && (
            <form onSubmit={enviar} className="flex flex-col gap-10" noValidate>
              <Paso numero={1} titulo="Elige qué vas a pagar">
                <FieldSet>
                  <FieldLegend className="sr-only">Cobro</FieldLegend>
                  <div className="grid gap-3" role="radiogroup">
                    {cobros.map((c) => {
                      const activo = elegido?.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          role="radio"
                          aria-checked={activo}
                          onClick={() => elegirCobro(c)}
                          className={cn(
                            'flex flex-col gap-1 rounded-lg border bg-card p-4 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between',
                            activo && 'border-primary ring-2 ring-primary/40',
                          )}
                        >
                          <span className="flex flex-col gap-1">
                            <span className="text-lg font-semibold">{c.nombre}</span>
                            <span className="text-sm text-muted-foreground">
                              {c.dirigidoA}
                              {c.fechaLimite && (
                                <span className="ml-3 inline-flex items-center gap-1">
                                  <CalendarClockIcon className="size-3.5" />
                                  hasta el {formatearFechaLimite(c.fechaLimite)}
                                </span>
                              )}
                            </span>
                            {c.descripcion && <span className="text-sm text-muted-foreground">{c.descripcion}</span>}
                          </span>
                          <span className="font-display text-3xl tabular-nums">{formatearPesos(c.monto)}</span>
                        </button>
                      );
                    })}
                  </div>
                </FieldSet>
              </Paso>

              <Paso numero={2} titulo="Transfiere a la cuenta del grupo">
                {estadoCuenta === 'cargando' ? <Skeleton className="h-48 w-full" /> : <DatosCuenta datos={cuenta ?? {}} />}
              </Paso>

              <Paso numero={3} titulo="Envía el comprobante">
                <FieldGroup>
                  {error && (
                    <Alert variant="destructive">
                      <CircleAlertIcon />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Field>
                    <FieldLabel htmlFor="pago-rut">RUT de la niña, niño o joven</FieldLabel>
                    <Input
                      id="pago-rut"
                      value={rut}
                      onChange={(e) => setRut(e.target.value)}
                      placeholder="12.345.678-9"
                      autoComplete="off"
                      required
                    />
                    <FieldDescription>Con él sabemos a quién corresponde el pago.</FieldDescription>
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
                    <Field>
                      <FieldLabel htmlFor="pago-remitente">Quién hizo la transferencia</FieldLabel>
                      <Input
                        id="pago-remitente"
                        value={remitente}
                        onChange={(e) => setRemitente(e.target.value)}
                        autoComplete="name"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="pago-monto">Monto transferido</FieldLabel>
                      <Input
                        id="pago-monto"
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={montoFinal}
                        onChange={(e) => setMonto(e.target.value)}
                        required
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="pago-comprobante">Comprobante</FieldLabel>
                    <Input
                      id="pago-comprobante"
                      type="file"
                      accept="image/png,image/jpeg,application/pdf"
                      onChange={elegirArchivo}
                      required
                    />
                    <FieldDescription>
                      Pantallazo o PDF de la transferencia, de hasta 10 MB. Solo lo ve la dirigencia y se elimina cuando se
                      confirma el pago.
                    </FieldDescription>
                  </Field>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-fit"
                    disabled={enviando || !elegido || !rut || !remitente || !archivo || !(Number(montoFinal) > 0)}
                  >
                    {enviando && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
                    Enviar comprobante
                  </Button>
                </FieldGroup>
              </Paso>
            </form>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
