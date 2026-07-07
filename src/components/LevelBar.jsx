import { useState } from 'react'
import { LEVELS, getLevelProgress } from '../utils/levelUtils'
import IconDisplay from './IconDisplay'

export default function LevelBar({ allTimeXP }) {
  const { current, next, progress, xpInLevel, xpNeeded } = getLevelProgress(allTimeXP)
  const [showRoadmap, setShowRoadmap] = useState(false)

  return (
    <>
      <div className="level-bar level-bar--clickable" onClick={() => setShowRoadmap(true)} title="View level roadmap">
        <div className="level-bar-header">
          <div className="level-badge">
            <IconDisplay icon={current.icon} size={22} className="level-icon" />
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
            <span className="level-next">Next: <IconDisplay icon={next.icon} size={16} /> {next.title}</span>
          </div>
        )}
      </div>

      {showRoadmap && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowRoadmap(false)}>
          <div className="modal roadmap-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2>Level Roadmap</h2>
              <button className="modal-close" onClick={() => setShowRoadmap(false)} aria-label="Close">✕</button>
            </div>
            <div className="roadmap-list">
              {LEVELS.map(lv => {
                const unlocked = lv.level <= current.level
                const isCurrent = lv.level === current.level
                return (
                  <div key={lv.level} className={`roadmap-item ${unlocked ? 'roadmap-item--unlocked' : 'roadmap-item--locked'} ${isCurrent ? 'roadmap-item--current' : ''}`}>
                    <IconDisplay icon={lv.icon} size={32} className="roadmap-icon" />
                    <div className="roadmap-info">
                      <div className="roadmap-level-name">Lv.{lv.level} {lv.title}</div>
                      <div className="roadmap-xp">{lv.minXP.toLocaleString()} XP</div>
                    </div>
                    {isCurrent && <span className="roadmap-current">YOU ARE HERE</span>}
                    {unlocked && !isCurrent && <span className="roadmap-check">✓</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
