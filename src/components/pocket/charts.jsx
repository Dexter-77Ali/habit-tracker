// Shared inline-SVG chart primitives for Pocket Tracker.
// No chart lib (the app hand-rolls SVG) — all theme-aware via CSS vars / passed colors.

/** Circular gauge: filled arc = pct, rest = track. children render centered. */
export function RingGauge({ pct = 0, size = 150, stroke = 14, color = 'var(--primary)', track = 'var(--surface-2)', children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c * (1 - Math.min(100, Math.max(0, pct)) / 100)
  return (
    <div className="pk-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <div className="pk-ring-center">{children}</div>
    </div>
  )
}

/** Donut from weighted segments [{ value, color }]. children render centered. */
export function Donut({ segments = [], size = 150, stroke = 22, children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  let acc = 0
  return (
    <div className="pk-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const frac = seg.value / total
          const dash = c * frac
          const gap = c - dash
          const offset = -acc * c
          acc += frac
          return (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={seg.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset} />
          )
        })}
      </svg>
      {children && <div className="pk-ring-center">{children}</div>}
    </div>
  )
}

/** Vertical bars from [{ label, amount, muted }]. */
export function Bars({ data = [], color = 'var(--primary)', mutedColor = '#4b3a6b', height = 120, format = (n) => n }) {
  const max = Math.max(1, ...data.map((d) => d.amount))
  return (
    <div className="pk-bars" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="pk-bar-col">
          <span className="pk-bar-val">{d.amount > 0 ? format(d.amount) : ''}</span>
          <div className="pk-bar-track" style={{ height: '100%' }}>
            <div className="pk-bar-fill" style={{
              height: `${(d.amount / max) * 100}%`,
              background: d.muted ? mutedColor : color,
            }} />
          </div>
          <span className="pk-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/** Horizontal ranked bars from [{ label, amount, color, icon }]. */
export function RankedBars({ data = [], format = (n) => n }) {
  const max = Math.max(1, ...data.map((d) => d.amount))
  return (
    <div className="pk-ranked">
      {data.map((d, i) => (
        <div key={i} className="pk-ranked-row">
          <span className="pk-ranked-label">{d.icon} {d.label}</span>
          <div className="pk-ranked-track">
            <div className="pk-ranked-fill" style={{ width: `${(d.amount / max) * 100}%`, background: d.color || 'var(--primary)' }} />
          </div>
          <span className="pk-ranked-val">{format(d.amount)}</span>
        </div>
      ))}
    </div>
  )
}

/** Line + area trend from [{ label, amount }]. Highlights the last point. */
export function TrendLine({ points = [], height = 160, color = 'var(--cyan)', format = (n) => n }) {
  const w = 320, h = height, pad = 24
  const max = Math.max(1, ...points.map((p) => p.amount))
  const stepX = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0
  const xy = points.map((p, i) => {
    const x = pad + i * stepX
    const y = h - pad - (p.amount / max) * (h - pad * 2)
    return [x, y]
  })
  const line = xy.map(([x, y]) => `${x},${y}`).join(' ')
  const area = `${pad},${h - pad} ${line} ${pad + (points.length - 1) * stepX},${h - pad}`
  return (
    <svg className="pk-trend" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" width="100%" height={height}>
      <polygon points={area} fill={color} opacity="0.12" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {xy.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === xy.length - 1 ? 4 : 2.5} fill={i === xy.length - 1 ? color : 'var(--surface)'} stroke={color} strokeWidth="1.5" />
          <text x={x} y={h - 6} textAnchor="middle" className="pk-trend-label">{points[i].label}</text>
        </g>
      ))}
    </svg>
  )
}

/** Horizontal stacked segments [{ value, color }] + remaining track. */
export function SegmentedBar({ segments = [], total }) {
  const sum = segments.reduce((s, seg) => s + seg.value, 0)
  const denom = total || sum || 1
  return (
    <div className="pk-segbar">
      {segments.map((seg, i) => (
        <div key={i} className="pk-segbar-seg" style={{ width: `${(seg.value / denom) * 100}%`, background: seg.color }} title={seg.label} />
      ))}
    </div>
  )
}

/** Thin progress bar using the app's accent gradient. */
export function ProgressBar({ pct = 0, color }) {
  return (
    <div className="pk-progress">
      <div className="pk-progress-fill" style={{ width: `${Math.min(100, pct)}%`, background: color || 'var(--gradient-primary)' }} />
    </div>
  )
}
