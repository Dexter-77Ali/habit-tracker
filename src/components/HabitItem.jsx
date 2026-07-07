import { useState, useEffect, useRef, useMemo } from 'react'
import { getDateKey, dateFromKey } from '../utils/dateUtils'
import { isHabitScheduled } from '../utils/scoreUtils'
import IconDisplay from './IconDisplay'

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
  const [menuOpen, setMenuOpen] = useState(false)
  const [justChecked, setJustChecked] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete()
      setConfirmDelete(false)
      setMenuOpen(false)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  const handleToggle = () => {
    if (disabled) return
    navigator.vibrate?.(checked ? 10 : [15, 30, 25]) // double-buzz reward on completion
    onToggle()
    if (!checked) {
      setJustChecked(true)
      setTimeout(() => setJustChecked(false), 900)
    }
  }

  const touchRef = useRef(null)
  const [swipeX, setSwipeX] = useState(0)

  const onTouchStart = (e) => { touchRef.current = e.touches[0].clientX }
  const onTouchMove = (e) => {
    if (touchRef.current === null) return
    const dx = e.touches[0].clientX - touchRef.current
    if (dx > 0) setSwipeX(Math.min(dx, 100))
  }
  const onTouchEnd = () => {
    if (swipeX > 80 && !disabled) handleToggle()
    setSwipeX(0)
    touchRef.current = null
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
    <li
      role="option"
      tabIndex={-1}
      aria-selected={checked}
      className={`habit-item ${checked ? 'habit-item--checked' : ''} ${disabled ? 'habit-item--disabled' : ''}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={swipeX > 0 ? { transform: `translateX(${swipeX}px)`, transition: swipeX === 0 ? 'transform 0.2s ease' : 'none' } : undefined}
    >
      <button
        className={`habit-checkbox ${checked ? 'habit-checkbox--checked' : ''} ${justChecked ? 'habit-checkbox--pop' : ''}`}
        onClick={handleToggle}
        aria-label={`Toggle ${habit.name}`}
        title={checked ? 'Mark incomplete' : 'Mark complete'}
        disabled={disabled}
      >
        {checked && <CheckIcon />}
        {justChecked && <span className="xp-float" aria-hidden="true">+{habit.xp} XP</span>}
      </button>

      <IconDisplay icon={habit.icon} size={20} className="habit-icon" />

      <div className="habit-name-col">
        <span
          className={`habit-name ${hasNotes ? 'habit-name--has-notes' : ''}`}
          onClick={onOpenNotes ? () => onOpenNotes(habit) : undefined}
          title={hasNotes ? 'Click to view notes' : 'Click to add notes'}
        >
          {habit.name}
          {hasNotes && <span className="notes-indicator">📝</span>}
        </span>
        <div className="habit-meta-row">
          {habit.frequency && habit.frequency !== 'daily' && (
            <span className="habit-frequency" title={`Frequency: ${habit.frequency === 'custom' ? (habit.frequencyDays || []).map(d => DAY_ABBR[d]).join('/') : habit.frequency}`}>
              {habit.frequency === 'weekdays' ? 'wkd' : habit.frequency === '3x-week' ? '3x' : habit.frequency === 'custom' ? (habit.frequencyDays || []).map(d => DAY_ABBR[d]).join('') : 'alt'}
            </span>
          )}
          {tags.length > 0 && (
            <div className="item-tags">
              {tags.map((tag) => (
                <span key={tag} className="item-tag-dot" style={{ background: tagColors[tag] || '#888' }} title={tag} />
              ))}
            </div>
          )}
          {today && (
            <div className="habit-history-dots">
              {last7Days.map((day) => {
                const didNotExist = habit.createdAt > day
                const done = !didNotExist && !!(logs[day] || {})[habit.id]
                let cls = 'history-dot history-dot--missed'
                if (didNotExist) cls = 'history-dot history-dot--na'
                else if (done) cls = 'history-dot history-dot--done'
                return <span key={day} className={cls} />
              })}
            </div>
          )}
        </div>
      </div>

      {habitStreak > 0 && (
        <span className={`habit-streak ${habitStreak >= 7 ? 'habit-streak--hot' : ''}`} title={`${habitStreak} day streak`}>
          🔥{habitStreak}
        </span>
      )}

      <span className="habit-xp">+{habit.xp} XP</span>

      <div className="kebab-wrapper" ref={menuRef}>
        <button
          className="kebab-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Actions"
          title="More actions"
        >
          <KebabIcon />
        </button>
        {menuOpen && (
          <div className="kebab-dropdown">
            <button className="kebab-item" onClick={() => { onEdit(); setMenuOpen(false) }}>
              <EditIcon /> Edit
            </button>
            {onOpenNotes && (
              <button className="kebab-item" onClick={() => { onOpenNotes(habit); setMenuOpen(false) }}>
                <NotesIcon /> Notes
              </button>
            )}
            <button
              className={`kebab-item kebab-item--danger ${confirmDelete ? 'kebab-item--confirm' : ''}`}
              onClick={handleDelete}
            >
              <TrashIcon /> {confirmDelete ? 'Confirm delete?' : 'Delete'}
            </button>
          </div>
        )}
      </div>
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

function KebabIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function NotesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}
