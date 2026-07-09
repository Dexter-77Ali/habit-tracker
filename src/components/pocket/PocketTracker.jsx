import { useState, useCallback } from 'react'
import { usePersistedStorage } from '../../hooks/usePersistedStorage'
import {
  SEED_CATEGORIES, seedGoals, seedExpenses,
  DEFAULT_POCKET_INCOME, DEFAULT_POCKET_UI, todayMonthKey,
} from '../../utils/pocketUtils'
import PocketOverview from './PocketOverview'
import PocketCalendar from './PocketCalendar'
import PocketStats from './PocketStats'
import PocketGoals from './PocketGoals'
import PocketSettings from './PocketSettings'
import AddExpenseModal from './AddExpenseModal'
import SetIncomeModal from './SetIncomeModal'

const TABS = [
  { id: 'overview', label: 'Overview', icon: '▦' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'stats',    label: 'Stats',    icon: '📊' },
  { id: 'goals',    label: 'Goals',    icon: '🎯' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function PocketTracker({ onExit }) {
  // Persisted financial state (synced via SYNC_KEYS, isolated from gamification)
  const [income, setIncome] = usePersistedStorage('ht_pocket_income', DEFAULT_POCKET_INCOME)
  const [expenses, setExpenses] = usePersistedStorage('ht_pocket_expenses', seedExpenses())
  const [categories, setCategories] = usePersistedStorage('ht_pocket_categories', SEED_CATEGORIES)
  const [goals, setGoals] = usePersistedStorage('ht_pocket_goals', seedGoals())
  const [ui, setUi] = usePersistedStorage('ht_pocket_ui', DEFAULT_POCKET_UI)

  // Transient view state
  const [tab, setTab] = useState('overview')
  const [activeMonth, setActiveMonth] = useState(todayMonthKey())
  const [selectedDate, setSelectedDate] = useState(null)
  const [expenseModal, setExpenseModal] = useState(false)
  const [incomeModal, setIncomeModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const patchUi = useCallback((patch) => setUi((u) => ({ ...u, ...patch })), [setUi])

  // ── Expense CRUD (validated) ──────────────────────────────
  const addExpense = useCallback((data) => {
    const amount = Math.min(Math.max(Number(data.amount) || 0, 0), 1_000_000_000)
    if (amount <= 0) return
    if (!categories.some((c) => c.id === data.categoryId)) return
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) return
    setExpenses((prev) => [...prev, {
      id: crypto.randomUUID(), amount, currency: 'IQD',
      categoryId: data.categoryId, note: (data.note || '').slice(0, 120),
      date: data.date, paymentMethod: data.paymentMethod || 'Card',
    }])
  }, [categories, setExpenses])
  const deleteExpense = useCallback((id) => setExpenses((prev) => prev.filter((e) => e.id !== id)), [setExpenses])

  // ── Goal CRUD ─────────────────────────────────────────────
  const addGoal = useCallback((data) => {
    setGoals((prev) => [...prev, {
      id: crypto.randomUUID(), name: (data.name || 'Goal').slice(0, 60), icon: data.icon || '🎯',
      target: Math.max(1, Number(data.target) || 1), saved: Math.max(0, Number(data.saved) || 0),
      deadline: data.deadline || null,
    }])
  }, [setGoals])
  const addFunds = useCallback((id, amt) => {
    const add = Math.max(0, Number(amt) || 0)
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, saved: Math.min(g.target, g.saved + add) } : g))
  }, [setGoals])
  const editGoal = useCallback((id, data) => setGoals((prev) => prev.map((g) => g.id === id ? { ...g, ...data } : g)), [setGoals])
  const deleteGoal = useCallback((id) => setGoals((prev) => prev.filter((g) => g.id !== id)), [setGoals])

  // ── Category CRUD ─────────────────────────────────────────
  const addCategory = useCallback((data) => {
    const id = (data.label || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || crypto.randomUUID()
    setCategories((prev) => prev.some((c) => c.id === id) ? prev : [...prev, {
      id, label: (data.label || 'New').slice(0, 24), icon: data.icon || '📦', color: data.color || '#94a3b8',
    }])
  }, [setCategories])
  const deleteCategory = useCallback((id) => setCategories((prev) => prev.filter((c) => c.id !== id)), [setCategories])

  const shared = {
    income, expenses, categories, goals, ui,
    activeMonth, setActiveMonth, selectedDate, setSelectedDate,
    onAddExpense: () => setExpenseModal(true),
    onSetIncome: () => setIncomeModal(true),
    onShowHistory: () => setShowHistory(true),
    onDeleteExpense: deleteExpense,
  }

  return (
    <div className="pocket">
      <div className="pocket-head">
        <div className="pocket-brand">
          <span className="pocket-wordmark">POCKET TRACKER</span>
          <button className="pocket-breadcrumb" onClick={onExit} title="Back to Life Tracker">
            LIFE TRACKER · MONTHLY BUDGET
          </button>
        </div>
        <nav className="pocket-tabs" role="tablist">
          <button className="pocket-tab pocket-tab--exit" onClick={onExit} title="Back to Life Tracker">
            <span className="pocket-tab-icon">‹</span>
            <span className="pocket-tab-label">Exit</span>
          </button>
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`pocket-tab ${tab === t.id ? 'pocket-tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className="pocket-tab-icon">{t.icon}</span>
              <span className="pocket-tab-label">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="pocket-body">
        {tab === 'overview' && <PocketOverview {...shared} showHistory={showHistory} onCloseHistory={() => setShowHistory(false)} />}
        {tab === 'calendar' && <PocketCalendar {...shared} />}
        {tab === 'stats' && <PocketStats {...shared} />}
        {tab === 'goals' && <PocketGoals {...shared} onAddGoal={addGoal} onAddFunds={addFunds} onEditGoal={editGoal} onDeleteGoal={deleteGoal} />}
        {tab === 'settings' && (
          <PocketSettings
            income={income} setIncome={setIncome} ui={ui} patchUi={patchUi}
            categories={categories} onAddCategory={addCategory} onDeleteCategory={deleteCategory}
            expenses={expenses} onClearSamples={() => setExpenses([])}
            onEditIncome={() => setIncomeModal(true)}
          />
        )}
      </div>

      {expenseModal && (
        <AddExpenseModal
          categories={categories} ui={ui}
          onSave={(d) => { addExpense(d); setExpenseModal(false) }}
          onClose={() => setExpenseModal(false)}
        />
      )}
      {incomeModal && (
        <SetIncomeModal
          income={income} ui={ui}
          onSave={(d) => { setIncome((prev) => ({ ...prev, ...d })); setIncomeModal(false) }}
          onClose={() => setIncomeModal(false)}
        />
      )}
    </div>
  )
}
