import { useEffect, useRef, useState } from 'react';
import Kiki from './Kiki.jsx';

const STORAGE_KEY = 'skilly:splash-visto';
const WORD = 'skilly';
const ANIMATED_MS = 2500; // dibujo + parpadeo + palabra + desvanecido
const STATIC_MS = 1400;   // versión sin movimiento
const FADE_MS = 350;      // igual que la transición de .skilly-splash

function prefersReducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** El splash se ve una sola vez por sesión del navegador. */
export function shouldShowSplash() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== '1';
  } catch {
    return true;
  }
}

/**
 * Pantalla de bienvenida: Kiki se dibuja solo, parpadea, aparece "skilly" letra
 * por letra con el lema y todo se desvanece para dejar ver la app.
 * Con "reducir movimiento" activado se muestra estática y más corta.
 * Clic, toque, Esc, Enter o espacio la saltan.
 */
export default function SplashScreen({ onDone, tagline = 'Juega a crecer' }) {
  const [reduced] = useState(prefersReducedMotion);
  const [leaving, setLeaving] = useState(false);
  const onDoneRef = useRef(onDone);
  const finishRef = useRef(() => {});
  onDoneRef.current = onDone;

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Sin almacenamiento (modo privado estricto): se volverá a mostrar, sin más.
    }

    let finished = false;
    let doneTimer;
    const finish = () => {
      if (finished) return;
      finished = true;
      setLeaving(true);
      doneTimer = setTimeout(() => onDoneRef.current?.(), FADE_MS);
    };
    finishRef.current = finish;

    const total = reduced ? STATIC_MS : ANIMATED_MS;
    const leaveTimer = setTimeout(finish, total - FADE_MS);
    const onKey = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') finish();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
      window.removeEventListener('keydown', onKey);
    };
  }, [reduced]);

  const classes = [
    'skilly-splash',
    !reduced && 'skilly-splash--animated',
    leaving && 'skilly-splash--leaving',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={() => finishRef.current()} aria-hidden="true">
      <Kiki className="skilly-splash__kiki" title={null} />
      <p className="skilly-splash__word">
        {WORD.split('').map((letter, i) => (
          <span key={i} style={{ '--i': i }}>
            {letter}
          </span>
        ))}
      </p>
      <p className="skilly-splash__tagline">{tagline}</p>
    </div>
  );
}
