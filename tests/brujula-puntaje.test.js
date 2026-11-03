// Pruebas del puntaje: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CASES, PAIR_BY_ID, SKILLS, STATEMENTS, VERSIONS } from '../src/brujula/data/contenido.js';
import { levelFor, scoreDiagnostic, summaryText } from '../src/brujula/lib/puntaje.js';

const bestOption = (id) => {
  const pts = CASES[id].options.map((o) => o.points);
  return pts.indexOf(Math.max(...pts));
};
const worstOption = (id) => {
  const pts = CASES[id].options.map((o) => o.points);
  return pts.indexOf(Math.min(...pts));
};

// Responde "perfecto": de acuerdo con las directas, en desacuerdo con las
// inversas y con las de control, la mejor opción en cada caso y sin prisa.
function perfect(versionId) {
  const v = VERSIONS[versionId];
  const p1 = {};
  for (const id of v.statements) {
    const st = STATEMENTS[id];
    p1[id] = st.control ? 1 : st.inverse ? 1 : 5;
  }
  const p2 = Object.fromEntries(v.pairs.map((id, i) => [id, i % 2 ? 'b' : 'a']));
  const p3 = Object.fromEntries(v.cases.map((c) => [c.id, bestOption(c.id)]));
  const times = versionId === 'completa' ? { p1: 300, p2: 120, p3: 600 } : { p1: 120, p2: 60, p3: 120 };
  return scoreDiagnostic(versionId, { p1, p2, p3 }, times);
}

// Marca 5 en todo, responde rápido y elige siempre la peor opción.
function careless(versionId) {
  const v = VERSIONS[versionId];
  const p1 = Object.fromEntries(v.statements.map((id) => [id, 5]));
  const p2 = Object.fromEntries(v.pairs.map((id) => [id, 'a']));
  const p3 = Object.fromEntries(v.cases.map((c) => [c.id, worstOption(c.id)]));
  return scoreDiagnostic(versionId, { p1, p2, p3 }, { p1: 20, p2: 10, p3: 15 });
}

for (const versionId of ['expres', 'completa']) {
  test(`${versionId}: quien responde perfecto queda alto y sin alertas`, () => {
    const r = perfect(versionId);
    for (const s of r.skills) {
      assert.equal(s.self, 100, s.short);
      assert.equal(s.cases, 100, s.short);
      assert.ok(s.index >= 75, `${s.short}: ${s.index}`);
      assert.equal(s.level.name, 'Fortaleza clara');
    }
    assert.equal(r.anyAlert, false);
    assert.deepEqual(r.blindSpots, []);
    assert.deepEqual(r.hiddenStrengths, []);
  });

  test(`${versionId}: todo 5, rápido y la peor opción activa las tres alertas`, () => {
    const r = careless(versionId);
    assert.equal(r.alerts.sinceridad.ok, false);
    assert.equal(r.alerts.consistencia.ok, false);
    assert.match(r.alerts.consistencia.text, /100% de las frases/);
    assert.equal(r.alerts.ritmo.ok, false);
    assert.match(r.alerts.ritmo.text, /la parte 1 en 20 segundos y los casos en 15 segundos/);
    for (const s of r.skills) assert.equal(s.cases, 0);
    // Se describe alto pero decide mal: todo es punto ciego.
    assert.equal(r.blindSpots.length, 12);
    assert.ok(summaryText(r, { name: 'Ana', date: '2026-10-28T12:00:00Z' }).includes('revisar'));
  });

  test(`${versionId}: el contenido cubre las 12 habilidades en cada parte`, () => {
    const v = VERSIONS[versionId];
    const st = v.statements.map((id) => STATEMENTS[id]);
    const controls = v.statements.map((id, i) => (STATEMENTS[id].control ? i + 1 : null)).filter(Boolean);
    assert.deepEqual(controls, versionId === 'completa' ? [8, 19, 29, 37] : [10, 20]);
    assert.equal(st.length, versionId === 'completa' ? 40 : 26);
    assert.equal(new Set(v.statements).size, v.statements.length);
    for (const s of SKILLS) {
      const mine = st.filter((x) => x.skill === s.id);
      assert.equal(mine.filter((x) => x.inverse).length, 1, s.short);
      assert.equal(mine.length, versionId === 'completa' ? 3 : 2, s.short);
      assert.ok(v.pairs.some((id) => [PAIR_BY_ID[id].a.skill, PAIR_BY_ID[id].b.skill].includes(s.id)), s.short);
      assert.ok(v.cases.some((c) => c.main === s.id || c.secondary.includes(s.id)), s.short);
    }
    // Por rondas: cada bloque de 12 frases de habilidad tiene una de cada una.
    const skillItems = st.filter((x) => !x.control);
    for (let r = 0; r < skillItems.length / 12; r++) {
      const round = skillItems.slice(r * 12, r * 12 + 12);
      assert.equal(new Set(round.map((x) => x.skill)).size, 12);
      assert.ok(round.filter((x) => x.inverse).length <= 6);
    }
  });
}

test('el puntaje sigue las reglas en un caso mixto (completa)', () => {
  const v = VERSIONS.completa;
  // Todo en 3 salvo comunicación: directas 4 y 5, inversa 2 (se puntúa 4).
  const p1 = Object.fromEntries(v.statements.map((id) => [id, 3]));
  Object.assign(p1, { com1: 4, com2: 5, comI: 2, ctl1: 1, ctl2: 2, ctl3: 1, ctl4: 2 });
  const p2 = Object.fromEntries(v.pairs.map((id) => [id, 'a']));
  // Caso 2 (principal comunicación, secundaria liderazgo): opción B vale 1.
  // Caso 8 (principal pensamiento crítico, secundaria comunicación): opción C vale 3.
  const p3 = Object.fromEntries(v.cases.map((c) => [c.id, worstOption(c.id)]));
  Object.assign(p3, { caso2: 1, caso8: 2 });
  const r = scoreDiagnostic('completa', { p1, p2, p3 }, { p1: 200, p3: 400 });
  const com = r.skills.find((s) => s.id === 'com');
  // (4 + 5 + 4) / 3 = 4,33 → (4,33 - 1) / 4 = 83
  assert.equal(com.self, 83);
  // Pares 1 y 7: comunicación es A en ambos.
  assert.equal(com.pref, 100);
  // (1 + 3/2) / (3 + 1,5) = 56
  assert.equal(com.cases, 56);
  // 0,45·83 + 0,40·56 + 0,15·100 = 74,75 → 75
  assert.equal(com.index, 75);
  assert.equal(com.level.name, 'Fortaleza clara');
  assert.equal(r.strengths[0].id, 'com');
});

test('niveles en sus límites', () => {
  assert.equal(levelFor(75).name, 'Fortaleza clara');
  assert.equal(levelFor(74).name, 'Sólida');
  assert.equal(levelFor(60).name, 'Sólida');
  assert.equal(levelFor(59).name, 'En desarrollo');
  assert.equal(levelFor(45).name, 'En desarrollo');
  assert.equal(levelFor(44).name, 'Prioridad');
});
