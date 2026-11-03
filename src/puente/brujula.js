// Une la Brújula con la app: las dos viven en el mismo sitio, así que la app
// lee el último resultado de la Brújula (mismo localStorage) y traduce sus 12
// habilidades a los 5 módulos de Skilly. La Brújula no se modifica.
import { getName, getResults } from '../brujula/lib/guardado.js';
import { scoreDiagnostic } from '../brujula/lib/puntaje.js';
import { VERSIONS } from '../brujula/data/contenido.js';

// Qué habilidades de la Brújula entrena cada módulo.
export const SKILLS_BY_MODULE = {
  liderazgo: ['lid', 'ini', 'aut'],
  comunicacion: ['com', 'esc'],
  equipo: ['equ', 'neg'],
  resiliencia: ['res', 'ada', 'apr'],
  resolucion: ['pen', 'org'],
};

export const brujulaName = () => getName();

/**
 * Último resultado de cualquiera de las dos versiones, o null si no hay.
 * moduleScores: índice promedio (0-100) de las habilidades de cada módulo.
 */
export function latestBrujula() {
  const all = Object.keys(VERSIONS).flatMap((type) => getResults(type).map((r) => ({ ...r, type })));
  if (!all.length) return null;
  const last = all.reduce((a, b) => (new Date(b.date) > new Date(a.date) ? b : a));
  const report = scoreDiagnostic(last.type, last.answers, last.times);
  const moduleScores = Object.fromEntries(
    Object.entries(SKILLS_BY_MODULE).map(([id, skills]) => {
      const values = skills.map((s) => report.skills.find((k) => k.id === s)?.index ?? 0);
      return [id, Math.round(values.reduce((a, b) => a + b, 0) / values.length)];
    }),
  );
  return { type: last.type, version: VERSIONS[last.type], date: last.date, report, moduleScores };
}
