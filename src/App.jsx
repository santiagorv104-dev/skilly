import { useState } from 'react';
import { SplashScreen, shouldShowSplash } from './brand';
import { StoreProvider, useStore } from './state.jsx';
import { useRoute } from './router.js';
import NavBar from './components/NavBar.jsx';
import LevelUp from './components/LevelUp.jsx';
import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
import Profile from './pages/Profile.jsx';
import Home from './pages/Home.jsx';
import Module from './pages/Module.jsx';
import Lesson from './pages/Lesson.jsx';
import Quiz from './pages/Quiz.jsx';
import Certificate from './pages/Certificate.jsx';

export default function App() {
  const [splash, setSplash] = useState(shouldShowSplash);

  return (
    <StoreProvider>
      {splash && <SplashScreen onDone={() => setSplash(false)} />}
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const route = useRoute();
  return (
    <>
      <NavBar route={route} />
      <main className="main">
        <Page route={route} />
      </main>
      <LevelUp />
    </>
  );
}

function Page({ route }) {
  const { state } = useStore();
  const signedIn = state.signedIn && state.account;

  if (route === '/entrar') return <Auth mode="signin" />;
  if (route === '/registro') return <Auth mode="register" />;
  if (route === '/' || !signedIn) return <Landing />;

  // A partir de aquí, solo con sesión iniciada; la perfilación va primero.
  if (route === '/perfil' || !state.profile) return <Profile />;
  if (route === '/inicio') return <Home />;
  if (route === '/modulo/liderazgo') return <Module />;
  if (route === '/modulo/liderazgo/quiz') return <Quiz />;
  if (route === '/certificado/liderazgo') return <Certificate />;

  const lesson = route.match(/^\/modulo\/liderazgo\/leccion\/(\d+)$/);
  if (lesson) return <Lesson index={Number(lesson[1]) - 1} />;

  return <Home />;
}
