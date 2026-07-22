import { useState, useEffect, useRef } from 'react'
import IconDisplay from './IconDisplay'
import TimerControl from './TimerControl'

export default function TaskItem({ task, onToggle, onEdit, onDelete, onOpenNotes, disabled, tagColors = {}, timerRunning = false, timerStartedAt = 0, spentMs = 0, onTimer }) {
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
    navigator.vibrate?.(task.completed ? 10 : [15, 30, 25]) // double-buzz reward on completion
    onToggle()
    if (!task.completed) {
      setJustChecked(true)
      setTimeout(() => setJustChecked(false), 900)
    }
  }

  const isOverdue = task.dueDate && !task.completed && task.dueDate < new Date().toISOString().slice(0, 10)
  const tags = task.tags || []
  const hasNotes = !!(task.notes)

  return (
    <li className={`habit-item ${task.completed ? 'habit-item--checked' : ''} ${isOverdue ? 'task-item--overdue' : ''} ${disabled ? 'habit-item--disabled' : ''}`}>
      <button
        className={`habit-checkbox ${task.completed ? 'habit-checkbox--checked' : ''} ${justChecked ? 'habit-checkbox--pop' : ''}`}
        onClick={handleToggle}
        aria-label={`Toggle ${task.name}`}
        disabled={disabled}
      >
        {task.completed && <CheckIcon />}
        {justChecked && <span className="xp-float" aria-hidden="true">+{task.xp} XP</span>}
      </button>

      <IconDisplay icon={task.icon} size={20} className="habit-icon" />

      <div className="task-name-col">
        <span
          className={`habit-name ${hasNotes ? 'habit-name--has-notes' : ''}`}
          onClick={onOpenNotes ? () => onOpenNotes(task) : undefined}
          title={hasNotes ? 'Click to view notes' : 'Click to add notes'}
        >
          {task.name}
          {hasNotes && <span className="notes-indicator">📝</span>}
        </span>
        {task.dueDate && (
          <span className={`task-due ${isOverdue ? 'task-due--overdue' : ''}`}>
            {isOverdue ? 'Overdue: ' : 'Due: '}{task.dueDate}
          </span>
        )}
      </div>

      {tags.length > 0 && (
        <div className="item-tags">
          {tags.map((tag) => (
            <span key={tag} className="item-tag-dot" style={{ background: tagColors[tag] || '#888' }} title={tag} />
          ))}
        </div>
      )}

      {(onTimer || spentMs > 0) && (
        <TimerControl
          running={timerRunning}
          startedAt={timerStartedAt}
          spentMs={spentMs}
          onToggle={onTimer}
          disabled={!onTimer}
        />
      )}

      {task.priority && task.priority !== 'none' && (
        <span className={`task-priority task-priority--${task.priority}`}>
          {task.priority}
        </span>
      )}

      <span className="habit-xp">+{task.xp} XP</span>

      {!disabled && (
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
                <button className="kebab-item" onClick={() => { onOpenNotes(task); setMenuOpen(false) }}>
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
