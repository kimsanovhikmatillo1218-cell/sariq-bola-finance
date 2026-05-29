import { useState } from 'react'
import { money } from '../../utils'

/* ── Bar Chart ── */
function BarChart({ rows, danger }) {
  const max = Math.max(...rows.map(r => r.value), 1)
  return (
    <div className="chartBars">
      {rows.map((r, i) => (
        <div className="chartRow" key={r.name}>
          <span className="chartLabel">{r.name}</span>
          <div className="chartBar">
            <div
              className={`chartFill ${danger ? 'danger' : ''}`}
              style={{ width: `${(r.value / max) * 100}%`, animationDelay: `${i * 40}ms` }}
            />
          </div>
          <span className="chartValue">{money(r.value)}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Line Chart ── */
function LineChart({ rows }) {
  const [tooltip, setTooltip] = useState(null)
  if (rows.length < 2) return <BarChart rows={rows} />

  const W = 520, H = 140, PAD = { t:16, r:12, b:28, l:12 }
  const vals   = rows.map(r => r.value)
  const minV   = Math.min(...vals)
  const maxV   = Math.max(...vals, 1)
  const range  = maxV - minV || 1
  const stepX  = (W - PAD.l - PAD.r) / (rows.length - 1)

  const px = i => PAD.l + i * stepX
  const py = v => PAD.t + (H - PAD.t - PAD.b) * (1 - (v - minV) / range)

  const points = rows.map((r, i) => ({ x: px(i), y: py(r.value), ...r }))
  const pathD  = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaD  = pathD + ` L${points[points.length-1].x.toFixed(1)},${H-PAD.b} L${points[0].x.toFixed(1)},${H-PAD.b} Z`

  return (
    <div className="lineChartWrap" style={{ position:'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="lineChartSvg">
        <defs>
          <linearGradient id="lgLine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--yellow)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--yellow)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* area fill */}
        <path d={areaD} fill="url(#lgLine)" />
        {/* line */}
        <path d={pathD} fill="none" stroke="var(--yellow)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {/* dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4}
            fill={tooltip?.i === i ? 'var(--yellow)' : 'var(--card)'}
            stroke="var(--yellow)" strokeWidth="2"
            style={{ cursor:'pointer' }}
            onMouseEnter={() => setTooltip({ i, x: p.x, y: p.y, name: p.name, value: p.value })}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </svg>

      {/* x-axis labels */}
      <div className="lineChartLabels">
        {rows.length <= 10
          ? rows.map((r, i) => <span key={i} style={{ left: `${(px(i) / W) * 100}%`, transform:'translateX(-50%)' }}>{r.name?.slice(5) || r.name}</span>)
          : [0, Math.floor((rows.length-1)/2), rows.length-1].map(i => (
              <span key={i} style={{ left: `${(px(i) / W) * 100}%`, transform:'translateX(-50%)' }}>{rows[i]?.name?.slice(5) || rows[i]?.name}</span>
            ))
        }
      </div>

      {/* tooltip */}
      {tooltip && (
        <div className="lineChartTooltip" style={{
          left: `${(tooltip.x / W) * 100}%`,
          top: `${(tooltip.y / H) * 100}%`,
          transform: `translate(${tooltip.x > W*0.7 ? '-100%' : '8px'}, -120%)`
        }}>
          <b>{tooltip.name}</b>
          <span>{money(tooltip.value)}</span>
        </div>
      )}
    </div>
  )
}

/* ── Donut Chart ── */
function DonutChart({ rows }) {
  const [hovered, setHovered] = useState(null)
  const total = rows.reduce((s, r) => s + r.value, 0) || 1

  const COLORS = [
    '#fabd00','#3b82f6','#22c55e','#f97316',
    '#a855f7','#ec4899','#14b8a6','#f43f5e'
  ]

  const R = 52, CX = 64, CY = 64, strokeW = 18
  let angle = -Math.PI / 2

  const slices = rows.map((r, i) => {
    const pct   = r.value / total
    const sweep = pct * 2 * Math.PI
    const x1    = CX + R * Math.cos(angle)
    const y1    = CY + R * Math.sin(angle)
    angle += sweep
    const x2    = CX + R * Math.cos(angle)
    const y2    = CY + R * Math.sin(angle)
    const large = sweep > Math.PI ? 1 : 0
    return { ...r, x1, y1, x2, y2, large, pct, color: COLORS[i % COLORS.length], sweep }
  })

  return (
    <div className="donutWrap">
      <svg width={128} height={128} viewBox="0 0 128 128" className="donutSvg" style={{ flexShrink:0 }}>
        {slices.map((s, i) => {
          const isHov = hovered === i
          const path = `M${s.x1.toFixed(2)},${s.y1.toFixed(2)} A${R},${R} 0 ${s.large},1 ${s.x2.toFixed(2)},${s.y2.toFixed(2)}`
          return (
            <path key={i} d={path}
              fill="none" stroke={s.color} strokeWidth={isHov ? strokeW + 4 : strokeW}
              strokeLinecap="butt"
              style={{ cursor:'pointer', transition:'stroke-width .2s ease', opacity: hovered !== null && !isHov ? .55 : 1 }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            />
          )
        })}
        {/* center text */}
        <text x="64" y="60" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--text)">
          {hovered !== null ? `${(slices[hovered].pct * 100).toFixed(0)}%` : `${rows.length}`}
        </text>
        <text x="64" y="74" textAnchor="middle" fontSize="9" fill="var(--muted)" fontWeight="700">
          {hovered !== null ? slices[hovered].name?.slice(0,8) : "tur"}
        </text>
      </svg>

      <div className="donutLegend">
        {slices.map((s, i) => (
          <div key={i} className={`donutLegendItem ${hovered === i ? 'hovered' : ''}`}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <span className="donutDot" style={{ background: s.color }} />
            <span className="donutName">{s.name}</span>
            <span className="donutVal">{money(s.value)}</span>
            <span className="donutPct">{(s.pct * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main Chart export ── */
export default function Chart({ title, rows, emptyText, danger, type }) {
  const chartType = type || (rows.length > 0 && rows[0]?.name?.match(/^\d{4}-\d{2}-\d{2}$/) ? 'line' : 'bar')

  return (
    <div className="chartBox">
      {title && <h3 className="chartTitle">{title}</h3>}
      {rows.length === 0
        ? <div className="empty">{emptyText}</div>
        : chartType === 'line'  ? <LineChart rows={rows} />
        : chartType === 'donut' ? <DonutChart rows={rows} />
        : <BarChart rows={rows} danger={danger} />
      }
    </div>
  )
}
