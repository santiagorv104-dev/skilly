import { useState } from 'react';
import { SkyChameleon } from '../brand';
import { useStore, XP } from '../state.jsx';

// Orden aleatorio de las opciones de cada pregunta, para que la respuesta
// correcta no esté siempre en el mismo lugar.
function shuffledOrders(quiz) {
  return quiz.map((q) => {
    const order = q.options.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  });
}

export default function Quiz({ module }) {
  const { state, dispatch } = useStore();
  const [orders, setOrders] = useState(() => shuffledOrders(module.quiz));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [result, setResult] = useState(null);
  const base = `#/modulo/${module.id}`;

  const allLessons = module.lessons.every((l) => state.lessonsDone[l.id]);
  if (!allLessons) {
    return (
      <div className="container container--narrow">
        <section className="card stack center">
          <h1 className="h2">Primero, las lecciones</h1>
          <p className="muted">El reto se desbloquea cuando terminas las cuatro lecciones del módulo.</p>
          <a className="btn btn--primary" href={base}>Ir al módulo</a>
        </section>
      </div>
    );
  }

  const restart = () => {
    setOrders(shuffledOrders(module.quiz));
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
              {result.firstPass && <p className="badge badge--green">+{XP.quiz} XP · Logro «{module.badge}»</p>}
              <p className="muted">Ya puedes descargar tu certificado de {module.title}.</p>
              <div className="row">
                <a className="btn btn--primary" href={`#/certificado/${module.id}`}>Ver mi certificado</a>
                <a className="btn btn--ghost" href="#/inicio">Volver a mi ruta</a>
              </div>
            </>
          ) : (
            <>
              <h1 className="h2">Obtuviste {result.score}%</h1>
              <p className="muted">Necesitas {module.passScore}% para aprobar. Repasa las lecciones y vuelve a intentarlo.</p>
              <div className="row">
                <button className="btn btn--primary" type="button" onClick={restart}>Intentar de nuevo</button>
                <a className="btn btn--ghost" href={base}>Repasar lecciones</a>
              </div>
            </>
          )}
        </section>
      </div>
    );
  }

  const q = module.quiz[index];
  const answered = picked !== null;
  const isLast = index === module.quiz.length - 1;

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
    const score = Math.round((correct / module.quiz.length) * 100);
    const passed = score >= module.passScore;
    const firstPass = passed && !state.quiz[module.id]?.passed;
    dispatch({ type: 'quiz', module: module.id, score, passed });
    setResult({ score, passed, firstPass });
  };

  return (
    <div className="container container--narrow">
      <section className="card stack" aria-labelledby="quiz-q">
        <a className="back" href={base}>← {module.title}</a>
        <div className="progress-dots" aria-label={`Pregunta ${index + 1} de ${module.quiz.length}`}>
          {module.quiz.map((_, i) => (
            <span key={i} className={i <= index ? 'dot dot--on' : 'dot'} />
          ))}
        </div>
        <p className="kicker">Reto final · {index + 1} de {module.quiz.length}</p>
        <h1 id="quiz-q" className="h2">{q.question}</h1>

        <div className="options">
          {orders[index].map((i) => {
            let cls = 'option';
            if (answered && i === q.answer) cls += ' option--right';
            else if (answered && i === picked) cls += ' option--wrong';
            return (
              <button key={i} type="button" className={cls} onClick={() => pick(i)} disabled={answered && i !== picked && i !== q.answer}>
                {q.options[i]}
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
