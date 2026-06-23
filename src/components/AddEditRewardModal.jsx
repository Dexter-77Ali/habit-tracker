import { useState, useEffect, useRef } from 'react'

const REWARD_ICONS = ['☕', '🎮', '🍕', '🎬', '🛍️', '🏖️', '🍦', '📱', '🎧', '🎁', '💤', '🍔']

export default function AddEditRewardModal({ reward, onSave, onClose }) {
  const isEdit = !!reward
  const firstInput = useRef(null)

  const [form, setForm] = useState({
    name: reward?.name || '',
    scope: reward?.scope || 'daily',
    xpThreshold: reward?.xpThreshold ?? 50,
    repeatable: reward?.repeatable ?? true,
    icon: reward?.icon || '☕',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => { firstInput.current?.focus() }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (form.xpThreshold < 1) errs.xpThreshold = 'Must be at least 1 XP'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      name: form.name.trim(),
      scope: form.scope,
      xpThreshold: Number(form.xpThreshold),
      repeatable: form.repeatable,
      icon: form.icon,
      type: 'custom',
    })
  }

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: val }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="reward-modal-title">
        <div className="modal-header">
          <h2 id="reward-modal-title">{isEdit ? 'Edit Reward' : 'Add New Reward'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div className="emoji-grid">
              {REWARD_ICONS.map((emoji) => (
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
            <label className="form-label" htmlFor="reward-name">Reward Name</label>
            <input
              id="reward-name"
              ref={firstInput}
              type="text"
              className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Buy a coffee"
              maxLength={60}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Scope</label>
            <div className="priority-row">
              {['daily', 'weekly', 'monthly'].map((s) => (
                <button
                  type="button"
                  key={s}
                  className={`priority-btn ${form.scope === s ? 'priority-btn--selected' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, scope: s }))}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reward-xp">
              XP Threshold <span className="form-hint">(earn this much to unlock)</span>
            </label>
            <input
              id="reward-xp"
              type="number"
              min={1}
              max={100000}
              className={`form-input ${errors.xpThreshold ? 'form-input--error' : ''}`}
              value={form.xpThreshold}
              onChange={set('xpThreshold')}
            />
            {errors.xpThreshold && <p className="form-error">{errors.xpThreshold}</p>}
          </div>

          <div className="form-group">
            <label className="toggle-label toggle-label--large">
              <input type="checkbox" checked={form.repeatable} onChange={set('repeatable')} />
              Repeatable <span className="form-hint">(triggers every time threshold is met)</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save Changes' : 'Add Reward'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
