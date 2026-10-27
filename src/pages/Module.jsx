import { useStore, XP } from '../state.jsx';
import { LIDERAZGO } from '../content/liderazgo.js';
import { nextStep } from './Home.jsx';

export default function Module() {
  const { state } = useStore();
  const allLessons = LIDERAZGO.lessons.every((l) => state.lessonsDone[l.id]);
  const quiz = state.quiz.liderazgo;
  const cert = state.certificates.liderazgo;
  const next = nextStep(state);

  return (
    <div className="container stack-lg">
      <header className="stack">
        <a className="back" href="#/inicio">← Tu ruta</a>
        <p className="kicker">Módulo 1 · Soft skill</p>
        <h1>{LIDERAZGO.title}</h1>
        <p className="lead">
          Cuatro lecciones cortas y un reto final. Aprueba el reto con {LIDERAZGO.passScore}% o más para obtener tu certificado.
        </p>
        <div className="row">
          <a className="btn btn--primary" href={next.href}>{next.label}</a>
        </div>
      </header>

      <ol className="lessons">
        {LIDERAZGO.lessons.map((lesson, i) => {
          const done = state.lessonsDone[lesson.id];
          return (
            <li key={lesson.id}>
              <a className={done ? 'card lesson-row lesson-row--done' : 'card lesson-row'} href={`#/modulo/liderazgo/leccion/${i + 1}`}>
                <span className="lesson-row__n" aria-hidden="true">{done ? '✓' : i + 1}</span>
                <span className="lesson-row__text">
                  <strong>{lesson.title}</strong>
                  <span className="small muted">{lesson.minutes} min · +{XP.lesson} XP{done ? ' · completada' : ''}</span>
                </span>
              </a>
            </li>
          );
        })}
        <li>
          {allLessons ? (
            <a className={quiz?.passed ? 'card lesson-row lesson-row--done' : 'card lesson-row lesson-row--quiz'} href="#/modulo/liderazgo/quiz">
              <span className="lesson-row__n" aria-hidden="true">{quiz?.passed ? '✓' : '★'}</span>
              <span className="lesson-row__text">
                <strong>Reto final</strong>
                <span className="small muted">
                  {LIDERAZGO.quiz.length} preguntas · +{XP.quiz} XP
                  {quiz ? ` · mejor puntaje ${quiz.best}%` : ''}
                </span>
              </span>
            </a>
          ) : (
            <div className="card lesson-row lesson-row--locked" aria-disabled="true">
              <span className="lesson-row__n" aria-hidden="true">★</span>
              <span className="lesson-row__text">
                <strong>Reto final</strong>
                <span className="small muted">Se desbloquea al terminar las cuatro lecciones</span>
              </span>
            </div>
          )}
        </li>
      </ol>

      {cert && (
        <a className="card cert-cta" href="#/certificado/liderazgo">
          <strong>Tu certificado de Liderazgo está listo</strong>
          <span className="small">Ábrelo para descargarlo o imprimirlo →</span>
        </a>
      )}
    </div>
  );
}
