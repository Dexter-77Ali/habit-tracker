import { useState, useEffect, useRef } from 'react'

const GROUP_EMOJI_OPTIONS = ['💚', '💼', '🏋️', '📚', '🎨', '🧠', '🏠', '💻', '🎯', '🌱', '🔥', '⚡', '🎵', '🛠️', '🚀', '❤️']

export default function AddEditGroupModal({ group, type, onSave, onClose }) {
  const isEdit = !!group
  const firstInput = useRef(null)

  const [form, setForm] = useState({
    name: group?.name || '',
    icon: group?.icon || '💚',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => { firstInput.current?.focus() }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Group name is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ name: form.name.trim(), icon: form.icon, type })
  }

  const label = type === 'habit' ? 'Habit' : 'Task'

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Group' : `New ${label} Group`}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div className="emoji-grid">
              {GROUP_EMOJI_OPTIONS.map((emoji) => (
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
            <label className="form-label" htmlFor="group-name">Group Name</label>
            <input
              id="group-name"
              ref={firstInput}
              type="text"
              className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              value={form.name}
              onChange={(e) => { setForm((prev) => ({ ...prev, name: e.target.value })); setErrors({}) }}
              placeholder="e.g. Health & Fitness"
              maxLength={40}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save Changes' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
