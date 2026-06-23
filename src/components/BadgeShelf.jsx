import { BUILTIN_BADGES, getEarnedBadges } from '../utils/rewardUtils'

export default function BadgeShelf({ profile, streak }) {
  const earned = getEarnedBadges(profile, streak)
  const earnedIds = new Set(earned.map((b) => b.id))

  if (BUILTIN_BADGES.length === 0) return null

  return (
    <div className="badge-shelf">
      <h4 className="badge-shelf-title">Badges</h4>
      <div className="badge-grid">
        {BUILTIN_BADGES.map((badge) => {
          const unlocked = earnedIds.has(badge.id)
          return (
            <div
              key={badge.id}
              className={`badge-item ${unlocked ? 'badge-item--unlocked' : 'badge-item--locked'}`}
              title={`${badge.name}: ${badge.description}${unlocked ? ' (Unlocked!)' : ''}`}
            >
              <span className="badge-icon">{badge.icon}</span>
              <span className="badge-name">{badge.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
