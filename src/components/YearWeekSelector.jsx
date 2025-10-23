export default function YearWeekSelector({
  year,
  onChangeYear,
  availableWeeks,
  week,
  onChangeWeek,
}) {
  const years = [2023, 2024];
  return (
    <div className="toolbar">
      <div className="segmented" role="tablist" aria-label="Year">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            role="tab"
            aria-selected={year === y}
            className={year === y ? 'active' : ''}
            onClick={() => onChangeYear(y)}
          >
            {y}
          </button>
        ))}
      </div>
      <div className="weeks">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
          <button
            key={w}
            type="button"
            disabled={!availableWeeks.includes(w)}
            onClick={() => onChangeWeek(w)}
            aria-pressed={week === w}
          >
            Week {w}
          </button>
        ))}
      </div>
    </div>
  );
}


