import { useEffect, useRef, useState } from 'react';
import { SKY_EYE, SKY_FILLS, SKY_STROKE, SKY_STROKES, SKY_VIEWBOX } from './skyPaths.js';

/**
 * Sky, el camaleón de Skilly, en SVG vectorial animable por partes.
 *
 * - title: texto accesible. Pasa null si Sky es decorativo (p. ej. junto a la palabra "skilly").
 * - celebrateKey: cuando aumenta (p. ej. el nivel del usuario), Sky cambia de color
 *   brevemente: morado → verde → amarillo → morado.
 * - El color sale de `color` (currentColor); por defecto, --skilly-purple.
 */
export default function SkyChameleon({
  title = 'Sky, el camaleón de Skilly',
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
    if (event.animationName === 'sky-levelup') setCelebrating(false);
    onAnimationEnd?.(event);
  };

  const classes = ['sky', celebrating && 'sky--levelup', className].filter(Boolean).join(' ');

  return (
    <svg
      viewBox={SKY_VIEWBOX}
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
        strokeWidth={SKY_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {SKY_STROKES.map(({ id, d }) => (
          <path key={id} className={`sky-stroke sky-${id}`} d={d} pathLength={1} />
        ))}
      </g>
      <g fill="currentColor">
        {SKY_FILLS.map(({ id, d }) => (
          <path key={id} className={`sky-fill sky-${id}`} d={d} />
        ))}
        <circle className="sky-eye" cx={SKY_EYE.cx} cy={SKY_EYE.cy} r={SKY_EYE.r} />
      </g>
    </svg>
  );
}
