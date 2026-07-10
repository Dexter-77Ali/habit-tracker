import { MonthNav } from '../PocketBits'
import { ArcGauge, ProgressBar } from '../charts'
import {
  budgetForMonth, spent, remaining, spentPct, safeToSpendPerDay,
  categoryBreakdown, expensesForMonth, money, compact, formatIQD,
} from '../../../utils/pocketUtils'

// Meridian premium Pocket Overview — ink hero + 270° arc gauge + hairline stats
// + allocations + recent. Same props/selectors as the classic layouts.
export default function MeridianOverview(props) {
  const { income, expenses, categories, ui, activeMonth, setActiveMonth } = props
  const budget = budgetForMonth(activeMonth, income)
  const spentAmt = spent(expenses, activeMonth, income)
  const remain = remaining(expenses, activeMonth, income)
  const pct = spentPct(expenses, activeMonth, income)
  const safe = safeToSpendPerDay(expenses, activeMonth, income)
  const breakdown = categoryBreakdown(expenses, activeMonth, income, categories)
  const rows = expensesForMonth(expenses, activeMonth, income)
  const recent = [...rows].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
  const catOf = (id) => categories.find((c) => c.id === id) || { icon: '📦', label: id, color: 'rgba(243,242,238,.4)' }
  const remainMoney = money(remain, ui)

  return (
    <div className="pk-overview">
      <div className="pk-tab-head">
        <button className="btn btn-primary btn-sm" onClick={props.onAddExpense}>+ Expense</button>
        <MonthNav activeMonth={activeMonth} setActiveMonth={setActiveMonth} />
      </div>

      <div className="card pk-card pk-hero-meridian">
        <div>
          <div className="pk-section-title" style={{ marginTop: 0 }}>Remaining · {activeMonth}</div>
          <div className="pk-hero-figure">{remainMoney.primary}</div>
          <div className="pk-money-secondary" style={{ marginTop: 6 }}>{remainMoney.secondary}</div>
          <div className="pk-hero-stats">
            <div className="pk-hero-stat">
              <span className="pk-stat-label">Income</span>
              <div className="pk-money-primary">{compact(budget)}</div>
            </div>
            <div className="pk-hero-stat">
              <span className="pk-stat-label">Spent</span>
              <div className="pk-money-primary">{compact(spentAmt)}</div>
            </div>
            <div className="pk-hero-stat">
              <span className="pk-stat-label">Safe / day</span>
              <div className="pk-money-primary pk-hero-safe">{compact(safe)}</div>
            </div>
          </div>
        </div>
        <ArcGauge pct={pct} size={168} stroke={13}>
          <span className="skin-hero-gpct">{pct}<span className="skin-hero-gpctsign">%</span></span>
          <span className="skin-hero-gsub">USED</span>
        </ArcGauge>
      </div>

      <div className="pk-grid pk-grid--main" style={{ marginTop: 'var(--space-4)' }}>
        <div className="card pk-card">
          <h3 className="pk-section-title" style={{ marginTop: 0 }}>Allocations</h3>
          <div className="pk-breakdown">
            {breakdown.map((c) => (
              <div key={c.id} className="pk-breakdown-row">
                <span className="pk-breakdown-label">{c.icon} {c.label}</span>
                <ProgressBar pct={(c.amount / (spentAmt || 1)) * 100} color={c.color} />
                <span className="pk-breakdown-val">{compact(c.amount)}</span>
              </div>
            ))}
            {!breakdown.length && <p className="pk-empty">No expenses this month.</p>}
          </div>
        </div>
        <aside className="pk-rail">
          <div className="card pk-card">
            <h3 className="pk-section-title" style={{ marginTop: 0 }}>Recent</h3>
            <div className="pk-recent">
              {recent.map((e) => {
                const c = catOf(e.categoryId)
                return (
                  <div key={e.id} className="pk-recent-row">
                    <span className="pk-recent-icon" style={{ color: c.color }}>{c.icon}</span>
                    <span className="pk-recent-note">{e.note || c.label}</span>
                    <span className="pk-recent-amt">−{compact(e.amount)}</span>
                  </div>
                )
              })}
              {!recent.length && <p className="pk-empty">No expenses yet.</p>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
