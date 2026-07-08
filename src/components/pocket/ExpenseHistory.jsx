import { useState, useMemo } from 'react'
import { compact, formatIQD, monthKey } from '../../utils/pocketUtils'
import { dateFromKey } from '../../utils/dateUtils'

export default function ExpenseHistory({ expenses, categories, ui, onClose, onDelete }) {
  const [catFilter, setCatFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')
  const [q, setQ] = useState('')

  const months = useMemo(() => [...new Set(expenses.map((e) => e.date.slice(0, 7)))].sort().reverse(), [expenses])
  const catOf = (id) => categories.find((c) => c.id === id) || { icon: '📦', label: id, color: '#94a3b8' }

  const filtered = useMemo(() => expenses.filter((e) => {
    if (catFilter !== 'all' && e.categoryId !== catFilter) return false
    if (monthFilter !== 'all' && e.date.slice(0, 7) !== monthFilter) return false
    if (q && !((e.note || '').toLowerCase().includes(q.toLowerCase()) || catOf(e.categoryId).label.toLowerCase().includes(q.toLowerCase()))) return false
    return true
  }).sort((a, b) => b.date.localeCompare(a.date)), [expenses, catFilter, monthFilter, q])

  const total = filtered.reduce((s, e) => s + e.amount, 0)
  const days = new Set(filtered.map((e) => e.date)).size || 1
  const byDay = useMemo(() => {
    const map = {}
    for (const e of filtered) (map[e.date] ||= []).push(e)
    return Object.entries(map)
  }, [filtered])

  return (
    <div className="pk-history">
      <div className="pk-tab-head">
        <button className="btn btn-ghost btn-sm" onClick={onClose}>‹ Back</button>
        <h2 className="pk-section-title">Expense history</h2>
      </div>

      <div className="pk-filters">
        <input className="form-input" placeholder="Search notes / category…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="form-input" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
          <option value="all">All months</option>
          {months.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="form-input" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      <div className="pk-kpi-row">
        <div className="card pk-card pk-kpi"><span className="pk-kpi-label">Total</span><span className="pk-kpi-value" style={{ color: 'var(--danger)' }}>{compact(total)}</span></div>
        <div className="card pk-card pk-kpi"><span className="pk-kpi-label">Entries</span><span className="pk-kpi-value">{filtered.length}</span></div>
        <div className="card pk-card pk-kpi"><span className="pk-kpi-label">Avg / day</span><span className="pk-kpi-value">{compact(total / days)}</span></div>
      </div>

      <div className="card pk-card">
        <div className="pk-ledger">
          {byDay.map(([day, items]) => (
            <div key={day} className="pk-ledger-day">
              <div className="pk-ledger-dayhead">
                <span>{dateFromKey(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="pk-ledger-daytotal">−{compact(items.reduce((s, e) => s + e.amount, 0))}</span>
              </div>
              {items.map((e) => {
                const c = catOf(e.categoryId)
                return (
                  <div key={e.id} className="pk-ledger-row pk-ledger-row--full">
                    <span className="pk-ledger-cat"><span style={{ color: c.color }}>{c.icon}</span> {e.note || c.label}</span>
                    <span className="pk-ledger-meta">{c.label} · {e.paymentMethod}</span>
                    <span className="pk-ledger-amt">−{formatIQD(e.amount)}</span>
                    <button className="pk-del" onClick={() => onDelete(e.id)} aria-label="Delete expense">✕</button>
                  </div>
                )
              })}
            </div>
          ))}
          {!filtered.length && <p className="pk-empty">No matching expenses.</p>}
        </div>
      </div>
    </div>
  )
}
