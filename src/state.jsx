import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

// Versión de prueba sin servidor: la cuenta y el progreso se guardan solo en
// este dispositivo (localStorage). Las contraseñas no se guardan.
const STORAGE_KEY = 'skilly:progreso:v1';
export const XP_PER_LEVEL = 100;
export const XP = { profile: 50, lesson: 30, quiz: 100 };

const emptyProgress = { profile: null, xp: 0, lessonsDone: {}, quiz: {}, certificates: {} };
const initialState = { account: null, signedIn: false, ...emptyProgress };

function makeCode() {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SKL-${part()}-${part()}`;
}

function reducer(state, action) {
  switch (action.type) {
    case 'register':
      // Cuenta nueva: empieza de cero.
      return { ...initialState, account: action.account, signedIn: true };
    case 'signIn':
      return { ...state, signedIn: true };
    case 'signOut':
      return { ...state, signedIn: false };
    case 'profile':
      return {
        ...state,
        profile: action.profile,
        xp: state.profile ? state.xp : state.xp + XP.profile,
      };
    case 'lesson':
      if (state.lessonsDone[action.id]) return state;
      return {
        ...state,
        lessonsDone: { ...state.lessonsDone, [action.id]: true },
        xp: state.xp + XP.lesson,
      };
    case 'quiz': {
      const prev = state.quiz[action.module] ?? { best: 0, passed: false };
      const firstPass = action.passed && !prev.passed;
      return {
        ...state,
        quiz: {
          ...state.quiz,
          [action.module]: { best: Math.max(prev.best, action.score), passed: prev.passed || action.passed },
        },
        xp: state.xp + (firstPass ? XP.quiz : 0),
        certificates: firstPass
          ? { ...state.certificates, [action.module]: { date: new Date().toISOString(), code: makeCode(), score: action.score } }
          : state.certificates,
      };
    }
    default:
      return state;
  }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...initialState, ...saved } : initialState;
  } catch {
    return initialState;
  }
}

export function levelInfo(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const current = xp % XP_PER_LEVEL;
  return { level, current, needed: XP_PER_LEVEL };
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Sin almacenamiento disponible: el progreso dura lo que dure la pestaña.
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch, ...levelInfo(state.xp) }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
