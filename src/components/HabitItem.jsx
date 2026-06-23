import { useState, useMemo } from 'react'
import { getDateKey, dateFromKey } from '../utils/dateUtils'
import { isHabitScheduled } from '../utils/scoreUtils'

const DAY_ABBR = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function calculateHabitStreak(habit, logs, today) {
  if (!today || !habit) return 0
  let streak = 0
  const d = dateFromKey(today)

  const todayChecked = !!(logs[today] || {})[habit.id]
  if (todayChecked) streak = 1

  d.setDate(d.getDate() - 1)

  for (let i = 0; i < 365; i++) {
    const key = getDateKey(d)
    if (key < habit.createdAt) break

    if (!isHabitScheduled(habit, key)) {
      d.setDate(d.getDate() - 1)
      continue
    }

    const done = !!(logs[key] || {})[habit.id]
    if (done) streak++
    else break

    d.setDate(d.getDate() - 1)
  }
  return streak
}

export default function HabitItem({ habit, checked, onToggle, onEdit, onDelete, onOpenNotes, disabled, logs = {}, today, tagColors = {} }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete()
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  const habitStreak = useMemo(() => calculateHabitStreak(habit, logs, today), [habit, logs, today])

  const last7Days = []
  if (today) {
    for (let i = 6; i >= 0; i--) {
      const d = dateFromKey(today)
      d.setDate(d.getDate() - i)
      last7Days.push(getDateKey(d))
    }
  }

  const tags = habit.tags || []
  const hasNotes = !!(habit.notes)

  return (
    <li className={`habit-item ${checked ? 'habit-item--checked' : ''} ${disabled ? 'habit-item--disabled' : ''}`}>
      <button
        className={`habit-checkbox ${checked ? 'habit-checkbox--checked' : ''}`}
        onClick={disabled ? undefined : onToggle}
        aria-label={`Toggle ${habit.name}`}
        title={checked ? 'Mark incomplete' : 'Mark complete'}
        disabled={disabled}
      >
        {checked && <CheckIcon />}
      </button>

      <span className="habit-icon">{habit.icon}</span>

      <span
        className={`habit-name ${hasNotes ? 'habit-name--has-notes' : ''}`}
        onClick={onOpenNotes ? () => onOpenNotes(habit) : undefined}
        title={hasNotes ? 'Click to view notes' : 'Click to add notes'}
      >
        {habit.name}
        {hasNotes && <span className="notes-indicator">📝</span>}
      </span>

      {tags.length > 0 && (
        <div className="item-tags">
          {tags.map((tag) => (
            <span key={tag} className="item-tag-dot" style={{ background: tagColors[tag] || '#888' }} title={tag} />
          ))}
        </div>
      )}

      {habit.frequency && habit.frequency !== 'daily' && (
        <span className="habit-frequency" title={`Frequency: ${habit.frequency === 'custom' ? (habit.frequencyDays || []).map(d => DAY_ABBR[d]).join('/') : habit.frequency}`}>
          {habit.frequency === 'weekdays' ? 'wkd' : habit.frequency === '3x-week' ? '3x' : habit.frequency === 'custom' ? (habit.frequencyDays || []).map(d => DAY_ABBR[d]).join('') : 'alt'}
        </span>
      )}

      <span className="habit-xp">+{habit.xp} XP</span>

      {habitStreak > 0 && (
        <span className={`habit-streak ${habitStreak >= 7 ? 'habit-streak--hot' : ''}`} title={`${habitStreak} day streak`}>
          🔥{habitStreak}
        </span>
      )}

      <div className="habit-actions">
        <button
          className="icon-btn icon-btn--edit"
          onClick={onEdit}
          title="Edit habit"
          aria-label={`Edit ${habit.name}`}
        >
          <EditIcon />
        </button>
        <button
          className={`icon-btn icon-btn--delete ${confirmDelete ? 'icon-btn--confirm' : ''}`}
          onClick={handleDelete}
          title={confirmDelete ? 'Click again to confirm' : 'Delete habit'}
          aria-label={`Delete ${habit.name}`}
        >
          {confirmDelete ? <ConfirmIcon /> : <TrashIcon />}
        </button>
      </div>

      {today && (
        <div className="habit-tooltip">
          <div className="tooltip-dots">
            {last7Days.map((day) => {
              const didNotExist = habit.createdAt > day
              const done = !didNotExist && !!(logs[day] || {})[habit.id]
              let cls = 'tooltip-dot tooltip-dot--missed'
              if (didNotExist) cls = 'tooltip-dot tooltip-dot--na'
              else if (done) cls = 'tooltip-dot tooltip-dot--done'
              return <span key={day} className={cls} title={day} />
            })}
          </div>
          <span className="tooltip-label">Last 7 days</span>
        </div>
      )}
    </li>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function ConfirmIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
