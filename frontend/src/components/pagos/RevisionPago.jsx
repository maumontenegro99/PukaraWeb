import { useState } from 'react';
import { CheckIcon, EyeIcon, LoaderCircleIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { formatearPesos } from '@/lib/pagos';
import { abrirArchivoProtegido, api } from '@/lib/panel';

export const verComprobante = (pago) =>
  abrirArchivoProtegido(`/api/pagos/${pago.id}/comprobante`).catch((err) => toast.error(err.message));

// Botones Ver / Confirmar / Rechazar de un pago en revisión, con sus diálogos.
// `onRevisado` se llama después de confirmar o rechazar, para recargar la página.
export function AccionesRevision({ pago, onRevisado }) {
  const [confirmando, setConfirmando] = useState(false);
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const nombre = pago.miembro.nombre.split(' ')[0];

  const confirmar = async () => {
    setOcupado(true);
    try {
      await api(`/api/pagos/${pago.id}/confirmar`, { method: 'POST' });
      toast.success(`Pago de ${nombre} confirmado. El comprobante se eliminó.`);
      onRevisado();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOcupado(false);
      setConfirmando(false);
    }
  };

  const rechazar = async (e) => {
    e.preventDefault();
    setOcupado(true);
    try {
      await api(`/api/pagos/${pago.id}/rechazar`, { method: 'POST', body: { motivo } });
      toast.success(`Comprobante de ${nombre} rechazado. Sigue figurando como pendiente.`);
      setRechazando(false);
      setMotivo('');
      onRevisado();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => verComprobante(pago)}>
        <EyeIcon data-icon="inline-start" />
        Ver comprobante
      </Button>
      <Button variant="outline" size="sm" disabled={ocupado} onClick={() => setConfirmando(true)}>
        <CheckIcon data-icon="inline-start" />
        Confirmar
      </Button>
      <Button variant="ghost" size="sm" disabled={ocupado} onClick={() => setRechazando(true)}>
        <XIcon data-icon="inline-start" />
        Rechazar
      </Button>

      <AlertDialog open={confirmando} onOpenChange={setConfirmando}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Confirmar {formatearPesos(pago.monto)} de {pago.miembro.nombre}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Verifica que la transferencia llegó a la cuenta del grupo. Al confirmar, el pago queda registrado para {pago.cobroNombre} y el
              comprobante se elimina.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmar} disabled={ocupado}>
              Confirmar pago
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={rechazando} onOpenChange={setRechazando}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={rechazar} className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle>Rechazar comprobante de {pago.miembro.nombre}</DialogTitle>
              <DialogDescription>El comprobante se elimina y el pago queda como pendiente para que la familia envíe otro.</DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor={`motivo-${pago.id}`}>Motivo</FieldLabel>
              <Textarea
                id={`motivo-${pago.id}`}
                rows={3}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej: el monto de la transferencia no coincide"
                required
              />
              <FieldDescription>Queda en el historial del pago.</FieldDescription>
            </Field>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" variant="destructive" disabled={ocupado || !motivo.trim()}>
                {ocupado && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
                Rechazar comprobante
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
