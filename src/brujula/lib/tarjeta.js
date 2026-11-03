// Tarjeta para compartir: PNG vertical de 1080 × 1350 dibujado con canvas,
// con el logo de Skilly, el radar, las fortalezas y las prioridades.

import { KIKI_EYE, KIKI_FILLS, KIKI_STROKE, KIKI_STROKES, KIKI_VIEWBOX } from '../brand/kikiPaths.js';
import { VERSIONS } from '../data/contenido.js';
import { RINGS, pointAt, polygon, radarLayout } from './radar.js';
import { formatDate } from './puntaje.js';

const W = 1080;
const H = 1350;
const C = {
  purple: '#4A2475',
  violet: '#6C3CE1',
  lavender: '#EEE2FF',
  green: '#22C55E',
  greenText: '#166534',
  yellow: '#FACC15',
  ink: '#2A1545',
  muted: '#6B5A85',
  line: '#D9C8F5',
  white: '#FFFFFF',
};
const FONT = 'Nunito, system-ui, sans-serif';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawKiki(ctx, x, y, height, color) {
  const [vx, vy, vw, vh] = KIKI_VIEWBOX.split(' ').map(Number);
  const s = height / vh;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.translate(-vx, -vy);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = KIKI_STROKE;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const { d } of KIKI_STROKES) ctx.stroke(new Path2D(d));
  for (const { d } of KIKI_FILLS) ctx.fill(new Path2D(d));
  ctx.beginPath();
  ctx.arc(KIKI_EYE.cx, KIKI_EYE.cy, KIKI_EYE.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return (vw / vh) * height;
}

function pathFrom(ctx, pts) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
}

function drawRadar(ctx, report, ox, oy, width) {
  const measure = (text, fs) => {
    ctx.font = `800 ${fs}px ${FONT}`;
    return ctx.measureText(text).width;
  };
  const L = radarLayout(width, report.skills, { fontSize: 27, gap: 16, maxR: 245, measure });
  ctx.save();
  ctx.translate(ox, oy);

  ctx.strokeStyle = C.line;
  ctx.lineWidth = 2;
  for (const v of RINGS) {
    pathFrom(ctx, L.axes.map((a) => pointAt(L, a, v)));
    ctx.stroke();
  }
  for (const a of L.axes) {
    ctx.beginPath();
    ctx.moveTo(L.cx, L.cy);
    ctx.lineTo(a.end.x, a.end.y);
    ctx.stroke();
  }

  pathFrom(ctx, polygon(L, 'index'));
  ctx.fillStyle = 'rgba(108, 60, 225, 0.28)';
  ctx.fill();
  ctx.strokeStyle = C.violet;
  ctx.lineWidth = 3;
  ctx.stroke();

  pathFrom(ctx, polygon(L, 'self'));
  ctx.strokeStyle = C.purple;
  ctx.lineWidth = 4;
  ctx.stroke();

  pathFrom(ctx, polygon(L, 'cases'));
  ctx.strokeStyle = C.greenText;
  ctx.setLineDash([14, 10]);
  ctx.stroke();
  ctx.setLineDash([]);

  for (const p of polygon(L, 'index')) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = C.violet;
    ctx.fill();
    ctx.strokeStyle = C.white;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.fillStyle = C.purple;
  ctx.font = `800 ${L.fontSize}px ${FONT}`;
  ctx.textBaseline = 'alphabetic';
  for (const a of L.axes) {
    ctx.textAlign = a.label.anchor === 'middle' ? 'center' : a.label.anchor === 'end' ? 'right' : 'left';
    a.lines.forEach((line, i) => ctx.fillText(line, a.label.x, a.label.y + i * a.label.lineH));
  }
  ctx.restore();
  return L.height;
}

// Etiquetas tipo pastilla en columna.
function drawPills(ctx, items, x, y, { fill, text, border }) {
  ctx.font = `800 28px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  items.forEach((label, i) => {
    const w = ctx.measureText(label).width + 44;
    const top = y + i * 66;
    roundRect(ctx, x, top, w, 52, 26);
    ctx.fillStyle = fill;
    ctx.fill();
    if (border) {
      ctx.strokeStyle = border;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.fillStyle = text;
    ctx.fillText(label, x + 22, top + 27);
  });
}

function fitFont(ctx, text, weight, size, maxWidth) {
  let fs = size;
  ctx.font = `${weight} ${fs}px ${FONT}`;
  while (ctx.measureText(text).width > maxWidth && fs > 30) {
    fs -= 2;
    ctx.font = `${weight} ${fs}px ${FONT}`;
  }
  return fs;
}

export async function drawShareCard(report, meta) {
  try {
    await Promise.all(['900 60px', '800 28px', '700 28px'].map((f) => document.fonts.load(`${f} Nunito`)));
  } catch {
    // Sin Nunito se dibuja con la fuente del sistema.
  }

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = C.lavender;
  ctx.fillRect(0, 0, W, H);

  // Logo: Kiki + "skilly".
  const kikiW = drawKiki(ctx, 60, 52, 70, C.purple);
  ctx.fillStyle = C.purple;
  ctx.font = `900 66px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('skilly', 60 + kikiW + 18, 112);

  ctx.font = `800 28px ${FONT}`;
  const tag = 'Brújula de habilidades';
  const tagW = ctx.measureText(tag).width + 48;
  roundRect(ctx, W - 60 - tagW, 62, tagW, 54, 27);
  ctx.fillStyle = C.yellow;
  ctx.fill();
  ctx.fillStyle = C.purple;
  ctx.textBaseline = 'middle';
  ctx.fillText(tag, W - 60 - tagW + 24, 90);

  // Tarjeta blanca.
  roundRect(ctx, 50, 165, W - 100, 1105, 40);
  ctx.fillStyle = C.white;
  ctx.fill();

  const title = meta.name ? `Tu brújula, ${meta.name}` : 'Tu brújula';
  ctx.fillStyle = C.purple;
  ctx.textBaseline = 'alphabetic';
  fitFont(ctx, title, 900, 60, W - 200);
  ctx.fillText(title, 100, 250);

  ctx.fillStyle = C.muted;
  ctx.font = `700 30px ${FONT}`;
  ctx.fillText(`${formatDate(meta.date)} · Versión ${VERSIONS[report.version].name}`, 100, 298);

  const radarH = drawRadar(ctx, report, 100, 320, W - 200);

  // Leyenda.
  const ly = 320 + radarH + 18;
  ctx.font = `700 24px ${FONT}`;
  ctx.textBaseline = 'middle';
  const legend = [
    { label: 'Índice', draw: (x) => { roundRect(ctx, x, ly - 12, 34, 24, 6); ctx.fillStyle = 'rgba(108, 60, 225, 0.35)'; ctx.fill(); } },
    { label: 'Te describes', draw: (x) => { ctx.strokeStyle = C.purple; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, ly); ctx.lineTo(x + 34, ly); ctx.stroke(); } },
    { label: 'Decides en los casos', draw: (x) => { ctx.strokeStyle = C.greenText; ctx.lineWidth = 4; ctx.setLineDash([9, 6]); ctx.beginPath(); ctx.moveTo(x, ly); ctx.lineTo(x + 34, ly); ctx.stroke(); ctx.setLineDash([]); } },
  ];
  const widths = legend.map((l) => 34 + 12 + ctx.measureText(l.label).width);
  let lx = (W - (widths.reduce((a, b) => a + b, 0) + 40 * (legend.length - 1))) / 2;
  legend.forEach((l, i) => {
    l.draw(lx);
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'left';
    ctx.fillText(l.label, lx + 46, ly + 1);
    lx += widths[i] + 40;
  });

  // Fortalezas y prioridades.
  const by = ly + 50;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.purple;
  ctx.font = `900 32px ${FONT}`;
  ctx.fillText('Tus fortalezas', 100, by + 26);
  ctx.fillText('Por dónde empezar', 560, by + 26);
  drawPills(ctx, report.strengths.map((s) => `${s.short} ${s.index}`), 100, by + 48, { fill: C.green, text: C.purple });
  drawPills(ctx, report.priorities.map((s) => `${s.short} ${s.index}`), 560, by + 48, {
    fill: C.lavender,
    text: C.purple,
    border: C.violet,
  });

  ctx.fillStyle = C.purple;
  ctx.font = `800 26px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('skilly · Tu brújula de habilidades', W / 2, H - 34);

  return canvas;
}

export async function downloadShareCard(report, meta) {
  const canvas = await drawShareCard(report, meta);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  const slug = (meta.name || 'skilly')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `brujula-${slug || 'skilly'}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
