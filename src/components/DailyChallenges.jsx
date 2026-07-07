import { useMemo, useEffect, useRef } from 'react'
import { generateDailyChallenges, checkChallengeComplete } from '../utils/challengeUtils'

export default function DailyChallenges({ habits, groups, logs, today, completedChallenges = [], onComplete }) {
  const challenges = useMemo(
    () => generateDailyChallenges(habits, groups, today),
    [habits, groups, today]
  )

  const completed = useMemo(() => {
    if (challenges.length === 0) return []
    return challenges.map(c => {
      const done = completedChallenges.includes(c.id) || checkChallengeComplete(c, habits, logs, today, groups)
      return { ...c, done }
    })
  }, [challenges, completedChallenges, habits, logs, today, groups])

  const firedRef = useRef(new Set())
  useEffect(() => {
    const pending = completed.filter(c => c.done && !completedChallenges.includes(c.id) && !firedRef.current.has(c.id))
    if (pending.length === 0) return
    const id = setTimeout(() => {
      pending.forEach(c => { firedRef.current.add(c.id); onComplete?.(c.id, c.xp) })
    }, 0)
    return () => clearTimeout(id)
  }, [completed, completedChallenges, onComplete])

  if (completed.length === 0) return null
  const allDone = completed.every(c => c.done)

  return (
    <div className={`daily-challenges card ${allDone ? 'daily-challenges--done' : ''}`}>
      <div className="card-header">
        <h3>Daily Challenges</h3>
        {allDone && <span className="challenge-bonus">ALL CLEAR +bonus</span>}
      </div>
      <ul className="challenge-list">
        {completed.map(c => (
          <li key={c.id} className={`challenge-item ${c.done ? 'challenge-item--done' : ''}`}>
            <span className="challenge-check">{c.done ? '▣' : '▢'}</span>
            <span className="challenge-label">{c.label}</span>
            <span className="challenge-xp">+{c.xp} XP</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
