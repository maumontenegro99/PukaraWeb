import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronsUpDownIcon, LogOutIcon, UserRoundIcon } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { authFetch } from '@/helpers/AuthFetch';
import { apiUrl } from '@/lib/api';

const ROLES = { ADMIN: 'Administración', DIRIGENTE_GUIADORA: 'Dirigente', APODERADO: 'Apoderado' };

const iniciales = (nombre = '') =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || 'PW';

export function NavUser() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useSidebar();

  const [usuario, setUsuario] = useState({ nombreCompleto: '', username: '', rol: '' });
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [form, setForm] = useState({ nombreCompleto: '', password: '' });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    authFetch(apiUrl('/api/usuarios/perfil'))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setUsuario(data))
      .catch(() => {});
  }, []);

  const abrirPerfil = () => {
    setForm({ nombreCompleto: usuario.nombreCompleto ?? '', password: '' });
    setPerfilAbierto(true);
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const res = await authFetch(apiUrl('/api/usuarios/perfil'), {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setUsuario(await res.json());
        setPerfilAbierto(false);
      }
    } finally {
      setGuardando(false);
    }
  };

  const cerrarSesion = () => {
    logout();
    navigate('/');
  };

  const nombre = usuario.nombreCompleto || usuario.username;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                <Avatar className="size-8 rounded-md">
                  <AvatarFallback className="rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    {iniciales(nombre)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{nombre || 'Cargando…'}</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">{ROLES[usuario.rol] ?? ''}</span>
                </div>
                <ChevronsUpDownIcon className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side={isMobile ? 'bottom' : 'right'} align="end" className="min-w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="grid text-sm leading-tight">
                  <span className="font-medium">{nombre}</span>
                  <span className="text-xs text-muted-foreground">@{usuario.username}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={abrirPerfil}>
                  <UserRoundIcon />
                  Mi perfil
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={cerrarSesion} variant="destructive">
                  <LogOutIcon />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={perfilAbierto} onOpenChange={setPerfilAbierto}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={guardarPerfil} className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle>Mi perfil</DialogTitle>
              <DialogDescription>Así te verán los demás dirigentes en el panel.</DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="perfil-nombre">Nombre completo</FieldLabel>
                <Input
                  id="perfil-nombre"
                  value={form.nombreCompleto}
                  onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="perfil-password">Nueva contraseña</FieldLabel>
                <Input
                  id="perfil-password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <FieldDescription>Déjala vacía para mantener la actual.</FieldDescription>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={guardando}>Guardar cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
