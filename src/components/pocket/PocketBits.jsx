import { addMonth, monthLabel, money } from '../../utils/pocketUtils'

/** ‹ prev · Month Year · next › selector, drives every figure on the tab. */
export function MonthNav({ activeMonth, setActiveMonth }) {
  return (
    <div className="pk-monthnav">
      <button className="pk-monthnav-btn" onClick={() => setActiveMonth(addMonth(activeMonth, -1))} aria-label="Previous month">‹</button>
      <span className="pk-monthnav-label">{monthLabel(activeMonth)}</span>
      <button className="pk-monthnav-btn" onClick={() => setActiveMonth(addMonth(activeMonth, 1))} aria-label="Next month">›</button>
    </div>
  )
}

/** Dual-currency amount: primary big, secondary small underneath. */
export function Money({ amount, ui, className = '', tone }) {
  const { primary, secondary } = money(amount, ui)
  const color = tone === 'income' ? 'var(--success)' : tone === 'expense' ? 'var(--danger)' : tone === 'remaining' ? 'var(--cyan)' : undefined
  return (
    <span className={`pk-money ${className}`}>
      <span className="pk-money-primary" style={color ? { color } : undefined}>{primary}</span>
      <span className="pk-money-secondary">{secondary}</span>
    </span>
  )
}
