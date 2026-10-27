// Narración con Piper (https://github.com/rhasspy/piper, MIT): voces neuronales
// que funcionan sin conexión. El programa y las voces se descargan una vez en
// %LOCALAPPDATA%\skilly-videos (fuera del repositorio).
//   node piper.mjs --muestras   → una muestra de cada voz en videos/muestras-voz/
import { spawn, spawnSync } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

export const TOOLS = path.join(process.env.LOCALAPPDATA ?? os.homedir(), 'skilly-videos');
const PIPER_ZIP = 'https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip';
const VOICES = 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0';

// Voces en español con licencia que permite uso comercial.
export const VOCES = {
  'es_MX-claude-high': 'México · Apache 2.0',
  'es_AR-daniela-high': 'Argentina · CC BY-SA 4.0',
  'es_MX-ald-medium': 'México · dominio público',
};

export async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar ${url} (${res.status})`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(file));
}

export async function ensurePiper() {
  const dir = path.join(TOOLS, 'piper');
  const exe = path.join(dir, 'piper', 'piper.exe');
  if (existsSync(exe)) return exe;
  mkdirSync(dir, { recursive: true });
  const zip = path.join(dir, 'piper_windows_amd64.zip');
  await download(PIPER_ZIP, zip);
  const res = spawnSync('tar', ['-xf', zip, '-C', dir]);
  if (res.status !== 0 || !existsSync(exe)) throw new Error('No se pudo descomprimir Piper');
  return exe;
}

export async function ensureVoice(id) {
  const [locale, name, quality] = id.split('-');
  const dir = path.join(TOOLS, 'voces');
  const model = path.join(dir, `${id}.onnx`);
  if (existsSync(model) && existsSync(`${model}.json`)) return model;
  mkdirSync(dir, { recursive: true });
  const base = `${VOICES}/${locale.split('_')[0]}/${locale}/${name}/${quality}/${id}.onnx`;
  await download(`${base}.json`, `${model}.json`);
  await download(base, model);
  return model;
}

export function synthesize(exe, model, text, outFile, { lengthScale = 1.0, sentenceSilence = 0.3 } = {}) {
  return new Promise((ok, fail) => {
    const p = spawn(exe, ['--model', model, '--output_file', outFile, '--length_scale', String(lengthScale), '--sentence_silence', String(sentenceSilence)], {
      stdio: ['pipe', 'ignore', 'pipe'],
    });
    let err = '';
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) => (code === 0 ? ok() : fail(new Error(err))));
    p.stdin.end(text.replace(/\s+/g, ' ') + '\n', 'utf8');
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2] === '--muestras') {
  const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'muestras-voz');
  mkdirSync(out, { recursive: true });
  const text = 'Hola, soy Kiki. En este módulo vas a entrenar tu liderazgo: inspirar, escuchar, dar feedback y decidir con tu equipo. Antes de decidir, escucha: deja terminar, haz preguntas abiertas y parafrasea para confirmar que entendiste.';
  const exe = await ensurePiper();
  for (const id of Object.keys(VOCES)) {
    const model = await ensureVoice(id);
    const file = path.join(out, `${id}.wav`);
    await synthesize(exe, model, text, file);
    console.log(`ok ${file}`);
  }
}
