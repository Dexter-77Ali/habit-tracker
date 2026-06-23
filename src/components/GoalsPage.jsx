import { useState } from 'react'
import GoalCard from './GoalCard'

export default function GoalsPage({
  goals, habits, tasks, logs, today,
  onAdd, onEdit, onDelete,
  onToggleMilestone, onAddMilestone, onEditMilestone, onDeleteMilestone,
  onUnlinkItem, onOpenNotes,
}) {
  const [expandedId, setExpandedId] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)

  const activeGoals = goals.filter((g) => !g.completed)
  const completedGoals = goals.filter((g) => g.completed)

  return (
    <div className="goals-page">
      <div className="goals-page-header">
        <h2 className="goals-page-title">Goals</h2>
        <button className="btn btn-primary btn-sm" onClick={onAdd}>+ New Goal</button>
      </div>

      {activeGoals.length === 0 && completedGoals.length === 0 ? (
        <div className="goals-empty">
          <p>No goals yet. Create your first goal to start tracking long-term progress.</p>
          <p>Break down certifications, courses, or projects into milestones and link daily habits.</p>
        </div>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <div className="goals-section">
              <h3 className="goals-section-title">Active ({activeGoals.length})</h3>
              <div className="goals-list">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    habits={habits}
                    tasks={tasks}
                    logs={logs}
                    today={today}
                    expanded={expandedId === goal.id}
                    onToggleExpand={() => setExpandedId(expandedId === goal.id ? null : goal.id)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onOpenNotes={onOpenNotes}
                    onToggleMilestone={onToggleMilestone}
                    onAddMilestone={onAddMilestone}
                    onEditMilestone={onEditMilestone}
                    onDeleteMilestone={onDeleteMilestone}
                    onUnlinkItem={onUnlinkItem}
                  />
                ))}
              </div>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div className="goals-section">
              <button
                className="goals-completed-toggle"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                Completed ({completedGoals.length}) {showCompleted ? '▾' : '▸'}
              </button>
              {showCompleted && (
                <div className="goals-list">
                  {completedGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      habits={habits}
                      tasks={tasks}
                      logs={logs}
                      today={today}
                      expanded={expandedId === goal.id}
                      onToggleExpand={() => setExpandedId(expandedId === goal.id ? null : goal.id)}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onOpenNotes={onOpenNotes}
                      onToggleMilestone={onToggleMilestone}
                      onAddMilestone={onAddMilestone}
                      onEditMilestone={onEditMilestone}
                      onDeleteMilestone={onDeleteMilestone}
                      onUnlinkItem={onUnlinkItem}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
