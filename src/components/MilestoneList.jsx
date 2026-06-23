import { useState } from 'react'

export default function MilestoneList({ milestones = [], onToggle, onAdd, onDelete, onEdit }) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', xp: 10, description: '', dueDate: '', priority: 'medium' })

  const resetForm = () => setForm({ name: '', xp: 10, description: '', dueDate: '', priority: 'medium' })

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onAdd({
      name: form.name.trim(),
      xp: Number(form.xp) || 10,
      description: form.description.trim(),
      dueDate: form.dueDate || null,
      priority: form.priority,
    })
    resetForm()
    setAdding(false)
  }

  const handleEditSave = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onEdit(editingId, {
      name: form.name.trim(),
      xp: Number(form.xp) || 10,
      description: form.description.trim(),
      dueDate: form.dueDate || null,
      priority: form.priority,
    })
    resetForm()
    setEditingId(null)
  }

  const startEdit = (m) => {
    setEditingId(m.id)
    setAdding(false)
    setForm({
      name: m.name,
      xp: m.xp,
      description: m.description || '',
      dueDate: m.dueDate || '',
      priority: m.priority || 'medium',
    })
  }

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return null
    return Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24))
  }

  const priorityLabel = { low: 'Low', medium: 'Med', high: 'High' }

  return (
    <div className="milestone-list">
      <div className="milestone-list-header">
        <h4>Tasks</h4>
        <button className="btn btn-ghost btn-sm" onClick={() => { setAdding(!adding); setEditingId(null); resetForm() }}>
          {adding ? 'Cancel' : '+ Add Task'}
        </button>
      </div>

      {(adding || editingId) && (
        <form className="milestone-add-form milestone-add-form--expanded" onSubmit={editingId ? handleEditSave : handleAdd}>
          <div className="milestone-form-row">
            <input
              type="text"
              className="form-input milestone-add-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Task name..."
              autoFocus
            />
            <input
              type="number"
              className="form-input milestone-add-xp"
              value={form.xp}
              onChange={(e) => setForm((f) => ({ ...f, xp: e.target.value }))}
              min={1}
              max={500}
              title="XP reward"
            />
          </div>
          <textarea
            className="form-input milestone-add-desc"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description (optional)..."
            rows={2}
          />
          <div className="milestone-form-row">
            <input
              type="date"
              className="form-input milestone-add-date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              title="Due date (optional)"
            />
            <div className="milestone-priority-row">
              {['low', 'medium', 'high'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`milestone-priority-btn milestone-priority-btn--${p} ${form.priority === p ? 'milestone-priority-btn--selected' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, priority: p }))}
                >
                  {priorityLabel[p]}
                </button>
              ))}
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              {editingId ? 'Save' : 'Add'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setEditingId(null); resetForm() }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {milestones.length === 0 ? (
        <p className="milestone-empty">No tasks yet. Add some to track progress toward this goal.</p>
      ) : (
        <ul className="milestone-items">
          {milestones.map((m) => {
            const daysLeft = getDaysLeft(m.dueDate)
            return (
              <li key={m.id} className={`milestone-item ${m.completed ? 'milestone-item--done' : ''}`}>
                <button
                  className={`milestone-checkbox ${m.completed ? 'milestone-checkbox--checked' : ''}`}
                  onClick={() => onToggle(m.id)}
                >
                  {m.completed && <CheckIcon />}
                </button>
                <div className="milestone-content" onClick={() => startEdit(m)}>
                  <div className="milestone-top-row">
                    <span className="milestone-name">{m.name}</span>
                    {m.priority && m.priority !== 'medium' && (
                      <span className={`milestone-priority-badge milestone-priority-badge--${m.priority}`}>
                        {m.priority === 'high' ? '!' : '↓'}
                      </span>
                    )}
                  </div>
                  {m.description && (
                    <p className="milestone-desc">{m.description}</p>
                  )}
                  <div className="milestone-meta">
                    <span className="milestone-xp">+{m.xp} XP</span>
                    {daysLeft !== null && (
                      <span className={`milestone-due ${daysLeft < 0 ? 'milestone-due--overdue' : daysLeft <= 3 ? 'milestone-due--soon' : ''}`}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d`}
                      </span>
                    )}
                    {m.completedAt && (
                      <span className="milestone-completed-at">Done {m.completedAt}</span>
                    )}
                  </div>
                </div>
                <button className="milestone-delete-btn" onClick={() => onDelete(m.id)} title="Remove task">×</button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
