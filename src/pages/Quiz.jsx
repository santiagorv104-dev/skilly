import { useState } from 'react';
import { SkyChameleon } from '../brand';
import { useStore, XP } from '../state.jsx';
import { LIDERAZGO } from '../content/liderazgo.js';

export default function Quiz() {
  const { state, dispatch } = useStore();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [result, setResult] = useState(null);

  const allLessons = LIDERAZGO.lessons.every((l) => state.lessonsDone[l.id]);
  if (!allLessons) {
    return (
      <div className="container container--narrow">
        <section className="card stack center">
          <h1 className="h2">Primero, las lecciones</h1>
          <p className="muted">El reto se desbloquea cuando terminas las cuatro lecciones del módulo.</p>
          <a className="btn btn--primary" href="#/modulo/liderazgo">Ir al módulo</a>
        </section>
      </div>
    );
  }

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setResult(null);
  };

  if (result) {
    return (
      <div className="container container--narrow">
        <section className="card stack center" aria-live="polite">
          <SkyChameleon className="sky-md" />
          {result.passed ? (
            <>
              <h1 className="h2">¡Aprobaste con {result.score}%!</h1>
              {result.firstPass && <p className="badge badge--green">+{XP.quiz} XP · Logro «Líder en formación»</p>}
              <p className="muted">Ya puedes descargar tu certificado del módulo de Liderazgo.</p>
              <div className="row">
                <a className="btn btn--primary" href="#/certificado/liderazgo">Ver mi certificado</a>
                <a className="btn btn--ghost" href="#/inicio">Volver a mi ruta</a>
              </div>
            </>
          ) : (
            <>
              <h1 className="h2">Obtuviste {result.score}%</h1>
              <p className="muted">Necesitas {LIDERAZGO.passScore}% para aprobar. Repasa las lecciones y vuelve a intentarlo.</p>
              <div className="row">
                <button className="btn btn--primary" type="button" onClick={restart}>Intentar de nuevo</button>
                <a className="btn btn--ghost" href="#/modulo/liderazgo">Repasar lecciones</a>
              </div>
            </>
          )}
        </section>
      </div>
    );
  }

  const q = LIDERAZGO.quiz[index];
  const answered = picked !== null;
  const isLast = index === LIDERAZGO.quiz.length - 1;

  const pick = (i) => {
    if (answered) return;
    setPicked(i);
    if (i === q.answer) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    const score = Math.round((correct / LIDERAZGO.quiz.length) * 100);
    const passed = score >= LIDERAZGO.passScore;
    const firstPass = passed && !state.quiz.liderazgo?.passed;
    dispatch({ type: 'quiz', module: 'liderazgo', score, passed });
    setResult({ score, passed, firstPass });
  };

  return (
    <div className="container container--narrow">
      <section className="card stack" aria-labelledby="quiz-q">
        <a className="back" href="#/modulo/liderazgo">← Liderazgo</a>
        <div className="progress-dots" aria-label={`Pregunta ${index + 1} de ${LIDERAZGO.quiz.length}`}>
          {LIDERAZGO.quiz.map((_, i) => (
            <span key={i} className={i <= index ? 'dot dot--on' : 'dot'} />
          ))}
        </div>
        <p className="kicker">Reto final · {index + 1} de {LIDERAZGO.quiz.length}</p>
        <h1 id="quiz-q" className="h2">{q.question}</h1>

        <div className="options">
          {q.options.map((option, i) => {
            let cls = 'option';
            if (answered && i === q.answer) cls += ' option--right';
            else if (answered && i === picked) cls += ' option--wrong';
            return (
              <button key={option} type="button" className={cls} onClick={() => pick(i)} disabled={answered && i !== picked && i !== q.answer}>
                {option}
              </button>
            );
          })}
        </div>

        {answered && (
          <p className={picked === q.answer ? 'feedback feedback--right' : 'feedback feedback--wrong'} role="status">
            <strong>{picked === q.answer ? '¡Correcto! ' : 'No exactamente. '}</strong>
            {q.why}
          </p>
        )}

        <div className="row row--end">
          <button className="btn btn--primary" type="button" disabled={!answered} onClick={next}>
            {isLast ? 'Ver resultado' : 'Siguiente'}
          </button>
        </div>
      </section>
    </div>
  );
}
