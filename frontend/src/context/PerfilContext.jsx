import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/panel';

// Perfil de quien tiene la sesión en el panel: { id, username, nombreCompleto, rol }.
// El rol solo sirve para ocultar lo que no se puede usar; quien decide los permisos es el backend (responde 403).
const PerfilContext = createContext({ perfil: null, setPerfil: () => {}, esAdmin: true });

export function PerfilProvider({ children }) {
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    api('/api/usuarios/perfil')
      .then(setPerfil)
      .catch(() => {});
  }, []);

  // Mientras carga se asume administración para que el menú no parpadee (hoy casi todos los usuarios lo son).
  const esAdmin = perfil === null || perfil.rol === 'ADMIN';

  return <PerfilContext.Provider value={{ perfil, setPerfil, esAdmin }}>{children}</PerfilContext.Provider>;
}

export const usePerfil = () => useContext(PerfilContext);
