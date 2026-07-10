import { MonthNav, Money } from './PocketBits'
import { RingGauge, Donut, SegmentedBar, ProgressBar } from './charts'
import {
  budgetForMonth, spent, remaining, spentPct, safeToSpendPerDay,
  categoryBreakdown, expensesForMonth, money, compact, formatIQD,
} from '../../utils/pocketUtils'
import { dateFromKey } from '../../utils/dateUtils'
import ExpenseHistory from './ExpenseHistory'
import { useSkin } from '../../skins/useSkin'
import MeridianOverview from './skins/MeridianOverview'

// Premium skins bring their own Overview renderer; classic keeps ui.dashboardStyle.
const SKIN_OVERVIEWS = { meridian: MeridianOverview }

export default function PocketOverview(props) {
  const { income, expenses, categories, ui, activeMonth, setActiveMonth, showHistory, onCloseHistory } = props
  const skin = useSkin()

  if (showHistory) {
    return <ExpenseHistory expenses={expenses} categories={categories} ui={ui} onClose={onCloseHistory} onDelete={props.onDeleteExpense} />
  }

  const SkinOverview = SKIN_OVERVIEWS[skin]
  if (SkinOverview) return <SkinOverview {...props} />

  const budget = budgetForMonth(activeMonth, income)
  const spentAmt = spent(expenses, activeMonth, income)
  const remain = remaining(expenses, activeMonth, income)
  const pct = spentPct(expenses, activeMonth, income)
  const breakdown = categoryBreakdown(expenses, activeMonth, income, categories)
  const rows = expensesForMonth(expenses, activeMonth, income)
  const recent = [...rows].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)
  const catOf = (id) => categories.find((c) => c.id === id) || { icon: '📦', label: id, color: '#94a3b8' }

  return (
    <div className="pk-overview">
      <div className="pk-tab-head">
        <div className="pk-actions">
          <button className="btn btn-primary btn-sm" onClick={props.onAddExpense}>+ Expense</button>
          {!income?.amount && <button className="btn btn-ghost btn-sm" onClick={props.onSetIncome}>Set income</button>}
        </div>
        <MonthNav activeMonth={activeMonth} setActiveMonth={setActiveMonth} />
      </div>

      {ui.dashboardStyle === 'ring' && (
        <RingLayout {...{ budget, spentAmt, remain, pct, breakdown, recent, catOf, ui, income, expenses, activeMonth }} onShowHistory={props.onShowHistory} />
      )}
      {ui.dashboardStyle === 'ledger' && (
        <LedgerLayout {...{ budget, spentAmt, remain, breakdown, rows, catOf, ui }} />
      )}
      {ui.dashboardStyle === 'cards' && (
        <CardsLayout {...{ budget, spentAmt, remain, pct, breakdown, recent, catOf, ui }} onShowHistory={props.onShowHistory} />
      )}
    </div>
  )
}

// ── 1a Budget Ring ───────────────────────────────────────────
function RingLayout({ budget, spentAmt, remain, pct, breakdown, recent, catOf, ui, income, expenses, activeMonth }) {
  const safe = safeToSpendPerDay(expenses, activeMonth, income)
  return (
    <div className="pk-grid pk-grid--main">
      <div className="card pk-card">
        <div className="pk-ring-row">
          <RingGauge pct={pct} color="var(--primary)">
            <span className="pk-ring-pct">{pct}%</span>
            <span className="pk-ring-sub">spent</span>
          </RingGauge>
          <div className="pk-ring-stats">
            <Stat label="Income" amount={budget} ui={ui} tone="income" />
            <Stat label="Spent" amount={spentAmt} ui={ui} tone="expense" />
            <Stat label="Remaining" amount={remain} ui={ui} tone="remaining" />
            <div className="pk-safe">Safe to spend <strong>{formatIQD(safe)}</strong>/day</div>
          </div>
        </div>
        <h3 className="pk-section-title">Category breakdown</h3>
        <div className="pk-breakdown pk-breakdown--2col">
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
      <RecentRail recent={recent} catOf={catOf} ui={ui} />
    </div>
  )
}

// ── 1b Ledger Flow ───────────────────────────────────────────
function LedgerLayout({ budget, spentAmt, remain, breakdown, rows, catOf, ui }) {
  const byDay = groupByDay(rows)
  return (
    <div className="pk-grid pk-grid--main">
      <div className="card pk-card">
        <SegmentedBar total={budget} segments={[...breakdown.map((c) => ({ value: c.amount, color: c.color, label: c.label }))]} />
        <div className="pk-legend">
          <span><i className="pk-dot" style={{ background: 'var(--danger)' }} /> Spent {compact(spentAmt)}</span>
          <span><i className="pk-dot" style={{ background: 'var(--surface-2)' }} /> Remaining {compact(remain)}</span>
        </div>
        <h3 className="pk-section-title">Transactions</h3>
        <div className="pk-ledger">
          {byDay.map(([day, items]) => (
            <div key={day} className="pk-ledger-day">
              <div className="pk-ledger-dayhead">
                <span>{dateFromKey(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className="pk-ledger-daytotal">−{compact(items.reduce((s, e) => s + e.amount, 0))}</span>
              </div>
              {items.map((e) => {
                const c = catOf(e.categoryId)
                return (
                  <div key={e.id} className="pk-ledger-row">
                    <span className="pk-ledger-cat"><span style={{ color: c.color }}>{c.icon}</span> {e.note || c.label}</span>
                    <span className="pk-ledger-amt">−{compact(e.amount)}</span>
                  </div>
                )
              })}
            </div>
          ))}
          {!rows.length && <p className="pk-empty">No transactions this month.</p>}
        </div>
      </div>
      <aside className="pk-rail">
        <div className="card pk-card"><Stat label="Income" amount={budget} ui={ui} tone="income" /></div>
        <div className="card pk-card"><Stat label="Spent" amount={spentAmt} ui={ui} tone="expense" /></div>
        <div className="card pk-card"><Stat label="Remaining" amount={remain} ui={ui} tone="remaining" /></div>
      </aside>
    </div>
  )
}

// ── 1c Stat Cards + Donut ────────────────────────────────────
function CardsLayout({ budget, spentAmt, remain, pct, breakdown, recent, catOf, ui, onShowHistory }) {
  const savedPct = budget ? Math.max(0, Math.round((remain / budget) * 100)) : 0
  return (
    <div className="pk-cards-layout">
      <div className="pk-kpi-row">
        <KpiCard label="Income" amount={budget} ui={ui} tone="income" />
        <KpiCard label="Spent" amount={spentAmt} ui={ui} tone="expense" />
        <KpiCard label="Remaining" amount={remain} ui={ui} tone="remaining" />
        <div className="card pk-card pk-kpi">
          <span className="pk-kpi-label">Saved</span>
          <span className="pk-kpi-value" style={{ color: 'var(--success)' }}>{savedPct}%</span>
        </div>
      </div>
      <div className="pk-grid pk-grid--donut">
        <div className="card pk-card pk-donut-card">
          <h3 className="pk-section-title">By category</h3>
          <div className="pk-donut-row">
            <Donut segments={breakdown.map((c) => ({ value: c.amount, color: c.color }))}>
              <span className="pk-ring-pct">{pct}%</span>
              <span className="pk-ring-sub">spent</span>
            </Donut>
            <div className="pk-donut-legend">
              {breakdown.slice(0, 8).map((c) => (
                <span key={c.id} className="pk-legend-item"><i className="pk-dot" style={{ background: c.color }} /> {c.label} <b>{compact(c.amount)}</b></span>
              ))}
            </div>
          </div>
        </div>
        <div className="card pk-card">
          <div className="pk-section-titlerow">
            <h3 className="pk-section-title">Recent</h3>
            <button className="pk-link" onClick={onShowHistory}>View all</button>
          </div>
          <table className="pk-table">
            <tbody>
              {recent.map((e) => {
                const c = catOf(e.categoryId)
                return (
                  <tr key={e.id}>
                    <td>{e.note || c.label}</td>
                    <td className="pk-table-cat"><span style={{ color: c.color }}>{c.icon}</span> {c.label}</td>
                    <td className="pk-table-amt">−{compact(e.amount)}</td>
                  </tr>
                )
              })}
              {!recent.length && <tr><td colSpan={3}><p className="pk-empty">No expenses yet.</p></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── shared bits ──────────────────────────────────────────────
function Stat({ label, amount, ui, tone }) {
  return (
    <div className="pk-stat">
      <span className="pk-stat-label">{label}</span>
      <Money amount={amount} ui={ui} tone={tone} />
    </div>
  )
}
function KpiCard({ label, amount, ui, tone }) {
  const { primary, secondary } = money(amount, ui)
  const color = tone === 'income' ? 'var(--success)' : tone === 'expense' ? 'var(--danger)' : tone === 'remaining' ? 'var(--cyan)' : undefined
  return (
    <div className="card pk-card pk-kpi">
      <span className="pk-kpi-label">{label}</span>
      <span className="pk-kpi-value" style={color ? { color } : undefined}>{primary}</span>
      <span className="pk-kpi-sub">{secondary}</span>
    </div>
  )
}
function RecentRail({ recent, catOf, ui }) {
  return (
    <aside className="pk-rail">
      <div className="card pk-card">
        <h3 className="pk-section-title">Recent</h3>
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
  )
}
function groupByDay(rows) {
  const map = {}
  for (const e of rows) (map[e.date] ||= []).push(e)
  return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
}
