import { useId } from 'react';

// Íconos sólidos de un color (currentColor) para el pie del portal, en el mismo estilo que el de Google Maps.
// Los recortes se hacen con máscaras para que el "hueco" deje ver el fondo.

export function IconoCorreo(props) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <mask id={id}>
        <rect width="24" height="24" fill="white" />
        <path d="M3.5 7 12 13.2 20.5 7" fill="none" stroke="black" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </mask>
      <rect x="1.5" y="4" width="21" height="16" rx="2.5" mask={`url(#${id})`} />
    </svg>
  );
}

export function IconoInstagram(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M7.5 1.5h9a6 6 0 0 1 6 6v9a6 6 0 0 1-6 6h-9a6 6 0 0 1-6-6v-9a6 6 0 0 1 6-6Zm0 2.3a3.7 3.7 0 0 0-3.7 3.7v9a3.7 3.7 0 0 0 3.7 3.7h9a3.7 3.7 0 0 0 3.7-3.7v-9a3.7 3.7 0 0 0-3.7-3.7h-9Z"
      />
      <path fillRule="evenodd" d="M12 6.8a5.2 5.2 0 1 1 0 10.4 5.2 5.2 0 0 1 0-10.4Zm0 2.3a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Z" />
      <circle cx="17.4" cy="6.6" r="1.3" />
    </svg>
  );
}

export function IconoFacebook(props) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <mask id={id}>
        <rect width="24" height="24" fill="white" />
        <path
          fill="black"
          d="M13.4 24v-9.6h3.1l.5-3.4h-3.6V8.9c0-1 .3-1.7 1.7-1.7H17V4.2c-.3 0-1.4-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.5V11H7.2v3.4H10V24Z"
        />
      </mask>
      <circle cx="12" cy="12" r="11" mask={`url(#${id})`} />
    </svg>
  );
}
