import { useEffect, useRef, useState } from 'react';
import { KIKI_EYE, KIKI_FILLS, KIKI_STROKE, KIKI_STROKES, KIKI_VIEWBOX } from './kikiPaths.js';

/**
 * Kiki, el camaleón de Skilly, en SVG vectorial animable por partes.
 *
 * - title: texto accesible. Pasa null si Kiki es decorativo (p. ej. junto a la palabra "skilly").
 * - celebrateKey: cuando aumenta (p. ej. el nivel del usuario), Kiki cambia de color
 *   brevemente: morado → verde → amarillo → morado.
 * - El color sale de `color` (currentColor); por defecto, --skilly-purple.
 */
export default function Kiki({
  title = 'Kiki, el camaleón de Skilly',
  celebrateKey,
  className = '',
  onAnimationEnd,
  ...rest
}) {
  const [celebrating, setCelebrating] = useState(false);
  const lastKey = useRef(celebrateKey);

  useEffect(() => {
    const prev = lastKey.current;
    lastKey.current = celebrateKey;
    if (celebrateKey === undefined || celebrateKey === prev) return;
    // Solo al subir: si el nivel baja o se reinicia, no hay fiesta.
    if (typeof celebrateKey === 'number' && typeof prev === 'number' && celebrateKey < prev) return;

    // Quitar y volver a poner la clase reinicia la animación si sube dos veces seguidas.
    setCelebrating(false);
    const frame = requestAnimationFrame(() => setCelebrating(true));
    return () => cancelAnimationFrame(frame);
  }, [celebrateKey]);

  const handleAnimationEnd = (event) => {
    if (event.animationName === 'kiki-levelup') setCelebrating(false);
    onAnimationEnd?.(event);
  };

  const classes = ['kiki', celebrating && 'kiki--levelup', className].filter(Boolean).join(' ');

  return (
    <svg
      viewBox={KIKI_VIEWBOX}
      className={classes}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      onAnimationEnd={handleAnimationEnd}
      {...rest}
    >
      {title && <title>{title}</title>}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={KIKI_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {KIKI_STROKES.map(({ id, d }) => (
          <path key={id} className={`kiki-stroke kiki-${id}`} d={d} pathLength={1} />
        ))}
      </g>
      <g fill="currentColor">
        {KIKI_FILLS.map(({ id, d }) => (
          <path key={id} className={`kiki-fill kiki-${id}`} d={d} />
        ))}
        <circle className="kiki-eye" cx={KIKI_EYE.cx} cy={KIKI_EYE.cy} r={KIKI_EYE.r} />
      </g>
    </svg>
  );
}
