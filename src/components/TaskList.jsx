import { useState } from 'react'
import { getDateKey } from '../utils/dateUtils'
import TaskItem from './TaskItem'
import GroupHeader from './GroupHeader'

export default function TaskList({
  tasks, onToggle, onEdit, onDelete, onAdd, onQuickAdd, onOpenNotes,
  groups = [], onAddGroup, onEditGroup, onDeleteGroup, onToggleGroupCollapse,
  onClearArchived, viewedDate, today, isViewingFuture, tagColors = {},
  activeTimer = null, onTimer, timeLog = {},
}) {
  const [archiveCollapsed, setArchiveCollapsed] = useState(true)
  const [quickName, setQuickName] = useState('')
  const isToday = viewedDate === today

  const handleQuickAdd = (e) => {
    if (e.key === 'Enter' && quickName.trim()) {
      onQuickAdd(quickName.trim())
      setQuickName('')
    }
  }

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const archiveCutoff = getDateKey(sevenDaysAgo)

  let visibleTasks, archived
  if (!isToday) {
    visibleTasks = tasks.filter((t) => t.completed && t.completedAt === viewedDate)
    archived = []
  } else {
    archived = tasks.filter((t) => t.completed && t.completedAt && t.completedAt < archiveCutoff)
    visibleTasks = tasks.filter((t) => !archived.includes(t))
  }

  const pending = visibleTasks.filter((t) => !t.completed)
  const completed = visibleTasks.filter((t) => t.completed)

  const ungroupedPending = pending.filter((t) => !t.groupId)
  const ungroupedCompleted = completed.filter((t) => !t.groupId)
  const sortedGroups = [...groups].sort((a, b) => a.name.localeCompare(b.name))

  const renderTaskItem = (task) => (
    <TaskItem
      key={task.id}
      task={task}
      onToggle={() => onToggle(task.id)}
      onEdit={() => onEdit(task)}
      onDelete={() => onDelete(task.id)}
      onOpenNotes={onOpenNotes}
      disabled={!isToday}
      tagColors={tagColors}
      timerRunning={activeTimer?.id === task.id}
      timerStartedAt={activeTimer?.id === task.id ? activeTimer.startedAt : 0}
      spentMs={timeLog[task.id] || 0}
      onTimer={isToday && onTimer && !task.completed ? () => onTimer(task.id, 'task') : undefined}
    />
  )

  return (
    <div className="habit-list-card card task-list-card">
      <div className="card-header">
        <h2>Tasks</h2>
        {isToday && (
          <div className="card-header-actions">
            <button className="btn btn-ghost btn-sm" onClick={onAddGroup}>
              + Group
            </button>
            <button className="btn btn-primary btn-sm" onClick={onAdd}>
              + Add Task
            </button>
          </div>
        )}
      </div>

      {isToday && onQuickAdd && (
        <div className="quick-add-bar">
          <input
            className="quick-add-input"
            placeholder="> enter task name..."
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            onKeyDown={handleQuickAdd}
          />
        </div>
      )}

      {!isToday && visibleTasks.length === 0 ? (
        <div className="empty-state">
          <p>{isViewingFuture ? 'Future date — no tasks to show.' : 'No tasks completed on this day.'}</p>
        </div>
      ) : isToday && tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks yet. Add a one-off task to earn extra XP!</p>
        </div>
      ) : (
        <div className="habit-list">
          {/* Ungrouped pending */}
          {ungroupedPending.length > 0 && (
            <div className="group-section">
              {sortedGroups.length > 0 && isToday && (
                <div className="group-label-general">General</div>
              )}
              <ul className="group-items-list">
                {ungroupedPending.map(renderTaskItem)}
              </ul>
            </div>
          )}

          {/* Grouped pending */}
          {isToday && sortedGroups.map((group) => {
            const groupPending = pending.filter((t) => t.groupId === group.id)
            const groupCompleted = completed.filter((t) => t.groupId === group.id)
            const items = [...groupPending, ...groupCompleted]
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
                  <ul className="group-items-list">
                    {items.map(renderTaskItem)}
                  </ul>
                </div>
              </div>
            )
          })}

          {/* Ungrouped completed */}
          {ungroupedCompleted.length > 0 && isToday && (
            <>
              {(ungroupedPending.length > 0 || sortedGroups.length > 0) && (
                <div className="task-divider">
                  <span>Completed ({ungroupedCompleted.length})</span>
                </div>
              )}
              <ul className="group-items-list">
                {ungroupedCompleted.map(renderTaskItem)}
              </ul>
            </>
          )}

          {/* Non-today completed list */}
          {!isToday && visibleTasks.length > 0 && (
            <ul className="group-items-list">
              {visibleTasks.map(renderTaskItem)}
            </ul>
          )}

          {/* Archived section */}
          {isToday && archived.length > 0 && (
            <div className="group-section archive-section">
              <div className="group-header archive-header" onClick={() => setArchiveCollapsed((v) => !v)}>
                <span className={`group-chevron ${archiveCollapsed ? 'group-chevron--collapsed' : ''}`}>
                  <ChevronIcon />
                </span>
                <span className="group-name">Archived</span>
                <span className="group-count-badge">{archived.length}</span>
                <div className="group-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-sm" onClick={onClearArchived}>
                    Clear
                  </button>
                </div>
              </div>
              <div className={`group-items ${archiveCollapsed ? 'group-items--collapsed' : ''}`}>
                <ul className="group-items-list">
                  {archived.map(renderTaskItem)}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
