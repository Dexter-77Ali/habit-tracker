export default function GoalsSummaryCard({ goals = [], onViewAll, onAdd }) {
  const activeGoals = goals.filter((g) => !g.completed).slice(0, 3)

  return (
    <div className="card goals-summary-card">
      <div className="card-header">
        <h2>Goals</h2>
        <div className="card-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={onViewAll}>View All</button>
          <button className="btn btn-primary btn-sm" onClick={onAdd}>+ Goal</button>
        </div>
      </div>

      {activeGoals.length === 0 ? (
        <div className="empty-state">
          <p>No active goals. Create one to track long-term progress.</p>
        </div>
      ) : (
        <div className="goals-summary-list">
          {activeGoals.map((goal) => {
            const done = goal.milestones.filter((m) => m.completed).length
            const total = goal.milestones.length
            const pct = total > 0 ? (done / total) * 100 : 0
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
              : null

            return (
              <div key={goal.id} className="goals-summary-item" onClick={onViewAll}>
                <div className="goals-summary-item-top">
                  <span className="goals-summary-icon">{goal.icon}</span>
                  <span className="goals-summary-name">{goal.name}</span>
                  {daysLeft !== null && (
                    <span className={`goals-summary-deadline ${daysLeft <= 7 ? 'goals-summary-deadline--soon' : ''}`}>
                      {daysLeft < 0 ? 'Overdue' : `${daysLeft}d`}
                    </span>
                  )}
                </div>
                <div className="goals-summary-bar">
                  <div className="goals-summary-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="goals-summary-count">{done}/{total}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
