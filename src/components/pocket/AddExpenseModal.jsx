import { useState, useEffect, useRef } from 'react'
import { getDateKey } from '../../utils/dateUtils'
import { toUSD } from '../../utils/pocketUtils'

export default function AddExpenseModal({ categories, ui, onSave, onClose }) {
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'other')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(getDateKey())
  const [paymentMethod, setPaymentMethod] = useState('Card')
  const firstRef = useRef(null)

  useEffect(() => { firstRef.current?.focus() }, [])
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const rate = ui.iqdRate
  const num = Number(amount) || 0

  const submit = (e) => {
    e.preventDefault()
    if (num <= 0) return
    onSave({ amount: num, categoryId, note, date, paymentMethod })
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="pk-exp-title">
        <div className="modal-header">
          <h2 id="pk-exp-title">Add Expense</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="pk-amount">Amount (IQD)</label>
            <input
              id="pk-amount" ref={firstRef} type="number" min="0" inputMode="numeric"
              className="form-input pk-amount-input" value={amount}
              onChange={(e) => setAmount(e.target.value)} placeholder="0"
            />
            <p className="form-hint pk-usd-hint">≈ ${toUSD(num, rate).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="pk-cat-grid">
              {categories.map((c) => (
                <button
                  type="button" key={c.id}
                  className={`pk-cat-chip ${categoryId === c.id ? 'pk-cat-chip--active' : ''}`}
                  style={categoryId === c.id ? { borderColor: c.color, boxShadow: `0 0 0 2px ${c.color}33` } : undefined}
                  onClick={() => setCategoryId(c.id)}
                  title={c.label}
                >
                  <span className="pk-cat-chip-icon">{c.icon}</span>
                  <span className="pk-cat-chip-label">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pk-note">Note <span className="form-hint">(optional)</span></label>
            <input id="pk-note" type="text" className="form-input" value={note} maxLength={120}
              onChange={(e) => setNote(e.target.value)} placeholder="e.g. Lunch with team" />
          </div>

          <div className="pk-form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="pk-date">Date</label>
              <input id="pk-date" type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Payment</label>
              <div className="pk-seg-toggle">
                {['Cash', 'Card', 'Transfer'].map((m) => (
                  <button type="button" key={m} className={`pk-seg-btn ${paymentMethod === m ? 'pk-seg-btn--active' : ''}`} onClick={() => setPaymentMethod(m)}>{m}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={num <= 0}>Save Expense</button>
          </div>
        </form>
      </div>
    </div>
  )
}
