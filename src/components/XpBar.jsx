import { useStore } from '../state.jsx';

export default function XpBar() {
  const { level, current, needed } = useStore();
  const pct = Math.round((current / needed) * 100);

  return (
    <div className="xp">
      <div className="xp__labels">
        <span>Nivel {level}</span>
        <span className="muted">{current} / {needed} XP</span>
      </div>
      <div
        className="xp__track"
        role="progressbar"
        aria-label={`Progreso hacia el nivel ${level + 1}`}
        aria-valuemin={0}
        aria-valuemax={needed}
        aria-valuenow={current}
      >
        <div className="xp__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
