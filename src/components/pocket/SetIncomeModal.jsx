import { useState, useEffect, useRef } from 'react'
import { toUSD } from '../../utils/pocketUtils'

export default function SetIncomeModal({ income, ui, onSave, onClose }) {
  const [amount, setAmount] = useState(String(income.amount || ''))
  const [source, setSource] = useState(income.source || 'Salary')
  const [recurring, setRecurring] = useState(income.recurring ?? true)
  const firstRef = useRef(null)

  useEffect(() => { firstRef.current?.focus() }, [])
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const num = Number(amount) || 0
  const submit = (e) => {
    e.preventDefault()
    if (num <= 0) return
    onSave({ amount: num, source, recurring })
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="pk-inc-title">
        <div className="modal-header">
          <h2 id="pk-inc-title">Monthly Income</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="pk-inc-amount">Amount (IQD)</label>
            <input id="pk-inc-amount" ref={firstRef} type="number" min="0" inputMode="numeric"
              className="form-input pk-amount-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
            <p className="form-hint pk-usd-hint">≈ ${toUSD(num, ui.iqdRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="pk-inc-source">Source</label>
            <input id="pk-inc-source" type="text" className="form-input" value={source} maxLength={40} onChange={(e) => setSource(e.target.value)} placeholder="Salary" />
          </div>
          <label className="pk-check-row">
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
            <span>Repeat every month</span>
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={num <= 0}>Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
