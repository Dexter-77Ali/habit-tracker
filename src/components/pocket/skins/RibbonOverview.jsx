import { MonthNav } from '../PocketBits'
import { BudgetRibbon, ProgressBar } from '../charts'
import {
  budgetForMonth, spent, remaining, safeToSpendPerDay,
  categoryBreakdown, expensesForMonth, money, compact, formatIQD,
} from '../../../utils/pocketUtils'

// Shared premium Overview for the ribbon skins: Terra (soft) and Bolt (ink).
// Hero = remaining figure + segmented budget ribbon w/ hatch remainder.
export default function RibbonOverview({ ink = false, hatchA, hatchB, ...props }) {
  const { income, expenses, categories, ui, activeMonth, setActiveMonth } = props
  const budget = budgetForMonth(activeMonth, income)
  const spentAmt = spent(expenses, activeMonth, income)
  const remain = remaining(expenses, activeMonth, income)
  const safe = safeToSpendPerDay(expenses, activeMonth, income)
  const breakdown = categoryBreakdown(expenses, activeMonth, income, categories)
  const rows = expensesForMonth(expenses, activeMonth, income)
  const recent = [...rows].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
  const catOf = (id) => categories.find((c) => c.id === id) || { icon: '📦', label: id, color: '#a59a89' }
  const remainMoney = money(remain, ui)

  return (
    <div className="pk-overview">
      <div className="pk-tab-head">
        <button className="btn btn-primary btn-sm" onClick={props.onAddExpense}>+ Expense</button>
        <MonthNav activeMonth={activeMonth} setActiveMonth={setActiveMonth} />
      </div>

      <div className="card pk-card pk-hero-ribbon">
        <div className="pk-section-title" style={{ marginTop: 0 }}>Remaining this month</div>
        <div className="pk-hero-figure pk-hero-figure--ribbon">{remainMoney.primary}</div>
        <div className="pk-money-secondary">{remainMoney.secondary}</div>
        <div style={{ marginTop: 20 }}>
          <BudgetRibbon
            ink={ink}
            height={ink ? 22 : 14}
            hatchA={hatchA}
            hatchB={hatchB}
            total={budget || 1}
            segments={breakdown.map((c) => ({ value: c.amount, color: c.color, label: c.label }))}
          />
          <div className="pk-hero-ribbonline">
            Spent <strong>{formatIQD(spentAmt)}</strong> · Budget <strong>{formatIQD(budget)}</strong> · Safe <strong>{compact(safe)}</strong>/day
          </div>
        </div>
      </div>

      <div className="pk-grid pk-grid--main" style={{ marginTop: 'var(--space-4)' }}>
        <div className="card pk-card">
          <h3 className="pk-section-title" style={{ marginTop: 0 }}>Where it went</h3>
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
