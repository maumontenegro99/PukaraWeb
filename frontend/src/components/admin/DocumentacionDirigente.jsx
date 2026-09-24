import { useCallback, useEffect, useRef, useState } from 'react';
import { CircleCheckIcon, CircleDashedIcon, EyeIcon, FileTextIcon, LoaderCircleIcon, RefreshCwIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmarEliminar } from '@/components/admin/ConfirmarEliminar';
import { formatearFechaCorta, formatearTamano } from '@/lib/biblioteca';
import { DOCUMENTOS } from '@/lib/documentacion';
import { abrirArchivoProtegido, api } from '@/lib/panel';

const MAX_BYTES = 10 * 1024 * 1024;

function FilaDocumento({ doc, archivo, entregado, ocupado, onSubir, onVer, onEliminar }) {
  const entrada = useRef(null);
  const elegir = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > MAX_BYTES) return toast.error('El archivo supera los 10 MB.');
    onSubir(doc, f);
  };

  return (
    <li className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {archivo || entregado ? (
            <CircleCheckIcon className="mt-0.5 size-5 shrink-0 text-[var(--color-rama-tropa)]" />
          ) : (
            <CircleDashedIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          )}
          <div className="flex flex-col gap-1">
            <p className="font-medium leading-tight">{doc.etiqueta}</p>
            {archivo ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileTextIcon className="size-3.5" />
                {archivo.nombreArchivo}, {formatearTamano(archivo.tamano)}. Subido el {formatearFechaCorta(archivo.fechaSubida)}
              </p>
            ) : entregado ? (
              <Badge variant="secondary">Entregado en papel, sin archivo</Badge>
            ) : (
              <p className="text-xs text-muted-foreground">Falta entregarlo</p>
            )}
          </div>
        </div>
        {ocupado && <LoaderCircleIcon className="size-4 shrink-0 animate-spin text-muted-foreground" />}
      </div>

      <div className="flex flex-wrap gap-2">
        {archivo && (
          <Button variant="outline" size="sm" onClick={() => onVer(doc)}>
            <EyeIcon data-icon="inline-start" />
            Ver
          </Button>
        )}
        <Button variant={archivo ? 'ghost' : 'default'} size="sm" disabled={ocupado} onClick={() => entrada.current?.click()}>
          {archivo ? <RefreshCwIcon data-icon="inline-start" /> : <UploadIcon data-icon="inline-start" />}
          {archivo ? 'Reemplazar' : 'Subir archivo'}
        </Button>
        {archivo && (
          <Button variant="ghost" size="sm" disabled={ocupado} onClick={() => onEliminar(doc)}>
            <Trash2Icon data-icon="inline-start" />
            Eliminar
          </Button>
        )}
        <input
          ref={entrada}
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={elegir}
          aria-label={`Archivo de ${doc.etiqueta}`}
        />
      </div>
    </li>
  );
}

// Panel lateral con los documentos de un dirigente. `onCambio` avisa a la página para recargar la lista
// (subir o eliminar un archivo cambia qué documentos figuran como entregados).
export function DocumentacionDirigente({ dirigente, onCerrar, onCambio }) {
  const [respuesta, setRespuesta] = useState({ id: null, archivos: [] });
  const [ocupado, setOcupado] = useState(null); // tipo en proceso
  const [aEliminar, setAEliminar] = useState(null);

  const id = dirigente?.id;
  const cargar = useCallback(
    () =>
      api(`/api/dirigentes/${id}/documentos`)
        .then((archivos) => setRespuesta({ id, archivos }))
        .catch((err) => toast.error(err.message)),
    [id]
  );

  useEffect(() => {
    if (id) cargar();
  }, [id, cargar]);

  const cargando = !!id && respuesta.id !== id;
  const archivoDe = (tipo) => respuesta.archivos.find((a) => a.tipo === tipo);

  const subir = async (doc, archivo) => {
    setOcupado(doc.tipo);
    try {
      const datos = new FormData();
      datos.append('archivo', archivo);
      await api(`/api/dirigentes/${id}/documentos/${doc.tipo}`, { method: 'PUT', body: datos });
      toast.success(`${doc.etiqueta} guardado`);
      await cargar();
      onCambio();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOcupado(null);
    }
  };

  const eliminar = async () => {
    const doc = aEliminar;
    setAEliminar(null);
    setOcupado(doc.tipo);
    try {
      await api(`/api/dirigentes/${id}/documentos/${doc.tipo}`, { method: 'DELETE' });
      toast.success(`${doc.etiqueta} eliminado`);
      await cargar();
      onCambio();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOcupado(null);
    }
  };

  const ver = (doc) =>
    abrirArchivoProtegido(`/api/dirigentes/${id}/documentos/${doc.tipo}/archivo`).catch((err) => toast.error(err.message));

  const completos = DOCUMENTOS.filter((d) => archivoDe(d.tipo) || dirigente?.[d.campo]).length;

  return (
    <Sheet open={!!dirigente} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            Documentación de {dirigente?.nombres} {dirigente?.apellidos}
          </SheetTitle>
          <SheetDescription>
            {completos} de {DOCUMENTOS.length} entregados. Los archivos son privados: solo se ven desde este panel.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          {cargando ? (
            <div className="flex flex-col gap-3">
              {DOCUMENTOS.map((d) => (
                <Skeleton key={d.tipo} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {DOCUMENTOS.map((doc) => (
                <FilaDocumento
                  key={doc.tipo}
                  doc={doc}
                  archivo={archivoDe(doc.tipo)}
                  entregado={!!dirigente?.[doc.campo]}
                  ocupado={ocupado === doc.tipo}
                  onSubir={subir}
                  onVer={ver}
                  onEliminar={setAEliminar}
                />
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">PDF, JPG o PNG de hasta 10 MB. Subir un archivo lo marca como entregado.</p>
        </div>
      </SheetContent>

      <ConfirmarEliminar
        abierto={!!aEliminar}
        onCambio={(abierto) => !abierto && setAEliminar(null)}
        titulo={`¿Eliminar el archivo de ${aEliminar?.etiqueta?.toLowerCase()}?`}
        descripcion="El documento quedará como pendiente hasta que se suba otro."
        accion="Eliminar archivo"
        onConfirmar={eliminar}
      />
    </Sheet>
  );
}
