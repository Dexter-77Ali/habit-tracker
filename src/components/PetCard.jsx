import { useState } from 'react'

// Companion pet: grows with total habit completions, mood tracks recent activity.
// Everything derived from logs — only the name is stored (ht_pet).

const STAGES = [
  { min: 0,   icon: '🥚', label: 'Egg' },
  { min: 10,  icon: '🐣', label: 'Hatchling' },
  { min: 50,  icon: '🐤', label: 'Chick' },
  { min: 150, icon: '🐥', label: 'Fledgling' },
  { min: 400, icon: '🦅', label: 'Apex' },
]

export function petState(logs, today) {
  let total = 0
  for (const day of Object.values(logs)) total += Object.values(day).filter(Boolean).length
  const stage = [...STAGES].reverse().find((s) => total >= s.min)
  const next = STAGES[STAGES.indexOf(stage) + 1] || null

  const idle = (offset) => {
    const d = new Date()
    d.setDate(d.getDate() - offset)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return !Object.values(logs[key] || {}).some(Boolean)
  }
  const mood = !idle(0) ? { icon: '😊', text: 'thriving' }
    : !idle(1) ? { icon: '😐', text: 'waiting for you' }
    : { icon: '😢', text: 'lonely — do one habit!' }
  return { total, stage, next, mood }
}

export default function PetCard({ logs, today, pet, onRename }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(pet?.name || '')
  const { total, stage, next, mood } = petState(logs, today)

  return (
    <div className="card pet-card">
      <span className="pet-icon" title={stage.label}>{stage.icon}</span>
      <div className="pet-info">
        {editing ? (
          <input
            className="form-input pet-name-input"
            value={draft}
            autoFocus
            maxLength={20}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => { onRename(draft.trim() || 'Pip'); setEditing(false) }}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
          />
        ) : (
          <button className="pet-name" onClick={() => { setDraft(pet?.name || ''); setEditing(true) }} title="Rename">
            {pet?.name || 'Pip'} <span className="pet-stage">· {stage.label}</span>
          </button>
        )}
        <span className="pet-mood">{mood.icon} {mood.text}</span>
        <div className="pet-track">
          <div className="pet-fill" style={{ width: next ? `${((total - stage.min) / (next.min - stage.min)) * 100}%` : '100%' }} />
        </div>
        <span className="pet-progress">
          {next ? `${total}/${next.min} completions to ${next.label}` : `${total} completions · fully grown`}
        </span>
      </div>
    </div>
  )
}
