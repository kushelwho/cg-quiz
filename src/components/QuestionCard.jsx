import { getOptionClass } from '../lib/parseMarkdown';

export default function QuestionCard({
  question,
  number,
  mode,
  selection,
  onSelect,
  submitted,
}) {
  const { id, text, options, correctIndex } = question;

  return (
    <div className="question-card" data-qid={id}>
      <div className="question-title"><span className="q-number">{number}.</span> {text}</div>
      <div className="options">
        {options.map((opt, idx) => {
          const cls = getOptionClass(mode, selection, correctIndex, idx, submitted);
          const disabled = mode === 'study' ? selection != null : submitted;
          return (
            <button
              key={idx}
              type="button"
              className={`option ${cls} ${disabled ? 'disabled' : ''}`.trim()}
              onClick={() => {
                if (disabled) return;
                onSelect(idx);
              }}
            >
              <span className="opt-label">{String.fromCharCode(65 + idx)}.</span>
              <span className="opt-text">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


