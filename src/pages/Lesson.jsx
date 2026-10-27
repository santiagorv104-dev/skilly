import { useStore, XP } from '../state.jsx';
import { go } from '../router.js';

export default function Lesson({ module, index }) {
  const { state, dispatch } = useStore();
  const lesson = module.lessons[index];
  const base = `/modulo/${module.id}`;

  if (!lesson) {
    return (
      <div className="container container--narrow">
        <p>Esta lección no existe. <a href={`#${base}`}>Volver al módulo</a></p>
      </div>
    );
  }

  const done = state.lessonsDone[lesson.id];
  const isLast = index === module.lessons.length - 1;
  const nextHref = isLast ? base : `${base}/leccion/${index + 2}`;

  const complete = () => {
    dispatch({ type: 'lesson', id: lesson.id });
    go(nextHref);
  };

  return (
    <div className="container container--narrow">
      <article className="card stack lesson" aria-labelledby="lesson-title">
        <a className="back" href={`#${base}`}>← {module.title}</a>
        <p className="kicker">Lección {index + 1} de {module.lessons.length} · {lesson.minutes} min</p>
        <h1 id="lesson-title">{lesson.title}</h1>
        {lesson.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <aside className="key">
          <strong>Idea clave</strong>
          <p>{lesson.key}</p>
        </aside>
        <div className="row row--between">
          {index > 0 ? (
            <a className="btn btn--text" href={`#${base}/leccion/${index}`}>Anterior</a>
          ) : (
            <span />
          )}
          {done ? (
            <a className="btn btn--primary" href={`#${nextHref}`}>{isLast ? 'Volver al módulo' : 'Siguiente lección'}</a>
          ) : (
            <button className="btn btn--primary" type="button" onClick={complete}>
              Completar (+{XP.lesson} XP)
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
