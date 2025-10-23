# CG Quiz Platform Plan (React + Vite, JavaScript)

A simple practice/exam platform with MCQs for 12 weeks, for two separate years (2023 and 2024). Years stay fully separated. Study mode gives instant feedback; Exam mode reveals only after submit.

---

## Goals
- Keep `2023` and `2024` question sets separate (no mixing).
- Support 12 weekly assignments per year.
- Study mode: instant feedback on click (correct = green; wrong = red + reveal correct green).
- Exam mode: user selects answers; only on Submit show score and color feedback.
- Shuffle questions and options on every attempt (on load/reset or mode change) in both modes.

## Tech Stack
- React + Vite (JavaScript template)
- Plain CSS for styling (single `styles.css`)
- Markdown loaded as raw strings via Vite `?raw` import suffix

## Data Source
- Use the provided root files:
  - `/Users/kushelrohilla/Documents/Programming/CG_Quiz_Platform/cg_2023.md`
  - `/Users/kushelrohilla/Documents/Programming/CG_Quiz_Platform/cg_2024.md`
- Copy to app as `src/data/cg_2023.md` and `src/data/cg_2024.md` and import with `?raw`.

## Project Structure (to be created under `cg-quiz/`)
```
cg-quiz/
  index.html
  package.json
  vite.config.js
  src/
    main.jsx
    App.jsx
    styles.css
    data/
      cg_2023.md
      cg_2024.md
    lib/
      parseMarkdown.js
    components/
      YearWeekSelector.jsx
      ModeToggle.jsx
      Quiz.jsx
      QuestionCard.jsx
      SubmitPanel.jsx
```

## Parsing Markdown
- Assumptions (robust to minor variations):
  - Week starts with `## Week <num>:`
  - Questions start with `^\d+\.` on their own line (question text may be bolded)
  - Options are list items beginning with `*` (any indent). Correct option contains `**` anywhere within
- Output shape example:
```js
{
  weeks: [
    {
      weekNumber: 1,
      weekTitle: 'Introduction …',
      questions: [
        {
          id: 'w1-q1',
          text: 'The Trinity explosion of 1945 …',
          options: [ 'Holocene', 'Cenocene', 'Anthropocene', 'Eocene' ],
          correctIndex: 2
        }
      ]
    }
  ]
}
```
- Import and parse:
```js
import y2023Raw from '../data/cg_2023.md?raw';
import y2024Raw from '../data/cg_2024.md?raw';
import { parseMarkdown } from '../lib/parseMarkdown';

const data2023 = parseMarkdown(y2023Raw);
const data2024 = parseMarkdown(y2024Raw);
```
- Parser outline (concept):
```js
export function parseMarkdown(md) {
  const lines = md.split(/\r?\n/);
  const weeks = [];
  let currentWeek = null;
  let currentQuestion = null;

  const pushQuestion = () => {
    if (currentQuestion && currentQuestion.options.length > 0 && currentQuestion.correctIndex >= 0) {
      currentWeek.questions.push(currentQuestion);
    }
    currentQuestion = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    const weekMatch = line.match(/^##\s+Week\s+(\d+):\s*(.*)$/);
    if (weekMatch) {
      if (currentWeek) pushQuestion();
      if (currentWeek) weeks.push(currentWeek);
      currentWeek = { weekNumber: Number(weekMatch[1]), weekTitle: weekMatch[2].trim(), questions: [] };
      continue;
    }
    const qMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (qMatch) {
      pushQuestion();
      currentQuestion = { id: '', text: qMatch[2].replace(/^\*\*|\*\*$/g, '').trim(), options: [], correctIndex: -1 };
      currentQuestion.id = `w${currentWeek?.weekNumber}-q${qMatch[1]}`;
      continue;
    }
    const optMatch = raw.match(/^\s*\*\s+(.*)$/);
    if (optMatch && currentQuestion) {
      const optRaw = optMatch[1].trim();
      const isCorrect = /\*\*/.test(optRaw);
      const clean = optRaw.replace(/\*\*/g, '').trim();
      currentQuestion.options.push(clean);
      if (isCorrect) currentQuestion.correctIndex = currentQuestion.options.length - 1;
    }
  }
  if (currentWeek) {
    if (currentQuestion) weeks.push({ ...currentWeek, questions: [...currentWeek.questions, currentQuestion] });
    else weeks.push(currentWeek);
  }
  // Filter out malformed questions
  weeks.forEach(w => w.questions = w.questions.filter(q => q.options.length && q.correctIndex >= 0));
  return { weeks };
}
```

## UI Components & Behavior
- `YearWeekSelector.jsx`
  - Year toggle: 2023 | 2024
  - Week buttons (1..12). Disable weeks not found.
- `ModeToggle.jsx`
  - Toggle: Study | Exam
  - Switching mode clears selections
- `Quiz.jsx`
  - Renders selected week's questions
  - Holds per-question selections (array of indices or null)
  - In Exam mode, has Submit/Reset controls (via `SubmitPanel`)
- `QuestionCard.jsx`
  - Renders question and options; click handlers vary by mode
- `SubmitPanel.jsx`
  - Shows score after submit and provides Reset

### Shuffling (questions and options)
- Shuffle is applied per attempt to both question order and each question's options.
- Preserve correctness by remapping `correctIndex` after shuffling options.
- When to shuffle:
  - When a week is loaded or the mode is entered (Study/Exam)
  - When user presses Reset in Exam mode
  - Do not reshuffle mid-attempt; keep stable until next attempt

```js
function shuffleInPlace(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function shuffleWeek(week) {
  const questions = week.questions.map(q => {
    const order = q.options.map((_, idx) => idx);
    shuffleInPlace(order);
    const options = order.map(i => q.options[i]);
    const correctIndex = order.indexOf(q.correctIndex);
    return { ...q, options, correctIndex };
  });
  shuffleInPlace(questions);
  return { ...week, questions };
}
```

### Color/Class Logic (core)
```js
function getOptionClass(mode, selectedIdx, correctIdx, idx, submitted) {
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
```

## Styling (minimal)
- Classes: `.option`, `.selected`, `.correct`, `.wrong`, `.disabled`
- Colors: green `#22c55e`, red `#ef4444`

## State Shape (concept)
```js
{
  year: 2023 | 2024,
  week: 1..12,
  mode: 'study' | 'exam',
  selections: { [questionId]: number|null },
  submitted: boolean
}
```

## Step-by-Step Build Checklist
1. Scaffold app: `npm create vite@latest cg-quiz -- --template react`
2. `cd cg-quiz && npm i`
3. Create folders: `src/data`, `src/lib`, `src/components`
4. Copy `cg_2023.md` and `cg_2024.md` into `src/data/`
5. Implement `src/lib/parseMarkdown.js` (per outline)
6. Build `src/App.jsx` with year/week/mode state and data loading
7. Implement components: YearWeekSelector, ModeToggle, Quiz, QuestionCard, SubmitPanel
8. Add color logic via `getOptionClass` and basic CSS in `styles.css`
9. Wire Study behavior: lock question after first click
10. Wire Exam behavior: Submit to reveal score and colors; Reset clears
11. Run dev: `npm run dev` and test both years and all weeks
12. Build: `npm run build`; optional preview: `npm run preview`

## Notes / Constraints
- Years are completely isolated in UI and data loading
- Parser is resilient to minor markdown differences; adjust regex if needed
- No server required; static SPA is sufficient
