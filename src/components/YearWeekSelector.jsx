export default function YearWeekSelector({
  year,
  onChangeYear,
  availableWeeks,
  week,
  onChangeWeek,
  onChangeTab,
  activeTab,
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
            aria-selected={activeTab === 'year' && year === y}
            className={activeTab === 'year' && year === y ? 'active' : ''}
            onClick={() => { onChangeTab('year'); onChangeYear(y); }}
          >
            {y}
          </button>
        ))}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'pyqs'}
          className={activeTab === 'pyqs' ? 'active' : ''}
          onClick={() => onChangeTab('pyqs')}
        >
          PYQs
        </button>
      </div>
      {activeTab === 'year' && (
        <div className="weeks">
          <button
            type="button"
            aria-pressed={week === 'all'}
            onClick={() => onChangeWeek('all')}
          >
            All Weeks
          </button>
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
      )}
    </div>
  );
}


