import { useId } from 'react';
import { ClockIcon, MoonIcon, SunIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTema } from '@/context/TemaContext';
import { HORA_OSCURO_DESDE, HORA_OSCURO_HASTA } from '@/lib/tema';
import { cn } from '@/lib/utils';

const hora = (h) => `${h}:00`;

// Dos partes: el botón cambia entre claro y oscuro con un clic, y la casilla con reloj hace que el modo siga la hora del día.
// `sobreOscuro` lo adapta a encabezados grafito (biblioteca).
export function SelectorTema({ sobreOscuro = false, className }) {
  const { tema, oscuro, cambiarTema, alternar } = useTema();
  const id = useId();
  const Icono = oscuro ? MoonIcon : SunIcon;
  const porHorario = tema === 'horario';
  const explicacion = `Según la hora: oscuro de ${hora(HORA_OSCURO_DESDE)} a ${hora(HORA_OSCURO_HASTA)}`;

  return (
    <div className={cn('flex items-center', className)}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        onClick={alternar}
        className={cn(sobreOscuro && 'text-white hover:bg-white/10 hover:text-white')}
      >
        <Icono />
      </Button>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <label
              htmlFor={id}
              className={cn(
                'flex h-8 cursor-pointer items-center gap-1 rounded-md px-1.5 text-muted-foreground hover:bg-accent hover:text-foreground',
                sobreOscuro && 'text-white/70 hover:bg-white/10 hover:text-white',
                porHorario && (sobreOscuro ? 'text-white' : 'text-foreground'),
              )}
            >
              <Checkbox
                id={id}
                checked={porHorario}
                // Al desmarcar se queda el modo que se ve ahora, sin saltos.
                onCheckedChange={(marcado) => cambiarTema(marcado ? 'horario' : oscuro ? 'oscuro' : 'claro')}
                aria-label={explicacion}
                className={cn('size-3.5', sobreOscuro && 'border-white/60')}
              />
              <ClockIcon className="size-3.5" aria-hidden="true" />
            </label>
          </TooltipTrigger>
          <TooltipContent>{explicacion}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
