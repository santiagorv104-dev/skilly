// Geometría del radar de 12 habilidades. La usan el gráfico en SVG y la
// tarjeta PNG (canvas), así los dos se ven igual.

// Orden de los ejes en el sentido del reloj desde arriba. Los nombres cortos
// quedan a los lados y los largos arriba y abajo, donde sobra ancho: así el
// radar cabe en un celular de 360 px sin cortar etiquetas.
export const RADAR_ORDER = ['com', 'org', 'equ', 'lid', 'neg', 'pen', 'ada', 'apr', 'res', 'ini', 'esc', 'aut'];

const LABEL_LINES = {
  esc: ['Escucha y', 'empatía'],
  equ: ['Trabajo en', 'equipo'],
  pen: ['Pensamiento', 'crítico'],
};

export const labelLines = (skill) => LABEL_LINES[skill.id] ?? [skill.short];

export const RINGS = [25, 50, 75, 100];

let measureCtx;
// Ancho del texto en píxeles con la fuente de la app; si no hay canvas, una estimación.
export function textWidth(text, fontSize, weight = 800) {
  try {
    measureCtx ??= document.createElement('canvas').getContext('2d');
    measureCtx.font = `${weight} ${fontSize}px Nunito, system-ui, sans-serif`;
    return measureCtx.measureText(text).width;
  } catch {
    return text.length * fontSize * 0.6;
  }
}

/**
 * Calcula el radar para un ancho dado.
 * skills: las 12 habilidades (cualquier orden); se ubican según RADAR_ORDER.
 * Devuelve { width, height, cx, cy, R, axes } y cada eje trae su ángulo,
 * el extremo y la posición de su etiqueta.
 */
export function radarLayout(width, skills, { fontSize = 13, gap = 10, maxR = 170, pad = 4, measure = textWidth } = {}) {
  const byId = Object.fromEntries(skills.map((s) => [s.id, s]));
  const lineH = fontSize * 1.2;
  const axes = RADAR_ORDER.map((id, k) => {
    const angle = (k * Math.PI * 2) / RADAR_ORDER.length;
    const lines = labelLines(byId[id]);
    const labelW = Math.max(...lines.map((l) => measure(l, fontSize)));
    return { id, skill: byId[id], k, angle, sin: Math.sin(angle), cos: Math.cos(angle), lines, labelW };
  });

  // El radio más grande que deja espacio a todas las etiquetas laterales.
  let R = maxR;
  for (const a of axes) {
    const s = Math.abs(a.sin);
    if (s > 0.2) R = Math.min(R, (width / 2 - a.labelW - pad) / s - gap);
  }
  R = Math.max(40, R);

  const top = axes[0].lines.length * lineH;
  const bottom = axes[6].lines.length * lineH;
  const cx = width / 2;
  const cy = pad + top + gap + 4 + R;
  const height = cy + R + gap + 4 + bottom + pad;

  for (const a of axes) {
    const r = R + gap;
    const x = cx + r * a.sin;
    const y = cy - r * a.cos;
    a.end = { x: cx + R * a.sin, y: cy - R * a.cos };
    a.label = {
      x,
      anchor: a.sin > 0.2 ? 'start' : a.sin < -0.2 ? 'end' : 'middle',
      // Primera línea de base: arriba se apila hacia arriba, abajo hacia abajo y
      // a los lados queda centrada en el punto.
      y:
        a.cos > 0.95
          ? y - 4 - (a.lines.length - 1) * lineH - lineH * 0.25
          : a.cos < -0.95
            ? y + 4 + lineH * 0.8
            : y - ((a.lines.length - 1) * lineH) / 2 + fontSize * 0.35,
      lineH,
    };
  }

  return { width, height, cx, cy, R, axes, fontSize };
}

// Punto del eje para un valor de 0 a 100.
export function pointAt(layout, axis, value) {
  const r = (layout.R * Math.max(0, Math.min(100, value))) / 100;
  return { x: layout.cx + r * axis.sin, y: layout.cy - r * axis.cos };
}

export function polygon(layout, key) {
  return layout.axes.map((a) => pointAt(layout, a, a.skill[key]));
}

export const toPoints = (pts) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
