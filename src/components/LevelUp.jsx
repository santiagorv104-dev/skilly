import { useCallback, useEffect, useRef, useState } from 'react';
import { SkyChameleon } from '../brand';
import { useStore } from '../state.jsx';

// Vigila el nivel: cuando sube, muestra a Sky celebrando (cambia de color).
export default function LevelUp() {
  const { level, state } = useStore();
  const seen = useRef(level);
  const [shown, setShown] = useState(null);
  const close = useCallback(() => setShown(null), []);

  useEffect(() => {
    if (!state.signedIn) {
      seen.current = level;
      return;
    }
    if (level > seen.current) setShown(level);
    seen.current = level;
  }, [level, state.signedIn]);

  if (!shown) return null;
  return <LevelUpDialog level={shown} onClose={close} />;
}

function LevelUpDialog({ level, onClose }) {
  // Sky se monta con el nivel anterior y en el siguiente cuadro recibe el nuevo:
  // así la animación de color arranca en cuanto aparece el diálogo.
  const [skyKey, setSkyKey] = useState(level - 1);
  const button = useRef(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setSkyKey(level));
    button.current?.focus();
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKey);
    };
  }, [level, onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="levelup-title"
        onClick={(event) => event.stopPropagation()}
      >
        <SkyChameleon className="dialog__sky" celebrateKey={skyKey} title="Sky celebrando" />
        <p className="dialog__kicker">¡Subiste de nivel!</p>
        <h2 id="levelup-title">Nivel {level}</h2>
        <p className="muted">Sky cambió de color para celebrarlo. Sigue así.</p>
        <button ref={button} className="btn btn--primary" type="button" onClick={onClose}>
          ¡Sigamos!
        </button>
      </div>
    </div>
  );
}
