import { useEffect, useMemo, useRef, useState } from 'react';
import { Kiki } from '../brand';
import { CASES, PAIR_BY_ID, PARTS, SCALE, STATEMENTS, VERSIONS } from '../data/contenido.js';
import { addResult, clearCurrent, getCurrent, getName, setCurrent } from '../lib/guardado.js';
import { go } from '../router.js';
import { CelebratingKiki, NameField } from '../components/Comunes.jsx';

const ADVANCE_MS = { 1: 250, 2: 250, 3: 450 };
const MAX_GAP_MS = 180_000; // una pausa larga no cuenta como tiempo de lectura
const LETTERS = ['A', 'B', 'C', 'D'];

const TRANSITIONS = {
  2: {
    title: '¡Parte 1 lista!',
    text: 'Las dos frases de cada par son positivas, así que ninguna es la correcta. Elige la que se parece más a ti, aunque te identifiques con ambas. Así se ve qué priorizas de verdad.',
  },
  3: {
    title: '¡Parte 2 lista!',
    text: 'Elige la opción que te parezca más eficaz. Aquí sí hay respuestas mejores que otras, y la más obvia no siempre es la mejor. Lee con calma: importa más acertar que ir rápido.',
  },
};

// Pantallas del diagnóstico en orden: preguntas de la parte 1, transición,
// parte 2, transición y parte 3.
function buildSteps(version) {
  const steps = [];
  version.statements.forEach((id, index) => steps.push({ kind: 'q', part: 1, index, id }));
  steps.push({ kind: 'transition', part: 2 });
  version.pairs.forEach((id, index) => steps.push({ kind: 'q', part: 2, index, id }));
  steps.push({ kind: 'transition', part: 3 });
  version.cases.forEach((c, index) => steps.push({ kind: 'q', part: 3, index, id: c.id }));
  return steps;
}

const partSizes = (v) => [v.statements.length, v.pairs.length, v.cases.length];

function savedRun(type) {
  const run = getCurrent();
  if (!run || !VERSIONS[run.type] || !run.answers || !Number.isInteger(run.step)) return null;
  if (run.step < 0 || run.step >= buildSteps(VERSIONS[run.type]).length) return null;
  return run;
}

export default function Diagnostico({ type }) {
  const version = VERSIONS[type];
  const steps = useMemo(() => buildSteps(version), [version]);
  const [saved] = useState(() => savedRun(type));
  const [run, setRun] = useState(() => (saved?.type === type ? saved : null));
  const [other, setOther] = useState(() => (saved && saved.type !== type ? saved : null));
  const [done, setDone] = useState(false);
  const [name, setName] = useState(getName);
  const mark = useRef(Date.now());
  const timer = useRef(null);
  const titleRef = useRef(null);
  const cardRef = useRef(null);

  // El avance se guarda en cada cambio para poder salir y continuar después.
  useEffect(() => {
    if (run && !done) setCurrent(run);
  }, [run, done]);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Con la pestaña oculta el reloj se detiene.
  useEffect(() => {
    let hiddenAt = 0;
    const onVisibility = () => {
      if (document.hidden) hiddenAt = Date.now();
      else if (hiddenAt) {
        mark.current += Date.now() - hiddenAt;
        hiddenAt = 0;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // En cada pantalla nueva: foco en la pregunta y, si quedó fuera de vista, arriba.
  const stepNumber = run?.step;
  useEffect(() => {
    if (stepNumber === undefined) return;
    if (cardRef.current && cardRef.current.getBoundingClientRect().top < 0) window.scrollTo(0, 0);
    titleRef.current?.focus({ preventScroll: true });
  }, [stepNumber]);

  const place = (next) => {
    const s = steps[next.step];
    return { ...next, part: s.part, index: s.kind === 'q' ? s.index : -1 };
  };

  // Segundos desde la última marca (sin contar pausas muy largas).
  const spend = () => {
    const now = Date.now();
    const seconds = Math.min(now - mark.current, MAX_GAP_MS) / 1000;
    mark.current = now;
    return seconds;
  };

  // Aplica un cambio y suma el tiempo de la pregunta en pantalla a su parte.
  const commit = (change) => {
    const step = steps[run.step];
    const seconds = spend();
    setRun((prev) => {
      const next = { ...prev, ...change(prev) };
      if (step.kind === 'q') {
        const key = `p${step.part}`;
        next.times = { ...prev.times, [key]: (prev.times[key] ?? 0) + seconds };
      }
      return place(next);
    });
  };

  const start = () => {
    clearCurrent();
    mark.current = Date.now();
    setOther(null);
    setRun(
      place({
        type,
        step: 0,
        answers: { p1: {}, p2: {}, p3: {} },
        times: { p1: 0, p2: 0, p3: 0 },
        started: new Date().toISOString(),
      }),
    );
  };

  const goTo = (stepIndex) => {
    clearTimeout(timer.current);
    commit(() => ({ step: stepIndex }));
  };

  const finish = () => {
    clearTimeout(timer.current);
    const seconds = spend();
    const times = { ...run.times, p3: (run.times.p3 ?? 0) + seconds };
    addResult({
      id: Date.now().toString(36),
      type,
      date: new Date().toISOString(),
      name: getName(),
      answers: run.answers,
      times: Object.fromEntries(Object.entries(times).map(([k, v]) => [k, Math.round(v)])),
    });
    clearCurrent();
    setDone(true);
  };

  const isLast = run && run.step === steps.length - 1;
  const next = () => (isLast ? finish() : goTo(run.step + 1));
  const back = () => {
    // Atrás salta las pantallas de transición.
    let s = run.step - 1;
    if (steps[s]?.kind === 'transition' && steps[run.step].kind === 'q') s -= 1;
    if (s >= 0) goTo(s);
  };

  const choose = (value) => {
    const step = steps[run.step];
    const key = `p${step.part}`;
    const at = run.step;
    clearTimeout(timer.current);
    commit((prev) => ({ answers: { ...prev.answers, [key]: { ...prev.answers[key], [step.id]: value } } }));
    // Avanza solo, salvo en la última pregunta: esa se confirma con el botón.
    if (at === steps.length - 1) return;
    timer.current = setTimeout(() => {
      setRun((prev) => (prev && prev.step === at ? place({ ...prev, step: at + 1 }) : prev));
    }, ADVANCE_MS[step.part]);
  };

  // Atajos: 1 a 5 en la parte 1, A y B en la parte 2, A a D en la parte 3.
  useEffect(() => {
    if (!run || done || steps[run.step].kind !== 'q') return undefined;
    const { part } = steps[run.step];
    const onKey = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
      const k = event.key.toLowerCase();
      if (part === 1 && /^[1-5]$/.test(k)) choose(Number(k));
      else if (part === 2 && (k === 'a' || k === 'b')) choose(k);
      else if (part === 3 && /^[a-d]$/.test(k)) choose('abcd'.indexOf(k));
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (done) return <Done type={type} name={name} />;

  if (!run && other) {
    const otherName = VERSIONS[other.type].name;
    return (
      <div className="container container--narrow">
        <section className="card center stack" aria-labelledby="conflict-title">
          <Kiki className="kiki-md" title="Kiki" />
          <h1 id="conflict-title" className="h2">Tienes la versión {otherName} a medias</h1>
          <p className="muted">
            Si empiezas la versión {version.name} ahora, se borra lo que llevabas de la {otherName}.
          </p>
          <div className="row">
            <a className="btn btn--primary" href={`#/${other.type}`}>Seguir con la {otherName}</a>
            <button className="btn btn--ghost" type="button" onClick={start}>
              Empezar la {version.name}
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (!run) {
    const [n1, n2, n3] = partSizes(version);
    return (
      <div className="container container--narrow">
        <section className="card stack intro" aria-labelledby="intro-title">
          <Kiki className="kiki-md intro__kiki" title="Kiki" />
          <p className="kicker">Diagnóstico {version.id === 'expres' ? 'exprés' : 'completo'} · {version.minutes} minutos</p>
          <h1 id="intro-title" className="h2">Tu brújula en tres partes</h1>
          <ol className="parts-list">
            <li>
              <strong>Autodescripción.</strong> {n1} frases: marca qué tanto te describe cada una, del 1 al 5.
            </li>
            <li>
              <strong>Elección forzada.</strong> {n2} pares: elige la frase que se parece más a ti.
            </li>
            <li>
              <strong>Casos.</strong> {n3} situaciones reales: elige lo que sería más eficaz.
            </li>
          </ol>
          <p className="tip">
            <strong>Consejo:</strong> Responde como eres en un día normal, no como te gustaría ser ni como querría verte
            un reclutador.
          </p>
          {!name && <NameField onSaved={setName} />}
          <p className="small muted">Puedes salir cuando quieras: tu avance queda guardado en este dispositivo.</p>
          <div className="row row--end">
            <button className="btn btn--primary" type="button" onClick={start}>
              Empezar
            </button>
          </div>
        </section>
      </div>
    );
  }

  const step = steps[run.step];
  const part = PARTS[step.part - 1];

  if (step.kind === 'transition') {
    const t = TRANSITIONS[step.part];
    return (
      <div className="container container--narrow">
        <section className="card center stack" aria-labelledby="q-title" ref={cardRef}>
          <PartsBar version={version} run={run} />
          <CelebratingKiki />
          <p className="kicker">
            Parte {step.part} de 3 · {part.name}
          </p>
          <h1 id="q-title" className="h2 q-title" ref={titleRef} tabIndex={-1}>
            {t.title}
          </h1>
          <p className="lead">{t.text}</p>
          <div className="row">
            <button className="btn btn--text" type="button" onClick={back}>
              Atrás
            </button>
            <button className="btn btn--primary" type="button" onClick={() => goTo(run.step + 1)}>
              Empezar la parte {step.part}
            </button>
          </div>
        </section>
      </div>
    );
  }

  const answer = run.answers[`p${step.part}`]?.[step.id];
  const total = partSizes(version)[step.part - 1];

  return (
    <div className="container container--narrow">
      <section key={run.step} className="card stack question" ref={cardRef} aria-labelledby="q-title">
        <div className="q-head">
          <p className="kicker">
            Parte {step.part} de 3 · {part.name}
          </p>
          <p className="q-count">
            {part.unit} {step.index + 1} de {total}
          </p>
        </div>
        <PartsBar version={version} run={run} />

        {step.part === 1 && <Statement id={step.id} value={answer} onChoose={choose} titleRef={titleRef} />}
        {step.part === 2 && <Pair id={step.id} value={answer} onChoose={choose} titleRef={titleRef} />}
        {step.part === 3 && <Case id={step.id} value={answer} onChoose={choose} titleRef={titleRef} />}

        <div className="row row--between q-nav">
          <button className="btn btn--text" type="button" disabled={run.step === 0} onClick={back}>
            Atrás
          </button>
          <button className="btn btn--primary" type="button" disabled={answer === undefined} onClick={next}>
            {isLast ? 'Ver mi brújula' : 'Siguiente'}
          </button>
        </div>
        <p className="note only-desktop">
          Atajo: {step.part === 1 ? 'teclas 1 a 5' : step.part === 2 ? 'teclas A y B' : 'teclas A a D'}
        </p>
      </section>
    </div>
  );
}

// Barra de tres tramos; cada tramo mide lo que toma su parte.
function PartsBar({ version, run }) {
  const sizes = partSizes(version);
  const done = [1, 2, 3].map((p) => Object.keys(run.answers[`p${p}`] ?? {}).length);
  const weights = version.partWeights;
  const total = weights.reduce((a, b) => a + b, 0);
  const percent = Math.round(
    weights.reduce((acc, w, i) => acc + (w * Math.min(done[i], sizes[i])) / sizes[i], 0) * (100 / total),
  );
  return (
    <div className="parts-bar" role="progressbar" aria-label="Avance del diagnóstico" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      {weights.map((w, i) => (
        <span key={i} className="parts-bar__seg" style={{ flexGrow: w }}>
          <span style={{ width: `${(Math.min(done[i], sizes[i]) / sizes[i]) * 100}%` }} />
        </span>
      ))}
    </div>
  );
}

function Statement({ id, value, onChoose, titleRef }) {
  const st = STATEMENTS[id];
  return (
    <>
      <h1 id="q-title" className="q-statement q-title" ref={titleRef} tabIndex={-1}>
        {st.text}
      </h1>
      <div className="likert" role="radiogroup" aria-labelledby="q-title">
        {SCALE.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            aria-label={`${o.value}, ${o.label}`}
            className={value === o.value ? 'likert__opt likert__opt--on' : 'likert__opt'}
            onClick={() => onChoose(o.value)}
          >
            <span className="likert__n">{o.value}</span>
            <span className="likert__label">{o.label}</span>
          </button>
        ))}
      </div>
      <div className="likert__ends" aria-hidden="true">
        <span>{SCALE[0].label}</span>
        <span>{SCALE[4].label}</span>
      </div>
    </>
  );
}

function Pair({ id, value, onChoose, titleRef }) {
  const pair = PAIR_BY_ID[id];
  return (
    <>
      <h1 id="q-title" className="h2 q-title" ref={titleRef} tabIndex={-1}>
        ¿Cuál de estas dos frases se parece más a ti?
      </h1>
      <div className="pair" role="radiogroup" aria-labelledby="q-title">
        {['a', 'b'].map((k, i) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={value === k}
            className={value === k ? 'option option--card option--on' : 'option option--card'}
            onClick={() => onChoose(k)}
          >
            <span className="option__key" aria-hidden="true">{LETTERS[i]}</span>
            <span>{pair[k].text}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Case({ id, value, onChoose, titleRef }) {
  const c = CASES[id];
  return (
    <>
      <div>
        <span className="badge">{c.context}</span>
      </div>
      <h1 id="q-title" className="case-text q-title" ref={titleRef} tabIndex={-1}>
        {c.text}
      </h1>
      <p id="q-ask" className="h3">¿Qué sería lo más eficaz?</p>
      <div className="options" role="radiogroup" aria-labelledby="q-ask" aria-describedby="q-title">
        {c.options.map((o, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            className={value === i ? 'option option--keyed option--on' : 'option option--keyed'}
            onClick={() => onChoose(i)}
          >
            <span className="option__key" aria-hidden="true">{LETTERS[i]}</span>
            <span>{o.text}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Done({ type, name }) {
  useEffect(() => {
    const t = setTimeout(() => go(`/informe/${type}`), 1900);
    return () => clearTimeout(t);
  }, [type]);
  return (
    <div className="container container--narrow">
      <section className="card center stack" aria-live="polite">
        <CelebratingKiki className="kiki-lg" />
        <h1 className="h2">¡Terminaste{name ? `, ${name}` : ''}!</h1>
        <p className="lead">Kiki está armando tu brújula.</p>
        <a className="btn btn--primary" href={`#/informe/${type}`}>
          Ver mi informe
        </a>
      </section>
    </div>
  );
}
