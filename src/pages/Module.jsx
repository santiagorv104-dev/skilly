import { useStore, XP } from '../state.jsx';
import { MODULES, videoFiles } from '../content/modules.js';
import { nextStep } from './Home.jsx';

export default function Module({ module }) {
  const { state } = useStore();
  const allLessons = module.lessons.every((l) => state.lessonsDone[l.id]);
  const quiz = state.quiz[module.id];
  const cert = state.certificates[module.id];
  const next = nextStep(state, module);
  const video = videoFiles(module.id);
  const number = MODULES.indexOf(module) + 1;

  return (
    <div className="container stack-lg">
      <header className="stack">
        <a className="back" href="#/inicio">← Tu ruta</a>
        <p className="kicker">Módulo {number} · Soft skill</p>
        <h1>{module.title}</h1>
        <p className="lead">
          {module.summary} Cuatro lecciones cortas y un reto final: apruébalo con {module.passScore}% o más para
          obtener tu certificado.
        </p>
        <div className="row">
          <a className="btn btn--primary" href={next.href}>{next.label}</a>
        </div>
      </header>

      <section className="card video" aria-labelledby="video-title">
        <div className="row row--between">
          <h2 id="video-title" className="h3">Video del módulo</h2>
          <span className="small muted">1 min · con subtítulos</span>
        </div>
        <video
          className="video__player"
          controls
          playsInline
          preload="metadata"
          poster={video.poster}
          aria-describedby="video-title"
        >
          <source src={video.src} type="video/mp4" />
          <track kind="captions" src={video.captions} srcLang="es" label="Español" default />
          Tu navegador no puede reproducir este video.
        </video>
        <p className="small muted">Sky te resume las ideas clave del módulo. Video animado con voz generada por computadora.</p>
      </section>

      <ol className="lessons">
        {module.lessons.map((lesson, i) => {
          const done = state.lessonsDone[lesson.id];
          return (
            <li key={lesson.id}>
              <a className={done ? 'card lesson-row lesson-row--done' : 'card lesson-row'} href={`#/modulo/${module.id}/leccion/${i + 1}`}>
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
            <a className={quiz?.passed ? 'card lesson-row lesson-row--done' : 'card lesson-row lesson-row--quiz'} href={`#/modulo/${module.id}/quiz`}>
              <span className="lesson-row__n" aria-hidden="true">{quiz?.passed ? '✓' : '★'}</span>
              <span className="lesson-row__text">
                <strong>Reto final</strong>
                <span className="small muted">
                  {module.quiz.length} preguntas · +{XP.quiz} XP
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
        <a className="card cert-cta" href={`#/certificado/${module.id}`}>
          <strong>Tu certificado de {module.title} está listo</strong>
          <span className="small">Ábrelo para descargarlo o imprimirlo →</span>
        </a>
      )}
    </div>
  );
}
