import { Link, Outlet, useLocation } from 'react-router-dom';

import { AppSidebar, SECCIONES } from '@/components/admin/AppSidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { SelectorTema } from '@/components/SelectorTema';
import { TransicionRuta } from '@/components/TransicionRuta';

const TITULOS = {
  ...Object.fromEntries(SECCIONES.flatMap((s) => s.items).map((i) => [i.to, i.label])),
  '/admin/noticias/nueva': 'Nueva noticia',
};

function Migas() {
  const { pathname } = useLocation();
  const seccion = Object.keys(TITULOS)
    .filter((ruta) => pathname.startsWith(ruta))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {seccion ? (
            <BreadcrumbLink asChild>
              <Link to="/admin">Panel</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>Panel</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {seccion && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{TITULOS[seccion]}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default function AdminLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Migas />
            <SelectorTema className="ml-auto" />
          </header>
          <TransicionRuta className="flex-1 p-4 md:p-6">
            <Outlet />
          </TransicionRuta>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="top-center" />
    </TooltipProvider>
  );
}
