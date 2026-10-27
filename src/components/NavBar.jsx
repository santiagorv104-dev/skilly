import { SkillyLogo } from '../brand';
import { useStore } from '../state.jsx';
import { go } from '../router.js';

export default function NavBar({ route }) {
  const { state, dispatch, level } = useStore();
  const signedIn = state.signedIn && state.account;

  const signOut = () => {
    dispatch({ type: 'signOut' });
    go('/');
  };

  return (
    <header className="nav">
      <div className="nav__inner">
        <SkillyLogo
          size="sm"
          as="a"
          href={signedIn ? '#/inicio' : '#/'}
          aria-label="Skilly, inicio"
          celebrateKey={signedIn ? level : undefined}
        />
        {signedIn ? (
          <>
            <nav className="nav__links" aria-label="Principal">
              <a href="#/inicio" aria-current={route === '/inicio' ? 'page' : undefined}>Inicio</a>
              <a href="#/modulo/liderazgo" aria-current={route.startsWith('/modulo') ? 'page' : undefined}>Liderazgo</a>
            </nav>
            <span className="chip" title={`${state.xp} XP en total`}>Nivel {level}</span>
            <button className="btn btn--text" type="button" onClick={signOut}>Salir</button>
          </>
        ) : (
          <nav className="nav__links" aria-label="Cuenta">
            <a href="#/entrar">Entrar</a>
            <a className="btn btn--primary btn--sm" href="#/registro">Crear cuenta</a>
          </nav>
        )}
      </div>
    </header>
  );
}
