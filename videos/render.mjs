// Video animado de Sky para cada módulo: MP4 (1280×720), póster PNG y subtítulos VTT
// en public/videos/. Pasos (en Windows, desde esta carpeta):
//   1. node render.mjs --frases            → .cache/<módulo>/frases.json con el guion
//   2. & .\tts.ps1 -Json .cache\<módulo>\frases.json -OutDir .cache\<módulo>\voz
//   3. node render.mjs [módulo ...]        → dibuja cada cuadro y codifica con ffmpeg
import { Resvg } from '@resvg/resvg-js';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MODULES } from '../src/content/modules.js';
import { SKY_EYE, SKY_FILLS, SKY_STROKE, SKY_STROKES, SKY_VIEWBOX } from '../src/brand/skyPaths.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE = path.join(HERE, '.cache');
const OUT = path.join(HERE, '..', 'public', 'videos');
const W = 1280;
const H = 720;
const FPS = 30;
const C = {
  purple: '#4A2475', violet: '#6C3CE1', lavender: '#EEE2FF', line: '#D9C8F5',
  green: '#22C55E', yellow: '#FACC15', ink: '#2A1545', muted: '#6B5A85', white: '#FFFFFF',
};

// ---------------------------------------------------------------------------
// Guion: una escena de introducción, una por lección y un cierre.
function scenesFor(module) {
  return [
    { id: 'intro', kind: 'intro', text: module.video.intro },
    ...module.lessons.map((lesson, i) => ({ id: `l${i + 1}`, kind: 'lesson', index: i, lesson, text: lesson.say })),
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

function textBlock(lines, { x, y, size, lh, weight = 800, fill = C.ink, anchor = 'start', spacing = 0 }) {
  const spans = lines.map((l, i) => `<tspan x="${x}" y="${(y + i * lh).toFixed(1)}">${esc(l)}</tspan>`).join('');
  return `<text font-family="Nunito" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}">${spans}</text>`;
}

// Longitud de cada trazo de Sky (para la animación de dibujo con stroke-dashoffset).
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
const LENGTHS = Object.fromEntries(SKY_STROKES.map((s) => [s.id, pathLength(s.d)]));

// Mismo orden y ritmo que el splash de la app: de la cabeza a la cola.
const DRAW = {
  head: [0.0, 0.45], back: [0.3, 1.15], belly: [0.5, 1.0], hindLeg: [0.8, 1.25, 'reverse'], tail: [1.05, 1.65],
};
const FILL_AT = { toe: 1.0, hindTip: 1.2 };

function sky({ x, y, width, drawT = Infinity, color = C.purple, eyeScale = 1, rotate = 0 }) {
  const [vx, vy, vw, vh] = SKY_VIEWBOX.split(' ').map(Number);
  const s = width / vw;
  const cx = vw / 2 + vx, cy = vh / 2 + vy;
  let strokes = '';
  for (const { id, d } of SKY_STROKES) {
    const [a, b, dir] = DRAW[id];
    const p = id === 'tail' ? easeOut((drawT - a) / (b - a)) : easeInOut((drawT - a) / (b - a));
    if (p <= 0) continue;
    const L = LENGTHS[id];
    const off = (1 - p) * (L + 20) * (dir === 'reverse' ? -1 : 1);
    const dash = p < 1 ? ` stroke-dasharray="${L.toFixed(1)} ${(L + 40).toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"` : '';
    strokes += `<path d="${d}"${dash}/>`;
  }
  const fills = SKY_FILLS.map((f) => {
    const o = clamp((drawT - FILL_AT[f.id]) / 0.15);
    return o > 0 ? `<path d="${f.d}" opacity="${o.toFixed(2)}"/>` : '';
  }).join('');
  const pop = drawT === Infinity ? 1 : easeOut((drawT - 0.3) / 0.2) * (1 + 0.25 * Math.sin(clamp((drawT - 0.3) / 0.3) * Math.PI));
  const ey = pop * eyeScale;
  const eye = pop > 0.01
    ? `<circle cx="${SKY_EYE.cx}" cy="${SKY_EYE.cy}" r="${SKY_EYE.r}" transform="translate(${SKY_EYE.cx} ${SKY_EYE.cy}) scale(${pop.toFixed(3)} ${ey.toFixed(3)}) translate(${-SKY_EYE.cx} ${-SKY_EYE.cy})"/>`
    : '';
  return `<g transform="translate(${x} ${y}) scale(${s.toFixed(4)}) translate(${-vx} ${-vy}) rotate(${rotate.toFixed(2)} ${cx} ${cy})">
<g fill="none" stroke="${color}" stroke-width="${SKY_STROKE}" stroke-linecap="round" stroke-linejoin="round">${strokes}</g>
<g fill="${color}">${fills}${eye}</g></g>`;
}

// ---------------------------------------------------------------------------
// Cuadro a cuadro
function frameSvg(module, number, scenes, total, t) {
  const scene = scenes.find((s) => t < s.end) ?? scenes[scenes.length - 1];
  const lt = t - scene.start;
  const sd = scene.end - scene.start;
  const exit = scene.kind === 'outro' ? 1 : clamp((sd - lt) / 0.3);
  const appear = (delay) => {
    const e = easeOut((lt - delay) / 0.45);
    return { o: (e * exit).toFixed(3), dy: ((1 - e) * 24).toFixed(1) };
  };

  // Fondo
  let svg = `<rect width="${W}" height="${H}" fill="${C.lavender}"/>`;
  svg += `<circle cx="${1150 + 10 * Math.sin(t / 3)}" cy="${640}" r="190" fill="${C.white}" opacity="0.45"/>`;
  svg += `<circle cx="${70}" cy="${690 + 8 * Math.sin(t / 2.5)}" r="120" fill="${C.white}" opacity="0.45"/>`;
  svg += `<circle cx="${1190}" cy="${120 + 8 * Math.cos(t / 2.8)}" r="80" fill="${C.white}" opacity="0.4"/>`;

  // Logo y módulo arriba
  svg += sky({ x: 52, y: 44, width: 64 });
  svg += `<text x="128" y="81" font-family="Nunito" font-size="36" font-weight="900" fill="${C.purple}">skilly</text>`;
  const chipW = module.title.length * 12.5 + 48;
  svg += `<rect x="${1228 - chipW}" y="44" width="${chipW}" height="46" rx="23" fill="${C.white}"/>`;
  svg += `<text x="${1228 - chipW / 2}" y="74" text-anchor="middle" font-family="Nunito" font-size="22" font-weight="800" fill="${C.purple}">${esc(module.title)}</text>`;

  // Sky: se dibuja en la intro, respira, parpadea y celebra en el cierre
  const drawT = scene.kind === 'intro' ? lt : Infinity;
  const phase = (t - 2.2) % 3.4;
  const eyeScale = t > 2 && phase >= 0 && phase < 0.24 ? 1 - 0.9 * Math.sin((Math.PI * phase) / 0.24) : 1;
  let color = C.purple;
  let hop = 0;
  if (scene.kind === 'outro') {
    const c = (lt - 1.0) / 1.8;
    if (c > 0 && c < 1) {
      color = c < 0.3 ? mix(C.purple, C.green, c / 0.3) : c < 0.62 ? mix(C.green, C.yellow, (c - 0.3) / 0.32) : mix(C.yellow, C.purple, (c - 0.62) / 0.38);
      hop = -22 * Math.sin(Math.PI * clamp(c / 0.35)) ;
    }
  }
  const bob = 7 * Math.sin((2 * Math.PI * t) / 2.6) + hop;
  svg += sky({ x: 70, y: 200 + bob, width: 480, drawT, color, eyeScale, rotate: 1.6 * Math.sin((2 * Math.PI * t) / 3.7) });

  // Panel derecho
  const X = 610, PW = 610;
  if (scene.kind === 'intro') {
    const a = appear(0.9), b = appear(1.1), c = appear(1.35), d = appear(1.6);
    const title = wrap(module.title, 76, PW, 0.58);
    const summary = wrap(module.summary, 36, PW);
    const ty = 300;
    const sy = ty + (title.length - 1) * 84 + 72;
    const cy = sy + (summary.length - 1) * 46 + 50;
    svg += `<g opacity="${a.o}" transform="translate(0 ${a.dy})">${textBlock([`MÓDULO ${number} DE ${MODULES.length}`], { x: X, y: 236, size: 22, lh: 0, weight: 900, fill: C.muted, spacing: 3 })}</g>`;
    svg += `<g opacity="${b.o}" transform="translate(0 ${b.dy})">${textBlock(title, { x: X, y: ty, size: 76, lh: 84, weight: 900, fill: C.purple })}</g>`;
    svg += `<g opacity="${c.o}" transform="translate(0 ${c.dy})">${textBlock(summary, { x: X, y: sy, size: 36, lh: 46, weight: 700, fill: C.ink })}</g>`;
    svg += `<g opacity="${d.o}" transform="translate(0 ${d.dy})"><rect x="${X}" y="${cy}" width="470" height="52" rx="26" fill="${C.white}"/>${textBlock(['4 lecciones · 1 reto · 1 certificado'], { x: X + 235, y: cy + 35, size: 24, lh: 0, weight: 800, fill: C.purple, anchor: 'middle' })}</g>`;
  } else if (scene.kind === 'lesson') {
    const a = appear(0.05), b = appear(0.2), c = appear(0.5);
    const title = wrap(scene.lesson.title, 60, PW, 0.58);
    const key = wrap(scene.lesson.key, 36, PW - 80);
    const ty = 250;
    const cardY = ty + (title.length - 1) * 68 + 44;
    const cardH = 96 + (key.length - 1) * 46 + 40;
    svg += `<g opacity="${a.o}" transform="translate(0 ${a.dy})">${textBlock([`LECCIÓN ${scene.index + 1} DE ${module.lessons.length}`], { x: X, y: 186, size: 22, lh: 0, weight: 900, fill: C.muted, spacing: 3 })}</g>`;
    svg += `<g opacity="${b.o}" transform="translate(0 ${b.dy})">${textBlock(title, { x: X, y: ty, size: 60, lh: 68, weight: 900, fill: C.purple })}</g>`;
    svg += `<g opacity="${c.o}" transform="translate(0 ${c.dy})">
<rect x="${X}" y="${cardY}" width="${PW}" height="${cardH}" rx="22" fill="${C.white}"/>
<rect x="${X}" y="${cardY}" width="10" height="${cardH}" rx="5" fill="${C.yellow}"/>
${textBlock(['IDEA CLAVE'], { x: X + 40, y: cardY + 48, size: 20, lh: 0, weight: 900, fill: C.muted, spacing: 3 })}
${textBlock(key, { x: X + 40, y: cardY + 96, size: 36, lh: 46, weight: 800, fill: C.purple })}</g>`;
    const dots = module.lessons.map((_, i) => `<rect x="${X + i * 70}" y="640" width="58" height="10" rx="5" fill="${i <= scene.index ? C.violet : C.white}"/>`).join('');
    svg += `<g opacity="${(exit * easeOut(lt / 0.3)).toFixed(3)}">${dots}</g>`;
  } else {
    const a = appear(0.05), b = appear(0.3), c = appear(0.5), d = appear(0.7), e = appear(1.1);
    svg += `<g opacity="${a.o}" transform="translate(0 ${a.dy})">${textBlock(['¡Ahora te toca!'], { x: X, y: 260, size: 72, lh: 0, weight: 900, fill: C.purple })}</g>`;
    const items = [[C.green, `${module.lessons.length} lecciones cortas`], [C.yellow, '1 reto final'], [C.violet, 'Tu certificado']];
    [b, c, d].forEach((p, i) => {
      const y = 350 + i * 64;
      svg += `<g opacity="${p.o}" transform="translate(0 ${p.dy})"><circle cx="${X + 16}" cy="${y - 12}" r="16" fill="${items[i][0]}"/>${textBlock([items[i][1]], { x: X + 50, y, size: 36, lh: 0, weight: 800, fill: C.ink })}</g>`;
    });
    svg += `<g opacity="${e.o}" transform="translate(0 ${e.dy})">${textBlock(['Juega a crecer'], { x: X, y: 600, size: 44, lh: 0, weight: 900, fill: C.violet })}</g>`;
  }

  // Barra de progreso del video
  svg += `<rect x="0" y="${H - 8}" width="${W}" height="8" fill="${C.line}"/>`;
  svg += `<rect x="0" y="${H - 8}" width="${(W * t / total).toFixed(1)}" height="8" fill="${C.violet}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svg}</svg>`;
}

// ---------------------------------------------------------------------------
// Audio (WAV PCM de 16 bits)
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
// Fuente Nunito (OFL) para los textos del video, descargada una vez.
async function fonts() {
  const dir = path.join(CACHE, 'fonts');
  const files = { 700: 'Nunito-Bold.ttf', 800: 'Nunito-ExtraBold.ttf', 900: 'Nunito-Black.ttf' };
  if (Object.values(files).every((f) => existsSync(path.join(dir, f)))) return Object.values(files).map((f) => path.join(dir, f));
  mkdirSync(dir, { recursive: true });
  const css = await (await fetch('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900', { headers: { 'User-Agent': 'curl/8.0' } })).text();
  for (const block of css.split('@font-face').slice(1)) {
    const weight = block.match(/font-weight:\s*(\d+)/)[1];
    const url = block.match(/url\((https:[^)]+\.ttf)\)/)[1];
    writeFileSync(path.join(dir, files[weight]), Buffer.from(await (await fetch(url)).arrayBuffer()));
  }
  return Object.values(files).map((f) => path.join(dir, f));
}

// ---------------------------------------------------------------------------
async function render(module, fontFiles, samples) {
  const number = MODULES.indexOf(module) + 1;
  const dir = path.join(CACHE, module.id);
  const scenes = scenesFor(module);

  // Línea de tiempo según la duración real de cada narración
  const LEAD = { intro: 1.4, lesson: 0.55, outro: 0.55 };
  const TAIL = { intro: 0.6, lesson: 0.8, outro: 2.4 };
  let t = 0, rate = 0;
  for (const s of scenes) {
    const wav = readWav(path.join(dir, 'voz', `${s.id}.wav`));
    rate = wav.rate;
    s.wav = wav.samples;
    s.start = t;
    s.voiceStart = t + LEAD[s.kind];
    s.voiceDur = wav.samples.length / wav.rate;
    s.end = s.voiceStart + s.voiceDur + TAIL[s.kind];
    t = s.end;
  }
  const total = t;

  const audio = new Int16Array(Math.ceil(total * rate) + rate);
  for (const s of scenes) audio.set(s.wav, Math.round(s.voiceStart * rate));
  const audioFile = path.join(dir, 'audio.wav');
  writeWav(audioFile, audio, rate);

  const fontOpts = { font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Nunito' } };

  if (samples) {
    // Cuadros de muestra para revisar el diseño sin codificar el video.
    const dirOut = path.join(CACHE, 'muestras');
    mkdirSync(dirOut, { recursive: true });
    for (const at of samples) {
      const png = new Resvg(frameSvg(module, number, scenes, total, at), { ...fontOpts, fitTo: { mode: 'width', value: 640 } }).render().asPng();
      writeFileSync(path.join(dirOut, `${module.id}-${at}.png`), png);
    }
    console.log(`muestras de ${module.id} (${total.toFixed(1)} s): ${samples.join(', ')}`);
    return;
  }

  mkdirSync(OUT, { recursive: true });
  writeFileSync(path.join(OUT, `${module.id}.vtt`), captions(scenes));
  const poster = new Resvg(frameSvg(module, number, scenes, total, 2.2), { ...fontOpts, fitTo: { mode: 'width', value: 960 } });
  writeFileSync(path.join(OUT, `${module.id}.png`), poster.render().asPng());

  const out = path.join(OUT, `${module.id}.mp4`);
  const enc = spawn(ffmpeg.path, [
    '-y', '-loglevel', 'error',
    '-f', 'rawvideo', '-pixel_format', 'rgba', '-video_size', `${W}x${H}`, '-framerate', String(FPS), '-i', 'pipe:0',
    '-i', audioFile,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '26', '-tune', 'animation', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '96k', '-ar', '44100',
    '-shortest', '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((ok, fail) => enc.on('close', (code) => (code === 0 ? ok() : fail(new Error(`ffmpeg salió con ${code}`)))));

  const frames = Math.ceil(total * FPS);
  for (let f = 0; f < frames; f++) {
    const img = new Resvg(frameSvg(module, number, scenes, total, f / FPS), fontOpts).render();
    if (!enc.stdin.write(img.pixels)) await new Promise((r) => enc.stdin.once('drain', r));
    if (f % (FPS * 10) === 0) process.stdout.write(`  ${module.id}: ${(f / FPS).toFixed(0)}s / ${total.toFixed(0)}s\n`);
  }
  enc.stdin.end();
  await done;
  console.log(`ok ${module.id}.mp4 (${total.toFixed(1)} s)`);
}

const args = process.argv.slice(2);
if (args[0] === '--frases') {
  for (const m of MODULES) {
    const dir = path.join(CACHE, m.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'frases.json'), JSON.stringify(scenesFor(m).map(({ id, text }) => ({ id, text })), null, 2));
  }
  console.log('Guiones escritos en .cache/<módulo>/frases.json');
} else {
  // --muestras=0.6,2.2,12 renderiza solo esos instantes (en segundos) como PNG.
  const sampleArg = args.find((a) => a.startsWith('--muestras='));
  const samples = sampleArg ? sampleArg.split('=')[1].split(',').map(Number) : null;
  const fontFiles = await fonts();
  const ids = args.filter((a) => !a.startsWith('--'));
  const chosen = ids.length ? MODULES.filter((m) => ids.includes(m.id)) : MODULES;
  for (const m of chosen) await render(m, fontFiles, samples);
}
