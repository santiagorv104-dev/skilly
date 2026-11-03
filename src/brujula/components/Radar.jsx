import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RINGS, pointAt, polygon, radarLayout, toPoints } from '../lib/radar.js';

// Ancho del contenedor; se recalcula al girar el celular o cambiar la ventana.
function useWidth(ref) {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

// Vuelve a medir las etiquetas cuando termina de cargar Nunito.
function useFontsReady() {
  const [ready, setReady] = useState(() => document.fonts?.status === 'loaded');
  useEffect(() => {
    if (ready || !document.fonts) return;
    let alive = true;
    document.fonts.ready.then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [ready]);
  return ready;
}

/** Radar grande del informe: índice, autodescripción y casos, con etiquetas y valores. */
export function RadarChart({ skills }) {
  const box = useRef(null);
  const width = useWidth(box);
  useFontsReady();
  const [active, setActive] = useState(null);

  const narrow = width < 480;
  const layout =
    width > 0 &&
    radarLayout(width, skills, { fontSize: narrow ? 12 : 14, gap: narrow ? 8 : 12, maxR: 190 });

  const summary = skills.map((s) => `${s.short} ${s.index}`).join(', ');
  const activeAxis = layout && active !== null ? layout.axes[active] : null;
  const activePoint = activeAxis && pointAt(layout, activeAxis, activeAxis.skill.index);

  return (
    <div className="radar" ref={box} onMouseLeave={() => setActive(null)}>
      {layout && (
        <svg
          className="radar__svg"
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          role="group"
          aria-label={`Radar de tus 12 habilidades. Índices: ${summary}.`}
        >
          {RINGS.map((v) => (
            <polygon
              key={v}
              className={v === 100 ? 'radar__ring radar__ring--outer' : 'radar__ring'}
              points={toPoints(layout.axes.map((a) => pointAt(layout, a, v)))}
            />
          ))}
          {layout.axes.map((a) => (
            <line key={a.id} className="radar__axis" x1={layout.cx} y1={layout.cy} x2={a.end.x} y2={a.end.y} />
          ))}
          {RINGS.map((v) => (
            <text key={v} className="radar__tick" x={layout.cx + 4} y={layout.cy - (layout.R * v) / 100 + 11} aria-hidden="true">
              {v}
            </text>
          ))}

          <polygon className="radar__index" points={toPoints(polygon(layout, 'index'))} />
          <polygon className="radar__self" points={toPoints(polygon(layout, 'self'))} />
          <polygon className="radar__cases" points={toPoints(polygon(layout, 'cases'))} />

          {layout.axes.map((a) => (
            <text
              key={a.id}
              className="radar__label"
              x={a.label.x}
              y={a.label.y}
              textAnchor={a.label.anchor}
              style={{ fontSize: layout.fontSize }}
              aria-hidden="true"
            >
              {a.lines.map((line, i) => (
                <tspan key={line} x={a.label.x} dy={i === 0 ? 0 : a.label.lineH}>
                  {line}
                </tspan>
              ))}
            </text>
          ))}

          {layout.axes.map((a, k) => {
            const p = pointAt(layout, a, a.skill.index);
            const s = a.skill;
            return (
              <g
                key={a.id}
                className={active === k ? 'radar__point radar__point--on' : 'radar__point'}
                tabIndex={0}
                role="img"
                aria-label={`${s.short}: índice ${s.index}, te describes ${s.self}, decides ${s.cases}`}
                onMouseEnter={() => setActive(k)}
                onFocus={() => setActive(k)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(active === k ? null : k)}
              >
                <circle className="radar__hit" cx={p.x} cy={p.y} r={16} />
                <circle className="radar__dot" cx={p.x} cy={p.y} r={active === k ? 7 : 5} />
              </g>
            );
          })}
        </svg>
      )}

      {activeAxis && (
        <div
          className="radar__tip"
          role="status"
          style={{
            left: Math.min(Math.max(activePoint.x, 110), layout.width - 110),
            top: activePoint.y,
          }}
        >
          <strong>{activeAxis.skill.short}: {activeAxis.skill.index}</strong>
          <span>
            Te describes {activeAxis.skill.self} · Decides {activeAxis.skill.cases}
          </span>
        </div>
      )}

      <ul className="radar__legend">
        <li>
          <span className="swatch swatch--index" aria-hidden="true" /> Índice combinado
        </li>
        <li>
          <span className="swatch swatch--self" aria-hidden="true" /> Cómo te describes
        </li>
        <li>
          <span className="swatch swatch--cases" aria-hidden="true" /> Cómo decides en los casos
        </li>
      </ul>
    </div>
  );
}

/** Radar pequeño, sin etiquetas, para las tarjetas de inicio. */
export function MiniRadar({ skills, size = 120 }) {
  const layout = radarLayout(size, skills, { maxR: size / 2 - 4, gap: 0, pad: 0, measure: () => 0 });
  // Sin etiquetas: el radar ocupa todo el cuadro.
  const shift = layout.cy - size / 2;
  return (
    <svg className="radar-mini" width={size} height={size} viewBox={`0 ${shift} ${size} ${size}`} aria-hidden="true">
      {[50, 100].map((v) => (
        <polygon key={v} className="radar__ring" points={toPoints(layout.axes.map((a) => pointAt(layout, a, v)))} />
      ))}
      <polygon className="radar__index" points={toPoints(polygon(layout, 'index'))} />
    </svg>
  );
}
