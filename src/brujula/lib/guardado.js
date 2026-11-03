// Lo único que se guarda, en el navegador (localStorage): el nombre, el
// diagnóstico en curso y los últimos 5 resultados de cada versión. No hay
// cuentas. Si el navegador no deja guardar, todo vive en memoria mientras
// dure la pestaña.

const KEYS = {
  name: 'brujula:nombre',
  current: 'brujula:en-curso',
  results: 'brujula:resultados',
};
const MAX_RESULTS = 5;
const memory = {};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return key in memory ? memory[key] : fallback;
  }
}

function write(key, value) {
  memory[key] = value;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sin almacenamiento: queda en memoria.
  }
}

export const getName = () => read(KEYS.name, '');
export const setName = (name) => write(KEYS.name, name.trim());

// Diagnóstico en curso: { type, step, part, index, answers: { p1, p2, p3 }, times: { p1, p2, p3 }, started }
export const getCurrent = () => read(KEYS.current, null);
export const setCurrent = (current) => write(KEYS.current, current);
export const clearCurrent = () => write(KEYS.current, null);

// Resultados: { expres: [...], completa: [...] }, el más reciente al final.
// Cada uno: { id, type, date, name, answers, times }; el informe se calcula al mostrarlo.
export function getResults(type) {
  const all = read(KEYS.results, {});
  return Array.isArray(all?.[type]) ? all[type] : [];
}

export function addResult(result) {
  const all = read(KEYS.results, {}) ?? {};
  const list = [...(all[result.type] ?? []), result].slice(-MAX_RESULTS);
  write(KEYS.results, { ...all, [result.type]: list });
}
