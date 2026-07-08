import { useState } from 'react'
import { formatIQD, monthLabel, addMonth, todayMonthKey, DEFAULT_IQD_RATE } from '../../utils/pocketUtils'

const DASH = [
  { id: 'ring', label: 'Budget Ring' },
  { id: 'ledger', label: 'Ledger Flow' },
  { id: 'cards', label: 'Stat Cards' },
]
const CHOOSERS = [
  { key: 'calendarStyle', label: 'Calendar', opts: [['heat', 'Heat grid'], ['agenda', 'Agenda']] },
  { key: 'statsStyle', label: 'Stats', opts: [['grid', 'Chart grid'], ['focus', 'Single focus']] },
  { key: 'goalsStyle', label: 'Goals', opts: [['cards', 'Cards'], ['rings', 'Rings']] },
]

export default function PocketSettings({ income, setIncome, ui, patchUi, categories, onAddCategory, onDeleteCategory, expenses, onClearSamples, onEditIncome }) {
  const [ovMonth, setOvMonth] = useState(todayMonthKey())
  const [ovAmt, setOvAmt] = useState('')
  const [newCat, setNewCat] = useState({ label: '', icon: '📦', color: '#94a3b8' })

  const addOverride = () => {
    const amt = Number(ovAmt) || 0
    if (amt <= 0) return
    setIncome((prev) => ({ ...prev, overrides: { ...prev.overrides, [ovMonth]: amt } }))
    setOvAmt('')
  }
  const removeOverride = (mk) => setIncome((prev) => {
    const o = { ...prev.overrides }; delete o[mk]; return { ...prev, overrides: o }
  })
  const overrides = Object.entries(income.overrides || {}).sort()

  return (
    <div className="pk-settings">
      {/* Income */}
      <div className="card pk-card">
        <h3 className="pk-section-title">Monthly income</h3>
        <div className="pk-set-row">
          <div className="pk-set-value">{formatIQD(income.amount)}</div>
          <button className="btn btn-ghost btn-sm" onClick={onEditIncome}>Edit</button>
        </div>
        <div className="pk-set-sub">
          <span>Default currency</span>
          <div className="pk-seg-toggle">
            {['IQD', 'USD'].map((c) => (
              <button key={c} className={`pk-seg-btn ${ui.primaryCurrency === c ? 'pk-seg-btn--active' : ''}`} onClick={() => patchUi({ primaryCurrency: c })}>{c}</button>
            ))}
          </div>
        </div>
        <div className="pk-set-sub">
          <span>IQD per $1</span>
          <input type="number" className="form-input pk-rate-input" value={ui.iqdRate}
            onChange={(e) => patchUi({ iqdRate: Math.max(1, Number(e.target.value) || DEFAULT_IQD_RATE) })} />
        </div>
      </div>

      {/* Recurring payday */}
      <div className="card pk-card">
        <div className="pk-set-row">
          <h3 className="pk-section-title">Recurring payday</h3>
          <label className="pk-switch">
            <input type="checkbox" checked={income.recurring} onChange={(e) => setIncome((p) => ({ ...p, recurring: e.target.checked }))} />
            <span className="pk-switch-track" />
          </label>
        </div>
        {income.recurring && <>
          <div className="pk-set-sub">
            <span>Reset day</span>
            <select className="form-input pk-day-select" value={income.resetDay || 25} onChange={(e) => setIncome((p) => ({ ...p, resetDay: Number(e.target.value) }))}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <p className="pk-set-note">Budget resets on day {income.resetDay || 25}; next period starts {monthLabel(addMonth(todayMonthKey(), 1))}.</p>
        </>}
      </div>

      {/* Budget overrides */}
      <div className="card pk-card">
        <h3 className="pk-section-title">Budget overrides</h3>
        {overrides.map(([mk, amt]) => (
          <div key={mk} className="pk-override-row">
            <span>{monthLabel(mk)}</span>
            <span className="pk-override-amt">{formatIQD(amt)}</span>
            <button className="pk-del" onClick={() => removeOverride(mk)} aria-label="Remove override">✕</button>
          </div>
        ))}
        {!overrides.length && <p className="pk-empty">No overrides — every month uses your base income.</p>}
        <div className="pk-form-row pk-override-add">
          <input type="month" className="form-input" value={ovMonth} onChange={(e) => setOvMonth(e.target.value)} />
          <input type="number" min="0" className="form-input" placeholder="Amount (IQD)" value={ovAmt} onChange={(e) => setOvAmt(e.target.value)} />
          <button className="btn btn-ghost btn-sm" onClick={addOverride}>Add</button>
        </div>
      </div>

      {/* Dashboard style */}
      <div className="card pk-card">
        <h3 className="pk-section-title">Dashboard style</h3>
        <div className="pk-style-grid">
          {DASH.map((d) => (
            <button key={d.id} className={`pk-style-card ${ui.dashboardStyle === d.id ? 'pk-style-card--active' : ''}`} onClick={() => patchUi({ dashboardStyle: d.id })}>
              <span className={`pk-style-preview pk-style-preview--${d.id}`} />
              <span>{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Layout choosers for other tabs */}
      <div className="card pk-card">
        <h3 className="pk-section-title">Tab layouts</h3>
        {CHOOSERS.map((ch) => (
          <div key={ch.key} className="pk-set-sub">
            <span>{ch.label}</span>
            <div className="pk-seg-toggle">
              {ch.opts.map(([val, lbl]) => (
                <button key={val} className={`pk-seg-btn ${ui[ch.key] === val ? 'pk-seg-btn--active' : ''}`} onClick={() => patchUi({ [ch.key]: val })}>{lbl}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="card pk-card">
        <h3 className="pk-section-title">Categories</h3>
        <div className="pk-cat-manage">
          {categories.map((c) => (
            <span key={c.id} className="pk-cat-tag" style={{ borderColor: c.color }}>
              {c.icon} {c.label}
              <button className="pk-del" onClick={() => onDeleteCategory(c.id)} aria-label={`Delete ${c.label}`}>✕</button>
            </span>
          ))}
        </div>
        <div className="pk-form-row pk-override-add">
          <input className="form-input pk-icon-input" placeholder="📦" value={newCat.icon} maxLength={2} onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })} />
          <input className="form-input" placeholder="Category name" value={newCat.label} maxLength={24} onChange={(e) => setNewCat({ ...newCat, label: e.target.value })} />
          <input type="color" className="form-input pk-color-input" value={newCat.color} onChange={(e) => setNewCat({ ...newCat, color: e.target.value })} />
          <button className="btn btn-ghost btn-sm" onClick={() => { if (newCat.label.trim()) { onAddCategory(newCat); setNewCat({ label: '', icon: '📦', color: '#94a3b8' }) } }}>Add</button>
        </div>
      </div>

      {/* Danger */}
      <div className="card pk-card">
        <h3 className="pk-section-title">Data</h3>
        <p className="pk-set-note">{expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded.</p>
        <button className="btn btn-ghost btn-sm pk-danger" onClick={() => { if (confirm('Clear ALL expenses? This cannot be undone.')) onClearSamples() }}>Clear all expenses</button>
      </div>
    </div>
  )
}
