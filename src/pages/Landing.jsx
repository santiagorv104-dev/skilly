import { SkillyLogo, Kiki } from '../brand';
import { useStore } from '../state.jsx';
import { MODULES } from '../content/modules.js';

const STEPS = [
  { title: 'Cuéntanos tu meta', text: 'Una perfilación corta para saber a dónde quieres llegar y qué habilidades reforzar.' },
  { title: 'Sigue tu ruta', text: 'Lecciones de pocos minutos y retos que te dan XP para subir de nivel con Kiki.' },
  { title: 'Demuéstralo', text: 'Aprueba el reto de cada módulo y obtén un certificado para mostrar en tu CV.' },
];

export default function Landing() {
  const { state } = useStore();
  const signedIn = state.signedIn && state.account;

  return (
    <div className="container stack-xl">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__text">
          <SkillyLogo size="lg" />
          <h1 id="hero-title">Porque en Skilly te adaptamos al mercado</h1>
          <p className="lead">
            El primer empleo es el nivel más difícil. Skilly te prepara con retos cortos, una ruta
            hecha para ti y certificados que puedes mostrar.
          </p>
          <div className="row">
            {signedIn ? (
              <a className="btn btn--primary" href="#/inicio">Ir a mi ruta</a>
            ) : (
              <>
                <a className="btn btn--primary" href="#/registro">Crear cuenta gratis</a>
                <a className="btn btn--ghost" href="#/entrar">Ya tengo cuenta</a>
              </>
            )}
          </div>
        </div>
        <Kiki className="hero__kiki" title="Kiki, el camaleón de Skilly" />
      </section>

      <section aria-labelledby="steps-title" className="stack">
        <h2 id="steps-title">Cómo funciona</h2>
        <ol className="steps">
          {STEPS.map((step, i) => (
            <li key={step.title} className="card">
              <span className="steps__n" aria-hidden="true">{i + 1}</span>
              <h3>{step.title}</h3>
              <p className="muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="skills-title" className="stack">
        <h2 id="skills-title">Habilidades más demandadas</h2>
        <ul className="pills">
          {MODULES.map((m) => (
            <li key={m.id} className="pill pill--on">{m.title}</li>
          ))}
        </ul>
      </section>

      <footer className="footer">
        <SkillyLogo size="sm" />
        <span className="muted">© 2026 Skilly · Porque en Skilly te adaptamos al mercado</span>
      </footer>
    </div>
  );
}
