import { Link, useLocation } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ExternalLinkIcon,
  FileSignatureIcon,
  FlagIcon,
  LibraryIcon,
  HouseIcon,
  NewspaperIcon,
  PackageIcon,
  UserCogIcon,
  UsersIcon,
  WalletIcon,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/admin/NavUser';
import insignia from '@/assets/insignia.png';

export const SECCIONES = [
  {
    titulo: 'Grupo',
    items: [
      { to: '/admin/ramas', label: 'Ramas', icon: FlagIcon },
      { to: '/admin/miembros', label: 'Miembros', icon: UsersIcon },
      { to: '/admin/equipo', label: 'Dirigentes', icon: UserCogIcon },
    ],
  },
  {
    titulo: 'Logística',
    items: [
      { to: '/admin/inventario', label: 'Inventario', icon: PackageIcon },
      { to: '/admin/eventos', label: 'Eventos', icon: CalendarDaysIcon },
    ],
  },
  {
    titulo: 'Finanzas',
    items: [{ to: '/admin/pagos', label: 'Pagos', icon: WalletIcon }],
  },
  {
    titulo: 'Comunicación',
    items: [{ to: '/admin/noticias', label: 'Noticias', icon: NewspaperIcon }],
  },
  {
    titulo: 'Biblioteca',
    items: [
      { to: '/admin/biblioteca', label: 'Documentos', icon: LibraryIcon },
      { to: '/admin/autorizaciones', label: 'Autorizaciones', icon: FileSignatureIcon },
    ],
  },
];

function ItemNav({ to, label, icon, end }) {
  const Icon = icon;
  const { pathname } = useLocation();
  const activo = end ? pathname === to : pathname.startsWith(to);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={activo} tooltip={label} asChild>
        <Link to={to} aria-current={activo ? 'page' : undefined}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin">
                <img src={insignia} alt="" className="size-8 object-contain" />
                <div className="flex flex-col leading-tight">
                  <span className="font-display text-lg uppercase">Pukara Weche</span>
                  <span className="text-xs text-sidebar-foreground/60">Panel del grupo</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <ItemNav to="/admin" label="Inicio" icon={HouseIcon} end />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {SECCIONES.map((seccion) => (
          <SidebarGroup key={seccion.titulo}>
            <SidebarGroupLabel>{seccion.titulo}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {seccion.items.map((item) => (
                  <ItemNav key={item.to} {...item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Ver sitio público" asChild>
              <Link to="/">
                <ExternalLinkIcon />
                <span>Ver sitio público</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Ver biblioteca" asChild>
              <Link to="/biblioteca">
                <LibraryIcon />
                <span>Ver biblioteca</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
