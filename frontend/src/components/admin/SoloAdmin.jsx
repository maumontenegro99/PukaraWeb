import { Link } from 'react-router-dom';
import { LockIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { usePerfil } from '@/context/PerfilContext';

// Secciones del panel que solo usa administración (el backend responde 403 al resto; esto evita mostrar una pantalla rota).
export function SoloAdmin({ children }) {
  const { esAdmin } = usePerfil();
  if (esAdmin) return children;

  return (
    <Empty className="mx-auto max-w-lg border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LockIcon />
        </EmptyMedia>
        <EmptyTitle>Esta sección es solo para administración</EmptyTitle>
        <EmptyDescription>Si necesitas revisar algo de aquí, pídeselo a un administrador del grupo.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="outline">
          <Link to="/admin">Volver al panel</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
