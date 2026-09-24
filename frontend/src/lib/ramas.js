import logoManada from '@/assets/logo-manada.png';
import logoBandada from '@/assets/logo-bandada.png';
import logoTropa from '@/assets/logo-tropa.png';
import logoCompania from '@/assets/logo-compania.png';
import logoAvanzada from '@/assets/logo-avanzada.png';
import logoClan from '@/assets/logo-clan.png';

// Ramas del grupo en orden de progresión. `color` es el del estandarte de cada unidad.
export const RAMAS = [
  { clave: 'MANADA', nombre: 'Manada', integrantes: 'Lobatos', edades: '7 a 11 años', color: 'var(--color-rama-manada)', logo: logoManada },
  { clave: 'BANDADA', nombre: 'Bandada', integrantes: 'Golondrinas', edades: '7 a 11 años', color: 'var(--color-rama-bandada)', logo: logoBandada },
  { clave: 'TROPA', nombre: 'Tropa', integrantes: 'Scouts', edades: '11 a 15 años', color: 'var(--color-rama-tropa)', logo: logoTropa },
  { clave: 'COMPANIA', nombre: 'Compañía', integrantes: 'Guías', edades: '11 a 15 años', color: 'var(--color-rama-compania)', logo: logoCompania },
  { clave: 'AVANZADA', nombre: 'Avanzada', integrantes: 'Pioneros y pioneras', edades: '15 a 17 años', color: 'var(--color-rama-avanzada)', logo: logoAvanzada },
  { clave: 'CLAN', nombre: 'Clan', integrantes: 'Caminantes', edades: '17 a 21 años', color: 'var(--color-rama-clan)', logo: logoClan },
];
