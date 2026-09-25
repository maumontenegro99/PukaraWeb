import { useEffect, useState } from 'react';
import { FileTextIcon, LoaderCircleIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatearPesos } from '@/lib/pagos';
import { api } from '@/lib/panel';

const MAX_BYTES = 10 * 1024 * 1024;

// El administrador registra un pago que le llegó por WhatsApp, correo, etc. (revisa el pantallazo aquí mismo)
// o que recibió en efectivo. Al guardarlo el pago queda confirmado y no se conserva ningún archivo.
// `integrante` es un EstadoIntegranteDto (miembro + saldo).
export function RegistrarPago({ cobro, integrante, onCerrar, onRegistrado }) {
  const [medio, setMedio] = useState('TRANSFERENCIA');
  const [monto, setMonto] = useState('');
  const [remitente, setRemitente] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [vista, setVista] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!integrante) return;
    setMonto(String(integrante.saldo || cobro.monto));
    setRemitente('');
    setMedio('TRANSFERENCIA');
    setArchivo(null);
    setError('');
  }, [integrante, cobro]);

  // Vista previa local del pantallazo (no se sube hasta confirmar).
  useEffect(() => {
    if (!archivo || !archivo.type.startsWith('image/')) {
      setVista(null);
      return;
    }
    const url = URL.createObjectURL(archivo);
    setVista(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  const elegir = (e) => {
    const f = e.target.files?.[0] ?? null;
    setError(f && f.size > MAX_BYTES ? 'El archivo supera los 10 MB.' : '');
    setArchivo(f && f.size <= MAX_BYTES ? f : null);
  };

  const registrar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    const datos = new FormData();
    datos.append('cobroId', cobro.id);
    datos.append('miembroId', integrante.miembro.id);
    datos.append('monto', Number(monto));
    datos.append('nombreRemitente', remitente);
    datos.append('medio', medio);
    if (medio === 'TRANSFERENCIA') datos.append('comprobante', archivo);
    try {
      await api('/api/pagos', { method: 'POST', body: datos });
      toast.success(`Pago de ${integrante.miembro.nombre} registrado y confirmado`);
      onRegistrado();
      onCerrar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={!!integrante} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <form onSubmit={registrar} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Registrar pago de {integrante?.miembro.nombre}</DialogTitle>
            <DialogDescription>
              {cobro.nombre}.{' '}
              {integrante && integrante.saldo > 0
                ? `Le falta pagar ${formatearPesos(integrante.saldo)}.`
                : 'Ya tiene el cobro pagado.'}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FieldSet>
              <FieldLegend variant="label">Cómo pagó</FieldLegend>
              <ToggleGroup
                type="single"
                variant="outline"
                value={medio}
                onValueChange={(v) => v && setMedio(v)}
                className="w-full"
              >
                <ToggleGroupItem value="TRANSFERENCIA" className="flex-1">
                  Transferencia
                </ToggleGroupItem>
                <ToggleGroupItem value="EFECTIVO" className="flex-1">
                  Efectivo
                </ToggleGroupItem>
              </ToggleGroup>
            </FieldSet>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="registro-monto">{medio === 'EFECTIVO' ? 'Monto recibido' : 'Monto transferido'}</FieldLabel>
                <Input
                  id="registro-monto"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="registro-remitente">Quién pagó</FieldLabel>
                <Input
                  id="registro-remitente"
                  value={remitente}
                  onChange={(e) => setRemitente(e.target.value)}
                  placeholder="Nombre del apoderado"
                />
              </Field>
            </div>
            {medio === 'TRANSFERENCIA' && (
              <Field>
                <FieldLabel htmlFor="registro-comprobante">Pantallazo de la transferencia</FieldLabel>
                <Input
                  id="registro-comprobante"
                  type="file"
                  accept="image/png,image/jpeg,application/pdf"
                  onChange={elegir}
                  required
                />
                <FieldDescription>
                  Revísalo antes de guardar: el pago queda confirmado y el pantallazo no se guarda.
                </FieldDescription>
              </Field>
            )}
            {medio === 'EFECTIVO' && (
              <FieldDescription>Regístralo solo si recibiste el dinero en mano. Queda confirmado a tu nombre.</FieldDescription>
            )}
            {medio === 'TRANSFERENCIA' && vista && (
              <img src={vista} alt="Vista previa del comprobante" className="max-h-64 w-full rounded-lg border object-contain" />
            )}
            {medio === 'TRANSFERENCIA' && archivo && !vista && (
              <p className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                <FileTextIcon className="size-4 text-muted-foreground" />
                {archivo.name}
              </p>
            )}
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={guardando || (medio === 'TRANSFERENCIA' && !archivo) || !(Number(monto) > 0)}>
              {guardando && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
              Registrar y confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
