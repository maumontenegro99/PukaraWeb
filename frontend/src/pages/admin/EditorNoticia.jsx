import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ArrowLeftIcon, ImageUpIcon, LoaderCircleIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { NoticiaCard } from '@/components/noticias/NoticiaCard';
import SocialEmbed from '@/components/SocialEmbed';
import { apiUrl } from '@/lib/api';
import { api } from '@/lib/panel';

const TIPOS = [
  { clave: 'INSTITUCIONAL', etiqueta: 'Institucional' },
  { clave: 'RAMA', etiqueta: 'De una rama' },
  { clave: 'EVENTO', etiqueta: 'Convocatoria' },
  { clave: 'AVISO', etiqueta: 'Aviso urgente' },
  { clave: 'HISTORIA', etiqueta: 'Historia' },
  { clave: 'OTRO', etiqueta: 'Otro' },
];

const MAX_IMAGEN = 2 * 1024 * 1024;
const MAX_BAJADA = 300;
const VACIA = { titulo: '', bajada: '', contenido: '', imagenUrl: '', enlaceSocial: '', autor: '', tipo: 'INSTITUCIONAL' };
const MODULOS_EDITOR = {
  toolbar: [[{ header: [2, false] }], ['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'clean']],
};
const contenidoVacio = (html) => !html || html.replace(/<(.|\n)*?>/g, '').trim() === '';

export default function EditorNoticia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const archivoRef = useRef(null);
  const [noticia, setNoticia] = useState(VACIA);
  const [original, setOriginal] = useState(null); // conserva fechaPublicacion al editar
  const [cargando, setCargando] = useState(!!id);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(apiUrl(`/api/noticias/${id}`))
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('No se encontró la noticia.'))))
      .then((data) => {
        setOriginal(data);
        setNoticia({ ...VACIA, ...Object.fromEntries(Object.keys(VACIA).map((k) => [k, data[k] ?? VACIA[k]])) });
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id]);

  const cambiar = (campo) => (valor) => setNoticia((n) => ({ ...n, [campo]: valor }));
  const campo = (nombre) => ({ id: `noticia-${nombre}`, value: noticia[nombre], onChange: (e) => cambiar(nombre)(e.target.value) });

  const subirImagen = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (archivo.size > MAX_IMAGEN) {
      setError('La imagen supera los 2 MB. Usa una más liviana o pega un enlace.');
      return;
    }
    const lector = new FileReader();
    lector.onloadend = () => cambiar('imagenUrl')(lector.result);
    lector.readAsDataURL(archivo);
  };

  const quitarImagen = () => {
    cambiar('imagenUrl')('');
    if (archivoRef.current) archivoRef.current.value = '';
  };

  const publicar = async (e) => {
    e.preventDefault();
    if (contenidoVacio(noticia.contenido)) {
      setError('Escribe el contenido de la noticia.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      await api('/api/noticias', {
        method: 'POST',
        body: { ...noticia, ...(original && { id: original.id, fechaPublicacion: original.fechaPublicacion }) },
      });
      toast.success(original ? 'Noticia actualizada' : 'Noticia publicada en el portal');
      navigate('/admin/noticias');
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const esArchivo = noticia.imagenUrl.startsWith('data:');
  const vistaPrevia = { ...noticia, id: original?.id ?? 0, fechaPublicacion: original?.fechaPublicacion ?? new Date().toISOString() };

  if (cargando) return <Skeleton className="mx-auto h-96 w-full max-w-6xl" />;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Button asChild variant="ghost" className="-ml-3 w-fit">
        <Link to="/admin/noticias">
          <ArrowLeftIcon data-icon="inline-start" />
          Todas las noticias
        </Link>
      </Button>
      <h1 className="font-display text-5xl uppercase">{original ? 'Editar noticia' : 'Publicar noticia'}</h1>

      <form onSubmit={publicar} className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <FieldGroup className="min-w-0">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Field>
            <FieldLabel htmlFor="noticia-titulo">Título</FieldLabel>
            <Input {...campo('titulo')} required />
          </Field>
          <Field>
            <FieldLabel htmlFor="noticia-bajada">Resumen</FieldLabel>
            <Textarea {...campo('bajada')} rows={2} maxLength={MAX_BAJADA} required />
            <FieldDescription>
              Se muestra en la tarjeta del portal. {noticia.bajada.length} de {MAX_BAJADA} caracteres.
            </FieldDescription>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="noticia-tipo">Tipo</FieldLabel>
              <Select value={noticia.tipo} onValueChange={cambiar('tipo')}>
                <SelectTrigger id="noticia-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {TIPOS.map((t) => (
                      <SelectItem key={t.clave} value={t.clave}>
                        {t.etiqueta}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="noticia-autor">Firma</FieldLabel>
              <Input {...campo('autor')} placeholder="Jefatura de grupo" required />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="noticia-imagen">Imagen de portada</FieldLabel>
            {esArchivo ? (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <img src={noticia.imagenUrl} alt="" className="size-14 rounded-md object-cover" />
                <span className="flex-1 text-sm">Imagen subida desde tu equipo</span>
                <Button type="button" variant="ghost" size="sm" onClick={quitarImagen}>
                  <XIcon data-icon="inline-start" />
                  Quitar
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input {...campo('imagenUrl')} id="noticia-imagen" type="url" placeholder="Pega el enlace de una imagen" />
                <Button type="button" variant="outline" onClick={() => archivoRef.current?.click()}>
                  <ImageUpIcon data-icon="inline-start" />
                  Subir desde el equipo
                </Button>
              </div>
            )}
            <input ref={archivoRef} type="file" accept="image/*" className="hidden" onChange={subirImagen} tabIndex={-1} aria-hidden="true" />
            <FieldDescription>Opcional. Sin imagen, la tarjeta usa la insignia del grupo.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="noticia-enlaceSocial">Publicación en redes</FieldLabel>
            <Input {...campo('enlaceSocial')} type="url" placeholder="Enlace de Instagram, YouTube, TikTok o X" />
            <FieldDescription>Opcional. Se muestra incrustada al final de la noticia.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Contenido</FieldLabel>
            <div className="overflow-hidden rounded-lg border bg-card [&_.ql-container]:min-h-64 [&_.ql-container]:border-0 [&_.ql-container]:font-sans [&_.ql-container]:text-base [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b">
              <ReactQuill theme="snow" value={noticia.contenido} onChange={cambiar('contenido')} modules={MODULOS_EDITOR} />
            </div>
          </Field>

          <div className="flex gap-2">
            <Button type="submit" size="lg" disabled={guardando || !noticia.titulo || !noticia.bajada || !noticia.autor}>
              {guardando && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
              {original ? 'Guardar cambios' : 'Publicar'}
            </Button>
            <Button asChild type="button" variant="ghost" size="lg">
              <Link to="/admin/noticias">Cancelar</Link>
            </Button>
          </div>
        </FieldGroup>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-20 lg:self-start">
          <h2 className="text-sm font-semibold text-muted-foreground">Así se verá en el portal</h2>
          <div className="pointer-events-none">
            <NoticiaCard noticia={{ ...vistaPrevia, titulo: noticia.titulo || 'Título de la noticia', bajada: noticia.bajada || 'El resumen aparecerá aquí.' }} />
          </div>
          {noticia.enlaceSocial && (
            <div className="pointer-events-none">
              <SocialEmbed url={noticia.enlaceSocial} />
            </div>
          )}
        </aside>
      </form>
    </div>
  );
}
