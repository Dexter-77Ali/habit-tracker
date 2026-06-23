import { useState } from 'react'

export default function TaskItem({ task, onToggle, onEdit, onDelete, onOpenNotes, disabled, tagColors = {} }) {
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

  const isOverdue = task.dueDate && !task.completed && task.dueDate < new Date().toISOString().slice(0, 10)
  const tags = task.tags || []
  const hasNotes = !!(task.notes)

  return (
    <li className={`habit-item ${task.completed ? 'habit-item--checked' : ''} ${isOverdue ? 'task-item--overdue' : ''} ${disabled ? 'habit-item--disabled' : ''}`}>
      <button
        className={`habit-checkbox ${task.completed ? 'habit-checkbox--checked' : ''}`}
        onClick={disabled ? undefined : onToggle}
        aria-label={`Toggle ${task.name}`}
        disabled={disabled}
      >
        {task.completed && <CheckIcon />}
      </button>

      <span className="habit-icon">{task.icon}</span>

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

      {task.priority && task.priority !== 'none' && (
        <span className={`task-priority task-priority--${task.priority}`}>
          {task.priority}
        </span>
      )}

      <span className="habit-xp">+{task.xp} XP</span>

      {!disabled && (
        <div className="habit-actions">
          <button className="icon-btn icon-btn--edit" onClick={onEdit} title="Edit task">
            <EditIcon />
          </button>
          <button
            className={`icon-btn icon-btn--delete ${confirmDelete ? 'icon-btn--confirm' : ''}`}
            onClick={handleDelete}
            title={confirmDelete ? 'Click again to confirm' : 'Delete task'}
          >
            {confirmDelete ? <ConfirmIcon /> : <TrashIcon />}
          </button>
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
