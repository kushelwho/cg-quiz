import { useEffect, useMemo, useState } from 'react';
import QuestionCard from './QuestionCard';
import SubmitPanel from './SubmitPanel';
import { shuffleWeek } from '../lib/parseMarkdown';

export default function Quiz({ weekData, mode }) {
  const [attemptWeek, setAttemptWeek] = useState(null);
  const [selections, setSelections] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Rebuild a shuffled attempt when weekData or mode changes (new attempt)
  useEffect(() => {
    if (!weekData) {
      setAttemptWeek(null);
      setSelections({});
      setSubmitted(false);
      return;
    }
    const shuffled = shuffleWeek(weekData);
    setAttemptWeek(shuffled);
    setSelections({});
    setSubmitted(false);
  }, [weekData, mode]);

  const total = attemptWeek?.questions.length || 0;
  const score = useMemo(() => {
    if (!submitted || !attemptWeek) return 0;
    return attemptWeek.questions.reduce((acc, q) => {
      const sel = selections[q.id] ?? null;
      return acc + (sel === q.correctIndex ? 1 : 0);
    }, 0);
  }, [submitted, selections, attemptWeek]);

  function handleSelect(questionId, idx) {
    setSelections((prev) => ({
      ...prev,
      [questionId]: idx,
    }));
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleReset() {
    if (!weekData) return;
    const shuffled = shuffleWeek(weekData);
    setAttemptWeek(shuffled);
    setSelections({});
    setSubmitted(false);
  }

  if (!attemptWeek) return null;

  return (
    <div className="quiz">
      {attemptWeek.questions.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          mode={mode}
          selection={selections[q.id] ?? null}
          submitted={submitted}
          onSelect={(idx) => handleSelect(q.id, idx)}
        />)
      )}
      {mode === 'exam' && (
        <SubmitPanel
          onSubmit={handleSubmit}
          onReset={handleReset}
          submitted={submitted}
          score={score}
          total={total}
        />
      )}
    </div>
  );
}


