import { useState } from 'react';
import { Kiki } from '../brand';
import { VERSIONS } from '../data/contenido.js';
import { getResults } from '../lib/guardado.js';
import {
  ALERT_NAMES,
  blindSpotText,
  compare,
  formatDate,
  formatDelta,
  formatDuration,
  headline,
  hiddenStrengthText,
  scoreDiagnostic,
  summaryText,
} from '../lib/puntaje.js';
import { downloadShareCard } from '../lib/tarjeta.js';
import { RadarChart } from '../components/Radar.jsx';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Navegadores sin portapapeles moderno.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

export default function Informe({ type }) {
  const version = VERSIONS[type];
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const results = getResults(type);
  const last = results[results.length - 1];

  if (!last) {
    return (
      <div className="container container--narrow">
        <section className="card center stack">
          <Kiki className="kiki-md" title="Kiki" />
          <h1 className="h2">Aún no tienes un resultado de la versión {version.name}</h1>
          <p className="muted">Haz el diagnóstico y aquí verás tu brújula completa.</p>
          <a className="btn btn--primary" href={`#/${type}`}>Empezar la {version.name}</a>
        </section>
      </div>
    );
  }

  const report = scoreDiagnostic(type, last.answers, last.times);
  const previous = results[results.length - 2];
  const comparison = previous && compare(report, scoreDiagnostic(type, previous.answers, previous.times));
  const meta = { name: last.name, date: last.date };
  const seconds = Object.values(last.times ?? {}).reduce((a, b) => a + b, 0);

  const download = async () => {
    setBusy(true);
    try {
      await downloadShareCard(report, meta);
      setStatus('Tu tarjeta se descargó.');
    } catch {
      setStatus('No se pudo crear la imagen en este navegador.');
    }
    setBusy(false);
  };

  const copy = async () => {
    const ok = await copyText(summaryText(report, meta));
    setStatus(ok ? '¡Resumen copiado! Pégalo donde quieras.' : 'No se pudo copiar el resumen.');
  };

  return (
    <div className="container container--report stack-lg">
      <section className="card report-head" aria-labelledby="report-title">
        <Kiki className="report-head__kiki" title="Kiki" />
        <div className="stack">
          <p className="kicker">
            {formatDate(last.date)} · Versión {version.name} · {formatDuration(seconds)}
          </p>
          <h1 id="report-title">Tu brújula{last.name ? `, ${last.name}` : ''}</h1>
          <p className="lead">{headline(report)}</p>
        </div>
      </section>

      <section className="card stack radar-card" aria-labelledby="radar-title">
        <h2 id="radar-title">Tus 12 habilidades</h2>
        <p className="small muted">Toca o pasa el mouse por los puntos para ver cada valor.</p>
        <RadarChart skills={report.skills} />
      </section>

      <section className="summary-grid" aria-label="Resumen">
        <div className="card stack">
          <h2 className="h3">Tus fortalezas</h2>
          <ol className="top3">
            {report.strengths.map((s) => (
              <li key={s.id}>
                <span className="badge badge--green">{s.short} · {s.index}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="card stack">
          <h2 className="h3">Por dónde empezar</h2>
          <ol className="top3">
            {report.priorities.map((s) => (
              <li key={s.id}>
                <span className="badge badge--outline">{s.short} · {s.index}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="card stack" aria-labelledby="alerts-title">
        <h2 id="alerts-title" className="h3">Confiabilidad</h2>
        <ul className="alerts">
          {Object.entries(report.alerts).map(([key, a]) => (
            <li key={key} className="alert">
              <span className={a.ok ? 'badge badge--green' : 'badge badge--warn'}>
                {ALERT_NAMES[key]}: {a.ok ? 'Bien' : 'Revisar'}
              </span>
              <p className="small">{a.text}</p>
            </li>
          ))}
        </ul>
        {report.anyAlert && <p className="tip">Con alguna alerta, toma los resultados como orientación general.</p>}
      </section>

      <section className="card stack" aria-labelledby="detail-title">
        <h2 id="detail-title">Detalle por habilidad</h2>
        <p className="small muted gap-legend">
          <span><span className="mark mark--self" aria-hidden="true" /> Te describes</span>
          <span><span className="mark mark--cases" aria-hidden="true" /> Decides en los casos</span>
          <span><span className="mark mark--fill" aria-hidden="true" /> Índice</span>
        </p>
        <ul className="skill-rows">
          {report.ranked.map((s) => (
            <SkillRow key={s.id} skill={s} delta={comparison?.deltas[s.id]} />
          ))}
        </ul>
      </section>

      {(report.blindSpots.length > 0 || report.hiddenStrengths.length > 0) && (
        <section className="card stack" aria-labelledby="gaps-title">
          <h2 id="gaps-title" className="h3">Puntos ciegos y fortalezas escondidas</h2>
          {report.blindSpots.length > 0 && (
            <div className="stack">
              <h3 className="small kicker">Puntos ciegos</h3>
              <ul className="gaps">
                {report.blindSpots.map((s) => (
                  <li key={s.id}>{blindSpotText(s)}</li>
                ))}
              </ul>
            </div>
          )}
          {report.hiddenStrengths.length > 0 && (
            <div className="stack">
              <h3 className="small kicker">Fortalezas escondidas</h3>
              <ul className="gaps">
                {report.hiddenStrengths.map((s) => (
                  <li key={s.id}>{hiddenStrengthText(s)}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="stack" aria-labelledby="plan-title">
        <h2 id="plan-title">Tu plan</h2>
        <ol className="plan">
          {report.priorities.map((s, i) => (
            <li key={s.id} className="card stack">
              <div className="plan__head">
                <span className="plan__n" aria-hidden="true">{i + 1}</span>
                <h3>{s.full}</h3>
              </div>
              <p className="muted">{s.desc}</p>
              <ul className="actions">
                {s.actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {comparison && (
        <section className="card stack" aria-labelledby="progress-title">
          <h2 id="progress-title" className="h3">Tu avance</h2>
          <p>
            Frente a tu resultado del {formatDate(previous.date)}: {comparison.text}
          </p>
          <p className="small muted">La diferencia de cada habilidad aparece junto a su índice en el detalle.</p>
        </section>
      )}

      <section className="card stack share" aria-labelledby="share-title">
        <h2 id="share-title" className="h3">Comparte tu brújula</h2>
        <p className="muted">Descarga una imagen con tu radar, tus fortalezas y tus prioridades, o copia el resumen en texto.</p>
        <div className="row">
          <button className="btn btn--primary" type="button" onClick={download} disabled={busy}>
            {busy ? 'Creando tu tarjeta...' : 'Descargar mi tarjeta'}
          </button>
          <button className="btn btn--ghost" type="button" onClick={copy}>
            Copiar resumen
          </button>
        </div>
        <p className="small share__status" role="status">{status}</p>
      </section>

      <section className="stack center">
        <div className="row">
          <a className="btn btn--primary" href={`#/${type}`}>Repetir el diagnóstico</a>
          <a className="btn btn--ghost" href="#/">Volver al inicio</a>
        </div>
        <p className="note method">{version.method}</p>
      </section>
    </div>
  );
}

function SkillRow({ skill: s, delta }) {
  const lo = Math.min(s.self, s.cases);
  const hi = Math.max(s.self, s.cases);
  return (
    <li className="skill-row">
      <div className="skill-row__head">
        <h3 className="skill-row__name">{s.short}</h3>
        <span className={`level level--${s.level.id}`}>{s.level.name}</span>
        <span className="skill-row__index">
          {s.index}
          {delta !== undefined && (
            <span
              className={`delta ${delta > 0 ? 'delta--up' : delta < 0 ? 'delta--down' : ''}`}
              aria-label={delta === 0 ? 'sin cambio' : `${delta > 0 ? 'subió' : 'bajó'} ${Math.abs(delta)}`}
            >
              {formatDelta(delta)}
            </span>
          )}
        </span>
      </div>
      <div className="gapbar" aria-hidden="true">
        <span className="gapbar__fill" style={{ width: `${s.index}%` }} />
        <span className="gapbar__link" style={{ left: `${lo}%`, width: `${hi - lo}%` }} />
        <span className="gapbar__mark gapbar__mark--self" style={{ left: `${s.self}%` }} />
        <span className="gapbar__mark gapbar__mark--cases" style={{ left: `${s.cases}%` }} />
      </div>
      <p className="small muted">
        Te describes {s.self} · Decides {s.cases} · Preferencia {s.pref}
      </p>
    </li>
  );
}
