import { Link, NavLink, Outlet } from 'react-router-dom';
import { MenuIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';
import { Banderines, COLORES_SOBRE_OSCURO } from '@/components/brand/Banderines';
import { SelectorTema } from '@/components/SelectorTema';
import { TransicionRuta } from '@/components/TransicionRuta';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import insignia from '@/assets/insignia.png';

const ENLACES = [
  { to: '/biblioteca', label: 'Documentos', end: true },
  { to: '/biblioteca/autorizaciones', label: 'Enviar autorización' },
  { to: '/biblioteca/pagos', label: 'Pagos' },
];

function EnlacesNav({ className, claro = false }) {
  return (
    <nav className={className}>
      {ENLACES.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'rounded-md px-3 py-2 text-sm font-medium',
              claro ? 'text-white/75 hover:bg-white/10 hover:text-white' : 'text-foreground/80 hover:bg-muted',
              isActive && (claro ? 'text-white underline decoration-primary decoration-2 underline-offset-8' : 'text-foreground')
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function BibliotecaLayout() {
  const { isAuthenticated } = useAuth();
  const panel = isAuthenticated ? '/admin' : '/login';

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-grafito text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/biblioteca" className="flex items-center gap-3">
            <img src={insignia} alt="" className="h-10 w-auto" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl uppercase">Biblioteca</span>
              <span className="text-xs text-white/60">Pukara Weche</span>
            </span>
          </Link>

          <EnlacesNav claro className="hidden items-center gap-1 md:flex" />

          <div className="flex items-center gap-2">
            <SelectorTema sobreOscuro />
            <Button asChild variant="ghost" className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex">
              <Link to="/">Portal</Link>
            </Button>
            <Button asChild className="hidden sm:inline-flex">
              <Link to={panel}>Panel del grupo</Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white md:hidden" aria-label="Abrir menú">
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl uppercase">Biblioteca</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 px-4">
                  <EnlacesNav className="flex flex-col" />
                  <Separator />
                  <Button asChild variant="outline">
                    <Link to="/">Portal de noticias</Link>
                  </Button>
                  <Button asChild>
                    <Link to={panel}>Panel del grupo</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <Banderines animado colores={COLORES_SOBRE_OSCURO} />
      </header>

      <main className="flex-1">
        <TransicionRuta>
          <Outlet />
        </TransicionRuta>
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground">
          <span>Biblioteca del Grupo Scout Pukara Weche</span>
          <span>
            ¿Falta un documento? Escríbenos a{' '}
            <a href="mailto:pukaraweche@gmail.com" className="text-celeste-ink underline underline-offset-4">
              pukaraweche@gmail.com
            </a>
          </span>
        </div>
      </footer>
      <Toaster position="top-center" />
    </div>
  );
}
