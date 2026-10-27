import { SkillyLogo } from '../brand';
import { useStore } from '../state.jsx';

export default function Certificate({ module }) {
  const { state } = useStore();
  const cert = state.certificates[module.id];

  if (!cert) {
    return (
      <div className="container container--narrow">
        <section className="card stack center">
          <h1 className="h2">Aún no tienes este certificado</h1>
          <p className="muted">Aprueba el reto final del módulo de {module.title} para obtenerlo.</p>
          <a className="btn btn--primary" href={`#/modulo/${module.id}`}>Ir al módulo</a>
        </section>
      </div>
    );
  }

  const date = new Intl.DateTimeFormat('es', { dateStyle: 'long' }).format(new Date(cert.date));

  return (
    <div className="container stack-lg">
      <div className="row row--between no-print">
        <a className="back" href="#/inicio">← Tu ruta</a>
        <button className="btn btn--primary" type="button" onClick={() => window.print()}>
          Descargar o imprimir
        </button>
      </div>

      <article className="certificate" aria-labelledby="cert-name">
        <SkillyLogo size="md" />
        <p className="certificate__kicker">Certificado de finalización</p>
        <p className="muted">Se otorga a</p>
        <h1 id="cert-name" className="certificate__name">{state.account.name}</h1>
        <p className="certificate__text">
          por completar el <strong>Módulo de {module.title}</strong> de Skilly: {module.certText}.
        </p>
        <div className="certificate__foot">
          <div>
            <span className="small muted">Fecha</span>
            <strong>{date}</strong>
          </div>
          <div className="certificate__seal" aria-label="Sello de logro">★</div>
          <div>
            <span className="small muted">Código</span>
            <strong>{cert.code}</strong>
          </div>
        </div>
      </article>
    </div>
  );
}
