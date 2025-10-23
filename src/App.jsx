import { useMemo, useState } from 'react'
import './styles.css'
import YearWeekSelector from './components/YearWeekSelector'
import ModeToggle from './components/ModeToggle'
import Quiz from './components/Quiz'
import y2023Raw from './data/cg_2023.md?raw'
import y2024Raw from './data/cg_2024.md?raw'
import { parseMarkdown } from './lib/parseMarkdown'

function App() {
  const data2023 = useMemo(() => parseMarkdown(y2023Raw), [])
  const data2024 = useMemo(() => parseMarkdown(y2024Raw), [])

  const [year, setYear] = useState(2023)
  const [week, setWeek] = useState(1)
  const [mode, setMode] = useState('study') // 'study' | 'exam'

  const data = year === 2023 ? data2023 : data2024
  const availableWeeks = useMemo(() => data.weeks.map(w => w.weekNumber), [data])
  const weekData = useMemo(() => data.weeks.find(w => w.weekNumber === week) || null, [data, week])

  function handleChangeYear(y) {
    setYear(y)
    // reset week to first available in that year
    const weeks = (y === 2023 ? data2023 : data2024).weeks
    setWeek(weeks[0]?.weekNumber ?? 1)
  }

  function handleChangeWeek(w) {
    setWeek(w)
  }

  function handleChangeMode(m) {
    setMode(m)
  }

  return (
    <div className="app">
      <h2>CG Quiz Platform</h2>
      <div className="toolbar">
        <YearWeekSelector
          year={year}
          onChangeYear={handleChangeYear}
          availableWeeks={availableWeeks}
          week={week}
          onChangeWeek={handleChangeWeek}
        />
        <ModeToggle mode={mode} onChange={handleChangeMode} />
      </div>
      {weekData ? (
        <Quiz weekData={weekData} mode={mode} />
      ) : (
        <p>No questions available for this week.</p>
      )}
      </div>
  )
}

export default App
