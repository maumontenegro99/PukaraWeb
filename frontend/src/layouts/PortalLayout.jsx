import { Link, NavLink, Outlet } from 'react-router-dom';
import { MenuIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Banderines, COLORES_SOBRE_OSCURO } from '@/components/brand/Banderines';
import { SelectorTema } from '@/components/SelectorTema';
import { TransicionRuta } from '@/components/TransicionRuta';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import insignia from '@/assets/insignia.png';
import logoAsociacion from '@/assets/logo-asosiacion.png';
import iconoGmail from '@/assets/icon-mail.png';
import iconoMaps from '@/assets/icon-map.png';
import iconoInstagram from '@/assets/icon-instagram.png';
import iconoFacebook from '@/assets/icon-facebook.png';

// `clase` corrige cada ícono: el de Maps es negro (se invierte a blanco) y el de Instagram trae margen propio.
const CONTACTOS = [
  { href: 'mailto:pukaraweche@gmail.com', red: 'Correo', icono: iconoGmail, texto: 'pukaraweche@gmail.com', externo: false },
  { href: 'https://maps.app.goo.gl/WWYeVVZFBZ2wPEYe7', red: 'Google Maps', icono: iconoMaps, texto: 'Cómo llegar a la sede', clase: 'invert' },
  { href: 'https://www.instagram.com/pukaraweche', red: 'Instagram', icono: iconoInstagram, texto: '@pukaraweche', clase: 'scale-[1.4]' },
  { href: 'https://www.facebook.com/pukaraweche', red: 'Facebook', icono: iconoFacebook, texto: 'Pukara Weche', clase: 'rounded-[4px]' },
];

const ENLACES = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/noticias', label: 'Noticias' },
  { to: '/#ramas', label: 'Ramas' },
  { to: '/#unete', label: 'Únete' },
];

function EnlacesNav({ className, onNavigate }) {
  return (
    <nav className={className}>
      {ENLACES.map(({ to, label, end }) =>
        to.includes('#') ? (
          <Link key={to} to={to} onClick={onNavigate} className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground">
            {label}
          </Link>
        ) : (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground',
                isActive && 'text-foreground underline decoration-primary decoration-2 underline-offset-8'
              )
            }
          >
            {label}
          </NavLink>
        )
      )}
    </nav>
  );
}

export default function PortalLayout() {
  const { isAuthenticated } = useAuth();

  const accesoPanel = isAuthenticated
    ? { to: '/admin', label: 'Ir al panel' }
    : { to: '/login', label: 'Acceso dirigentes' };

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={insignia} alt="" className="h-10 w-auto" />
            <span className="font-display text-2xl uppercase">Pukara Weche</span>
          </Link>

          <EnlacesNav className="hidden items-center gap-1 md:flex" />

          <div className="flex items-center gap-2">
            <SelectorTema />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/biblioteca">Biblioteca</Link>
            </Button>
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link to={accesoPanel.to}>{accesoPanel.label}</Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl uppercase">Pukara Weche</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 px-4">
                  <EnlacesNav className="flex flex-col" />
                  <Separator />
                  <Button asChild variant="outline">
                    <Link to="/biblioteca">Biblioteca</Link>
                  </Button>
                  <Button asChild>
                    <Link to={accesoPanel.to}>{accesoPanel.label}</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <Banderines animado />
      </header>

      <main className="flex-1">
        <TransicionRuta>
          <Outlet />
        </TransicionRuta>
      </main>

      <footer className="bg-grafito text-white/80">
        <Banderines colores={COLORES_SOBRE_OSCURO} className="opacity-70" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <span className="font-display text-3xl uppercase text-white">Pukara Weche</span>
            <p className="max-w-sm text-sm leading-relaxed">
              Grupo guía y scout. Aprendemos a vivir en la naturaleza, en comunidad y al servicio de los demás.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <span className="font-semibold text-white">Contacto</span>
            {CONTACTOS.map(({ href, red, icono, texto, clase, externo = true }) => (
              <a
                key={href}
                href={href}
                {...(externo && { target: '_blank', rel: 'noopener noreferrer' })}
                className="inline-flex w-fit items-center gap-3 rounded-md hover:text-white focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="flex size-6 shrink-0 items-center justify-center">
                  <img src={icono} alt="" className={cn('size-full object-contain', clase)} />
                </span>
                <span>
                  <span className="sr-only">{red}: </span>
                  {texto}
                </span>
              </a>
            ))}
          </div>

          <div className="flex flex-col items-start gap-3 text-sm">
            <span className="font-semibold text-white">Somos parte de</span>
            <a href="https://guiasyscoutsdechile.org/" target="_blank" rel="noopener noreferrer" className="rounded-md opacity-90 hover:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
              <img src={logoAsociacion} alt="Asociación de Guías y Scouts de Chile" className="h-24 w-auto" />
            </a>
          </div>
        </div>
        <p className="border-t border-white/10 py-5 text-center text-xs text-white/60">
          © {new Date().getFullYear()} Grupo Scout Pukara Weche
        </p>
      </footer>
    </div>
  );
}
