import { ArcGauge, RingGauge, BudgetRibbon } from '../../components/pocket/charts'
import { isHabitScheduled } from '../../utils/scoreUtils'
import { getLevelProgress } from '../../utils/levelUtils'
import { formatFullDate } from '../../utils/dateUtils'

// Dashboard hero for premium skins (skin !== 'classic'): today's completion,
// streak, level/XP. Replaces LevelBar's slot; classic never renders this.
// Pure derivation from existing utils — no new state, no logic changes.
export default function SkinHero({ skin, habits, logs, today, streak, allTimeXP, dayComplete }) {
  const scheduled = habits.filter((h) => h.createdAt <= today && isHabitScheduled(h, today))
  const todayLog = logs[today] || {}
  const done = scheduled.filter((h) => todayLog[h.id]).length
  const total = scheduled.length
  const pct = total ? Math.round((done / total) * 100) : 0
  const xpToday = scheduled.filter((h) => todayLog[h.id]).reduce((s, h) => s + (h.xp || 0), 0)
  const lv = getLevelProgress(allTimeXP)

  const gauge =
    skin === 'meridian' ? <ArcGauge pct={pct} size={150} stroke={12}><Center pct={pct} /></ArcGauge> :
    skin === 'aurora' ? <RingGauge pct={pct} size={140} stroke={12} color="url(#skinAuroraRing)"><AuroraDefs /><Center pct={pct} /></RingGauge> :
    skin === 'halo' ? <RingGauge pct={pct} size={140} stroke={12} color="var(--primary)" track="var(--surface-2)"><Center pct={pct} /></RingGauge> :
    /* terra + bolt use the ribbon below instead of a gauge */ null

  return (
    <section className={`skin-hero skin-hero--${skin}`} aria-label="Today's progress">
      <div className="skin-hero-main">
        <div className="skin-hero-label">TODAY'S PROGRESS · {formatFullDate().toUpperCase()}</div>
        <div className="skin-hero-figure">
          <span className="skin-hero-count">{done}</span>
          <span className="skin-hero-total">/ {total}</span>
          <span className="skin-hero-sub">habits kept</span>
        </div>
        <div className="skin-hero-meta">
          <span className="skin-hero-xp">+{xpToday} XP today</span>
          <span className="skin-hero-dotsep" />
          <span className={`skin-hero-pill ${streak > 0 ? 'skin-hero-pill--on' : ''}`}>
            <span className="skin-hero-pulse" />{streak > 0 ? 'On streak' : 'Start today'}
          </span>
        </div>
        {(skin === 'terra' || skin === 'bolt') && (
          <div className="skin-hero-ribbonwrap">
            <BudgetRibbon
              ink={skin === 'bolt'}
              height={skin === 'bolt' ? 22 : 14}
              hatchA={skin === 'bolt' ? '#ece7da' : '#e8ddc9'}
              hatchB={skin === 'bolt' ? '#d9d2c2' : '#ded0b6'}
              total={total || 1}
              segments={[{ value: done, color: 'var(--primary)', label: 'done' }]}
            />
            <div className="skin-hero-ribbonlabel">{done} kept · {total - done} to go</div>
          </div>
        )}
      </div>
      {gauge && <div className="skin-hero-gauge">{gauge}</div>}
      <div className="skin-hero-side">
        <div className="skin-hero-streak">
          <span className="skin-hero-flame">🔥</span>
          <span className="skin-hero-streakn">{streak}</span>
          <span className="skin-hero-streaklabel">DAY STREAK</span>
        </div>
        <div className="skin-hero-level">
          <div className="skin-hero-levelrow">
            <span className="skin-hero-levellabel">LEVEL {lv.current.level} · {lv.current.title.toUpperCase()}</span>
            <span className="skin-hero-levelpct">{lv.progress}%</span>
          </div>
          <div className="skin-hero-track"><div className="skin-hero-fill" style={{ width: `${lv.progress}%` }} /></div>
          <div className="skin-hero-next">{lv.next ? `${(lv.next.minXP - allTimeXP).toLocaleString()} XP to ${lv.next.title}` : 'MAX LEVEL'}</div>
        </div>
      </div>
    </section>
  )
}

function Center({ pct }) {
  return (
    <>
      <span className="skin-hero-gpct">{pct}<span className="skin-hero-gpctsign">%</span></span>
      <span className="skin-hero-gsub">COMPLETE</span>
    </>
  )
}

// Aurora's tri-stop ring gradient needs an SVG def in-DOM once
function AuroraDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="skinAuroraRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2dd4bf" /><stop offset=".5" stopColor="#a78bfa" /><stop offset="1" stopColor="#f0abfc" />
        </linearGradient>
      </defs>
    </svg>
  )
}
