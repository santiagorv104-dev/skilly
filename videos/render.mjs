// Video de cada módulo: clips de personas (Pexels) + textos y Kiki animados encima
// + narración con voz neuronal (Piper). Salida en public/videos/: MP4 1280×720,
// póster PNG y subtítulos VTT.
//   node render.mjs [módulo ...]                 → renderiza (todos si no se indica)
//   node render.mjs liderazgo --muestras=3,12    → cuadros de muestra en %LOCALAPPDATA%\skilly-videos\muestras
// Clips, voz, narraciones y fuentes se descargan/generan una vez en %LOCALAPPDATA%\skilly-videos.
import { Resvg } from '@resvg/resvg-js';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MODULES } from '../src/content/modules.js';
import { KIKI_EYE, KIKI_FILLS, KIKI_STROKE, KIKI_STROKES, KIKI_VIEWBOX } from '../src/brand/kikiPaths.js';
import { TOOLS, download, ensurePiper, ensureVoice, synthesize } from './piper.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'public', 'videos');
const CLIPS = JSON.parse(readFileSync(path.join(HERE, 'clips.json'), 'utf8'));
const VOICE = 'es_MX-claude-high';
const W = 1280;
const H = 720;
const FPS = 30;
const C = {
  purple: '#4A2475', violet: '#6C3CE1', lavender: '#EEE2FF', line: '#D9C8F5',
  green: '#22C55E', yellow: '#FACC15', ink: '#2A1545', muted: '#6B5A85', white: '#FFFFFF',
};

// Tiempos (s): la intro empieza con Kiki dibujándose sobre lavanda y una cortina lo revela.
const REVEAL = 1.9;
const WIPE = 0.4;
const SWIPE = 0.32;
const LEAD = { intro: REVEAL + WIPE + 0.1, lesson: 0.5, outro: 0.6 };
const TAIL = { intro: 0.7, lesson: 0.9, outro: 2.6 };

// ---------------------------------------------------------------------------
function scenesFor(module) {
  const clips = CLIPS[module.id];
  return [
    { id: 'intro', kind: 'intro', text: module.video.intro, clip: clips.intro },
    ...module.lessons.map((lesson, i) => ({ id: `l${i + 1}`, kind: 'lesson', index: i, lesson, text: lesson.say, clip: clips[`l${i + 1}`] })),
    { id: 'outro', kind: 'outro', text: module.video.outro },
  ];
}

// ---------------------------------------------------------------------------
// Utilidades
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (x) => 1 - (1 - clamp(x)) ** 3;
const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2; };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function mix(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

function wrap(text, fontSize, width, factor = 0.56) {
  const max = Math.max(8, Math.floor(width / (fontSize * factor)));
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && (line + ' ' + word).length > max) { lines.push(line); line = word; }
    else line = line ? line + ' ' + word : word;
  }
  if (line) lines.push(line);
  return lines;
}

function textBlock(lines, { x, y, size, lh = 0, weight = 800, fill = C.ink, anchor = 'start', spacing = 0, opacity = 1 }) {
  const spans = lines.map((l, i) => `<tspan x="${x}" y="${(y + i * lh).toFixed(1)}">${esc(l)}</tspan>`).join('');
  return `<text font-family="Nunito" font-size="${size}" font-weight="${weight}" fill="${fill}" fill-opacity="${opacity}" text-anchor="${anchor}" letter-spacing="${spacing}">${spans}</text>`;
}

// ---------------------------------------------------------------------------
// Kiki (mismo dibujo que la app, animado por partes)
function pathLength(d) {
  const t = d.match(/[MLC]|-?\d*\.?\d+/g);
  let i = 0, cmd = null, cur = [0, 0], len = 0;
  const n = () => Number(t[i++]);
  while (i < t.length) {
    if (/[MLC]/.test(t[i])) cmd = t[i++];
    if (cmd === 'M') { cur = [n(), n()]; cmd = 'L'; continue; }
    if (cmd === 'L') { const p = [n(), n()]; len += Math.hypot(p[0] - cur[0], p[1] - cur[1]); cur = p; }
    if (cmd === 'C') {
      const a = [n(), n()], b = [n(), n()], p = [n(), n()];
      let prev = cur;
      for (let s = 1; s <= 24; s++) {
        const u = s / 24, v = 1 - u;
        const q = [0, 1].map((k) => v * v * v * cur[k] + 3 * v * v * u * a[k] + 3 * v * u * u * b[k] + u * u * u * p[k]);
        len += Math.hypot(q[0] - prev[0], q[1] - prev[1]);
        prev = q;
      }
      cur = p;
    }
  }
  return len;
}
const LENGTHS = Object.fromEntries(KIKI_STROKES.map((s) => [s.id, pathLength(s.d)]));
const DRAW = { head: [0.0, 0.45], back: [0.3, 1.15], belly: [0.5, 1.0], hindLeg: [0.8, 1.25, 'reverse'], tail: [1.05, 1.65] };
const FILL_AT = { toe: 1.0, hindTip: 1.2 };

function kiki({ x, y, width, drawT = Infinity, color = C.purple, eyeScale = 1, rotate = 0 }) {
  const [vx, vy, vw, vh] = KIKI_VIEWBOX.split(' ').map(Number);
  const s = width / vw;
  const cx = vw / 2 + vx, cy = vh / 2 + vy;
  let strokes = '';
  for (const { id, d } of KIKI_STROKES) {
    const [a, b, dir] = DRAW[id];
    const p = id === 'tail' ? easeOut((drawT - a) / (b - a)) : easeInOut((drawT - a) / (b - a));
    if (p <= 0) continue;
    const L = LENGTHS[id];
    const off = (1 - p) * (L + 20) * (dir === 'reverse' ? -1 : 1);
    const dash = p < 1 ? ` stroke-dasharray="${L.toFixed(1)} ${(L + 40).toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"` : '';
    strokes += `<path d="${d}"${dash}/>`;
  }
  const fills = KIKI_FILLS.map((f) => {
    const o = clamp((drawT - FILL_AT[f.id]) / 0.15);
    return o > 0 ? `<path d="${f.d}" opacity="${o.toFixed(2)}"/>` : '';
  }).join('');
  const pop = drawT === Infinity ? 1 : easeOut((drawT - 0.3) / 0.2) * (1 + 0.25 * Math.sin(clamp((drawT - 0.3) / 0.3) * Math.PI));
  const eye = pop > 0.01
    ? `<circle cx="${KIKI_EYE.cx}" cy="${KIKI_EYE.cy}" r="${KIKI_EYE.r}" transform="translate(${KIKI_EYE.cx} ${KIKI_EYE.cy}) scale(${pop.toFixed(3)} ${(pop * eyeScale).toFixed(3)}) translate(${-KIKI_EYE.cx} ${-KIKI_EYE.cy})"/>`
    : '';
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(4)}) translate(${-vx} ${-vy}) rotate(${rotate.toFixed(2)} ${cx} ${cy})">
<g fill="none" stroke="${color}" stroke-width="${KIKI_STROKE}" stroke-linecap="round" stroke-linejoin="round">${strokes}</g>
<g fill="${color}">${fills}${eye}</g></g>`;
}

const blink = (t) => {
  const phase = (t - 2.6) % 3.4;
  return t > 2.4 && phase >= 0 && phase < 0.24 ? 1 - 0.9 * Math.sin((Math.PI * phase) / 0.24) : 1;
};

function logo(color) {
  return kiki({ x: 48, y: 40, width: 64, color }) +
    `<text x="124" y="77" font-family="Nunito" font-size="36" font-weight="900" fill="${color}">skilly</text>`;
}

function chip(module) {
  const w = module.title.length * 12.5 + 48;
  return `<rect x="${1232 - w}" y="40" width="${w}" height="46" rx="23" fill="${C.white}"/>` +
    `<text x="${1232 - w / 2}" y="70" text-anchor="middle" font-family="Nunito" font-size="22" font-weight="800" fill="${C.purple}">${esc(module.title)}</text>`;
}

// ---------------------------------------------------------------------------
// Capa superpuesta (RGBA) para cada instante
function overlaySvg(module, number, scenes, total, t) {
  const scene = scenes.find((s) => t < s.end) ?? scenes[scenes.length - 1];
  const lt = t - scene.start;
  const sd = scene.end - scene.start;
  const appear = (delay) => {
    const e = easeOut((lt - delay) / 0.45);
    return { o: e.toFixed(3), dy: ((1 - e) * 24).toFixed(1) };
  };
  let svg = '';

  if (scene.kind === 'outro') {
    svg += `<rect width="${W}" height="${H}" fill="${C.lavender}"/>`;
    svg += `<circle cx="${1150 + 10 * Math.sin(t / 3)}" cy="640" r="190" fill="${C.white}" opacity="0.45"/>`;
    svg += `<circle cx="70" cy="${690 + 8 * Math.sin(t / 2.5)}" r="120" fill="${C.white}" opacity="0.45"/>`;
    svg += logo(C.purple) + chip(module);
    let color = C.purple, hop = 0;
    const c = (lt - 1.0) / 1.8;
    if (c > 0 && c < 1) {
      color = c < 0.3 ? mix(C.purple, C.green, c / 0.3) : c < 0.62 ? mix(C.green, C.yellow, (c - 0.3) / 0.32) : mix(C.yellow, C.purple, (c - 0.62) / 0.38);
      hop = -22 * Math.sin(Math.PI * clamp(c / 0.35));
    }
    svg += kiki({ x: 70, y: 200 + 7 * Math.sin((2 * Math.PI * t) / 2.6) + hop, width: 480, color, eyeScale: blink(t), rotate: 1.6 * Math.sin((2 * Math.PI * t) / 3.7) });
    const X = 610;
    const a = appear(0.05), b = appear(0.3), cc = appear(0.5), d = appear(0.7), e = appear(1.1);
    svg += `<g opacity="${a.o}" transform="translate(0 ${a.dy})">${textBlock(['¡Ahora te toca!'], { x: X, y: 260, size: 72, weight: 900, fill: C.purple })}</g>`;
    const items = [[C.green, `${module.lessons.length} lecciones cortas`], [C.yellow, '1 reto final'], [C.violet, 'Tu certificado']];
    [b, cc, d].forEach((p, i) => {
      const y = 350 + i * 64;
      svg += `<g opacity="${p.o}" transform="translate(0 ${p.dy})"><circle cx="${X + 16}" cy="${y - 12}" r="16" fill="${items[i][0]}"/>${textBlock([items[i][1]], { x: X + 50, y, size: 36, fill: C.ink })}</g>`;
    });
    svg += `<g opacity="${e.o}" transform="translate(0 ${e.dy})">${textBlock(['Porque en Skilly te', 'adaptamos al mercado'], { x: X, y: 580, size: 38, lh: 46, weight: 900, fill: C.violet })}</g>`;
    svg += `<rect x="0" y="${H - 8}" width="${W}" height="8" fill="${C.line}"/>`;
  } else {
    // Sombra para que el texto blanco se lea sobre el video
    svg += `<rect width="${W}" height="${H}" fill="url(#shade)"/>`;
    svg += `<rect y="0" width="${W}" height="140" fill="url(#shadeTop)"/>`;
    svg += logo(C.white) + chip(module);
    const X = 72, PW = 600;

    if (scene.kind === 'intro') {
      const base = REVEAL + WIPE - 0.1;
      const a = appear(base), b = appear(base + 0.15), c = appear(base + 0.35), d = appear(base + 0.55);
      const title = wrap(module.title, 84, PW, 0.58);
      const summary = wrap(module.summary, 36, PW);
      const ty = 330;
      const sy = ty + (title.length - 1) * 92 + 70;
      const cy = sy + (summary.length - 1) * 46 + 44;
      svg += `<g opacity="${a.o}" transform="translate(0 ${a.dy})">${textBlock([`MÓDULO ${number} DE ${MODULES.length}`], { x: X, y: 250, size: 22, weight: 900, fill: C.yellow, spacing: 3 })}</g>`;
      svg += `<g opacity="${b.o}" transform="translate(0 ${b.dy})">${textBlock(title, { x: X, y: ty, size: 84, lh: 92, weight: 900, fill: C.white })}</g>`;
      svg += `<g opacity="${c.o}" transform="translate(0 ${c.dy})">${textBlock(summary, { x: X, y: sy, size: 36, lh: 46, weight: 700, fill: C.white, opacity: 0.94 })}</g>`;
      svg += `<g opacity="${d.o}" transform="translate(0 ${d.dy})"><rect x="${X}" y="${cy}" width="470" height="52" rx="26" fill="${C.white}"/>${textBlock(['4 lecciones · 1 reto · 1 certificado'], { x: X + 235, y: cy + 35, size: 24, fill: C.purple, anchor: 'middle' })}</g>`;
    } else {
      const a = appear(0.15), b = appear(0.3), c = appear(0.6);
      const title = wrap(scene.lesson.title, 62, PW, 0.58);
      const key = wrap(scene.lesson.key, 34, PW - 70);
      const cardH = 92 + (key.length - 1) * 44 + 34;
      const cardY = H - 60 - cardH;
      const dots = module.lessons.map((_, i) => `<rect x="${X + i * 46}" y="164" width="38" height="8" rx="4" fill="${i <= scene.index ? C.yellow : C.white}" fill-opacity="${i <= scene.index ? 1 : 0.45}"/>`).join('');
      svg += `<g opacity="${a.o}" transform="translate(0 ${a.dy})">${dots}${textBlock([`LECCIÓN ${scene.index + 1} DE ${module.lessons.length}`], { x: X, y: 214, size: 22, weight: 900, fill: C.yellow, spacing: 3 })}</g>`;
      svg += `<g opacity="${b.o}" transform="translate(0 ${b.dy})">${textBlock(title, { x: X, y: 288, size: 62, lh: 70, weight: 900, fill: C.white })}</g>`;
      svg += `<g opacity="${c.o}" transform="translate(0 ${c.dy})">
<rect x="${X}" y="${cardY}" width="${PW + 20}" height="${cardH}" rx="22" fill="${C.white}"/>
<rect x="${X}" y="${cardY}" width="10" height="${cardH}" rx="5" fill="${C.yellow}"/>
${textBlock(['IDEA CLAVE'], { x: X + 38, y: cardY + 46, size: 19, weight: 900, fill: C.muted, spacing: 3 })}
${textBlock(key, { x: X + 38, y: cardY + 92, size: 34, lh: 44, fill: C.purple })}</g>`;
    }

    // Kiki en una insignia, abajo a la derecha
    const pop = easeOut((lt - (scene.kind === 'intro' ? REVEAL + WIPE : 0.2)) / 0.4);
    if (pop > 0) {
      const bob = 5 * Math.sin((2 * Math.PI * t) / 2.6);
      const r = 76 * (0.6 + 0.4 * pop);
      svg += `<g opacity="${pop.toFixed(3)}"><circle cx="1172" cy="${614 + bob}" r="${r.toFixed(1)}" fill="#000" opacity="0.18" transform="translate(3 6)"/>`;
      svg += `<circle cx="1172" cy="${614 + bob}" r="${r.toFixed(1)}" fill="${C.white}"/>`;
      svg += kiki({ x: 1172 - 60 * (0.6 + 0.4 * pop), y: 614 + bob - 40 * (0.6 + 0.4 * pop), width: 120 * (0.6 + 0.4 * pop), eyeScale: blink(t), rotate: 2 * Math.sin((2 * Math.PI * t) / 3.7) }) + '</g>';
    }
    svg += `<rect x="0" y="${H - 8}" width="${W}" height="8" fill="${C.white}" fill-opacity="0.35"/>`;

    // Intro: Kiki se dibuja sobre lavanda y una cortina lo descubre
    if (scene.kind === 'intro' && lt < REVEAL + WIPE) {
      const dx = -W * easeInOut((lt - REVEAL) / WIPE);
      svg += `<g transform="translate(${dx.toFixed(1)} 0)"><rect width="${W}" height="${H}" fill="${C.lavender}"/>`;
      svg += `<rect x="${W - 10}" width="10" height="${H}" fill="${C.violet}"/>`;
      svg += kiki({ x: 410, y: 150, width: 460, drawT: lt });
      const wm = easeOut((lt - 1.35) / 0.4);
      svg += `<g opacity="${wm.toFixed(3)}">${textBlock(['skilly'], { x: W / 2, y: 610 + (1 - wm) * 20, size: 64, weight: 900, fill: C.purple, anchor: 'middle' })}</g></g>`;
    }
  }

  // Cortina lavanda entre escenas
  const idx = scenes.indexOf(scene);
  if (scene.kind !== 'outro' && lt > sd - SWIPE) {
    const x = W * (1 - easeInOut((lt - (sd - SWIPE)) / SWIPE));
    svg += `<rect x="${x.toFixed(1)}" width="${W}" height="${H}" fill="${C.lavender}"/><rect x="${x.toFixed(1)}" width="10" height="${H}" fill="${C.violet}"/>`;
  }
  if (scene.kind === 'lesson' && idx > 0 && lt < SWIPE) {
    const x = -W * easeInOut(lt / SWIPE);
    svg += `<rect x="${x.toFixed(1)}" width="${W}" height="${H}" fill="${C.lavender}"/><rect x="${(x + W - 10).toFixed(1)}" width="10" height="${H}" fill="${C.violet}"/>`;
  }

  svg += `<rect x="0" y="${H - 8}" width="${(W * t / total).toFixed(1)}" height="8" fill="${C.violet}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
<linearGradient id="shade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${C.ink}" stop-opacity="0.86"/><stop offset="0.5" stop-color="${C.ink}" stop-opacity="0.55"/><stop offset="0.85" stop-color="${C.ink}" stop-opacity="0"/></linearGradient>
<linearGradient id="shadeTop" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.ink}" stop-opacity="0.5"/><stop offset="1" stop-color="${C.ink}" stop-opacity="0"/></linearGradient>
</defs>${svg}</svg>`;
}

// ---------------------------------------------------------------------------
// Audio (WAV PCM 16 bits mono)
function readWav(file) {
  const b = readFileSync(file);
  let pos = 12, fmt = null, data = null;
  while (pos + 8 <= b.length) {
    const id = b.toString('ascii', pos, pos + 4);
    const size = b.readUInt32LE(pos + 4);
    if (id === 'fmt ') fmt = { channels: b.readUInt16LE(pos + 10), rate: b.readUInt32LE(pos + 12), bits: b.readUInt16LE(pos + 22) };
    if (id === 'data') data = b.subarray(pos + 8, pos + 8 + size);
    pos += 8 + size + (size % 2);
  }
  if (!fmt || !data || fmt.bits !== 16 || fmt.channels !== 1) throw new Error(`WAV no soportado: ${file}`);
  return { rate: fmt.rate, samples: new Int16Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.length)) };
}

function writeWav(file, samples, rate) {
  const data = Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  writeFileSync(file, Buffer.concat([h, data]));
}

async function narrate(scenes) {
  const exe = await ensurePiper();
  const model = await ensureVoice(VOICE);
  const dir = path.join(TOOLS, 'narracion');
  mkdirSync(dir, { recursive: true });
  for (const s of scenes) {
    const hash = createHash('sha1').update(`${VOICE}|${s.text}`).digest('hex').slice(0, 16);
    s.wavFile = path.join(dir, `${hash}.wav`);
    if (!existsSync(s.wavFile)) await synthesize(exe, model, s.text, s.wavFile);
  }
}

// ---------------------------------------------------------------------------
// Clips
async function ensureClip(clip) {
  const dir = path.join(TOOLS, 'clips');
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, clip.archivo);
  if (!existsSync(file)) {
    await download(`https://videos.pexels.com/video-files/${clip.pexels}/${clip.archivo}`, file);
  }
  return file;
}

function duration(file) {
  const r = spawnSync(ffmpeg.path, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const m = r.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return m ? +m[1] * 3600 + +m[2] * 60 + parseFloat(m[3]) : 0;
}

// Cada escena con video: cámara lenta si el clip es corto y un paneo suave.
function clipFilter(input, scene, i) {
  const D = scene.end - scene.start;
  const usable = scene.clipDur - scene.clipOffset;
  const speed = usable >= D ? 1 : Math.max(0.62, usable / D);
  const pan = i % 2 === 0 ? `min(t/${D.toFixed(3)},1)` : `(1-min(t/${D.toFixed(3)},1))`;
  return `[${input}:v]setpts=(PTS-STARTPTS)/${speed.toFixed(3)},fps=${FPS},scale=-2:792,crop=${W}:${H}:x='(in_w-out_w)*${pan}':y='(in_h-out_h)/2',trim=duration=${D.toFixed(3)},setpts=PTS-STARTPTS,format=yuv420p,setsar=1[v${i}]`;
}

// ---------------------------------------------------------------------------
// Subtítulos
const stamp = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)}.${p(ms % 1000, 3)}`;
};

function captions(scenes) {
  let vtt = 'WEBVTT\n\n';
  let n = 1;
  for (const s of scenes) {
    const chunks = s.text.split(/(?<=[.!?:])\s+/).flatMap((c) => {
      if (c.length <= 80) return [c];
      const mid = c.indexOf(', ', Math.floor(c.length / 3));
      return mid > 0 ? [c.slice(0, mid + 1), c.slice(mid + 2)] : [c];
    });
    const totalChars = chunks.reduce((a, c) => a + c.length, 0);
    let t = s.voiceStart;
    for (const c of chunks) {
      const d = (s.voiceDur * c.length) / totalChars;
      vtt += `${n++}\n${stamp(t)} --> ${stamp(t + d)}\n${c}\n\n`;
      t += d;
    }
  }
  return vtt;
}

// ---------------------------------------------------------------------------
// Fuente Nunito (OFL) para los textos del video
async function fonts() {
  const dir = path.join(TOOLS, 'fonts');
  const files = { 700: 'Nunito-Bold.ttf', 800: 'Nunito-ExtraBold.ttf', 900: 'Nunito-Black.ttf' };
  const paths = Object.values(files).map((f) => path.join(dir, f));
  if (paths.every((p) => existsSync(p))) return paths;
  mkdirSync(dir, { recursive: true });
  const css = await (await fetch('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900', { headers: { 'User-Agent': 'curl/8.0' } })).text();
  for (const block of css.split('@font-face').slice(1)) {
    const weight = block.match(/font-weight:\s*(\d+)/)[1];
    const url = block.match(/url\((https:[^)]+\.ttf)\)/)[1];
    await download(url, path.join(dir, files[weight]));
  }
  return paths;
}

// ---------------------------------------------------------------------------
async function prepare(module) {
  const scenes = scenesFor(module);
  await narrate(scenes);
  for (const s of scenes) {
    if (!s.clip) continue;
    s.clipFile = await ensureClip(s.clip);
    s.clipDur = duration(s.clipFile);
    s.clipOffset = Math.min(0.4, s.clipDur * 0.05);
  }
  let t = 0, rate = 0;
  for (const s of scenes) {
    const wav = readWav(s.wavFile);
    rate = wav.rate;
    s.wav = wav.samples;
    s.start = t;
    s.voiceStart = t + LEAD[s.kind];
    s.voiceDur = wav.samples.length / wav.rate;
    s.end = s.voiceStart + s.voiceDur + TAIL[s.kind];
    t = s.end;
  }
  return { scenes, total: t, rate };
}

async function samples(module, fontFiles, times) {
  const { scenes, total } = await prepare(module);
  const number = MODULES.indexOf(module) + 1;
  const dir = path.join(TOOLS, 'muestras');
  mkdirSync(dir, { recursive: true });
  for (const at of times) {
    const scene = scenes.find((s) => at < s.end) ?? scenes[scenes.length - 1];
    let bg = '';
    if (scene.clipFile) {
      const png = path.join(dir, 'fondo.png');
      spawnSync(ffmpeg.path, ['-y', '-loglevel', 'error', '-ss', String(scene.clipOffset + (at - scene.start)), '-i', scene.clipFile, '-frames:v', '1', '-vf', `scale=-2:792,crop=${W}:${H}`, png]);
      bg = `<image href="data:image/png;base64,${readFileSync(png).toString('base64')}" width="${W}" height="${H}"/>`;
    }
    const ov = overlaySvg(module, number, scenes, total, at).replace(/<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${bg}${ov}</svg>`;
    const out = new Resvg(svg, { font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Nunito' }, fitTo: { mode: 'width', value: 640 } });
    writeFileSync(path.join(dir, `${module.id}-${at}.png`), out.render().asPng());
  }
  console.log(`muestras de ${module.id} (${total.toFixed(1)} s) en ${dir}`);
}

async function render(module, fontFiles) {
  const number = MODULES.indexOf(module) + 1;
  const { scenes, total, rate } = await prepare(module);
  const work = path.join(TOOLS, 'trabajo');
  mkdirSync(work, { recursive: true });

  const audio = new Int16Array(Math.ceil(total * rate) + rate);
  for (const s of scenes) audio.set(s.wav, Math.round(s.voiceStart * rate));
  const audioFile = path.join(work, `${module.id}.wav`);
  writeWav(audioFile, audio, rate);

  // Entradas: un clip por escena con video, fondo lavanda para el cierre,
  // la capa animada por stdin y la narración.
  const args = ['-y', '-loglevel', 'error'];
  const filters = [];
  let input = 0;
  scenes.forEach((s, i) => {
    if (s.clipFile) {
      args.push('-stream_loop', '-1', '-ss', s.clipOffset.toFixed(2), '-i', s.clipFile);
      filters.push(clipFilter(input++, s, i));
    } else {
      args.push('-f', 'lavfi', '-i', `color=c=0xEEE2FF:s=${W}x${H}:r=${FPS}:d=${(s.end - s.start).toFixed(3)}`);
      filters.push(`[${input++}:v]format=yuv420p,setsar=1[v${i}]`);
    }
  });
  const overlayInput = input++;
  args.push('-f', 'rawvideo', '-pixel_format', 'rgba', '-video_size', `${W}x${H}`, '-framerate', String(FPS), '-i', 'pipe:0');
  const audioInput = input++;
  args.push('-i', audioFile);
  filters.push(`${scenes.map((_, i) => `[v${i}]`).join('')}concat=n=${scenes.length}:v=1:a=0[bg]`);
  filters.push(`[bg][${overlayInput}:v]overlay=0:0:format=auto,format=yuv420p[out]`);

  mkdirSync(OUT, { recursive: true });
  const out = path.join(OUT, `${module.id}.mp4`);
  args.push(
    '-filter_complex', filters.join(';'),
    '-map', '[out]', '-map', `${audioInput}:a`,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-pix_fmt', 'yuv420p',
    '-af', 'volume=0.85', '-c:a', 'aac', '-b:a', '128k', '-ar', '44100',
    '-shortest', '-movflags', '+faststart', out,
  );
  const enc = spawn(ffmpeg.path, args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((ok, fail) => enc.on('close', (code) => (code === 0 ? ok() : fail(new Error(`ffmpeg salió con ${code}`)))));

  const fontOpts = { font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Nunito' } };
  const frames = Math.ceil(total * FPS);
  for (let f = 0; f < frames; f++) {
    const img = new Resvg(overlaySvg(module, number, scenes, total, f / FPS), fontOpts).render();
    if (!enc.stdin.write(img.pixels)) await new Promise((r) => enc.stdin.once('drain', r));
    if (f % (FPS * 15) === 0) process.stdout.write(`  ${module.id}: ${(f / FPS).toFixed(0)}s / ${total.toFixed(0)}s\n`);
  }
  enc.stdin.end();
  await done;

  writeFileSync(path.join(OUT, `${module.id}.vtt`), captions(scenes));
  const posterAt = scenes[0].start + LEAD.intro + 1.4;
  spawnSync(ffmpeg.path, ['-y', '-loglevel', 'error', '-ss', posterAt.toFixed(2), '-i', out, '-frames:v', '1', '-vf', 'scale=960:-2', '-q:v', '4', path.join(OUT, `${module.id}.jpg`)]);
  console.log(`ok ${module.id}.mp4 (${total.toFixed(1)} s)`);
}

// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const sampleArg = args.find((a) => a.startsWith('--muestras='));
const ids = args.filter((a) => !a.startsWith('--'));
const chosen = ids.length ? MODULES.filter((m) => ids.includes(m.id)) : MODULES;
const fontFiles = await fonts();
for (const m of chosen) {
  if (sampleArg) await samples(m, fontFiles, sampleArg.split('=')[1].split(',').map(Number));
  else await render(m, fontFiles);
}
