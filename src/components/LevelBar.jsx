import { getLevelProgress } from '../utils/levelUtils'

export default function LevelBar({ allTimeXP }) {
  const { current, next, progress, xpInLevel, xpNeeded } = getLevelProgress(allTimeXP)

  return (
    <div className="level-bar">
      <div className="level-bar-header">
        <div className="level-badge">
          <span className="level-icon">{current.icon}</span>
          <span className="level-title">Lv.{current.level} {current.title}</span>
        </div>
        <div className="level-xp-info">
          {next ? (
            <span>
              <strong>{allTimeXP.toLocaleString()}</strong> / {next.minXP.toLocaleString()} XP
            </span>
          ) : (
            <span><strong>{allTimeXP.toLocaleString()}</strong> XP — MAX LEVEL</span>
          )}
        </div>
      </div>
      <div className="progress-track level-track">
        <div
          className={`progress-fill level-fill ${!next ? 'progress-fill--complete' : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {next && (
        <div className="level-bar-footer">
          <span className="progress-percent">{progress}%</span>
          <span className="level-next">Next: {next.icon} {next.title}</span>
        </div>
      )}
    </div>
  )
}
