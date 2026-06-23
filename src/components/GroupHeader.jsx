import { useState } from 'react'

export default function GroupHeader({ group, itemCount, onToggleCollapse, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(group.id)
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div className="group-header" onClick={() => onToggleCollapse(group.id)}>
      <span className={`group-chevron ${group.collapsed ? 'group-chevron--collapsed' : ''}`}>
        <ChevronIcon />
      </span>
      <span className="group-icon">{group.icon}</span>
      <span className="group-name">{group.name}</span>
      <span className="group-count-badge">{itemCount}</span>

      <div className="group-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="icon-btn icon-btn--edit"
          onClick={() => onEdit(group)}
          title="Edit group"
        >
          <EditIcon />
        </button>
        <button
          className={`icon-btn icon-btn--delete ${confirmDelete ? 'icon-btn--confirm' : ''}`}
          onClick={handleDelete}
          title={confirmDelete ? 'Click again to confirm' : 'Delete group (items kept)'}
        >
          {confirmDelete ? <ConfirmIcon /> : <TrashIcon />}
        </button>
      </div>
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function ConfirmIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
