import { useState } from 'react';
import { SkillyLogo } from '../brand';
import { useStore } from '../state.jsx';
import { go } from '../router.js';

export default function Auth({ mode }) {
  const { state, dispatch } = useStore();
  const [error, setError] = useState('');
  const registering = mode === 'register';

  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email')).trim().toLowerCase();

    if (registering) {
      const name = String(data.get('name')).trim();
      dispatch({ type: 'register', account: { name, email } });
      go('/perfil');
      return;
    }

    if (state.account?.email !== email) {
      setError('No encontramos esa cuenta en este dispositivo. Revisa el correo o crea una cuenta.');
      return;
    }
    dispatch({ type: 'signIn' });
    go(state.profile ? '/inicio' : '/perfil');
  };

  return (
    <div className="container container--narrow">
      <section className="card auth" aria-labelledby="auth-title">
        <SkillyLogo size="md" stacked />
        <h1 id="auth-title" className="auth__title">{registering ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h1>

        <div className="tabs" role="tablist" aria-label="Tipo de acceso">
          <a role="tab" aria-selected={!registering} className="tabs__tab" href="#/entrar">Tengo cuenta</a>
          <a role="tab" aria-selected={registering} className="tabs__tab" href="#/registro">Crear cuenta</a>
        </div>

        <form className="form" onSubmit={submit} key={mode}>
          {registering && (
            <label>
              Nombre
              <input name="name" autoComplete="name" required minLength={2} placeholder="Tu nombre y apellido" />
            </label>
          )}
          <label>
            Correo
            <input name="email" type="email" autoComplete="email" required placeholder="tu@correo.com" onChange={() => setError('')} />
          </label>
          <label>
            Contraseña
            <input
              name="password"
              type="password"
              autoComplete={registering ? 'new-password' : 'current-password'}
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
            />
          </label>
          {error && <p className="form__error" role="alert">{error}</p>}
          <button className="btn btn--primary" type="submit">{registering ? 'Crear cuenta' : 'Entrar'}</button>
        </form>

        <p className="note">
          Versión de prueba: tu progreso se guarda solo en este dispositivo y la contraseña no se almacena.
        </p>
      </section>
    </div>
  );
}
