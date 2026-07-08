import { useState } from 'react'
import { RingGauge, ProgressBar } from './charts'
import { Money } from './PocketBits'
import { goalPct, suggestedMonthly, monthsLeft, formatIQD, monthLabel } from '../../utils/pocketUtils'

export default function PocketGoals({ goals, ui, onAddGoal, onAddFunds, onDeleteGoal }) {
  const [fundsFor, setFundsFor] = useState(null)
  const [fundsAmt, setFundsAmt] = useState('')
  const [newOpen, setNewOpen] = useState(false)
  const [nf, setNf] = useState({ name: '', icon: '🎯', target: '', saved: '', deadline: '' })

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target, 0)
  const overallPct = totalTarget ? Math.round((totalSaved / totalTarget) * 100) : 0

  const commitFunds = (id) => {
    const amt = Number(fundsAmt) || 0
    if (amt > 0) onAddFunds(id, amt)
    setFundsFor(null); setFundsAmt('')
  }
  const submitNew = (e) => {
    e.preventDefault()
    if (!nf.name.trim() || !(Number(nf.target) > 0)) return
    onAddGoal({ name: nf.name, icon: nf.icon, target: nf.target, saved: nf.saved, deadline: nf.deadline || null })
    setNf({ name: '', icon: '🎯', target: '', saved: '', deadline: '' }); setNewOpen(false)
  }

  const FundsInline = ({ id }) => fundsFor === id && (
    <div className="pk-funds-inline">
      <input type="number" min="0" className="form-input" placeholder="Amount" value={fundsAmt} autoFocus
        onChange={(e) => setFundsAmt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && commitFunds(id)} />
      <button className="btn btn-primary btn-sm" onClick={() => commitFunds(id)}>Add</button>
      <button className="btn btn-ghost btn-sm" onClick={() => { setFundsFor(null); setFundsAmt('') }}>✕</button>
    </div>
  )

  return (
    <div className="pk-goals">
      <div className="pk-tab-head">
        <div className="pk-goals-summary card pk-card">
          <span>Saved <strong style={{ color: 'var(--success)' }}>{formatIQD(totalSaved)}</strong> / {formatIQD(totalTarget)}</span>
          <span className="pk-goals-overall">{overallPct}%</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setNewOpen((v) => !v)}>+ New goal</button>
      </div>

      {newOpen && (
        <form className="card pk-card pk-newgoal" onSubmit={submitNew}>
          <div className="pk-form-row">
            <input className="form-input" placeholder="Goal name" value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })} maxLength={60} />
            <input className="form-input pk-icon-input" placeholder="🎯" value={nf.icon} onChange={(e) => setNf({ ...nf, icon: e.target.value })} maxLength={2} />
          </div>
          <div className="pk-form-row">
            <input className="form-input" type="number" min="1" placeholder="Target (IQD)" value={nf.target} onChange={(e) => setNf({ ...nf, target: e.target.value })} />
            <input className="form-input" type="number" min="0" placeholder="Saved so far" value={nf.saved} onChange={(e) => setNf({ ...nf, saved: e.target.value })} />
            <input className="form-input" type="month" value={nf.deadline} onChange={(e) => setNf({ ...nf, deadline: e.target.value })} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setNewOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Add goal</button>
          </div>
        </form>
      )}

      {ui.goalsStyle === 'rings' ? (
        <div className="pk-goal-list">
          {goals.map((g) => {
            const pct = goalPct(g)
            return (
              <div key={g.id} className="card pk-card pk-goal-ringrow">
                <RingGauge pct={pct} size={92} stroke={9} color="var(--primary)">
                  <span className="pk-ring-pct pk-ring-pct--sm">{pct}%</span>
                </RingGauge>
                <div className="pk-goal-info">
                  <div className="pk-goal-name">{g.icon} {g.name} <button className="pk-del" onClick={() => onDeleteGoal(g.id)} aria-label="Delete goal">✕</button></div>
                  <Money amount={g.saved} ui={ui} /> <span className="pk-goal-target">/ {formatIQD(g.target)}</span>
                  <div className="pk-goal-meta">
                    {g.deadline && <span>by {monthLabel(g.deadline)} · {monthsLeft(g.deadline)}mo left</span>}
                    <span>Suggest <strong>{formatIQD(suggestedMonthly(g))}</strong>/mo</span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setFundsFor(g.id)}>+ Add funds</button>
                  <FundsInline id={g.id} />
                </div>
              </div>
            )
          })}
          {!goals.length && <p className="pk-empty">No goals yet — add one above.</p>}
        </div>
      ) : (
        <div className="pk-goal-cards">
          {goals.map((g) => {
            const pct = goalPct(g)
            return (
              <div key={g.id} className="card pk-card pk-goal-card">
                <div className="pk-goal-cardhead">
                  <span className="pk-goal-icon">{g.icon}</span>
                  <span className="pk-goal-name">{g.name}</span>
                  <button className="pk-del" onClick={() => onDeleteGoal(g.id)} aria-label="Delete goal">✕</button>
                </div>
                <div className="pk-goal-amount"><Money amount={g.saved} ui={ui} /> <span className="pk-goal-target">/ {formatIQD(g.target)}</span></div>
                <ProgressBar pct={pct} />
                <div className="pk-goal-meta">
                  <span className="pk-goal-pct">{pct}%</span>
                  {g.deadline && <span>{monthsLeft(g.deadline)}mo left</span>}
                </div>
                <div className="pk-goal-suggest">Suggested <strong>{formatIQD(suggestedMonthly(g))}</strong>/mo{g.deadline ? ` · by ${monthLabel(g.deadline)}` : ''}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setFundsFor(g.id)}>+ Add funds</button>
                <FundsInline id={g.id} />
              </div>
            )
          })}
          <button className="pk-goal-new" onClick={() => setNewOpen(true)}>+ New goal</button>
        </div>
      )}
    </div>
  )
}
