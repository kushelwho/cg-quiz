import { useEffect, useMemo, useState } from 'react';
import QuestionCard from './QuestionCard';
import SubmitPanel from './SubmitPanel';
import { shuffleWeek } from '../lib/parseMarkdown';

export default function Quiz({ weekData, mode }) {
  const [attemptWeek, setAttemptWeek] = useState(null);
  const [selections, setSelections] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timerStart, setTimerStart] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Rebuild a shuffled attempt when weekData or mode changes (new attempt)
  useEffect(() => {
    if (!weekData) {
      setAttemptWeek(null);
      setSelections({});
      setSubmitted(false);
      setTimerStart(null);
      setElapsedMs(0);
      return;
    }
    const shuffled = shuffleWeek(weekData);
    setAttemptWeek(shuffled);
    setSelections({});
    setSubmitted(false);
    setTimerStart(null);
    setElapsedMs(0);
  }, [weekData, mode]);

  // Tick timer while running; freeze on submit in exam mode
  useEffect(() => {
    if (timerStart == null) return;
    if (mode === 'exam' && submitted) return;
    const id = setInterval(() => {
      setElapsedMs(Date.now() - timerStart);
    }, 1000);
    return () => clearInterval(id);
  }, [timerStart, submitted, mode]);

  const total = attemptWeek?.questions.length || 0;
  const score = useMemo(() => {
    if (!submitted || !attemptWeek) return 0;
    return attemptWeek.questions.reduce((acc, q) => {
      const sel = selections[q.id] ?? null;
      return acc + (sel === q.correctIndex ? 1 : 0);
    }, 0);
  }, [submitted, selections, attemptWeek]);

  const answeredCount = useMemo(() => {
    if (!attemptWeek) return 0;
    return attemptWeek.questions.reduce((acc, q) => (
      (selections[q.id] ?? null) != null ? acc + 1 : acc
    ), 0);
  }, [attemptWeek, selections]);

  function handleSelect(questionId, idx) {
    if (timerStart == null) {
      setTimerStart(Date.now());
      setElapsedMs(0);
    }
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
    setTimerStart(null);
    setElapsedMs(0);
  }

  if (!attemptWeek) return null;

  function formatTime(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  return (
    <div className="quiz">
      <div className="quiz-header">
        <div className="week-title">Week {weekData.weekNumber}: {weekData.weekTitle}</div>
        <div className="meta">
          <div className="progress-badge" title="Answered / Total">{answeredCount}/{total}</div>
          <div className="timer-badge" aria-live="polite">⏱ {formatTime(elapsedMs)}</div>
        </div>
      </div>
      {attemptWeek.questions.map((q, idx) => (
        <QuestionCard
          key={q.id}
          question={q}
          number={idx + 1}
          mode={mode}
          selection={selections[q.id] ?? null}
          submitted={submitted}
          onSelect={(idx2) => handleSelect(q.id, idx2)}
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


