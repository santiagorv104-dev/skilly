import { LIDERAZGO } from './liderazgo.js';
import { COMUNICACION } from './comunicacion.js';
import { EQUIPO } from './equipo.js';
import { RESILIENCIA } from './resiliencia.js';
import { RESOLUCION } from './resolucion.js';

// Ruta de habilidades blandas (las cinco que mide la perfilación).
export const MODULES = [LIDERAZGO, COMUNICACION, EQUIPO, RESILIENCIA, RESOLUCION];

export function getModule(id) {
  return MODULES.find((m) => m.id === id);
}

// Archivos del video de cada módulo (generados con videos/render.mjs).
export function videoFiles(id) {
  return { src: `videos/${id}.mp4`, poster: `videos/${id}.png`, captions: `videos/${id}.vtt` };
}

// Preguntas de perfilación (versión corta del flujo 5.1–5.5).
export const PROFILE_QUESTIONS = [
  {
    id: 'momento',
    question: '¿Qué te describe mejor ahora?',
    options: ['Estoy estudiando', 'Acabo de graduarme', 'Busco mi primer empleo', 'Quiero cambiar de área'],
  },
  {
    id: 'area',
    question: '¿Qué sector te interesa?',
    options: ['Tecnología', 'Negocios y administración', 'Marketing y comunicación', 'Diseño', 'Aún no lo sé'],
  },
  {
    id: 'objetivo',
    question: '¿Cuál es tu objetivo principal?',
    options: ['Conseguir mi primer empleo', 'Prácticas o pasantía', 'Trabajar como freelance', 'Mejorar mis habilidades'],
  },
  {
    id: 'tiempo',
    question: '¿Cuánto tiempo al día puedes dedicar?',
    options: ['Menos de 15 minutos', '15 a 30 minutos', '30 a 60 minutos', 'Más de 1 hora'],
  },
  {
    id: 'habilidad',
    question: '¿Qué habilidad quieres fortalecer primero?',
    options: MODULES.map((m) => m.title),
  },
];

// La ruta empieza por la habilidad que la persona eligió en la perfilación.
export function orderedModules(profile) {
  const first = MODULES.find((m) => m.title === profile?.habilidad);
  return first ? [first, ...MODULES.filter((m) => m !== first)] : MODULES;
}
