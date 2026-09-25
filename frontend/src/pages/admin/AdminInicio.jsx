import { Link } from 'react-router-dom';
import { PenLineIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { seccionesPara } from '@/components/admin/AppSidebar';
import { usePerfil } from '@/context/PerfilContext';

const DESCRIPCIONES = {
  '/admin/ramas': 'Unidades del grupo, su equipo y sus integrantes.',
  '/admin/miembros': 'Fichas de niñas, niños y jóvenes con sus apoderados.',
  '/admin/equipo': 'Dirigentes, cargos y documentación al día.',
  '/admin/inventario': 'Carpas, ollas y materiales: qué hay y dónde está.',
  '/admin/eventos': 'Reuniones, salidas y campamentos del calendario.',
  '/admin/pagos': 'Cuotas y campamentos: quién pagó y qué comprobantes faltan revisar.',
  '/admin/noticias': 'Lo que ven las familias en el sitio público.',
  '/admin/biblioteca': 'Manuales y formularios de la biblioteca pública.',
  '/admin/autorizaciones': 'Quién autorizó cada campamento y quién falta.',
};

export default function AdminInicio() {
  const { esAdmin } = usePerfil();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl uppercase">Panel del grupo</h1>
          <p className="mt-2 text-muted-foreground">Elige qué quieres gestionar hoy.</p>
        </div>
        <Button asChild>
          <Link to="/admin/noticias/nueva">
            <PenLineIcon data-icon="inline-start" />
            Publicar noticia
          </Link>
        </Button>
      </div>

      {seccionesPara(esAdmin).map((seccion) => (
        <section key={seccion.titulo} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">{seccion.titulo}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {seccion.items.map(({ to, label, icon }) => {
              const Icono = icon;
              return (
              <Link
                key={to}
                to={to}
                className="group flex items-start gap-4 rounded-lg border bg-card p-4 hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Icono className="size-5" />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-semibold group-hover:underline group-hover:decoration-primary">{label}</span>
                  <span className="text-sm text-muted-foreground">{DESCRIPCIONES[to]}</span>
                </span>
              </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
