// Daily chest: appears once all of today's habits are done. One open per day.
export default function ChestCard({ chest, onOpen }) {
  if (chest?.opened) {
    const r = chest.reward
    return (
      <div className="chest-card chest-card--opened">
        <span className="chest-emoji">🎁</span>
        <span className="chest-text">
          Today's chest: {r?.type === 'freeze' ? '+1 streak freeze ❄️' : `+${r?.amount || 0} XP`}
        </span>
      </div>
    )
  }
  return (
    <button className="chest-card chest-card--ready" onClick={onOpen}>
      <span className="chest-emoji chest-emoji--shake">🎁</span>
      <span className="chest-text">All habits done — open today's chest!</span>
    </button>
  )
}
