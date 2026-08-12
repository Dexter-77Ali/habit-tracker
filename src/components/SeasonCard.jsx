import { useEffect } from 'react'

// Monthly season: XP earned this month unlocks bronze/silver/gold tiers (auto-claimed bonus XP).
export const SEASON_TIERS = [
  { id: 'bronze', label: 'Bronze', icon: '🥉', threshold: 500,  bonus: 50 },
  { id: 'silver', label: 'Silver', icon: '🥈', threshold: 1500, bonus: 150 },
  { id: 'gold',   label: 'Gold',   icon: '🥇', threshold: 3000, bonus: 300 },
]

export default function SeasonCard({ monthKey, monthLabel, monthEarned, claimedTiers = [], onTierReached }) {
  useEffect(() => {
    for (const t of SEASON_TIERS) {
      if (!claimedTiers.includes(t.id) && monthEarned >= t.threshold) onTierReached(monthKey, t)
    }
  }, [monthKey, monthEarned, claimedTiers, onTierReached])

  const next = SEASON_TIERS.find((t) => monthEarned < t.threshold)
  const pct = next ? Math.min(100, (monthEarned / next.threshold) * 100) : 100

  return (
    <div className="card season-card">
      <div className="card-header">
        <h3 className="season-title">SEASON · {monthLabel}</h3>
        <div className="season-tiers">
          {SEASON_TIERS.map((t) => (
            <span key={t.id} className={`season-tier ${claimedTiers.includes(t.id) ? 'season-tier--earned' : ''}`}
              title={`${t.label}: ${t.threshold} XP (+${t.bonus} bonus)`}>
              {t.icon}
            </span>
          ))}
        </div>
      </div>
      <div className="season-track"><div className="season-fill" style={{ width: `${pct}%` }} /></div>
      <span className="season-progress">
        {monthEarned} XP{next ? ` · ${next.threshold - monthEarned} to ${t2(next.label)}` : ' · all tiers earned 🏆'}
      </span>
    </div>
  )
}

const t2 = (s) => s.toLowerCase()
