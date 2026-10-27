import { useState } from 'react';
import { SkyChameleon } from '../brand';
import { useStore, XP } from '../state.jsx';
import { go } from '../router.js';
import { PROFILE_QUESTIONS } from '../content/modules.js';

export default function Profile() {
  const { state, dispatch } = useStore();
  const [answers, setAnswers] = useState(state.profile ?? {});
  const [step, setStep] = useState(0);
  const done = step === PROFILE_QUESTIONS.length;

  if (done) {
    const first = answers.habilidad;
    return (
      <div className="container container--narrow">
        <section className="card center stack" aria-labelledby="profile-done">
          <SkyChameleon className="sky-md" />
          <h1 id="profile-done">¡Tu ruta está lista!</h1>
          <p className="lead">
            Empezamos por <strong>Liderazgo</strong>, una de las habilidades que más piden en un primer empleo.
            {first && first !== 'Liderazgo' && ` ${first} llegará muy pronto a tu ruta.`}
          </p>
          {!state.profile && <p className="badge badge--green">+{XP.profile} XP por completar tu perfil</p>}
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => {
              dispatch({ type: 'profile', profile: answers });
              go('/inicio');
            }}
          >
            Ir a mi ruta
          </button>
        </section>
      </div>
    );
  }

  const q = PROFILE_QUESTIONS[step];
  const chosen = answers[q.id];

  return (
    <div className="container container--narrow">
      <section className="card stack" aria-labelledby="profile-q">
        <div className="progress-dots" aria-label={`Pregunta ${step + 1} de ${PROFILE_QUESTIONS.length}`}>
          {PROFILE_QUESTIONS.map((item, i) => (
            <span key={item.id} className={i <= step ? 'dot dot--on' : 'dot'} />
          ))}
        </div>
        <p className="kicker">Perfilación · {step + 1} de {PROFILE_QUESTIONS.length}</p>
        <h1 id="profile-q" className="h2">{q.question}</h1>

        <div className="options" role="radiogroup" aria-labelledby="profile-q">
          {q.options.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={chosen === option}
              className={chosen === option ? 'option option--on' : 'option'}
              onClick={() => setAnswers({ ...answers, [q.id]: option })}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="row row--between">
          <button className="btn btn--text" type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>
            Atrás
          </button>
          <button className="btn btn--primary" type="button" disabled={!chosen} onClick={() => setStep(step + 1)}>
            {step === PROFILE_QUESTIONS.length - 1 ? 'Ver mi ruta' : 'Siguiente'}
          </button>
        </div>
      </section>
    </div>
  );
}
