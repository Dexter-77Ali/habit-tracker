import { v4 as uuidv4 } from 'uuid'
import { getDateKey, dateFromKey } from './dateUtils'

// ─────────────────────────────────────────────────────────────
// Pocket Tracker — pure financial helpers. No XP/gamification.
// All stored amounts are canonical IQD; USD is a display-only
// conversion via the configurable rate. This keeps every sum in
// one currency and avoids mixed-currency bugs.
// ─────────────────────────────────────────────────────────────

export const DEFAULT_IQD_RATE = 1310 // IQD per 1 USD (configurable in Settings)
export const PAYMENT_METHODS = ['Cash', 'Card', 'Transfer']

// Category identity colors — fixed & theme-agnostic (like the app's tag palette),
// so a category reads the same in every theme.
export const SEED_CATEGORIES = [
  { id: 'food',          label: 'Food',          icon: '🍔', color: '#ff6b6b' },
  { id: 'grocery',       label: 'Grocery',       icon: '🛒', color: '#4ade80' },
  { id: 'clothing',      label: 'Clothing',      icon: '👕', color: '#c084fc' },
  { id: 'travel',        label: 'Travel',        icon: '✈️', color: '#38bdf8' },
  { id: 'rent',          label: 'Rent',          icon: '🏠', color: '#fb923c' },
  { id: 'loan',          label: 'Loan',          icon: '🏦', color: '#f472b6' },
  { id: 'education',     label: 'Education',      icon: '📚', color: '#facc15' },
  { id: 'medical',       label: 'Medical',       icon: '💊', color: '#2dd4bf' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎮', color: '#a78bfa' },
  { id: 'ai',            label: 'AI',            icon: '🤖', color: '#22d3ee' },
  { id: 'business',      label: 'Business',      icon: '💼', color: '#60a5fa' },
  { id: 'transport',    label: 'Transport',     icon: '🚕', color: '#fbbf24' },
  { id: 'family',        label: 'Family',        icon: '👨‍👩‍👧', color: '#f9a8d4' },
  { id: 'gift',          label: 'Gift',          icon: '🎁', color: '#f87171' },
  { id: 'coffee',        label: 'Coffee',        icon: '☕', color: '#d6a06a' },
  { id: 'subscriptions', label: 'Subscriptions', icon: '🔁', color: '#818cf8' },
  { id: 'utilities',     label: 'Utilities',     icon: '💡', color: '#34d399' },
  { id: 'fuel',          label: 'Fuel',          icon: '⛽', color: '#fb7185' },
  { id: 'health',        label: 'Health',        icon: '🏋️', color: '#4ade80' },
  { id: 'insurance',     label: 'Insurance',     icon: '🛡️', color: '#93c5fd' },
  { id: 'savings',       label: 'Savings',       icon: '💰', color: '#10b981' },
  { id: 'pets',          label: 'Pets',          icon: '🐾', color: '#fca5a5' },
  { id: 'charity',       label: 'Charity',       icon: '🤝', color: '#fcd34d' },
  { id: 'other',         label: 'Other',         icon: '📦', color: '#94a3b8' },
]

// Seed saving goals (the user's real examples). amounts in IQD.
export function seedGoals() {
  return [
    { id: uuidv4(), name: 'HTB Certification', icon: '📜', target: 500000,   saved: 300000,  deadline: '2026-11' },
    { id: uuidv4(), name: 'Car',               icon: '🚗', target: 20000000, saved: 4500000, deadline: '2027-12' },
    { id: uuidv4(), name: 'Side Project',      icon: '🚀', target: 1000000,  saved: 650000,  deadline: '2026-10' },
  ]
}

// Sample expenses so the dashboard/charts render populated on first run.
// Real, deletable rows (clearable in Settings) — not hard-coded UI.
export function seedExpenses() {
  const now = new Date()
  const mk = (monthsAgo, day) => getDateKey(new Date(now.getFullYear(), now.getMonth() - monthsAgo, day))
  const e = (amount, categoryId, note, monthsAgo, day, paymentMethod = 'Card') =>
    ({ id: uuidv4(), amount, currency: 'IQD', categoryId, note, date: mk(monthsAgo, day), paymentMethod })
  return [
    // current month
    e(35000, 'food', 'Lunch', 0, 2), e(12000, 'coffee', 'Latte', 0, 2, 'Cash'),
    e(250000, 'grocery', 'Weekly shop', 0, 3), e(18000, 'transport', 'Taxi', 0, 4, 'Cash'),
    e(60000, 'fuel', 'Gas', 0, 5), e(45000, 'entertainment', 'Cinema', 0, 6),
    e(90000, 'ai', 'API credits', 0, 7), e(500000, 'rent', 'Rent', 0, 1, 'Transfer'),
    e(30000, 'food', 'Dinner', 0, 8), e(75000, 'clothing', 'T-shirt', 0, 9),
    e(15000, 'coffee', 'Espresso', 0, 10, 'Cash'), e(120000, 'medical', 'Pharmacy', 0, 11),
    // last month
    e(480000, 'rent', 'Rent', 1, 1, 'Transfer'), e(300000, 'grocery', 'Groceries', 1, 5),
    e(80000, 'fuel', 'Gas', 1, 8), e(55000, 'entertainment', 'Concert', 1, 12),
    e(40000, 'food', 'Restaurant', 1, 15), e(95000, 'subscriptions', 'Streaming', 1, 20),
    // two months ago
    e(470000, 'rent', 'Rent', 2, 1, 'Transfer'), e(280000, 'grocery', 'Groceries', 2, 6),
    e(65000, 'transport', 'Rides', 2, 10, 'Cash'), e(50000, 'coffee', 'Coffee runs', 2, 14),
  ]
}

export const DEFAULT_POCKET_INCOME = {
  amount: 2000000, currency: 'IQD', source: 'Salary',
  // recurring off by default → budget periods = calendar months (intuitive first-run).
  // Enabling it in Settings switches periods to run from resetDay (default 25) each month.
  recurring: false, resetDay: 25, overrides: {},
}

export const DEFAULT_POCKET_UI = {
  dashboardStyle: 'ring',   // ring | ledger | cards
  calendarStyle: 'heat',    // heat | agenda
  statsStyle: 'grid',       // grid | focus
  goalsStyle: 'cards',      // cards | rings
  primaryCurrency: 'IQD',   // IQD | USD
  iqdRate: DEFAULT_IQD_RATE,
}

// ── Currency ────────────────────────────────────────────────
export function formatIQD(amount) {
  return `${Math.round(amount || 0).toLocaleString('en-US')} IQD`
}
export function toUSD(amountIQD, rate = DEFAULT_IQD_RATE) {
  return (amountIQD || 0) / (rate || DEFAULT_IQD_RATE)
}
export function formatUSD(amountIQD, rate = DEFAULT_IQD_RATE) {
  return `≈ $${toUSD(amountIQD, rate).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}
/** Compact form for tight cells: 1,235,000 → 1.24M, 765000 → 765K */
export function compact(amount) {
  const n = Math.round(amount || 0)
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}
/** Returns { primary, secondary } strings honoring the primary-currency setting. */
export function money(amountIQD, ui = DEFAULT_POCKET_UI) {
  const rate = ui.iqdRate || DEFAULT_IQD_RATE
  if (ui.primaryCurrency === 'USD') {
    return {
      primary: `$${toUSD(amountIQD, rate).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      secondary: `≈ ${formatIQD(amountIQD)}`,
    }
  }
  return { primary: formatIQD(amountIQD), secondary: formatUSD(amountIQD, rate) }
}

// ── Month helpers ───────────────────────────────────────────
export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
export function monthLabel(mKey) {
  const [y, m] = mKey.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
export function monthShort(mKey) {
  const [y, m] = mKey.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' })
}
export function addMonth(mKey, delta) {
  const [y, m] = mKey.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return monthKey(d)
}
export function daysInMonth(mKey) {
  const [y, m] = mKey.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}
export function todayMonthKey() { return monthKey(new Date()) }

// ── Budget-period math (recurring payday) ───────────────────
// When recurring is on with resetDay=d, the budget period for the month a
// given date belongs to runs from day d of one calendar month to day d of the
// next. We label the period by the calendar month it STARTS in.
export function periodForDate(dateKey, income) {
  const d = dateFromKey(dateKey)
  if (!income?.recurring) return monthKey(d)
  const resetDay = Math.min(Math.max(income.resetDay || 25, 1), 28) // clamp to a day every month has
  if (d.getDate() >= resetDay) return monthKey(d)
  return addMonth(monthKey(d), -1)
}
/** [startKey, endKey) date-key bounds of the budget period a month label covers. */
export function periodBounds(mKey, income) {
  const [y, m] = mKey.split('-').map(Number)
  if (!income?.recurring) {
    return [getDateKey(new Date(y, m - 1, 1)), getDateKey(new Date(y, m, 1))]
  }
  const resetDay = Math.min(Math.max(income.resetDay || 25, 1), 28)
  return [getDateKey(new Date(y, m - 1, resetDay)), getDateKey(new Date(y, m, resetDay))]
}

// ── Selectors ───────────────────────────────────────────────
export function budgetForMonth(mKey, income) {
  return income?.overrides?.[mKey] ?? income?.amount ?? 0
}
export function expensesForMonth(expenses, mKey, income) {
  const [start, end] = periodBounds(mKey, income)
  return (expenses || []).filter((e) => e.date >= start && e.date < end)
}
export function spent(expenses, mKey, income) {
  return expensesForMonth(expenses, mKey, income).reduce((s, e) => s + (e.amount || 0), 0)
}
export function remaining(expenses, mKey, income) {
  return budgetForMonth(mKey, income) - spent(expenses, mKey, income)
}
export function spentPct(expenses, mKey, income) {
  const b = budgetForMonth(mKey, income)
  if (!b) return 0
  return Math.min(100, Math.round((spent(expenses, mKey, income) / b) * 100))
}
/** Category totals for the month, sorted desc, with category meta merged in. */
export function categoryBreakdown(expenses, mKey, income, categories) {
  const rows = expensesForMonth(expenses, mKey, income)
  const byCat = {}
  for (const e of rows) byCat[e.categoryId] = (byCat[e.categoryId] || 0) + (e.amount || 0)
  return Object.entries(byCat)
    .map(([id, amount]) => {
      const cat = (categories || []).find((c) => c.id === id) || { id, label: id, icon: '📦', color: '#94a3b8' }
      return { ...cat, amount }
    })
    .sort((a, b) => b.amount - a.amount)
}
export function daySpend(expenses, dateKey) {
  return (expenses || []).filter((e) => e.date === dateKey).reduce((s, e) => s + (e.amount || 0), 0)
}
export function dailyAvg(expenses, mKey, income) {
  const rows = expensesForMonth(expenses, mKey, income)
  const days = new Set(rows.map((e) => e.date)).size || 1
  return spent(expenses, mKey, income) / days
}
export function safeToSpendPerDay(expenses, mKey, income) {
  const [, end] = periodBounds(mKey, income)
  const todayK = getDateKey()
  const endD = dateFromKey(end)
  const daysLeft = Math.max(1, Math.ceil((endD - dateFromKey(todayK > end ? end : todayK)) / 86400000))
  return Math.max(0, remaining(expenses, mKey, income) / daysLeft)
}
/** Vertical weekly buckets W1..W5 for the calendar month of mKey. */
export function weeklyBuckets(expenses, mKey, income) {
  const rows = expensesForMonth(expenses, mKey, income)
  const buckets = [0, 0, 0, 0, 0]
  for (const e of rows) {
    const dayOfMonth = dateFromKey(e.date).getDate()
    const wk = Math.min(4, Math.floor((dayOfMonth - 1) / 7))
    buckets[wk] += e.amount || 0
  }
  return buckets.map((amount, i) => ({ label: `W${i + 1}`, amount }))
}
/** Totals for the last `count` months (oldest→newest), for the trend chart. */
export function monthlyTotals(expenses, endMonthKey, income, count = 6) {
  const out = []
  for (let i = count - 1; i >= 0; i--) {
    const mk = addMonth(endMonthKey, -i)
    out.push({ month: mk, label: monthShort(mk), amount: spent(expenses, mk, income) })
  }
  return out
}
export function monthsLeft(deadline) {
  if (!deadline) return 1
  const [y, m] = deadline.split('-').map(Number)
  const now = new Date()
  const diff = (y - now.getFullYear()) * 12 + (m - 1 - now.getMonth())
  return Math.max(1, diff)
}
export function suggestedMonthly(goal) {
  return Math.ceil(Math.max(0, (goal.target || 0) - (goal.saved || 0)) / monthsLeft(goal.deadline))
}
export function goalPct(goal) {
  if (!goal.target) return 0
  return Math.min(100, Math.round(((goal.saved || 0) / goal.target) * 100))
}
