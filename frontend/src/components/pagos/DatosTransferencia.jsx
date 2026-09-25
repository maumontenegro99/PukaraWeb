import { useEffect, useState } from 'react';
import { LoaderCircleIcon } from 'lucide-react';
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/panel';

export const CAMPOS_TRANSFERENCIA = [
  { clave: 'titular', etiqueta: 'Titular' },
  { clave: 'rut', etiqueta: 'RUT' },
  { clave: 'banco', etiqueta: 'Banco' },
  { clave: 'tipoCuenta', etiqueta: 'Tipo de cuenta' },
  { clave: 'numeroCuenta', etiqueta: 'Número de cuenta' },
  { clave: 'correo', etiqueta: 'Correo para el aviso' },
];

const VACIO = Object.fromEntries([...CAMPOS_TRANSFERENCIA.map((c) => [c.clave, '']), ['instrucciones', '']]);

// Datos de la cuenta del grupo que se muestran a las familias en la biblioteca.
export function DatosTransferencia({ abierto, onCambio }) {
  const [datos, setDatos] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!abierto) return;
    setError('');
    api('/api/pagos/configuracion')
      .then((d) => setDatos(Object.fromEntries(Object.keys(VACIO).map((k) => [k, d[k] ?? '']))))
      .catch((err) => setError(err.message));
  }, [abierto]);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await api('/api/pagos/configuracion', { method: 'PUT', body: datos });
      toast.success('Datos de transferencia actualizados');
      onCambio(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={onCambio}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={guardar} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Datos de transferencia</DialogTitle>
            <DialogDescription>Las familias los ven en la biblioteca, en la sección Pagos.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {CAMPOS_TRANSFERENCIA.map((c) => (
                <Field key={c.clave} className={c.clave === 'titular' ? 'sm:col-span-2' : undefined}>
                  <FieldLabel htmlFor={`transferencia-${c.clave}`}>{c.etiqueta}</FieldLabel>
                  <Input
                    id={`transferencia-${c.clave}`}
                    value={datos[c.clave]}
                    onChange={(e) => setDatos((d) => ({ ...d, [c.clave]: e.target.value }))}
                    type={c.clave === 'correo' ? 'email' : 'text'}
                  />
                </Field>
              ))}
            </div>
            <Field>
              <FieldLabel htmlFor="transferencia-instrucciones">Indicaciones</FieldLabel>
              <Textarea
                id="transferencia-instrucciones"
                rows={2}
                value={datos.instrucciones}
                onChange={(e) => setDatos((d) => ({ ...d, instrucciones: e.target.value }))}
                placeholder="Ej: en el asunto escribe el nombre del niño, niña o joven"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={guardando}>
              {guardando && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
              Guardar datos
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
