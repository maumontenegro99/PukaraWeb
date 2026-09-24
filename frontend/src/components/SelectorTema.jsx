import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTema } from '@/context/TemaContext';
import { cn } from '@/lib/utils';

const OPCIONES = [
  { valor: 'claro', etiqueta: 'Claro', icono: SunIcon },
  { valor: 'oscuro', etiqueta: 'Oscuro', icono: MoonIcon },
  { valor: 'sistema', etiqueta: 'Según el dispositivo', icono: MonitorIcon },
];

// Botón para elegir el tema. `sobreOscuro` lo adapta a encabezados grafito (biblioteca).
export function SelectorTema({ sobreOscuro = false, className }) {
  const { tema, oscuro, cambiarTema } = useTema();
  const Icono = oscuro ? MoonIcon : SunIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Cambiar tema"
          className={cn(sobreOscuro && 'text-white hover:bg-white/10 hover:text-white', className)}
        >
          <Icono />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuGroup>
          {OPCIONES.map(({ valor, etiqueta, icono }) => {
            const IconoOpcion = icono;
            return (
              <DropdownMenuItem key={valor} onSelect={() => cambiarTema(valor)}>
                <IconoOpcion />
                {etiqueta}
                {tema === valor && <CheckIcon className="ml-auto" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
