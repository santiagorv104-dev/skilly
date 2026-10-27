import { Kiki } from '../brand';
import { useStore } from '../state.jsx';
import XpBar from '../components/XpBar.jsx';
import { MODULES, orderedModules } from '../content/modules.js';

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
  const modules = orderedModules(state.profile);
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
                    i === 0 && lessonsDone === 0 && <span className="badge">Tu primera meta</span>
                  )}
                </div>
                <p className="muted">{m.summary}</p>
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
