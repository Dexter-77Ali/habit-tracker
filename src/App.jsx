import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { usePersistedStorage, useSaveIndicator } from './hooks/usePersistedStorage'
import { getDateKey, getWeekDates, getMonthDates, dateFromKey } from './utils/dateUtils'
import {
  calculateDailyXP,
  isDayComplete,
  aggregateXP,
  calculateStreak,
  getTriggerCelebration,
} from './utils/scoreUtils'
import { getLevel } from './utils/levelUtils'
import { getPeriodKey, getEarnedBadges } from './utils/rewardUtils'

import Sidebar from './components/Sidebar'
import Header from './components/Header'
import LevelBar from './components/LevelBar'
import BadgeShelf from './components/BadgeShelf'
import CelebrationBanner from './components/CelebrationBanner'
import DateNav from './components/DateNav'
import HabitList from './components/HabitList'
import TaskList from './components/TaskList'
import AddEditModal from './components/AddEditModal'
import AddEditRewardModal from './components/AddEditRewardModal'
import AddEditGroupModal from './components/AddEditGroupModal'
import AddEditGoalModal from './components/AddEditGoalModal'
import NotesModal from './components/NotesModal'
import ScoresPanel from './components/ScoresPanel'
import GoalsPage from './components/GoalsPage'
import GoalsSummaryCard from './components/GoalsSummaryCard'
import AnalyticsPage from './components/AnalyticsPage'
import './App.css'

const QUICK_ADD_EMOJIS = ['🏃', '📖', '💧', '🧘', '🍎', '✏️', '💊', '🛌', '🎯', '💪']

const TAG_PALETTE = [
  '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  '#0ea5e9', '#a855f7',
]

const DEFAULT_HABITS = [
  { id: uuidv4(), name: 'Morning exercise', xp: 30, icon: '🏃', createdAt: getDateKey(), groupId: null, notes: '', tags: [], frequency: 'daily' },
  { id: uuidv4(), name: 'Read 20 min', xp: 20, icon: '📖', createdAt: getDateKey(), groupId: null, notes: '', tags: [], frequency: 'daily' },
  { id: uuidv4(), name: 'Drink 2L water', xp: 10, icon: '💧', createdAt: getDateKey(), groupId: null, notes: '', tags: [], frequency: 'daily' },
]

export default function App() {
  const [habits, setHabits] = usePersistedStorage('ht_habits', DEFAULT_HABITS)
  const [logs, setLogs] = usePersistedStorage('ht_logs', {})
  const [tasks, setTasks] = usePersistedStorage('ht_tasks', [])
  const [rewards, setRewards] = usePersistedStorage('ht_rewards', [])
  const [profile, setProfile] = usePersistedStorage('ht_profile', {
    allTimeXP: 0,
    completedDays: 0,
    joinedAt: getDateKey(),
  })
  const [settings, setSettings] = usePersistedStorage('ht_settings', {
    includeWeekends: false,
    theme: 'dark',
    focusMode: false,
    maxFreezesPerMonth: 2,
  })
  const [groups, setGroups] = usePersistedStorage('ht_groups', [])
  const [tagsMeta, setTagsMeta] = usePersistedStorage('ht_tags_meta', { colors: {} })
  const [goals, setGoals] = usePersistedStorage('ht_goals', [])
  const [streakFreezes, setStreakFreezes] = usePersistedStorage('ht_streak_freezes', {})

  const [currentPage, setCurrentPage] = useState('dashboard')
  const [modalState, setModalState] = useState({ open: false, item: null, mode: 'habit' })
  const [rewardModal, setRewardModal] = useState({ open: false, reward: null })
  const [groupModal, setGroupModal] = useState({ open: false, group: null, type: 'habit' })
  const [goalModal, setGoalModal] = useState({ open: false, goal: null })
  const [notesModal, setNotesModal] = useState({ open: false, item: null, mode: 'habit' })
  const [celebration, setCelebration] = useState(null)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const today = getDateKey()
  const [viewedDate, setViewedDate] = useState(today)
  const isViewingFuture = viewedDate > today
  const isViewingPast = viewedDate < today
  const viewedLog = logs[viewedDate] || {}

  const lastSaved = useSaveIndicator()
  const [showSaved, setShowSaved] = useState(false)
  const savedTimer = useRef(null)

  useEffect(() => {
    if (lastSaved) {
      setShowSaved(true)
      if (savedTimer.current) clearTimeout(savedTimer.current)
      savedTimer.current = setTimeout(() => setShowSaved(false), 2000)
    }
  }, [lastSaved])

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme || 'dark')
  }, [settings.theme])

  // ------------------------------------------------------------------
  // Tags - derive allTags and auto-assign colors
  // ------------------------------------------------------------------
  const allTags = useMemo(() => {
    const tagSet = new Set()
    habits.forEach((h) => (h.tags || []).forEach((t) => tagSet.add(t)))
    tasks.forEach((t) => (t.tags || []).forEach((tag) => tagSet.add(tag)))
    return [...tagSet].sort()
  }, [habits, tasks])

  const tagColors = useMemo(() => {
    const colors = { ...tagsMeta.colors }
    allTags.forEach((tag) => {
      if (!colors[tag]) {
        const usedColors = Object.values(colors)
        colors[tag] = TAG_PALETTE.find((c) => !usedColors.includes(c)) || TAG_PALETTE[Object.keys(colors).length % TAG_PALETTE.length]
      }
    })
    return colors
  }, [allTags, tagsMeta.colors])

  useEffect(() => {
    const hasNew = allTags.some((tag) => !tagsMeta.colors[tag])
    if (hasNew) {
      setTagsMeta((prev) => {
        const colors = { ...prev.colors }
        allTags.forEach((tag) => {
          if (!colors[tag]) {
            const usedColors = Object.values(colors)
            colors[tag] = TAG_PALETTE.find((c) => !usedColors.includes(c)) || TAG_PALETTE[Object.keys(colors).length % TAG_PALETTE.length]
          }
        })
        return { ...prev, colors }
      })
    }
  }, [allTags, tagsMeta.colors, setTagsMeta])

  // ------------------------------------------------------------------
  // Derived scores (for viewed date on left panel)
  // ------------------------------------------------------------------
  const viewedDailyXP = calculateDailyXP(logs, habits, viewedDate, tasks)
  const viewedEarned = viewedDailyXP.earned
  const viewedMax = viewedDailyXP.max
  const viewedDayComplete = isDayComplete(logs, habits, viewedDate)

  const todayDailyXP = calculateDailyXP(logs, habits, today, tasks)
  const todayEarned = todayDailyXP.earned
  const dayComplete = isDayComplete(logs, habits, today)

  const weekDates = getWeekDates(new Date(), settings.includeWeekends)
  const weekAgg = aggregateXP(logs, habits, weekDates, tasks)
  const weekEarned = weekAgg.earned
  const weekMax = weekAgg.max
  const weekComplete = weekAgg.habitMax > 0 && weekAgg.habitEarned === weekAgg.habitMax

  const monthDates = getMonthDates(new Date(), settings.includeWeekends)
  const monthAgg = aggregateXP(logs, habits, monthDates, tasks)
  const monthEarned = monthAgg.earned
  const monthMax = monthAgg.max
  const monthComplete = monthAgg.habitMax > 0 && monthAgg.habitEarned === monthAgg.habitMax

  const streak = calculateStreak(logs, habits, settings.includeWeekends, streakFreezes)
  const level = getLevel(profile.allTimeXP)
  const earnedBadges = getEarnedBadges(profile, streak)

  const xpByScope = {
    daily: todayEarned,
    weekly: weekEarned,
    monthly: monthEarned,
  }

  // ------------------------------------------------------------------
  // Celebration detection
  // ------------------------------------------------------------------
  const prevScores = useRef({
    dayComplete: false, weekComplete: false, monthComplete: false,
    streak: 0, level: 1, badgeCount: 0,
  })

  useEffect(() => {
    const prev = prevScores.current
    const next = {
      dayComplete, weekComplete, monthComplete, streak,
      level: level.level, levelTitle: level.title, levelIcon: level.icon,
      newBadge: earnedBadges.length > prev.badgeCount ? earnedBadges[earnedBadges.length - 1]?.name : null,
      badgeCount: earnedBadges.length,
    }
    const msg = getTriggerCelebration(prev, next)
    if (msg) setCelebration(msg)
    prevScores.current = next
  }, [dayComplete, weekComplete, monthComplete, streak, level.level, earnedBadges.length])

  useEffect(() => {
    if (dayComplete) {
      setProfile((prev) => {
        const counted = prev._countedDays || []
        if (counted.includes(today)) return prev
        return { ...prev, completedDays: (prev.completedDays || 0) + 1, _countedDays: [...counted, today] }
      })
    }
  }, [dayComplete, today, setProfile])

  // ------------------------------------------------------------------
  // Date navigation
  // ------------------------------------------------------------------
  const navigateDate = useCallback((dateKey) => {
    setViewedDate(dateKey)
    setCurrentPage('dashboard')
  }, [])

  const navigatePrev = useCallback(() => {
    const d = dateFromKey(viewedDate)
    d.setDate(d.getDate() - 1)
    setViewedDate(getDateKey(d))
  }, [viewedDate])

  const navigateNext = useCallback(() => {
    const d = dateFromKey(viewedDate)
    d.setDate(d.getDate() + 1)
    setViewedDate(getDateKey(d))
  }, [viewedDate])

  const navigateToday = useCallback(() => {
    setViewedDate(today)
  }, [today])

  // ------------------------------------------------------------------
  // Habit handlers
  // ------------------------------------------------------------------
  const toggleFocusMode = useCallback(() => {
    setSettings((prev) => ({ ...prev, focusMode: !prev.focusMode }))
  }, [setSettings])

  const getMonthKey = (dateKey) => dateKey.slice(0, 7)

  const freezesThisMonth = useMemo(() => {
    const monthKey = getMonthKey(viewedDate)
    return Object.keys(streakFreezes).filter((k) => streakFreezes[k] && k.startsWith(monthKey)).length
  }, [streakFreezes, viewedDate])

  const freezeDay = useCallback((dateKey) => {
    const max = settings.maxFreezesPerMonth || 2
    const monthKey = getMonthKey(dateKey)
    const usedThisMonth = Object.keys(streakFreezes).filter((k) => streakFreezes[k] && k.startsWith(monthKey)).length
    if (usedThisMonth >= max) return
    setStreakFreezes((prev) => ({ ...prev, [dateKey]: true }))
  }, [settings.maxFreezesPerMonth, streakFreezes, setStreakFreezes])

  const unfreezeDay = useCallback((dateKey) => {
    setStreakFreezes((prev) => {
      const next = { ...prev }
      delete next[dateKey]
      return next
    })
  }, [setStreakFreezes])

  const toggleHabit = useCallback((habitId) => {
    if (isViewingFuture) return
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return
    const wasChecked = !!(logs[viewedDate] || {})[habitId]

    setLogs((prev) => {
      const dayLog = prev[viewedDate] || {}
      return { ...prev, [viewedDate]: { ...dayLog, [habitId]: !dayLog[habitId] } }
    })

    setProfile((prev) => ({
      ...prev,
      allTimeXP: Math.max(0, prev.allTimeXP + (wasChecked ? -habit.xp : habit.xp)),
    }))
  }, [viewedDate, isViewingFuture, habits, logs, setLogs, setProfile])

  const addHabit = useCallback((data) => {
    setHabits((prev) => [...prev, { id: uuidv4(), createdAt: today, groupId: null, notes: '', tags: [], frequency: 'daily', ...data }])
  }, [today, setHabits])

  const quickAddHabit = useCallback((name) => {
    const icon = QUICK_ADD_EMOJIS[Math.floor(Math.random() * QUICK_ADD_EMOJIS.length)]
    addHabit({ name, xp: 10, icon })
  }, [addHabit])

  const editHabit = useCallback((id, data) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h)))
  }, [setHabits])

  const deleteHabit = useCallback((id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id))
    setLogs((prev) => {
      const updated = { ...prev }
      Object.keys(updated).forEach((date) => {
        const { [id]: _, ...rest } = updated[date]
        updated[date] = rest
      })
      return updated
    })
  }, [setHabits, setLogs])

  // ------------------------------------------------------------------
  // Task handlers
  // ------------------------------------------------------------------
  const toggleTask = useCallback((taskId) => {
    setTasks((prev) => prev.map((t) => {
      if (t.id !== taskId) return t
      const nowCompleted = !t.completed
      if (nowCompleted) {
        setProfile((p) => ({ ...p, allTimeXP: p.allTimeXP + t.xp }))
        return { ...t, completed: true, completedAt: today }
      } else {
        setProfile((p) => ({ ...p, allTimeXP: Math.max(0, p.allTimeXP - t.xp) }))
        return { ...t, completed: false, completedAt: null }
      }
    }))
  }, [today, setTasks, setProfile])

  const addTask = useCallback((data) => {
    setTasks((prev) => [...prev, { id: uuidv4(), createdAt: today, completed: false, completedAt: null, groupId: null, notes: '', tags: [], ...data }])
  }, [today, setTasks])

  const quickAddTask = useCallback((name) => {
    const icon = QUICK_ADD_EMOJIS[Math.floor(Math.random() * QUICK_ADD_EMOJIS.length)]
    addTask({ name, xp: 10, icon, priority: 'none' })
  }, [addTask])

  const editTask = useCallback((id, data) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)))
  }, [setTasks])

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [setTasks])

  const clearArchivedTasks = useCallback(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const cutoff = getDateKey(sevenDaysAgo)
    setTasks((prev) => prev.filter((t) => !(t.completed && t.completedAt && t.completedAt < cutoff)))
  }, [setTasks])

  // ------------------------------------------------------------------
  // Group handlers
  // ------------------------------------------------------------------
  const addGroup = useCallback((data) => {
    setGroups((prev) => [...prev, { id: uuidv4(), collapsed: false, ...data }])
  }, [setGroups])

  const editGroup = useCallback((id, data) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)))
  }, [setGroups])

  const deleteGroup = useCallback((id) => {
    setGroups((prev) => prev.filter((g) => g.id !== id))
    setHabits((prev) => prev.map((h) => h.groupId === id ? { ...h, groupId: null } : h))
    setTasks((prev) => prev.map((t) => t.groupId === id ? { ...t, groupId: null } : t))
  }, [setGroups, setHabits, setTasks])

  const toggleGroupCollapse = useCallback((id) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, collapsed: !g.collapsed } : g)))
  }, [setGroups])

  // ------------------------------------------------------------------
  // Reward handlers
  // ------------------------------------------------------------------
  const addReward = useCallback((data) => {
    setRewards((prev) => [...prev, { id: uuidv4(), claimedDates: [], ...data }])
  }, [setRewards])

  const editReward = useCallback((id, data) => {
    setRewards((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
  }, [setRewards])

  const deleteReward = useCallback((id) => {
    setRewards((prev) => prev.filter((r) => r.id !== id))
  }, [setRewards])

  const claimReward = useCallback((id) => {
    setRewards((prev) => prev.map((r) => {
      if (r.id !== id) return r
      const periodKey = getPeriodKey(r.scope, settings.includeWeekends)
      if (r.claimedDates.includes(periodKey)) return r
      return { ...r, claimedDates: [...r.claimedDates, periodKey] }
    }))
    const reward = rewards.find((r) => r.id === id)
    if (reward) setCelebration(`Reward claimed: ${reward.icon} ${reward.name}!`)
  }, [rewards, settings.includeWeekends, setRewards])

  // ------------------------------------------------------------------
  // Goal handlers
  // ------------------------------------------------------------------
  const addGoal = useCallback((data) => {
    setGoals((prev) => [...prev, {
      id: uuidv4(),
      createdAt: today,
      completed: false,
      completedAt: null,
      milestones: [],
      linkedHabitIds: [],
      linkedTaskIds: [],
      notes: '',
      ...data,
    }])
  }, [today, setGoals])

  const editGoal = useCallback((id, data) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)))
  }, [setGoals])

  const deleteGoal = useCallback((id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }, [setGoals])

  const toggleMilestone = useCallback((goalId, milestoneId) => {
    setGoals((prev) => prev.map((g) => {
      if (g.id !== goalId) return g
      const milestones = g.milestones.map((m) => {
        if (m.id !== milestoneId) return m
        const nowCompleted = !m.completed
        if (nowCompleted) {
          setProfile((p) => ({ ...p, allTimeXP: p.allTimeXP + m.xp }))
          return { ...m, completed: true, completedAt: today }
        } else {
          setProfile((p) => ({ ...p, allTimeXP: Math.max(0, p.allTimeXP - m.xp) }))
          return { ...m, completed: false, completedAt: null }
        }
      })
      const allDone = milestones.length > 0 && milestones.every((m) => m.completed)
      const wasComplete = g.completed
      if (allDone && !wasComplete) {
        setCelebration(`Goal completed: ${g.icon} ${g.name}!`)
      }
      return { ...g, milestones, completed: allDone, completedAt: allDone ? today : null }
    }))
  }, [today, setGoals, setProfile])

  const addMilestone = useCallback((goalId, data) => {
    setGoals((prev) => prev.map((g) => {
      if (g.id !== goalId) return g
      const milestone = { id: uuidv4(), completed: false, completedAt: null, xp: 10, description: '', dueDate: null, priority: 'medium', ...data }
      return { ...g, milestones: [...g.milestones, milestone], completed: false, completedAt: null }
    }))
  }, [setGoals])

  const editMilestone = useCallback((goalId, milestoneId, data) => {
    setGoals((prev) => prev.map((g) => {
      if (g.id !== goalId) return g
      return { ...g, milestones: g.milestones.map((m) => m.id === milestoneId ? { ...m, ...data } : m) }
    }))
  }, [setGoals])

  const deleteMilestone = useCallback((goalId, milestoneId) => {
    setGoals((prev) => prev.map((g) => {
      if (g.id !== goalId) return g
      const milestone = g.milestones.find((m) => m.id === milestoneId)
      if (milestone?.completed) {
        setProfile((p) => ({ ...p, allTimeXP: Math.max(0, p.allTimeXP - milestone.xp) }))
      }
      const milestones = g.milestones.filter((m) => m.id !== milestoneId)
      const allDone = milestones.length > 0 && milestones.every((m) => m.completed)
      return { ...g, milestones, completed: allDone, completedAt: allDone ? g.completedAt || today : null }
    }))
  }, [today, setGoals, setProfile])

  const linkItemToGoal = useCallback((goalId, itemId, type) => {
    setGoals((prev) => prev.map((g) => {
      if (g.id !== goalId) return g
      if (type === 'habit') {
        if (g.linkedHabitIds.includes(itemId)) return g
        return { ...g, linkedHabitIds: [...g.linkedHabitIds, itemId] }
      } else {
        if (g.linkedTaskIds.includes(itemId)) return g
        return { ...g, linkedTaskIds: [...g.linkedTaskIds, itemId] }
      }
    }))
  }, [setGoals])

  const unlinkItemFromGoal = useCallback((goalId, itemId, type) => {
    setGoals((prev) => prev.map((g) => {
      if (g.id !== goalId) return g
      if (type === 'habit') {
        return { ...g, linkedHabitIds: g.linkedHabitIds.filter((id) => id !== itemId) }
      } else {
        return { ...g, linkedTaskIds: g.linkedTaskIds.filter((id) => id !== itemId) }
      }
    }))
  }, [setGoals])

  // ------------------------------------------------------------------
  // Modal helpers
  // ------------------------------------------------------------------
  const openAddHabit = () => setModalState({ open: true, item: null, mode: 'habit' })
  const openEditHabit = (habit) => setModalState({ open: true, item: habit, mode: 'habit' })
  const openAddTask = () => setModalState({ open: true, item: null, mode: 'task' })
  const openEditTask = (task) => setModalState({ open: true, item: task, mode: 'task' })
  const closeModal = () => setModalState({ open: false, item: null, mode: 'habit' })

  const handleModalSave = (data) => {
    if (modalState.mode === 'habit') {
      if (modalState.item) editHabit(modalState.item.id, data)
      else addHabit(data)
    } else {
      if (modalState.item) editTask(modalState.item.id, data)
      else addTask(data)
    }
    closeModal()
  }

  const openAddReward = () => setRewardModal({ open: true, reward: null })
  const openEditReward = (reward) => setRewardModal({ open: true, reward })
  const closeRewardModal = () => setRewardModal({ open: false, reward: null })

  const handleRewardSave = (data) => {
    if (rewardModal.reward) editReward(rewardModal.reward.id, data)
    else addReward(data)
    closeRewardModal()
  }

  const openAddGroup = (type) => setGroupModal({ open: true, group: null, type })
  const openEditGroup = (group) => setGroupModal({ open: true, group, type: group.type })
  const closeGroupModal = () => setGroupModal({ open: false, group: null, type: 'habit' })

  const handleGroupSave = (data) => {
    if (groupModal.group) editGroup(groupModal.group.id, data)
    else addGroup(data)
    closeGroupModal()
  }

  // Notes modal
  const openNotes = (item, mode) => setNotesModal({ open: true, item, mode })
  const closeNotes = () => setNotesModal({ open: false, item: null, mode: 'habit' })
  const saveNotes = (notes) => {
    if (notesModal.mode === 'habit') editHabit(notesModal.item.id, { notes })
    else if (notesModal.mode === 'task') editTask(notesModal.item.id, { notes })
    else if (notesModal.mode === 'goal') editGoal(notesModal.item.id, { notes })
    closeNotes()
  }

  // Goal modal
  const openAddGoal = () => setGoalModal({ open: true, goal: null })
  const openEditGoal = (goal) => setGoalModal({ open: true, goal })
  const closeGoalModal = () => setGoalModal({ open: false, goal: null })
  const handleGoalSave = (data) => {
    if (goalModal.goal) editGoal(goalModal.goal.id, data)
    else addGoal(data)
    closeGoalModal()
  }

  // ------------------------------------------------------------------
  // Export / Import
  // ------------------------------------------------------------------
  const handleExport = () => {
    const data = { habits, logs, tasks, rewards, profile, settings, groups, tagsMeta, goals, streakFreezes }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `life-tracker-backup-${today}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.habits) setHabits(data.habits)
        if (data.logs) setLogs(data.logs)
        if (data.tasks) setTasks(data.tasks)
        if (data.rewards) setRewards(data.rewards)
        if (data.profile) setProfile(data.profile)
        if (data.settings) setSettings(data.settings)
        if (data.groups) setGroups(data.groups)
        if (data.tagsMeta) setTagsMeta(data.tagsMeta)
        if (data.goals) setGoals(data.goals)
        if (data.streakFreezes) setStreakFreezes(data.streakFreezes)
        setCelebration('Data imported successfully!')
      } catch {
        alert('Invalid backup file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const toggleTheme = () => {
    setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
  }

  // ------------------------------------------------------------------
  // Keyboard shortcuts
  // ------------------------------------------------------------------
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      if (modalState.open || rewardModal.open || groupModal.open || notesModal.open || goalModal.open) return

      switch (e.key) {
        case 'n': openAddHabit(); e.preventDefault(); break
        case 't': openAddTask(); e.preventDefault(); break
        case 'r': openAddReward(); e.preventDefault(); break
        case 'ArrowLeft': navigatePrev(); e.preventDefault(); break
        case 'ArrowRight': navigateNext(); e.preventDefault(); break
        case '?': setShortcutsOpen((v) => !v); e.preventDefault(); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [modalState.open, rewardModal.open, groupModal.open, notesModal.open, goalModal.open, navigatePrev, navigateNext])

  const visibleHabits = habits.filter((h) => h.createdAt <= viewedDate)

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="app-main">
        <Header
          streak={streak}
          dayComplete={dayComplete}
          allTimeXP={profile.allTimeXP}
          onExport={handleExport}
          onImport={handleImport}
          theme={settings.theme || 'dark'}
          onToggleTheme={toggleTheme}
          shortcutsOpen={shortcutsOpen}
          onToggleShortcuts={() => setShortcutsOpen((v) => !v)}
        />

        {currentPage === 'dashboard' && (
          <>
            <LevelBar allTimeXP={profile.allTimeXP} />
            <BadgeShelf profile={profile} streak={streak} />

            <DateNav
              viewedDate={viewedDate}
              today={today}
              onPrev={navigatePrev}
              onNext={navigateNext}
              onToday={navigateToday}
              isViewingFuture={isViewingFuture}
              isFrozen={!!streakFreezes[viewedDate]}
              onFreezeDay={() => freezeDay(viewedDate)}
              onUnfreezeDay={() => unfreezeDay(viewedDate)}
              freezesRemaining={(settings.maxFreezesPerMonth || 2) - freezesThisMonth}
            />

            {celebration && (
              <CelebrationBanner
                message={celebration}
                onDismiss={() => setCelebration(null)}
              />
            )}

            <main className="dashboard">
              <section className="habits-section">
                <HabitList
                  habits={visibleHabits}
                  todayLog={viewedLog}
                  onToggle={toggleHabit}
                  onEdit={openEditHabit}
                  onDelete={deleteHabit}
                  onAdd={openAddHabit}
                  onQuickAdd={quickAddHabit}
                  onOpenNotes={(habit) => openNotes(habit, 'habit')}
                  groups={groups.filter((g) => g.type === 'habit')}
                  onAddGroup={() => openAddGroup('habit')}
                  onEditGroup={openEditGroup}
                  onDeleteGroup={deleteGroup}
                  onToggleGroupCollapse={toggleGroupCollapse}
                  logs={logs}
                  today={today}
                  viewedDate={viewedDate}
                  isViewingFuture={isViewingFuture}
                  tagColors={tagColors}
                  focusMode={settings.focusMode}
                  onToggleFocusMode={toggleFocusMode}
                />

                <TaskList
                  tasks={tasks}
                  onToggle={toggleTask}
                  onEdit={openEditTask}
                  onDelete={deleteTask}
                  onAdd={openAddTask}
                  onQuickAdd={quickAddTask}
                  onOpenNotes={(task) => openNotes(task, 'task')}
                  groups={groups.filter((g) => g.type === 'task')}
                  onAddGroup={() => openAddGroup('task')}
                  onEditGroup={openEditGroup}
                  onDeleteGroup={deleteGroup}
                  onToggleGroupCollapse={toggleGroupCollapse}
                  onClearArchived={clearArchivedTasks}
                  viewedDate={viewedDate}
                  today={today}
                  isViewingFuture={isViewingFuture}
                  tagColors={tagColors}
                />

                <GoalsSummaryCard
                  goals={goals}
                  onViewAll={() => setCurrentPage('goals')}
                  onAdd={openAddGoal}
                />
              </section>

              <aside className="scores-section">
                <ScoresPanel
                  todayEarned={viewedEarned}
                  todayMax={viewedMax}
                  dayComplete={viewedDayComplete}
                  todayHabitEarned={viewedDailyXP.habitEarned}
                  todayTaskEarned={viewedDailyXP.taskEarned}
                  weekDates={weekDates}
                  weekEarned={weekEarned}
                  weekMax={weekMax}
                  weekComplete={weekComplete}
                  monthEarned={monthEarned}
                  monthMax={monthMax}
                  monthComplete={monthComplete}
                  logs={logs}
                  habits={habits}
                  tasks={tasks}
                  includeWeekends={settings.includeWeekends}
                  onToggleWeekends={() => setSettings((s) => ({ ...s, includeWeekends: !s.includeWeekends }))}
                  rewards={rewards}
                  xpByScope={xpByScope}
                  onClaimReward={claimReward}
                  onEditReward={openEditReward}
                  onDeleteReward={deleteReward}
                  onAddReward={openAddReward}
                  onNavigateDate={navigateDate}
                  viewedDate={viewedDate}
                  streakFreezes={streakFreezes}
                />
              </aside>
            </main>
          </>
        )}

        {currentPage === 'goals' && (
          <GoalsPage
            goals={goals}
            habits={habits}
            tasks={tasks}
            logs={logs}
            today={today}
            onAdd={openAddGoal}
            onEdit={openEditGoal}
            onDelete={deleteGoal}
            onToggleMilestone={toggleMilestone}
            onAddMilestone={addMilestone}
            onEditMilestone={editMilestone}
            onDeleteMilestone={deleteMilestone}
            onUnlinkItem={unlinkItemFromGoal}
            onOpenNotes={(goal) => openNotes(goal, 'goal')}
          />
        )}

        {currentPage === 'analytics' && (
          <AnalyticsPage
            habits={habits}
            tasks={tasks}
            logs={logs}
            tagColors={tagColors}
            allTags={allTags}
            includeWeekends={settings.includeWeekends}
          />
        )}
      </div>

      {modalState.open && (
        <AddEditModal
          item={modalState.item}
          mode={modalState.mode}
          onSave={handleModalSave}
          onClose={closeModal}
          groups={groups.filter((g) => g.type === modalState.mode)}
          allTags={allTags}
          tagColors={tagColors}
        />
      )}

      {rewardModal.open && (
        <AddEditRewardModal
          reward={rewardModal.reward}
          onSave={handleRewardSave}
          onClose={closeRewardModal}
        />
      )}

      {groupModal.open && (
        <AddEditGroupModal
          group={groupModal.group}
          type={groupModal.type}
          onSave={handleGroupSave}
          onClose={closeGroupModal}
        />
      )}

      {goalModal.open && (
        <AddEditGoalModal
          goal={goalModal.goal}
          habits={habits}
          tasks={tasks}
          onSave={handleGoalSave}
          onClose={closeGoalModal}
        />
      )}

      {notesModal.open && (
        <NotesModal
          item={notesModal.item}
          onSave={saveNotes}
          onClose={closeNotes}
        />
      )}

      {showSaved && (
        <div className="save-indicator" key={lastSaved}>
          <span className="save-dot" />
          Saved {new Date(lastSaved).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
