import { useState } from 'react';
import { Kiki } from '../brand';
import { VERSIONS } from '../data/contenido.js';
import { getCurrent, getName, getResults } from '../lib/guardado.js';
import { formatDate, scoreDiagnostic } from '../lib/puntaje.js';
import { MiniRadar } from '../components/Radar.jsx';
import { NameField } from '../components/Comunes.jsx';

const PART_NAMES = ['Autodescripción', 'Elección forzada', 'Casos'];

export default function Inicio() {
  const [name, setNameState] = useState(getName);
  const [editing, setEditing] = useState(false);
  const current = getCurrent();
  const pending = current && VERSIONS[current.type] ? current : null;

  return (
    <div className="container stack-lg">
      <section className="card home-hero" aria-labelledby="home-title">
        <Kiki className="home-hero__kiki" title="Kiki, el camaleón de Skilly" />
        <div className="stack">
          <p className="kicker">{name ? `Hola, ${name}` : 'Hola'}</p>
          <h1 id="home-title">Brújula de habilidades</h1>
          <p className="lead">
            Conoce tus habilidades blandas. La Brújula combina tres formatos que usan las pruebas profesionales: cómo te
            describes, qué priorizas cuando tienes que elegir y cómo resuelves situaciones reales.
          </p>
          <p className="tip">
            <strong>Consejo:</strong> Responde como eres en un día normal, no como te gustaría ser ni como querría verte
            un reclutador.
          </p>
          {!name || editing ? (
            <NameField
              onSaved={(saved) => {
                setNameState(saved);
                setEditing(false);
              }}
            />
          ) : (
            <p className="small muted">
              Tu informe saldrá a nombre de <strong>{name}</strong>.{' '}
              <button className="btn btn--text btn--inline" type="button" onClick={() => setEditing(true)}>
                Cambiar nombre
              </button>
            </p>
          )}
        </div>
      </section>

      {pending && (
        <section className="card resume" aria-labelledby="resume-title">
          <div className="stack">
            <h2 id="resume-title" className="h3">Continuar donde ibas</h2>
            <p className="muted">
              Tienes la versión {VERSIONS[pending.type].name} a medias: parte {pending.part ?? 1} de 3,{' '}
              {PART_NAMES[(pending.part ?? 1) - 1].toLowerCase()}.
            </p>
          </div>
          <a className="btn btn--primary" href={`#/${pending.type}`}>
            Continuar
          </a>
        </section>
      )}

      <section className="stack" aria-labelledby="versions-title">
        <h2 id="versions-title">Elige tu diagnóstico</h2>
        <ul className="versions">
          {Object.values(VERSIONS).map((v) => (
            <VersionCard key={v.id} version={v} pending={pending?.type === v.id} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function VersionCard({ version, pending }) {
  const results = getResults(version.id);
  const last = results[results.length - 1];
  const report = last && scoreDiagnostic(version.id, last.answers, last.times);

  return (
    <li className="card version">
      <div className="version__head">
        <h3 className="h2">{version.name}</h3>
        <span className="badge">{version.minutes} min</span>
      </div>
      <p>{version.blurb}</p>
      <a className="btn btn--primary" href={`#/${version.id}`}>
        {pending ? 'Continuar' : last ? 'Hacerla otra vez' : 'Empezar'}
      </a>

      {report && (
        <div className="last-result">
          <MiniRadar skills={report.skills} />
          <div className="stack last-result__text">
            <p className="small muted">Tu último resultado · {formatDate(last.date)}</p>
            <ol className="top3">
              {report.strengths.map((s) => (
                <li key={s.id}>
                  <span className="badge badge--green">{s.short} {s.index}</span>
                </li>
              ))}
            </ol>
            <a className="btn btn--ghost btn--sm" href={`#/informe/${version.id}`}>
              Ver informe
            </a>
          </div>
        </div>
      )}
    </li>
  );
}
