import { useState, useCallback } from 'react'
import HabitItem from './HabitItem'
import GroupHeader from './GroupHeader'

export default function HabitList({
  habits, todayLog, onToggle, onEdit, onDelete, onAdd, onQuickAdd, onOpenNotes,
  groups = [], onAddGroup, onEditGroup, onDeleteGroup, onToggleGroupCollapse,
  logs, today, viewedDate, isViewingFuture, tagColors = {},
  focusMode = false, onToggleFocusMode,
}) {
  const [quickName, setQuickName] = useState('')
  const isToday = viewedDate === today
  const isFocusActive = focusMode && isToday

  const handleQuickAdd = (e) => {
    if (e.key === 'Enter' && quickName.trim()) {
      onQuickAdd(quickName.trim())
      setQuickName('')
    }
  }

  const handleListKeyDown = useCallback((e) => {
    const list = e.currentTarget
    const items = [...list.querySelectorAll('[role="option"]')]
    const idx = items.indexOf(document.activeElement)
    if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(idx + 1, items.length - 1)]?.focus() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(idx - 1, 0)]?.focus() }
    else if (e.key === ' ' && idx >= 0) { e.preventDefault(); items[idx].querySelector('.habit-checkbox')?.click() }
  }, [])

  const completedCount = isFocusActive
    ? habits.filter((h) => !!todayLog[h.id]).length
    : 0

  const displayHabits = isFocusActive
    ? habits.filter((h) => !todayLog[h.id])
    : habits

  const ungrouped = displayHabits.filter((h) => !h.groupId)
  const sortedGroups = [...groups].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="habit-list-card card">
      <div className="card-header">
        <h2>{isToday ? "Today's Habits" : 'Habits'}</h2>
        <div className="card-header-actions">
          {isToday && onToggleFocusMode && (
            <button
              className={`btn btn-ghost btn-sm focus-mode-btn ${focusMode ? 'focus-mode-btn--active' : ''}`}
              onClick={onToggleFocusMode}
              title={focusMode ? 'Show all habits' : 'Hide completed'}
            >
              {focusMode ? '👁 Focus' : '👁 Focus'}
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={onAddGroup}>
            + Group
          </button>
          <button className="btn btn-primary btn-sm" onClick={onAdd}>
            + Add Habit
          </button>
        </div>
      </div>

      {isToday && onQuickAdd && (
        <div className="quick-add-bar">
          <input
            className="quick-add-input"
            placeholder="> enter habit name..."
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            onKeyDown={handleQuickAdd}
          />
        </div>
      )}

      {isFocusActive && completedCount > 0 && (
        <div className="focus-mode-summary">
          {completedCount} completed, hidden
        </div>
      )}

      {displayHabits.length === 0 && !isFocusActive ? (
        <div className="empty-state">
          <p>No habits yet. Add your first habit to get started!</p>
        </div>
      ) : displayHabits.length === 0 && isFocusActive ? (
        <div className="empty-state">
          <p>All done! Nothing left to do today.</p>
        </div>
      ) : (
        <div className="habit-list">
          {ungrouped.length > 0 && (
            <div className="group-section">
              {sortedGroups.length > 0 && (
                <div className="group-label-general">General</div>
              )}
              <ul className="group-items-list" role="listbox" tabIndex={0} onKeyDown={handleListKeyDown}>
                {ungrouped.map((habit) => (
                  <HabitItem
                    key={habit.id}
                    habit={habit}
                    checked={!!todayLog[habit.id]}
                    onToggle={() => onToggle(habit.id)}
                    onEdit={() => onEdit(habit)}
                    onDelete={() => onDelete(habit.id)}
                    onOpenNotes={onOpenNotes}
                    disabled={isViewingFuture}
                    logs={logs}
                    today={today}
                    tagColors={tagColors}
                  />
                ))}
              </ul>
            </div>
          )}

          {sortedGroups.map((group) => {
            const items = displayHabits.filter((h) => h.groupId === group.id)
            if (items.length === 0) return null
            return (
              <div className="group-section" key={group.id}>
                <GroupHeader
                  group={group}
                  itemCount={items.length}
                  onToggleCollapse={onToggleGroupCollapse}
                  onEdit={onEditGroup}
                  onDelete={onDeleteGroup}
                />
                <div className={`group-items ${group.collapsed ? 'group-items--collapsed' : ''}`}>
                  <ul className="group-items-list" role="listbox" tabIndex={0} onKeyDown={handleListKeyDown}>
                    {items.map((habit) => (
                      <HabitItem
                        key={habit.id}
                        habit={habit}
                        checked={!!todayLog[habit.id]}
                        onToggle={() => onToggle(habit.id)}
                        onEdit={() => onEdit(habit)}
                        onDelete={() => onDelete(habit.id)}
                        onOpenNotes={onOpenNotes}
                        disabled={isViewingFuture}
                        logs={logs}
                        today={today}
                        tagColors={tagColors}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
