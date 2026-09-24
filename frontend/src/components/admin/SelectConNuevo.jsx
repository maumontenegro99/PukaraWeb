import { Select, SelectContent, SelectGroup, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';

export const NINGUNA = 'NINGUNA';
export const NUEVA = 'NUEVA';

// Select con una opción para crear un elemento en el momento (categorías, ubicaciones, apoderados).
// Los valores son strings: NINGUNA, NUEVA o el id de la opción.
export function SelectConNuevo({ id, valor, onCambio, opciones, vacio, nuevo }) {
  return (
    <Select value={valor} onValueChange={onCambio}>
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={NINGUNA}>{vacio}</SelectItem>
          <SelectItem value={NUEVA}>{nuevo}</SelectItem>
        </SelectGroup>
        {opciones.length > 0 && <SelectSeparator />}
        <SelectGroup>
          {opciones.map((o) => (
            <SelectItem key={o.id} value={String(o.id)}>
              {o.nombre}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
