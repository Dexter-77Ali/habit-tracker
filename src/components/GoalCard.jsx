import { useState } from 'react'
import MilestoneList from './MilestoneList'

export default function GoalCard({
  goal, habits = [], tasks = [], logs = {}, today,
  expanded = false, onToggleExpand,
  onEdit, onDelete, onOpenNotes,
  onToggleMilestone, onAddMilestone, onEditMilestone, onDeleteMilestone, onUnlinkItem,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const completedCount = goal.milestones.filter((m) => m.completed).length
  const totalCount = goal.milestones.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null

  const linkedHabits = (goal.linkedHabitIds || []).map((id) => habits.find((h) => h.id === id)).filter(Boolean)
  const linkedTasks = (goal.linkedTaskIds || []).map((id) => tasks.find((t) => t.id === id)).filter(Boolean)

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(goal.id)
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div className={`goal-card ${goal.completed ? 'goal-card--completed' : ''} ${expanded ? 'goal-card--expanded' : ''}`}>
      <div className="goal-card-header" onClick={onToggleExpand}>
        <span className="goal-card-icon">{goal.icon}</span>
        <div className="goal-card-info">
          <span className="goal-card-name">{goal.name}</span>
          <div className="goal-card-meta">
            <span className="goal-card-progress-text">{completedCount}/{totalCount} tasks</span>
            {daysLeft !== null && (
              <span className={`goal-card-deadline ${daysLeft < 0 ? 'goal-card-deadline--overdue' : daysLeft <= 7 ? 'goal-card-deadline--soon' : ''}`}>
                {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
              </span>
            )}
            {goal.completed && <span className="goal-card-done-badge">Completed</span>}
          </div>
        </div>
        <div className="goal-card-progress-bar">
          <div className="goal-card-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="goal-card-chevron">{expanded ? '▾' : '▸'}</span>
      </div>

      {expanded && (
        <div className="goal-card-body">
          <MilestoneList
            milestones={goal.milestones}
            onToggle={(mId) => onToggleMilestone(goal.id, mId)}
            onAdd={(data) => onAddMilestone(goal.id, data)}
            onEdit={(mId, data) => onEditMilestone(goal.id, mId, data)}
            onDelete={(mId) => onDeleteMilestone(goal.id, mId)}
          />

          {(linkedHabits.length > 0 || linkedTasks.length > 0) && (
            <div className="goal-linked-section">
              <h4 className="goal-linked-title">Linked Items</h4>
              <div className="goal-linked-list">
                {linkedHabits.map((h) => {
                  const checked = !!(logs[today] || {})[h.id]
                  return (
                    <div key={h.id} className="goal-linked-item">
                      <span className={`goal-linked-dot ${checked ? 'goal-linked-dot--done' : ''}`} />
                      <span className="goal-linked-icon">{h.icon}</span>
                      <span>{h.name}</span>
                      <button className="goal-unlink-btn" onClick={() => onUnlinkItem(goal.id, h.id, 'habit')} title="Unlink">×</button>
                    </div>
                  )
                })}
                {linkedTasks.map((t) => (
                  <div key={t.id} className="goal-linked-item">
                    <span className={`goal-linked-dot ${t.completed ? 'goal-linked-dot--done' : ''}`} />
                    <span className="goal-linked-icon">{t.icon}</span>
                    <span>{t.name}</span>
                    <button className="goal-unlink-btn" onClick={() => onUnlinkItem(goal.id, t.id, 'task')} title="Unlink">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="goal-card-actions">
            {onOpenNotes && (
              <button className="btn btn-ghost btn-sm" onClick={() => onOpenNotes(goal)}>Notes</button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => onEdit(goal)}>Edit</button>
            <button
              className={`btn btn-ghost btn-sm ${confirmDelete ? 'btn--danger' : ''}`}
              onClick={handleDelete}
            >
              {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
