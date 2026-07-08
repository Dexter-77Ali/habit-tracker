import { useState } from 'react'
import { MonthNav } from './PocketBits'
import { Bars, TrendLine, RankedBars } from './charts'
import {
  weeklyBuckets, monthlyTotals, categoryBreakdown, spent,
  addMonth, monthShort, compact,
} from '../../utils/pocketUtils'

export default function PocketStats({ income, expenses, categories, ui, activeMonth, setActiveMonth }) {
  const [period, setPeriod] = useState('6M')

  const weekly = weeklyBuckets(expenses, activeMonth, income)
  const trend6 = monthlyTotals(expenses, activeMonth, income, 6)
  const trend = period === 'Week'
    ? weekly.map((w) => ({ label: w.label, amount: w.amount }))
    : period === 'Month'
      ? monthlyTotals(expenses, activeMonth, income, 4).map((t) => ({ label: t.label, amount: t.amount }))
      : trend6
  const top = categoryBreakdown(expenses, activeMonth, income, categories).slice(0, 6)

  const prevMonth = addMonth(activeMonth, -1)
  const thisCats = categoryBreakdown(expenses, activeMonth, income, categories)
  const prevCats = categoryBreakdown(expenses, prevMonth, income, categories)
  const compareIds = [...new Set([...thisCats, ...prevCats].map((c) => c.id))].slice(0, 6)
  const compare = compareIds.map((id) => {
    const t = thisCats.find((c) => c.id === id)?.amount || 0
    const p = prevCats.find((c) => c.id === id)?.amount || 0
    const cat = categories.find((c) => c.id === id) || { label: id, icon: '📦', color: '#94a3b8' }
    const delta = p ? Math.round(((t - p) / p) * 100) : (t ? 100 : 0)
    return { ...cat, t, p, delta }
  })

  const amounts = trend.map((t) => t.amount)
  const avg = amounts.length ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0
  const high = Math.max(0, ...amounts), low = amounts.length ? Math.min(...amounts) : 0

  const WeeklyPanel = () => (
    <div className="card pk-card">
      <h3 className="pk-section-title">Weekly spend</h3>
      <Bars data={weekly.map((w, i) => ({ ...w, muted: i >= currentWeekIndex(activeMonth) + 1 }))} color="var(--primary)" format={compact} />
    </div>
  )
  const TrendPanel = ({ big }) => (
    <div className="card pk-card">
      <div className="pk-section-titlerow">
        <h3 className="pk-section-title">{big ? 'Trend' : '6-month trend'}</h3>
        {big && <div className="pk-seg-toggle">
          {['Week', 'Month', '6M'].map((p) => (
            <button key={p} className={`pk-seg-btn ${period === p ? 'pk-seg-btn--active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>}
      </div>
      <TrendLine points={trend} color="var(--cyan)" height={big ? 200 : 150} format={compact} />
      {big && <div className="pk-focus-stats">
        <span>Avg <strong>{compact(avg)}</strong></span>
        <span>High <strong style={{ color: 'var(--danger)' }}>{compact(high)}</strong></span>
        <span>Low <strong style={{ color: 'var(--success)' }}>{compact(low)}</strong></span>
      </div>}
    </div>
  )
  const ComparePanel = () => (
    <div className="card pk-card">
      <h3 className="pk-section-title">{monthShort(activeMonth)} vs {monthShort(prevMonth)}</h3>
      <div className="pk-compare">
        {compare.map((c) => (
          <div key={c.id} className="pk-compare-row">
            <span className="pk-compare-label">{c.icon} {c.label}</span>
            <div className="pk-compare-bars">
              <div className="pk-compare-bar"><div className="pk-compare-fill" style={{ width: pctOf(c.p, compare), background: '#6b5a8c' }} /></div>
              <div className="pk-compare-bar"><div className="pk-compare-fill" style={{ width: pctOf(c.t, compare), background: c.color }} /></div>
            </div>
            <span className={`pk-delta ${c.delta > 0 ? 'pk-delta--up' : c.delta < 0 ? 'pk-delta--down' : ''}`}>
              {c.delta > 0 ? '+' : ''}{c.delta}%
            </span>
          </div>
        ))}
        {!compare.length && <p className="pk-empty">Not enough data.</p>}
      </div>
    </div>
  )
  const TopPanel = () => (
    <div className="card pk-card">
      <h3 className="pk-section-title">Top categories</h3>
      <RankedBars data={top} format={compact} />
      {!top.length && <p className="pk-empty">No expenses this month.</p>}
    </div>
  )

  return (
    <div className="pk-stats">
      <div className="pk-tab-head">
        <div className="pk-seg-toggle">
          <button className={`pk-seg-btn ${ui.statsStyle === 'grid' ? 'pk-seg-btn--active' : ''}`} disabled>Grid</button>
        </div>
        <MonthNav activeMonth={activeMonth} setActiveMonth={setActiveMonth} />
      </div>
      {ui.statsStyle === 'focus' ? (
        <div className="pk-stats-focus">
          <TrendPanel big />
          <div className="pk-grid pk-grid--2">
            <TopPanel />
            <ComparePanel />
          </div>
        </div>
      ) : (
        <div className="pk-grid pk-grid--2x2">
          <WeeklyPanel />
          <TrendPanel />
          <ComparePanel />
          <TopPanel />
        </div>
      )}
    </div>
  )
}

function currentWeekIndex(mKey) {
  const now = new Date()
  if (mKey !== `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`) return 4
  return Math.min(4, Math.floor((now.getDate() - 1) / 7))
}
function pctOf(v, rows) {
  const max = Math.max(1, ...rows.flatMap((r) => [r.t, r.p]))
  return `${(v / max) * 100}%`
}
