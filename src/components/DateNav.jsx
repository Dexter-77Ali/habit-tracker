import { dateFromKey } from '../utils/dateUtils'

export default function DateNav({
  viewedDate, today, onPrev, onNext, onToday, isViewingFuture,
  isFrozen, onFreezeDay, onUnfreezeDay, freezesRemaining,
}) {
  const dateObj = dateFromKey(viewedDate)
  const label = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const isToday = viewedDate === today
  const canFreeze = !isFrozen && freezesRemaining > 0 && !isViewingFuture

  return (
    <nav className="date-nav">
      <button className="btn btn-ghost btn-sm date-nav-btn" onClick={onPrev} title="Previous day (←)">
        ‹ Prev
      </button>

      <div className="date-nav-center">
        <span className="date-nav-label">{label}</span>
        {isViewingFuture && <span className="date-nav-future">Future date — read only</span>}
        {isFrozen && <span className="date-nav-frozen">❄️ Frozen day</span>}
      </div>

      <button className="btn btn-ghost btn-sm date-nav-btn" onClick={onNext} title="Next day (→)">
        Next ›
      </button>

      {!isToday && (
        <button className="btn btn-primary btn-sm date-nav-today" onClick={onToday}>
          Today
        </button>
      )}

      {onFreezeDay && !isViewingFuture && (
        <button
          className={`btn btn-sm freeze-btn ${isFrozen ? 'freeze-btn--active' : ''}`}
          onClick={isFrozen ? onUnfreezeDay : onFreezeDay}
          disabled={!isFrozen && !canFreeze}
          title={isFrozen ? 'Unfreeze this day' : `Freeze this day (${freezesRemaining} left this month)`}
        >
          {isFrozen ? '❄️ Unfreeze' : `❄️ Freeze (${freezesRemaining})`}
        </button>
      )}
    </nav>
  )
}
