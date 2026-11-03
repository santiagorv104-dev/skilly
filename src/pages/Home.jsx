import { useMemo } from 'react';
import { Kiki } from '../brand';
import { useStore } from '../state.jsx';
import XpBar from '../components/XpBar.jsx';
import { MODULES, orderedModules } from '../content/modules.js';
import { latestBrujula } from '../puente/brujula.js';
import { formatDate } from '../brujula/lib/puntaje.js';

// Siguiente paso dentro de un módulo.
export function nextStep(state, module) {
  const pending = module.lessons.findIndex((l) => !state.lessonsDone[l.id]);
  if (pending >= 0) {
    return { label: pending === 0 ? 'Empezar' : 'Continuar', href: `#/modulo/${module.id}/leccion/${pending + 1}` };
  }
  if (!state.quiz[module.id]?.passed) return { label: 'Hacer el reto', href: `#/modulo/${module.id}/quiz` };
  return { label: 'Ver certificado', href: `#/certificado/${module.id}` };
}

export function moduleProgress(state, module) {
  const lessonsDone = module.lessons.filter((l) => state.lessonsDone[l.id]).length;
  const passed = !!state.quiz[module.id]?.passed;
  const percent = Math.round(((lessonsDone + (passed ? 1 : 0)) / (module.lessons.length + 1)) * 100);
  return { lessonsDone, passed, percent };
}

export default function Home() {
  const { state, level } = useStore();
  const firstName = state.account.name.split(' ')[0];
  const brujula = useMemo(() => latestBrujula(), []);
  const modules = orderedModules(state.profile, brujula?.moduleScores);
  const anyLesson = Object.keys(state.lessonsDone).length > 0;
  const passedCount = MODULES.filter((m) => state.quiz[m.id]?.passed).length;

  const badges = [
    { id: 'perfil', label: 'Perfil completo', earned: !!state.profile },
    { id: 'primera', label: 'Primera lección', earned: anyLesson },
    ...MODULES.map((m) => ({ id: m.id, label: m.badge, earned: !!state.quiz[m.id]?.passed })),
    { id: 'ruta', label: 'Ruta completa', earned: passedCount === MODULES.length },
  ];

  return (
    <div className="container stack-lg">
      <section className="card welcome" aria-labelledby="welcome-title">
        <Kiki className="welcome__kiki" celebrateKey={level} title="Kiki" />
        <div className="stack">
          <h1 id="welcome-title">¡Hola, {firstName}!</h1>
          <p className="muted">Cada lección suma XP. Cuando subes de nivel, Kiki cambia de color.</p>
          <XpBar />
        </div>
      </section>

      <BrujulaCard brujula={brujula} />

      <section className="stack" aria-labelledby="route-title">
        <div className="row row--between">
          <h2 id="route-title">Tu ruta</h2>
          <span className="small muted">{passedCount} de {MODULES.length} módulos completados</span>
        </div>
        <ul className="modules">
          {modules.map((m, i) => {
            const { lessonsDone, passed, percent } = moduleProgress(state, m);
            const next = nextStep(state, m);
            return (
              <li key={m.id} className="card module">
                <div className="module__head">
                  <h3>{m.title}</h3>
                  {passed ? (
                    <span className="badge badge--green">Completado</span>
                  ) : (
                    i === 0 && lessonsDone === 0 && (
                      <span className="badge">{brujula ? 'Tu prioridad' : 'Tu primera meta'}</span>
                    )
                  )}
                </div>
                <p className="muted">{m.summary}</p>
                {brujula && <p className="small muted">Tu Brújula en esta habilidad: {brujula.moduleScores[m.id]} de 100</p>}
                <div className="bar" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
                <p className="small">{lessonsDone} de {m.lessons.length} lecciones · reto {passed ? 'aprobado' : 'pendiente'}</p>
                <div className="row">
                  <a className="btn btn--primary" href={next.href}>{next.label}</a>
                  <a className="btn btn--ghost" href={`#/modulo/${m.id}`}>Ver módulo</a>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="stack" aria-labelledby="badges-title">
        <h2 id="badges-title">Logros</h2>
        <ul className="pills">
          {badges.map((b) => (
            <li key={b.id} className={b.earned ? 'pill pill--earned' : 'pill'}>
              {b.earned ? '★ ' : ''}{b.label}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// Resumen de la Brújula (primera parte del recorrido) dentro de la app.
function BrujulaCard({ brujula }) {
  if (!brujula) {
    return (
      <section className="card brujula-card" aria-labelledby="brujula-title">
        <div className="stack">
          <h2 id="brujula-title" className="h3">Haz tu Brújula</h2>
          <p className="muted">Un diagnóstico de 12 habilidades blandas. Con tu resultado ordenamos tu ruta por prioridades.</p>
        </div>
        <a className="btn btn--primary" href="#/">Ir a la Brújula</a>
      </section>
    );
  }
  const { report, version, date, type } = brujula;
  return (
    <section className="card brujula-card" aria-labelledby="brujula-title">
      <div className="stack">
        <h2 id="brujula-title" className="h3">Tu Brújula</h2>
        <p className="small muted">Versión {version.name} · {formatDate(date)}</p>
        <div className="brujula-card__rows">
          <span className="small">Fortalezas</span>
          <ul className="pills">
            {report.strengths.map((s) => (
              <li key={s.id} className="pill pill--earned">{s.short} {s.index}</li>
            ))}
          </ul>
          <span className="small">Prioridades</span>
          <ul className="pills">
            {report.priorities.map((s) => (
              <li key={s.id} className="pill pill--on">{s.short} {s.index}</li>
            ))}
          </ul>
        </div>
      </div>
      <a className="btn btn--ghost" href={`#/informe/${type}`}>Ver mi informe</a>
    </section>
  );
}
