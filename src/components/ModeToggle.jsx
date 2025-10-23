export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="segmented" role="tablist" aria-label="Mode">
      {['study', 'exam'].map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={mode === m}
          className={mode === m ? 'active' : ''}
          onClick={() => onChange(m)}
        >
          {m === 'study' ? 'Study' : 'Exam'}
        </button>
      ))}
    </div>
  );
}


