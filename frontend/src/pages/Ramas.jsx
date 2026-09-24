import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRightIcon, MailIcon, PhoneIcon, ServerCrashIcon, UsersIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { BanderinRama } from '@/components/brand/Banderines';
import { Encabezado } from '@/components/admin/Encabezado';
import { RAMAS } from '@/lib/ramas';
import { useDatosPanel } from '@/lib/panel';
import { cn } from '@/lib/utils';

const ORDEN = RAMAS.map((r) => r.clave);

const DatoIcono = ({ icono }) => {
  const Icono = icono;
  return <Icono className="mt-0.5 size-4 shrink-0 text-muted-foreground" />;
};

function ContactoDirigente({ dirigente, onCerrar }) {
  return (
    <Dialog open={!!dirigente} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {dirigente?.nombres} {dirigente?.apellidos}
          </DialogTitle>
          <DialogDescription>{dirigente?.cargo || 'Dirigente'}</DialogDescription>
        </DialogHeader>
        <dl className="flex flex-col gap-4">
          {[
            { icono: MailIcon, etiqueta: 'Correo', valor: dirigente?.email, href: dirigente?.email && `mailto:${dirigente.email}` },
            { icono: PhoneIcon, etiqueta: 'Teléfono', valor: dirigente?.telefono, href: dirigente?.telefono && `tel:${dirigente.telefono}` },
          ].map(({ icono, etiqueta, valor, href }) => (
            <div key={etiqueta} className="flex items-start gap-3">
              <DatoIcono icono={icono} />
              <div>
                <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
                <dd className="font-medium">
                  {valor ? <a href={href} className="underline underline-offset-4">{valor}</a> : <span className="text-muted-foreground">No registrado</span>}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}

function Ramas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ramas, miembros, estado } = useDatosPanel({ ramas: '/api/ramas', miembros: '/api/miembros' });
  const [dirigente, setDirigente] = useState(null);

  const ordenadas = useMemo(() => [...ramas].sort((a, b) => ORDEN.indexOf(a.tipo) - ORDEN.indexOf(b.tipo)), [ramas]);

  const integrantes = useMemo(() => {
    const cuenta = {};
    miembros.forEach((m) => m.rama && (cuenta[m.rama.id] = (cuenta[m.rama.id] ?? 0) + 1));
    return cuenta;
  }, [miembros]);

  // Si se llega desde Miembros con una rama elegida, se resalta y se desplaza hasta ella.
  const destacada = location.state?.selectedRamaId ?? null;
  useEffect(() => {
    if (destacada && ordenadas.length > 0) {
      requestAnimationFrame(() => document.getElementById(`rama-${destacada}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    }
  }, [destacada, ordenadas.length]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Encabezado titulo="Ramas" descripcion="Las unidades del grupo, su equipo de dirigentes y cuántos integrantes tiene cada una." />

      {estado === 'cargando' && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      )}

      {estado === 'error' && (
        <Alert>
          <ServerCrashIcon />
          <AlertTitle>No se pudieron cargar las ramas</AlertTitle>
          <AlertDescription>El servidor no responde. Vuelve a intentarlo en unos minutos.</AlertDescription>
        </Alert>
      )}

      {estado === 'listo' && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ordenadas.map((rama) => {
            const marca = RAMAS.find((r) => r.clave === rama.tipo);
            const total = integrantes[rama.id] ?? 0;
            return (
              <Card
                key={rama.id}
                id={`rama-${rama.id}`}
                className={cn('scroll-mt-20 transition-shadow', destacada === rama.id && 'ring-2 ring-primary')}
              >
                <CardHeader className="flex flex-row items-start gap-4">
                  {marca && <BanderinRama rama={marca} className="h-20 w-16" />}
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-2xl">{rama.nombre}</CardTitle>
                    <CardDescription>
                      {marca?.integrantes && `${marca.integrantes}, `}
                      {rama.edadMinima && rama.edadMaxima ? `${rama.edadMinima} a ${rama.edadMaxima} años` : marca?.edades}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  {rama.descripcion && <p className="text-sm text-muted-foreground">{rama.descripcion}</p>}
                  <Separator />
                  <div>
                    <h3>
                      <Button
                        variant="link"
                        className="h-auto gap-1 p-0 text-sm font-semibold text-foreground"
                        onClick={() => navigate('/admin/equipo', { state: { ramaId: rama.id } })}
                      >
                        Equipo de unidad
                        <ChevronRightIcon data-icon="inline-end" />
                      </Button>
                    </h3>
                    {rama.equipo?.length ? (
                      <ul className="mt-2 flex flex-col gap-2">
                        {rama.equipo.map((d) => (
                          <li key={d.id} className="flex flex-col items-start">
                            <Button variant="link" className="h-auto p-0 text-foreground" onClick={() => setDirigente(d)}>
                              {d.nombres} {d.apellidos}
                            </Button>
                            {d.cargo && <span className="text-xs text-muted-foreground">{d.cargo}</span>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">Sin dirigentes asignados.</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="justify-between gap-2">
                  <span className="text-sm">
                    <strong className="text-lg tabular-nums">{total}</strong> {total === 1 ? 'integrante' : 'integrantes'}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/miembros', { state: { ramaId: rama.id } })}>
                    <UsersIcon data-icon="inline-start" />
                    Ver miembros
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <ContactoDirigente dirigente={dirigente} onCerrar={() => setDirigente(null)} />
    </div>
  );
}

export default Ramas;
