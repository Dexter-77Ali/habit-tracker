import { useEffect } from 'react'
import { weekKey, weeklyQuests, questMetrics } from '../utils/questUtils'

// 3 deterministic quests per week; auto-awards XP when a quest's target is hit.
export default function WeeklyQuests({ logs, habits, tasks, timeLogs, includeWeekends, claimedByWeek, onQuestComplete }) {
  const wk = weekKey()
  const quests = weeklyQuests(wk)
  const metrics = questMetrics({ logs, habits, tasks, timeLogs, includeWeekends })
  const claimed = claimedByWeek[wk] || []

  useEffect(() => {
    for (const q of quests) {
      if (!claimed.includes(q.id) && metrics[q.metric] >= q.target) onQuestComplete(wk, q.id, q.xp, q.label)
    }
  }, [quests, claimed, metrics, wk, onQuestComplete])

  return (
    <div className="card quest-card">
      <div className="card-header">
        <h3 className="quest-title">WEEKLY QUESTS</h3>
        <span className="quest-count">{claimed.length}/3</span>
      </div>
      <ul className="quest-list">
        {quests.map((q) => {
          const done = claimed.includes(q.id)
          const value = Math.min(metrics[q.metric], q.target)
          return (
            <li key={q.id} className={`quest-item ${done ? 'quest-item--done' : ''}`}>
              <div className="quest-row">
                <span className="quest-label">{done ? '▣' : '▢'} {q.label}</span>
                <span className="quest-xp">+{q.xp} XP</span>
              </div>
              <div className="quest-track">
                <div className="quest-fill" style={{ width: `${(value / q.target) * 100}%` }} />
              </div>
              <span className="quest-progress">{value}/{q.target}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
