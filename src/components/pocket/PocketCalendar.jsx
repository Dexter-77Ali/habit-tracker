import { MonthNav } from './PocketBits'
import { compact, formatIQD, daySpend, daysInMonth } from '../../utils/pocketUtils'
import { getDateKey, dateFromKey } from '../../utils/dateUtils'

export default function PocketCalendar({ expenses, categories, ui, activeMonth, setActiveMonth, selectedDate, setSelectedDate }) {
  const [y, m] = activeMonth.split('-').map(Number)
  const nDays = daysInMonth(activeMonth)
  const firstWeekday = new Date(y, m - 1, 1).getDay() // 0=Sun
  const days = []
  for (let d = 1; d <= nDays; d++) days.push(getDateKey(new Date(y, m - 1, d)))

  const monthRows = expenses.filter((e) => e.date.slice(0, 7) === activeMonth)
  const monthTotal = monthRows.reduce((s, e) => s + e.amount, 0)
  const spentDays = new Set(monthRows.map((e) => e.date)).size || 1
  const dayMax = Math.max(1, ...days.map((dk) => daySpend(expenses, dk)))
  const sel = selectedDate && selectedDate.slice(0, 7) === activeMonth ? selectedDate : null
  const catOf = (id) => categories.find((c) => c.id === id) || { icon: '📦', label: id, color: '#94a3b8' }
  const tint = (amt) => amt <= 0 ? 'transparent' : `color-mix(in srgb, var(--primary) ${Math.round(8 + (amt / dayMax) * 42)}%, transparent)`

  const HeadStats = () => (
    <div className="pk-cal-headstats">
      <span>Month total <strong>{formatIQD(monthTotal)}</strong></span>
      <span>Daily avg <strong>{compact(monthTotal / spentDays)}</strong></span>
    </div>
  )
  const DayPanel = () => {
    const items = sel ? monthRows.filter((e) => e.date === sel) : []
    return (
      <aside className="card pk-card pk-cal-panel">
        {sel ? <>
          <h3 className="pk-section-title">{dateFromKey(sel).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
          <div className="pk-cal-panel-total">{formatIQD(daySpend(expenses, sel))} · {items.length} item{items.length !== 1 ? 's' : ''}</div>
          <div className="pk-recent">
            {items.map((e) => { const c = catOf(e.categoryId); return (
              <div key={e.id} className="pk-recent-row">
                <span className="pk-recent-icon" style={{ color: c.color }}>{c.icon}</span>
                <span className="pk-recent-note">{e.note || c.label}</span>
                <span className="pk-recent-amt">−{compact(e.amount)}</span>
              </div>) })}
            {!items.length && <p className="pk-empty">No expenses this day.</p>}
          </div>
        </> : <p className="pk-empty">Select a day to see its expenses.</p>}
      </aside>
    )
  }

  if (ui.calendarStyle === 'agenda') {
    const byDay = {}
    for (const e of monthRows) (byDay[e.date] ||= []).push(e)
    const sortedDays = Object.keys(byDay).sort().reverse()
    return (
      <div className="pk-calendar">
        <div className="pk-tab-head"><HeadStats /><MonthNav activeMonth={activeMonth} setActiveMonth={setActiveMonth} /></div>
        <div className="pk-grid pk-grid--agenda">
          <div className="card pk-card pk-minimonth">
            <div className="pk-cal-grid pk-cal-grid--mini">
              {['S','M','T','W','T','F','S'].map((d, i) => <span key={i} className="pk-cal-dow">{d}</span>)}
              {Array.from({ length: firstWeekday }).map((_, i) => <span key={`b${i}`} />)}
              {days.map((dk) => {
                const amt = daySpend(expenses, dk)
                return <button key={dk} className={`pk-mini-cell ${sel === dk ? 'pk-mini-cell--sel' : ''}`}
                  style={{ background: sel === dk ? 'var(--primary)' : tint(amt) }}
                  onClick={() => setSelectedDate(dk)}>{dateFromKey(dk).getDate()}</button>
              })}
            </div>
            <div className="pk-cal-panel-total">Month total <strong>{formatIQD(monthTotal)}</strong></div>
          </div>
          <div className="card pk-card pk-agenda">
            {sortedDays.map((day) => (
              <div key={day} className="pk-ledger-day">
                <div className="pk-ledger-dayhead">
                  <span>{dateFromKey(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="pk-ledger-daytotal">−{compact(byDay[day].reduce((s, e) => s + e.amount, 0))}</span>
                </div>
                {byDay[day].map((e) => { const c = catOf(e.categoryId); return (
                  <div key={e.id} className="pk-ledger-row">
                    <span className="pk-ledger-cat"><span style={{ color: c.color }}>{c.icon}</span> {e.note || c.label}</span>
                    <span className="pk-ledger-amt">−{compact(e.amount)}</span>
                  </div>) })}
              </div>
            ))}
            {!sortedDays.length && <p className="pk-empty">No expenses this month.</p>}
          </div>
        </div>
      </div>
    )
  }

  // heat grid (default)
  return (
    <div className="pk-calendar">
      <div className="pk-tab-head"><HeadStats /><MonthNav activeMonth={activeMonth} setActiveMonth={setActiveMonth} /></div>
      <div className="pk-grid pk-grid--cal">
        <div className="card pk-card">
          <div className="pk-cal-grid">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <span key={d} className="pk-cal-dow">{d.slice(0,1)}</span>)}
            {Array.from({ length: firstWeekday }).map((_, i) => <span key={`b${i}`} className="pk-cal-cell pk-cal-cell--blank" />)}
            {days.map((dk) => {
              const amt = daySpend(expenses, dk)
              return (
                <button key={dk}
                  className={`pk-cal-cell ${sel === dk ? 'pk-cal-cell--sel' : ''}`}
                  style={{ background: tint(amt) }}
                  onClick={() => setSelectedDate(dk)}>
                  <span className="pk-cal-date">{dateFromKey(dk).getDate()}</span>
                  {amt > 0 && <span className="pk-cal-amt">{compact(amt)}</span>}
                </button>
              )
            })}
          </div>
        </div>
        <DayPanel />
      </div>
    </div>
  )
}
