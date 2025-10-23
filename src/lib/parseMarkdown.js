export function parseMarkdown(md) {
  const lines = md.split(/\r?\n/);
  const weeks = [];
  let currentWeek = null;
  let currentQuestion = null;

  function pushQuestionIfValid() {
    if (!currentWeek) return;
    if (
      currentQuestion &&
      Array.isArray(currentQuestion.options) &&
      currentQuestion.options.length > 0 &&
      typeof currentQuestion.correctIndex === 'number' &&
      currentQuestion.correctIndex >= 0
    ) {
      currentWeek.questions.push(currentQuestion);
    }
    currentQuestion = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Detect new week
    const weekMatch = line.match(/^##\s+Week\s+(\d+):\s*(.*)$/);
    if (weekMatch) {
      // finish previous question and week
      pushQuestionIfValid();
      if (currentWeek) {
        weeks.push(currentWeek);
      }
      currentWeek = {
        weekNumber: Number(weekMatch[1]),
        weekTitle: (weekMatch[2] || '').trim(),
        questions: [],
      };
      continue;
    }

    // Detect question start like `1. Question text` possibly bolded
    const qMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (qMatch) {
      if (!currentWeek) {
        currentWeek = { weekNumber: 0, weekTitle: 'All (Flat)', questions: [] };
      }
      pushQuestionIfValid();
      const questionNumber = qMatch[1];
      const rawText = qMatch[2] || '';
      const cleanText = rawText.replace(/^\*\*|\*\*$/g, '').trim();
      currentQuestion = {
        id: `w${currentWeek.weekNumber}-q${questionNumber}`,
        text: cleanText,
        options: [],
        correctIndex: -1,
      };
      continue;
    }

    // Detect option lines beginning with `* ` allowing leading spaces
    const optMatch = rawLine.match(/^\s*[-\*]\s+(.*)$/);
    if (optMatch && currentQuestion) {
      const optRaw = (optMatch[1] || '').trim();
      const isCorrect = /\*\*/.test(optRaw);
      const cleanOpt = optRaw.replace(/\*\*/g, '').trim();
      currentQuestion.options.push(cleanOpt);
      if (isCorrect) {
        currentQuestion.correctIndex = currentQuestion.options.length - 1;
      }
      continue;
    }
  }

  // finalize last week/question
  if (currentWeek) {
    pushQuestionIfValid();
    weeks.push(currentWeek);
  }

  // Filter out malformed questions (no options or no correct)
  weeks.forEach((w) => {
    w.questions = w.questions.filter(
      (q) => Array.isArray(q.options) && q.options.length > 0 && q.correctIndex >= 0
    );
  });

  return { weeks };
}

export function shuffleInPlace(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function shuffleWeek(week) {
  const questions = week.questions.map((q) => {
    const order = q.options.map((_, idx) => idx);
    shuffleInPlace(order);
    const options = order.map((i) => q.options[i]);
    const correctIndex = order.indexOf(q.correctIndex);
    return { ...q, options, correctIndex };
  });
  shuffleInPlace(questions);
  return { ...week, questions };
}

export function getOptionClass(mode, selectedIdx, correctIdx, idx, submitted) {
  if (mode === 'study') {
    if (selectedIdx == null) return '';
    if (idx === correctIdx) return 'correct';
    if (idx === selectedIdx && selectedIdx !== correctIdx) return 'wrong';
    return '';
  }
  // exam
  if (!submitted) return selectedIdx === idx ? 'selected' : '';
  if (idx === correctIdx) return 'correct';
  if (idx === selectedIdx && selectedIdx !== correctIdx) return 'wrong';
  return '';
}


