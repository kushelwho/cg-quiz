import { useMemo, useState } from 'react'
import './styles.css'
import YearWeekSelector from './components/YearWeekSelector'
import ModeToggle from './components/ModeToggle'
import Quiz from './components/Quiz'
import y2023Raw from './data/cg_2023.md?raw'
import y2024Raw from './data/cg_2024.md?raw'
import pyqsRaw from './data/all_pyqs.md?raw'
import { parseMarkdown } from './lib/parseMarkdown'

function App() {
  const data2023 = useMemo(() => parseMarkdown(y2023Raw), [])
  const data2024 = useMemo(() => parseMarkdown(y2024Raw), [])

  const [year, setYear] = useState(2023)
  const [week, setWeek] = useState(1)
  const [mode, setMode] = useState('study') // 'study' | 'exam'
  const [activeTab, setActiveTab] = useState('year') // 'year' | 'pyqs'

  const data = year === 2023 ? data2023 : data2024
  const pyqsData = useMemo(() => parseMarkdown(pyqsRaw), [])
  const availableWeeks = useMemo(() => data.weeks.map(w => w.weekNumber), [data])
  const weekData = useMemo(() => {
    if (activeTab === 'pyqs') {
      // Flatten all PYQs into one virtual week; ignore year/week chips
      const allQ = pyqsData.weeks.flatMap(w => w.questions)
      return { weekNumber: 0, weekTitle: 'PYQs (All)', questions: allQ }
    }
    if (week === 'all') {
      const allQuestions = data.weeks.flatMap(w => w.questions.map(q => ({ ...q })))
      return { weekNumber: 0, weekTitle: 'All Weeks', questions: allQuestions }
    }
    return data.weeks.find(w => w.weekNumber === week) || null
  }, [data, week, activeTab, pyqsData])

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
          activeTab={activeTab}
          onChangeTab={setActiveTab}
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
