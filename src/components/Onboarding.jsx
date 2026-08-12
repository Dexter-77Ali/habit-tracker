import { useState } from 'react'

const STARTERS = [
  { name: 'Morning exercise', icon: '🏃', xp: 30 },
  { name: 'Read 20 min', icon: '📖', xp: 20 },
  { name: 'Drink 2L water', icon: '💧', xp: 10 },
  { name: 'Meditate 5 min', icon: '🧘', xp: 15 },
  { name: 'Sleep before 23:00', icon: '🛌', xp: 20 },
  { name: 'No junk food', icon: '🍎', xp: 15 },
  { name: 'Journal one line', icon: '✏️', xp: 10 },
  { name: 'Study 30 min', icon: '🧠', xp: 30 },
]

// First-run: pick starter habits → optional reminder → go.
export default function Onboarding({ existingNames, onFinish }) {
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState(() => new Set(existingNames))
  const [reminder, setReminder] = useState('')

  const toggle = (name) => setPicked((prev) => {
    const next = new Set(prev)
    next.has(name) ? next.delete(name) : next.add(name)
    return next
  })

  const finish = () => {
    const newHabits = STARTERS.filter((s) => picked.has(s.name) && !existingNames.includes(s.name))
    onFinish({ newHabits, removeNames: existingNames.filter((n) => !picked.has(n)), reminder: reminder || null })
  }

  return (
    <div className="modal-overlay">
      <div className="modal onboarding" role="dialog" aria-modal="true">
        {step === 0 && (
          <>
            <h2 className="onboarding-title">Welcome to Life Tracker 👋</h2>
            <p className="onboarding-sub">Build habits, earn XP, keep streaks alive — and let the app nudge you at the right moments.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => onFinish(null)}>Skip setup</button>
              <button className="btn btn-primary" onClick={() => setStep(1)}>Start →</button>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h2 className="onboarding-title">Pick your habits</h2>
            <p className="onboarding-sub">Start small — 2 or 3 is plenty. You can change everything later.</p>
            <div className="onboarding-grid">
              {STARTERS.map((s) => (
                <button
                  key={s.name}
                  className={`onboarding-pick ${picked.has(s.name) ? 'onboarding-pick--on' : ''}`}
                  onClick={() => toggle(s.name)}
                >
                  <span className="onboarding-pick-icon">{s.icon}</span> {s.name}
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
              <button className="btn btn-primary" onClick={() => setStep(2)} disabled={picked.size === 0}>Next →</button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="onboarding-title">Daily reminder?</h2>
            <p className="onboarding-sub">On the phone app, we'll ping you once a day. Leave empty to skip.</p>
            <input type="time" className="form-input onboarding-time" value={reminder} onChange={(e) => setReminder(e.target.value)} />
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={finish}>Let's go 🚀</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
