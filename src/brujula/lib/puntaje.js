// Cálculo del puntaje de la Brújula. Funciones puras: reciben las respuestas
// y devuelven el informe, así se pueden probar con `npm test`.
//
// Respuestas:
//   p1: { idFrase: 1..5 }
//   p2: { idPar: 'a' | 'b' }
//   p3: { idCaso: índice de la opción elegida (0 = A ... 3 = D) }
// Tiempos en segundos: { p1, p2, p3 }

import { CASES, PAIR_BY_ID, SKILLS, STATEMENTS, VERSIONS } from '../data/contenido.js';

export const LEVELS = [
  { id: 'fortaleza', name: 'Fortaleza clara', min: 75 },
  { id: 'solida', name: 'Sólida', min: 60 },
  { id: 'desarrollo', name: 'En desarrollo', min: 45 },
  { id: 'prioridad', name: 'Prioridad', min: 0 },
];

export function levelFor(index) {
  return LEVELS.find((l) => index >= l.min);
}

const mean = (values) => values.reduce((a, b) => a + b, 0) / values.length;

// Autodescripción: inversas al revés, promedio y paso de 1-5 a 0-100.
function selfScores(version, p1) {
  const bySkill = Object.fromEntries(SKILLS.map((s) => [s.id, []]));
  for (const id of version.statements) {
    const st = STATEMENTS[id];
    if (st.control) continue;
    const answer = p1[id];
    bySkill[st.skill].push(st.inverse ? 6 - answer : answer);
  }
  return Object.fromEntries(
    Object.entries(bySkill).map(([skill, values]) => [skill, Math.round(((mean(values) - 1) / 4) * 100)]),
  );
}

// Preferencia: porcentaje de los pares en que se eligió la habilidad.
function prefScores(version, p2) {
  const seen = Object.fromEntries(SKILLS.map((s) => [s.id, 0]));
  const chosen = { ...seen };
  for (const id of version.pairs) {
    const pair = PAIR_BY_ID[id];
    seen[pair.a.skill] += 1;
    seen[pair.b.skill] += 1;
    chosen[pair[p2[id]].skill] += 1;
  }
  return Object.fromEntries(
    SKILLS.map((s) => [s.id, seen[s.id] ? Math.round((chosen[s.id] / seen[s.id]) * 100) : 0]),
  );
}

// Casos: la principal suma los puntos completos (máximo 3) y cada secundaria
// la mitad (máximo 1,5). Puntaje = lo que sacó / lo máximo que podía sacar.
function caseScores(version, p3) {
  const got = Object.fromEntries(SKILLS.map((s) => [s.id, 0]));
  const max = { ...got };
  for (const c of version.cases) {
    const points = CASES[c.id].options[p3[c.id]].points;
    got[c.main] += points;
    max[c.main] += 3;
    for (const skill of c.secondary) {
      got[skill] += points / 2;
      max[skill] += 1.5;
    }
  }
  return Object.fromEntries(
    SKILLS.map((s) => [s.id, max[s.id] ? Math.round((got[s.id] / max[s.id]) * 100) : 0]),
  );
}

function sincerityAlert(version, p1) {
  const controls = version.statements.filter((id) => STATEMENTS[id].control);
  const agreed = controls.filter((id) => p1[id] >= 4).length;
  if (agreed >= version.sincerityMin) {
    return {
      ok: false,
      text: `Marcaste de acuerdo en ${agreed} de ${controls.length} frases que casi nadie puede afirmar con honestidad, como no haber dicho nunca una mentira. Tu autodescripción podría estar inflada, así que dale más peso a los casos.`,
    };
  }
  return {
    ok: true,
    text: 'No marcaste como ciertas las frases que casi nadie puede afirmar con honestidad. Tu autodescripción parece realista.',
  };
}

function consistencyAlert(version, p1) {
  const answers = version.statements.map((id) => p1[id]);
  const counts = {};
  for (const a of answers) counts[a] = (counts[a] ?? 0) + 1;
  const samePercent = Math.round((Math.max(...Object.values(counts)) / answers.length) * 100);
  if (samePercent >= 70) {
    return {
      ok: false,
      text: `Usaste la misma respuesta en el ${samePercent}% de las frases, y eso le quita precisión al resultado.`,
    };
  }

  let contradictions = 0;
  for (const skill of SKILLS) {
    const ids = version.statements.filter((id) => STATEMENTS[id].skill === skill.id);
    const direct = mean(ids.filter((id) => !STATEMENTS[id].inverse).map((id) => p1[id]));
    const inverse = p1[ids.find((id) => STATEMENTS[id].inverse)];
    if ((direct >= 4 && inverse >= 4) || (direct <= 2 && inverse <= 2)) contradictions += 1;
  }
  if (contradictions >= 3) {
    return {
      ok: false,
      text: `En ${contradictions} habilidades estuviste de acuerdo con una frase y también con su contraria. Puede que hayas leído algunas con prisa.`,
    };
  }
  return { ok: true, text: 'Respondiste de forma coherente a frases con sentido contrario.' };
}

function paceAlert(version, times) {
  const p1 = Math.round(times.p1 ?? 0);
  const p3 = Math.round(times.p3 ?? 0);
  const fast = [];
  if (p1 < version.pace.p1) fast.push(`la parte 1 en ${p1} segundos`);
  if (p3 < version.pace.p3) fast.push(`los casos en ${p3} segundos`);
  if (fast.length) {
    return {
      ok: false,
      text: `Respondiste ${fast.join(' y ')}, más rápido de lo que suele tomar leer con atención.`,
    };
  }
  return { ok: true, text: 'Le dedicaste un tiempo razonable a cada parte.' };
}

export function scoreDiagnostic(versionId, answers, times = {}) {
  const version = VERSIONS[versionId];
  const self = selfScores(version, answers.p1);
  const pref = prefScores(version, answers.p2);
  const cases = caseScores(version, answers.p3);
  const w = version.weights;

  const skills = SKILLS.map((s, order) => {
    // toFixed evita que 74,75 quede como 74,7499... por el redondeo binario.
    const index = Math.round(Number((w.self * self[s.id] + w.cases * cases[s.id] + w.pref * pref[s.id]).toFixed(6)));
    return { ...s, order, self: self[s.id], cases: cases[s.id], pref: pref[s.id], index, level: levelFor(index) };
  });

  // Mayor a menor índice; en empate, primero la de mejor puntaje en casos.
  const ranked = [...skills].sort((a, b) => b.index - a.index || b.cases - a.cases || a.order - b.order);

  const blindSpots = ranked.filter((s) => s.self - s.cases >= version.gap);
  const hiddenStrengths = ranked.filter((s) => s.cases - s.self >= version.gap);

  const alerts = {
    sinceridad: sincerityAlert(version, answers.p1),
    consistencia: consistencyAlert(version, answers.p1),
    ritmo: paceAlert(version, times),
  };

  return {
    version: versionId,
    skills, // en el orden del contenido (para el radar)
    ranked,
    strengths: ranked.slice(0, 3),
    priorities: ranked.slice(-3).reverse(), // la más baja primero
    blindSpots,
    hiddenStrengths,
    alerts,
    anyAlert: Object.values(alerts).some((a) => !a.ok),
  };
}

// --- Textos del informe ----------------------------------------------------------

export function joinNames(names) {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}

export const lower = (skill) => skill.short.toLowerCase();

export function headline(report) {
  return `Tus fortalezas más claras hoy son ${joinNames(report.strengths.map(lower))}. Donde más margen de mejora tienes es en ${joinNames(report.priorities.map(lower))}.`;
}

export const blindSpotText = (s) =>
  `${s.short}: te describes en ${s.self}, pero en los casos sacaste ${s.cases}. Puede que en la práctica no la uses tanto como crees.`;

export const hiddenStrengthText = (s) =>
  `${s.short}: en los casos sacaste ${s.cases}, pero te describes en ${s.self}. Probablemente la estás subestimando.`;

export const ALERT_NAMES = { sinceridad: 'Sinceridad', consistencia: 'Consistencia', ritmo: 'Ritmo' };

// Diferencia de cada habilidad frente al resultado anterior de la misma versión.
export function compare(report, previous) {
  if (!previous) return null;
  const before = Object.fromEntries(previous.skills.map((s) => [s.id, s.index]));
  const deltas = Object.fromEntries(report.skills.map((s) => [s.id, s.index - before[s.id]]));
  const values = Object.values(deltas);
  const up = values.filter((d) => d > 0).length;
  const down = values.filter((d) => d < 0).length;
  const best = [...report.skills].sort((a, b) => deltas[b.id] - deltas[a.id])[0];

  let text;
  if (up === 0 && down === 0) text = 'Tus índices quedaron igual que la vez anterior.';
  else if (up >= down) {
    text = `Subiste en ${up} de 12 habilidades.`;
    if (deltas[best.id] > 0) text += ` Tu mayor avance fue en ${lower(best)} (+${deltas[best.id]}).`;
  } else {
    text = `Esta vez bajaste en ${down} de 12 habilidades y subiste en ${up}. Un mal día también cuenta: míralo como una pista, no como una nota.`;
  }
  return { deltas, text };
}

export const formatDelta = (d) => (d > 0 ? `+${d}` : d < 0 ? `${d}` : '=');

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDuration(seconds) {
  const min = Math.max(1, Math.round(seconds / 60));
  return `${min} min`;
}

// Resumen en texto para copiar.
export function summaryText(report, meta) {
  const version = VERSIONS[report.version];
  const who = meta.name ? ` · ${meta.name}` : '';
  const lines = [
    `Brújula de habilidades · ${version.name}${who} · ${formatDate(meta.date)}`,
    `Confiabilidad: ${Object.entries(report.alerts)
      .map(([k, a]) => `${ALERT_NAMES[k].toLowerCase()} ${a.ok ? 'bien' : 'revisar'}`)
      .join(', ')}`,
    '',
    ...report.ranked.map(
      (s) =>
        `${s.short}: ${s.index} (te describes ${s.self} / decides ${s.cases} / preferencia ${s.pref}) · ${s.level.name}`,
    ),
  ];
  if (report.blindSpots.length) lines.push('', 'Puntos ciegos:', ...report.blindSpots.map(blindSpotText));
  if (report.hiddenStrengths.length) {
    lines.push('', 'Fortalezas escondidas:', ...report.hiddenStrengths.map(hiddenStrengthText));
  }
  return lines.join('\n');
}
