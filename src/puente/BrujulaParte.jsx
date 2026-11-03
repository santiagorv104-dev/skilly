import { useMemo } from 'react';
import '../brujula/brujula.css';
import { NavBar } from '../brujula/components/Comunes.jsx';
import Inicio from '../brujula/pages/Inicio.jsx';
import Diagnostico from '../brujula/pages/Diagnostico.jsx';
import Informe from '../brujula/pages/Informe.jsx';
import { VERSIONS } from '../brujula/data/contenido.js';
import { useStore } from '../state.jsx';
import { orderedModules } from '../content/modules.js';
import { latestBrujula } from './brujula.js';

// Primera parte del recorrido: la Brújula, con las mismas rutas que en su app
// independiente (#/, #/expres, #/completa, #/informe/<versión>).
export function brujulaPage(route) {
  if (route === '/') return { page: 'inicio' };
  const match = route.match(/^\/(informe\/)?([a-z]+)$/);
  if (match && VERSIONS[match[2]]) return { page: match[1] ? 'informe' : 'diagnostico', type: match[2] };
  return null;
}

export default function BrujulaParte({ route, page }) {
  return (
    <>
      <NavBar route={route} />
      <main className="main">
        {page.page === 'inicio' && (
          <>
            <Inicio />
            <NextStep where="inicio" />
          </>
        )}
        {page.page === 'diagnostico' && <Diagnostico key={page.type} type={page.type} />}
        {page.page === 'informe' && (
          <>
            <Informe key={page.type} type={page.type} />
            <NextStep where="informe" />
          </>
        )}
      </main>
    </>
  );
}

// Puente hacia la segunda parte: la app de Skilly.
function NextStep({ where }) {
  const { state } = useStore();
  const brujula = useMemo(() => latestBrujula(), []);
  if (where === 'informe' && !brujula) return null;

  const signedIn = state.signedIn && state.account;
  const href = signedIn ? '#/inicio' : state.account ? '#/entrar' : '#/registro';
  const cta = signedIn ? 'Ir a mi ruta' : state.account ? 'Entrar a Skilly' : 'Crear mi cuenta en Skilly';
  const top = brujula ? orderedModules(null, brujula.moduleScores).slice(0, 2) : [];
  const container = where === 'informe' ? 'container container--report' : 'container';

  return (
    <div className={`${container} next-step`}>
      <section className="card stack" aria-labelledby="next-step-title">
        <p className="kicker">Paso 2 · La app de Skilly</p>
        <h2 id="next-step-title">{brujula ? 'Entrena tus prioridades' : 'Después, tu ruta en Skilly'}</h2>
        {brujula ? (
          <>
            <p className="muted">
              Con tu Brújula ordenamos tu ruta: empiezas por los módulos donde más puedes crecer, con lecciones cortas,
              retos y certificados.
            </p>
            <ul className="pills">
              {top.map((m) => (
                <li key={m.id} className="pill pill--on">
                  {m.title} · {brujula.moduleScores[m.id]}
                </li>
              ))}
            </ul>
            <div className="row">
              <a className="btn btn--primary" href={href}>{cta}</a>
            </div>
          </>
        ) : (
          <>
            <p className="muted">
              Cuando termines tu diagnóstico, Skilly arma tu ruta de entrenamiento según tus resultados.
            </p>
            {state.account && (
              <div className="row">
                <a className="btn btn--ghost" href={href}>{signedIn ? 'Ir a mi ruta' : 'Ya tengo cuenta'}</a>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
