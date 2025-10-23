import { getOptionClass } from '../lib/parseMarkdown';

export default function QuestionCard({
  question,
  mode,
  selection,
  onSelect,
  submitted,
}) {
  const { id, text, options, correctIndex } = question;

  return (
    <div className="question-card" data-qid={id}>
      <div className="question-title">{text}</div>
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
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}


