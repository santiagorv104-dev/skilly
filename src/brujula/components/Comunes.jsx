import { useEffect, useState } from 'react';
import { Kiki, SkillyLogo } from '../brand';
import { getName, setName } from '../lib/guardado.js';

export function NavBar({ route }) {
  return (
    <header className="nav">
      <div className="nav__inner">
        <SkillyLogo size="sm" as="a" href="#/" aria-label="Skilly, inicio de la Brújula" />
        <span className="nav__app">Brújula</span>
        <nav className="nav__links" aria-label="Principal">
          <a href="#/" aria-current={route === '/' ? 'page' : undefined}>Inicio</a>
        </nav>
      </div>
    </header>
  );
}

/** Kiki que celebra cambiando de color apenas aparece. */
export function CelebratingKiki({ className = 'kiki-md', title = 'Kiki celebrando' }) {
  const [key, setKey] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setKey(1));
    return () => cancelAnimationFrame(frame);
  }, []);
  return <Kiki className={className} celebrateKey={key} title={title} />;
}

/** Nombre para personalizar el informe. No hay registro ni contraseña. */
export function NameField({ onSaved }) {
  const [value, setValue] = useState('');
  const save = (event) => {
    event.preventDefault();
    if (!value.trim()) return;
    setName(value);
    onSaved?.(getName());
  };
  return (
    <form className="form name-form" onSubmit={save}>
      <label htmlFor="name">¿Cómo te llamas?</label>
      <div className="name-form__row">
        <input
          id="name"
          name="name"
          autoComplete="given-name"
          maxLength={40}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tu nombre"
        />
        <button className="btn btn--primary" type="submit" disabled={!value.trim()}>
          Guardar
        </button>
      </div>
      <p className="small muted">Solo lo usamos para personalizar tu informe. Se queda en este dispositivo.</p>
    </form>
  );
}
