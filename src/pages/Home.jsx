import { SkyChameleon } from '../brand';
import { useStore } from '../state.jsx';
import XpBar from '../components/XpBar.jsx';
import { MODULES } from '../content/modules.js';
import { LIDERAZGO } from '../content/liderazgo.js';

// Siguiente paso dentro del módulo de Liderazgo.
export function nextStep(state) {
  const pending = LIDERAZGO.lessons.findIndex((l) => !state.lessonsDone[l.id]);
  if (pending >= 0) {
    return { label: pending === 0 ? 'Empezar' : 'Continuar', href: `#/modulo/liderazgo/leccion/${pending + 1}` };
  }
  if (!state.quiz.liderazgo?.passed) return { label: 'Hacer el reto', href: '#/modulo/liderazgo/quiz' };
  return { label: 'Ver certificado', href: '#/certificado/liderazgo' };
}

export default function Home() {
  const { state, level } = useStore();
  const firstName = state.account.name.split(' ')[0];
  const lessonsDone = LIDERAZGO.lessons.filter((l) => state.lessonsDone[l.id]).length;
  const passed = !!state.quiz.liderazgo?.passed;
  const total = LIDERAZGO.lessons.length + 1; // lecciones + reto
  const progress = Math.round(((lessonsDone + (passed ? 1 : 0)) / total) * 100);
  const next = nextStep(state);

  const badges = [
    { id: 'perfil', label: 'Perfil completo', earned: !!state.profile },
    { id: 'primera', label: 'Primera lección', earned: lessonsDone > 0 },
    { id: 'lider', label: 'Líder en formación', earned: passed },
  ];

  return (
    <div className="container stack-lg">
      <section className="card welcome" aria-labelledby="welcome-title">
        <SkyChameleon className="welcome__sky" celebrateKey={level} title="Sky" />
        <div className="stack">
          <h1 id="welcome-title">¡Hola, {firstName}!</h1>
          <p className="muted">Cada lección suma XP. Cuando subes de nivel, Sky cambia de color.</p>
          <XpBar />
        </div>
      </section>

      <section className="stack" aria-labelledby="route-title">
        <h2 id="route-title">Tu ruta</h2>
        <ul className="modules">
          {MODULES.map((m) =>
            m.available ? (
              <li key={m.id} className="card module">
                <div className="module__head">
                  <h3>{m.title}</h3>
                  {passed && <span className="badge badge--green">Completado</span>}
                </div>
                <p className="muted">{m.summary}</p>
                <div className="bar" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
                <p className="small">{lessonsDone} de {LIDERAZGO.lessons.length} lecciones · reto {passed ? 'aprobado' : 'pendiente'}</p>
                <div className="row">
                  <a className="btn btn--primary" href={next.href}>{next.label}</a>
                  <a className="btn btn--ghost" href="#/modulo/liderazgo">Ver módulo</a>
                </div>
              </li>
            ) : (
              <li key={m.id} className="card module module--locked">
                <div className="module__head">
                  <h3>{m.title}</h3>
                  <span className="badge">Próximamente</span>
                </div>
                <p className="muted">{m.summary}</p>
              </li>
            ),
          )}
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
