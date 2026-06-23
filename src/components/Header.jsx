import { formatFullDate } from '../utils/dateUtils'
import { getLevel } from '../utils/levelUtils'

export default function Header({ streak, dayComplete, allTimeXP, onExport, onImport, theme, onToggleTheme, shortcutsOpen, onToggleShortcuts }) {
  const level = getLevel(allTimeXP)

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="app-title">Life Tracker</h1>
        <p className="header-date">{formatFullDate()}</p>
      </div>
      <div className="header-right">
        <div className="shortcuts-container">
          <button
            className="icon-btn shortcuts-btn"
            onClick={onToggleShortcuts}
            title="Keyboard shortcuts (?)"
            aria-label="Show keyboard shortcuts"
          >
            ?
          </button>
          {shortcutsOpen && (
            <div className="shortcuts-panel">
              <div className="shortcuts-title">Keyboard Shortcuts</div>
              <div className="shortcut-row"><kbd className="shortcut-key">N</kbd> New habit</div>
              <div className="shortcut-row"><kbd className="shortcut-key">T</kbd> New task</div>
              <div className="shortcut-row"><kbd className="shortcut-key">R</kbd> New reward</div>
              <div className="shortcut-row"><kbd className="shortcut-key">←</kbd> Previous day</div>
              <div className="shortcut-row"><kbd className="shortcut-key">→</kbd> Next day</div>
              <div className="shortcut-row"><kbd className="shortcut-key">Esc</kbd> Close modal</div>
              <div className="shortcut-row"><kbd className="shortcut-key">?</kbd> Toggle this panel</div>
            </div>
          )}
        </div>

        <button
          className="icon-btn theme-toggle"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="header-data-btns">
          <button className="icon-btn" onClick={onExport} title="Export data">📥</button>
          <label className="icon-btn import-label" title="Import data">
            📤
            <input type="file" accept=".json" onChange={onImport} hidden />
          </label>
        </div>

        {dayComplete && (
          <span className="day-complete-badge">Day Complete ✓</span>
        )}

        <div className="level-badge-header" title={`${allTimeXP.toLocaleString()} all-time XP`}>
          <span className="level-icon-sm">{level.icon}</span>
          <span className="level-title-sm">Lv.{level.level}</span>
        </div>

        <div className="streak-badge">
          <span className="streak-flame">🔥</span>
          <span className="streak-count">{streak}</span>
          <span className="streak-label">streak</span>
        </div>
      </div>
    </header>
  )
}
