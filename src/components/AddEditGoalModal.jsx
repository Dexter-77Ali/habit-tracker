import { useState, useEffect } from 'react'

const EMOJI_OPTIONS = ['🎯', '🏆', '📜', '🎓', '💻', '🔐', '🏋️', '📚', '🚀', '⭐', '🛡️', '🧪', '🔬', '🌍', '💼', '🎨']

export default function AddEditGoalModal({ goal, habits = [], tasks = [], onSave, onClose }) {
  const isEdit = !!goal

  const [form, setForm] = useState({
    name: goal?.name || '',
    icon: goal?.icon || '🎯',
    deadline: goal?.deadline || '',
    linkedHabitIds: goal?.linkedHabitIds || [],
    linkedTaskIds: goal?.linkedTaskIds || [],
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Goal name is required'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      name: form.name.trim(),
      icon: form.icon,
      deadline: form.deadline || null,
      linkedHabitIds: form.linkedHabitIds,
      linkedTaskIds: form.linkedTaskIds,
    })
  }

  const toggleLinkedHabit = (id) => {
    setForm((prev) => ({
      ...prev,
      linkedHabitIds: prev.linkedHabitIds.includes(id)
        ? prev.linkedHabitIds.filter((hid) => hid !== id)
        : [...prev.linkedHabitIds, id],
    }))
  }

  const toggleLinkedTask = (id) => {
    setForm((prev) => ({
      ...prev,
      linkedTaskIds: prev.linkedTaskIds.includes(id)
        ? prev.linkedTaskIds.filter((tid) => tid !== id)
        : [...prev.linkedTaskIds, id],
    }))
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal goal-modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Goal' : 'Create New Goal'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div className="emoji-grid">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  className={`emoji-btn ${form.icon === emoji ? 'emoji-btn--selected' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, icon: emoji }))}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="goal-name">Goal Name</label>
            <input
              id="goal-name"
              type="text"
              className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              value={form.name}
              onChange={(e) => { setForm((prev) => ({ ...prev, name: e.target.value })); setErrors({}) }}
              placeholder="e.g. OSCP Certification"
              maxLength={80}
              autoFocus
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="goal-deadline">
              Deadline <span className="form-hint">(optional)</span>
            </label>
            <input
              id="goal-deadline"
              type="date"
              className="form-input"
              value={form.deadline}
              onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
            />
          </div>

          {habits.length > 0 && (
            <div className="form-group">
              <label className="form-label">Link Habits</label>
              <div className="goal-link-list">
                {habits.map((h) => (
                  <label key={h.id} className="goal-link-item">
                    <input
                      type="checkbox"
                      checked={form.linkedHabitIds.includes(h.id)}
                      onChange={() => toggleLinkedHabit(h.id)}
                    />
                    <span>{h.icon} {h.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {tasks.length > 0 && (
            <div className="form-group">
              <label className="form-label">Link Tasks</label>
              <div className="goal-link-list">
                {tasks.filter((t) => !t.completed).map((t) => (
                  <label key={t.id} className="goal-link-item">
                    <input
                      type="checkbox"
                      checked={form.linkedTaskIds.includes(t.id)}
                      onChange={() => toggleLinkedTask(t.id)}
                    />
                    <span>{t.icon} {t.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
