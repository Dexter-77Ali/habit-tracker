import { useState } from 'react'
import { getEarnedBadges, getBadgeProgress, TIERS, TOTAL_BADGES } from '../utils/rewardUtils'
import IconDisplay from './IconDisplay'

export default function BadgeShelf({ profile, streak, stats = {} }) {
  const [open, setOpen] = useState(false)
  const earnedCount = getEarnedBadges(profile, streak, stats).length
  const families = getBadgeProgress(profile, streak, stats)

  return (
    <div className={`badge-shelf ${open ? 'badge-shelf--open' : ''}`}>
      <button className="badge-shelf-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="badge-shelf-title">🏅 Badges</span>
        <span className="badge-shelf-count">{earnedCount}/{TOTAL_BADGES}</span>
        <span className={`badge-shelf-chevron ${open ? 'badge-shelf-chevron--open' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="badge-family-list">
          {families.map((fam) => (
            <div
              key={fam.id}
              className={`badge-family ${fam.tier ? `badge-family--${fam.tier.key}` : 'badge-family--locked'}`}
              title={fam.next
                ? `${fam.name}: ${fam.value.toLocaleString()} / ${fam.next.toLocaleString()} ${fam.unit} to next tier`
                : `${fam.name}: DIAMOND — maxed out!`}
            >
              <IconDisplay icon={fam.icon} size={22} className="badge-icon" />
              <div className="badge-family-info">
                <span className="badge-family-name">
                  {fam.name}
                  {fam.tier && <span className="badge-tier-label" style={{ color: fam.tier.color }}> {fam.tier.label}</span>}
                </span>
                <span className="badge-family-progress">
                  {fam.next
                    ? `${fam.value.toLocaleString()} / ${fam.next.toLocaleString()} ${fam.unit}`
                    : 'MAXED'}
                </span>
              </div>
              <div className="badge-tier-pips">
                {TIERS.map((t, i) => (
                  <span
                    key={t.key}
                    className="badge-tier-pip"
                    style={i <= fam.tierIndex ? { background: t.color, boxShadow: `0 0 6px ${t.color}` } : undefined}
                    title={`${t.label}: ${fam.thresholds[i].toLocaleString()} ${fam.unit}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
