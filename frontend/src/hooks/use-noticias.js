import { useEffect, useState } from 'react';
import { apiUrl } from '@/lib/api';

// Noticias públicas: el backend permite GET /api/noticias sin token y las devuelve de la más nueva a la más antigua.
export function useNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error

  useEffect(() => {
    const controller = new AbortController();
    fetch(apiUrl('/api/noticias'), { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setNoticias(data);
        setEstado('listo');
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setEstado('error');
      });
    return () => controller.abort();
  }, []);

  return { noticias, estado };
}

export function useNoticia(id) {
  // Guarda para qué id es la respuesta: si el id cambia, se considera "cargando" hasta que llegue la nueva.
  const [respuesta, setRespuesta] = useState({ id: null, noticia: null, estado: 'cargando' }); // estado: listo | no-encontrada | error

  useEffect(() => {
    const controller = new AbortController();
    fetch(apiUrl(`/api/noticias/${id}`), { signal: controller.signal })
      .then((res) => {
        if (res.status === 404) return setRespuesta({ id, noticia: null, estado: 'no-encontrada' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json().then((data) => setRespuesta({ id, noticia: data, estado: 'listo' }));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setRespuesta({ id, noticia: null, estado: 'error' });
      });
    return () => controller.abort();
  }, [id]);

  return respuesta.id === id ? respuesta : { noticia: null, estado: 'cargando' };
}
