import { useState, useEffect, useRef } from 'react'
import { usePersistedStorage } from '../hooks/usePersistedStorage'
import { PNG_ICONS } from '../utils/iconUtils'
import IconDisplay from './IconDisplay'
import TagInput from './TagInput'

const EMOJI_OPTIONS = ['🏃', '📖', '💧', '🧘', '🍎', '✏️', '💊', '🛌', '🎯', '💪', '🧹', '🎵', '🌿', '🧠', '🚴', '🔧', '🐛', '📝', '📞', '🛒']
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AddEditModal({ item, mode = 'habit', onSave, onClose, groups = [], allTags = [], tagColors = {} }) {
  const isEdit = !!item
  const isTask = mode === 'task'
  const firstInput = useRef(null)

  const [form, setForm] = useState({
    name: item?.name || '',
    xp: item?.xp ?? 10,
    icon: item?.icon || (isTask ? '🔧' : '🎯'),
    dueDate: item?.dueDate || '',
    priority: item?.priority || 'none',
    groupId: item?.groupId || '',
    tags: item?.tags || [],
    frequency: item?.frequency || 'daily',
    frequencyDays: item?.frequencyDays || [1, 3, 5],
  })
  const [errors, setErrors] = useState({})
  const [iconTab, setIconTab] = useState('emoji')
  const [customIcons, setCustomIcons] = usePersistedStorage('ht_custom_icons', [])

  useEffect(() => { firstInput.current?.focus() }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (form.xp < 1 || form.xp > 1000) errs.xp = 'XP must be between 1 and 1000'
    if (!isTask && form.frequency === 'custom' && form.frequencyDays.length === 0) errs.frequency = 'Select at least one day'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const data = {
      name: form.name.trim(),
      xp: Number(form.xp),
      icon: form.icon,
      groupId: form.groupId || null,
      tags: form.tags,
    }
    if (!isTask) {
      data.frequency = form.frequency
      if (form.frequency === 'custom') {
        data.frequencyDays = form.frequencyDays
      }
    }
    if (isTask) {
      data.dueDate = form.dueDate || null
      data.priority = form.priority
    }
    onSave(data)
  }

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const label = isTask ? 'Task' : 'Habit'

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title">{isEdit ? `Edit ${label}` : `Add New ${label}`}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div className="icon-picker-tabs">
              {['emoji', 'icons', 'upload'].map(tab => (
                <button type="button" key={tab} className={`icon-picker-tab ${iconTab === tab ? 'icon-picker-tab--active' : ''}`} onClick={() => setIconTab(tab)}>
                  {tab === 'emoji' ? 'Emoji' : tab === 'icons' ? 'Icons' : 'Upload'}
                </button>
              ))}
            </div>

            {iconTab === 'emoji' && (
              <div className="emoji-grid">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button type="button" key={emoji} className={`emoji-btn ${form.icon === emoji ? 'emoji-btn--selected' : ''}`} onClick={() => setForm((prev) => ({ ...prev, icon: emoji }))}>
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {iconTab === 'icons' && (
              <div className="emoji-grid icon-grid-scroll">
                {PNG_ICONS.map((ic) => (
                  <button type="button" key={ic.path} className={`emoji-btn ${form.icon === ic.path ? 'emoji-btn--selected' : ''}`} onClick={() => setForm((prev) => ({ ...prev, icon: ic.path }))} title={ic.name}>
                    <img src={ic.path} width={24} height={24} alt={ic.name} />
                  </button>
                ))}
              </div>
            )}

            {iconTab === 'upload' && (
              <div>
                <div className="emoji-grid icon-grid-scroll">
                  {customIcons.map((ic) => (
                    <button type="button" key={ic.id} className={`emoji-btn ${form.icon === ic.data ? 'emoji-btn--selected' : ''}`} onClick={() => setForm((prev) => ({ ...prev, icon: ic.data }))} title={ic.name}>
                      <img src={ic.data} width={24} height={24} alt={ic.name} />
                    </button>
                  ))}
                </div>
                <label className="icon-upload-btn">
                  + Upload icon
                  <input type="file" accept="image/*" hidden onChange={(e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    if (!file.type.startsWith('image/') || file.size > 1_000_000) {
                      setErrors(prev => ({ ...prev, icon: 'Images only, max 1 MB' }))
                      e.target.value = ''
                      return
                    }
                    setErrors(prev => ({ ...prev, icon: undefined }))
                    const reader = new FileReader()
                    reader.onload = () => {
                      const dataUrl = reader.result
                      setCustomIcons(prev => [...prev, { id: Date.now(), data: dataUrl, name: file.name }])
                      setForm(prev => ({ ...prev, icon: dataUrl }))
                    }
                    reader.readAsDataURL(file)
                    e.target.value = ''
                  }} />
                </label>
                {errors.icon && <p className="form-error">{errors.icon}</p>}
              </div>
            )}

            {form.icon && (
              <div className="icon-preview">
                Selected: <IconDisplay icon={form.icon} size={24} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-name">{label} Name</label>
            <input
              id="item-name"
              ref={firstInput}
              type="text"
              className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              value={form.name}
              onChange={set('name')}
              placeholder={isTask ? 'e.g. Fix login bug' : 'e.g. Read 20 minutes'}
              maxLength={60}
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="item-xp">
              XP Points <span className="form-hint">(1-1000)</span>
            </label>
            <div className="xp-row">
              <input
                id="item-xp"
                type="range"
                min={1}
                max={100}
                className="xp-slider"
                value={form.xp}
                onChange={set('xp')}
              />
              <input
                type="number"
                min={1}
                max={1000}
                className={`form-input xp-number ${errors.xp ? 'form-input--error' : ''}`}
                value={form.xp}
                onChange={set('xp')}
              />
            </div>
            {errors.xp && <p className="form-error">{errors.xp}</p>}
          </div>

          {groups.length > 0 && (
            <div className="form-group">
              <label className="form-label" htmlFor="item-group">Group</label>
              <select
                id="item-group"
                className="form-input"
                value={form.groupId}
                onChange={set('groupId')}
              >
                <option value="">None</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Tags</label>
            <TagInput
              tags={form.tags}
              allTags={allTags}
              onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
              tagColors={tagColors}
            />
          </div>

          {!isTask && (
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <div className="frequency-row">
                {[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekdays', label: 'Weekdays' },
                  { value: '3x-week', label: '3x/week' },
                  { value: 'every-other-day', label: 'Every other day' },
                  { value: 'custom', label: 'Custom' },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    className={`frequency-btn ${form.frequency === opt.value ? 'frequency-btn--selected' : ''}`}
                    onClick={() => setForm((prev) => ({ ...prev, frequency: opt.value }))}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {form.frequency === 'custom' && (
                <div className="day-toggle-row">
                  {DAY_LABELS.map((label, i) => (
                    <button
                      type="button"
                      key={i}
                      className={`day-toggle-btn ${form.frequencyDays.includes(i) ? 'day-toggle-btn--selected' : ''}`}
                      onClick={() => setForm((prev) => {
                        const days = prev.frequencyDays.includes(i)
                          ? prev.frequencyDays.filter((d) => d !== i)
                          : [...prev.frequencyDays, i].sort()
                        return { ...prev, frequencyDays: days }
                      })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {errors.frequency && <p className="form-error">{errors.frequency}</p>}
            </div>
          )}

          {isTask && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="item-due">Due Date <span className="form-hint">(optional)</span></label>
                <input
                  id="item-due"
                  type="date"
                  className="form-input"
                  value={form.dueDate}
                  onChange={set('dueDate')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <div className="priority-row">
                  {['none', 'low', 'medium', 'high'].map((p) => (
                    <button
                      type="button"
                      key={p}
                      className={`priority-btn priority-btn--${p} ${form.priority === p ? 'priority-btn--selected' : ''}`}
                      onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                    >
                      {p === 'none' ? 'None' : p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save Changes' : `Add ${label}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
