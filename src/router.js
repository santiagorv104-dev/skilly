import { useEffect, useState } from 'react';

// Navegación con #/ruta: no necesita configuración del servidor, así funciona
// igual en local, en GitHub Pages o en cualquier hosting estático.
const read = () => window.location.hash.replace(/^#/, '') || '/';

export function useRoute() {
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export function go(path) {
  window.location.hash = path;
}
