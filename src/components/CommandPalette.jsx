import { useState, useEffect, useRef, useMemo } from 'react'

// Ctrl/Cmd+K palette: jump pages, toggle items, start timers, quick-add.
export default function CommandPalette({ habits, tasks, todayLog, onToggleHabit, onToggleTask, onTimer, onNavigate, onQuickAddHabit, onQuickAddTask, onClose }) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const actions = useMemo(() => {
    const list = [
      { id: 'nav-dashboard', label: '📋 Go to Dashboard', run: () => onNavigate('dashboard') },
      { id: 'nav-goals', label: '🎯 Go to Goals', run: () => onNavigate('goals') },
      { id: 'nav-analytics', label: '📊 Go to Analytics', run: () => onNavigate('analytics') },
      { id: 'nav-pocket', label: '💰 Go to Pocket Tracker', run: () => onNavigate('pocket') },
    ]
    for (const h of habits) {
      const done = !!todayLog[h.id]
      list.push({ id: `h-${h.id}`, label: `${done ? '✅' : '▢'} ${h.icon?.startsWith('/') || h.icon?.startsWith('data:') ? '' : h.icon || ''} ${h.name} — ${done ? 'un-check' : 'check off'}`, run: () => onToggleHabit(h.id) })
      list.push({ id: `ht-${h.id}`, label: `⏱ ${h.name} — start/stop timer`, run: () => onTimer(h.id, 'habit') })
    }
    for (const t of tasks.filter((t) => !t.completed)) {
      list.push({ id: `t-${t.id}`, label: `▢ ${t.name} — complete task`, run: () => onToggleTask(t.id) })
      list.push({ id: `tt-${t.id}`, label: `⏱ ${t.name} — start/stop timer`, run: () => onTimer(t.id, 'task') })
    }
    return list
  }, [habits, tasks, todayLog, onNavigate, onToggleHabit, onToggleTask, onTimer])

  const q = query.trim().toLowerCase()
  const addMode = q.startsWith('add ')
  const filtered = useMemo(() => {
    if (addMode) {
      const rest = query.trim().slice(4)
      return [
        { id: 'add-habit', label: `➕ Add habit: "${rest}"`, run: () => onQuickAddHabit(rest) },
        { id: 'add-task', label: `➕ Add task: "${rest}"`, run: () => onQuickAddTask(rest) },
      ]
    }
    if (!q) return actions.slice(0, 12)
    return actions
      .map((a) => ({ a, score: fuzzyScore(a.label.toLowerCase(), q) }))
      .filter((x) => x.score > 0)
      .sort((x, y) => y.score - x.score)
      .slice(0, 12)
      .map((x) => x.a)
  }, [q, addMode, query, actions, onQuickAddHabit, onQuickAddTask])

  useEffect(() => { setIndex(0) }, [q])

  const run = (a) => { a.run(); onClose() }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((i) => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && filtered[index]) { e.preventDefault(); run(filtered[index]) }
    else if (e.key === 'Escape') onClose()
  }

  return (
    <div className="modal-overlay palette-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <input
          ref={inputRef}
          className="palette-input"
          placeholder="Type to jump, check off, start timers… ('add …' to create)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <ul className="palette-list">
          {filtered.map((a, i) => (
            <li key={a.id}>
              <button
                className={`palette-item ${i === index ? 'palette-item--active' : ''}`}
                onMouseEnter={() => setIndex(i)}
                onClick={() => run(a)}
              >{a.label}</button>
            </li>
          ))}
          {filtered.length === 0 && <li className="palette-empty">No matches</li>}
        </ul>
        <div className="palette-hint">↑↓ navigate · Enter run · Esc close</div>
      </div>
    </div>
  )
}

/** Subsequence match: all query chars in order; contiguous runs score higher. */
function fuzzyScore(text, q) {
  let ti = 0, score = 0, streakLen = 0
  for (const ch of q) {
    const found = text.indexOf(ch, ti)
    if (found === -1) return 0
    streakLen = found === ti ? streakLen + 1 : 1
    score += streakLen
    ti = found + 1
  }
  return score
}
