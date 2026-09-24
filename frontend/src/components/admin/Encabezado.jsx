// Encabezado de cada página del panel: título, descripción y acciones a la derecha.
export function Encabezado({ titulo, descripcion, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-5xl uppercase">{titulo}</h1>
        {descripcion && <p className="mt-2 text-muted-foreground">{descripcion}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
