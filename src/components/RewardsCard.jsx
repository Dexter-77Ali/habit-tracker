import RewardItem from './RewardItem'

const SCOPE_ORDER = ['daily', 'weekly', 'monthly']

export default function RewardsCard({ rewards, xpByScope, includeWeekends, onClaim, onEdit, onDelete, onAdd }) {
  const grouped = { daily: [], weekly: [], monthly: [] }
  rewards.forEach((r) => {
    if (grouped[r.scope]) grouped[r.scope].push(r)
  })

  return (
    <div className="card rewards-card">
      <div className="card-header">
        <h3>Rewards</h3>
        <button className="btn btn-primary btn-sm" onClick={onAdd}>+ Add</button>
      </div>

      {rewards.length === 0 ? (
        <div className="empty-state">
          <p>Set XP thresholds and reward yourself!</p>
        </div>
      ) : (
        SCOPE_ORDER.map((scope) =>
          grouped[scope].length > 0 && (
            <div key={scope} className="reward-scope-group">
              <h4 className="reward-scope-label">{scope.charAt(0).toUpperCase() + scope.slice(1)}</h4>
              {grouped[scope].map((reward) => (
                <RewardItem
                  key={reward.id}
                  reward={reward}
                  xpByScope={xpByScope}
                  includeWeekends={includeWeekends}
                  onClaim={() => onClaim(reward.id)}
                  onEdit={() => onEdit(reward)}
                  onDelete={() => onDelete(reward.id)}
                />
              ))}
            </div>
          )
        )
      )}
    </div>
  )
}
