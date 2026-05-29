import { useState, useMemo } from 'react'
import Chart from '../components/ui/Chart'
import BranchRanking from '../components/ui/BranchRanking'
import { money, num, inDateRange } from '../utils'
import { IconBarChart, IconTrendUp, IconCalendar, IconArrowUpDown, IconLineChart } from '../components/ui/Icons'

/* ── Preset period helpers ── */
function getPresetRange(preset) {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
  const today = fmt(now)

  if (preset === 'today')    return { start: today, end: today }
  if (preset === 'week') {
    const s = new Date(now); s.setDate(s.getDate() - 6); return { start: fmt(s), end: today }
  }
  if (preset === 'month') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1)
    return { start: fmt(s), end: today }
  }
  if (preset === 'last30') {
    const s = new Date(now); s.setDate(s.getDate() - 29); return { start: fmt(s), end: today }
  }
  if (preset === 'last7') {
    const s = new Date(now); s.setDate(s.getDate() - 6); return { start: fmt(s), end: today }
  }
  return null
}

const PRESETS = [
  { key: 'today',  label: 'Bugun' },
  { key: 'week',   label: '7 kun' },
  { key: 'month',  label: 'Bu oy' },
  { key: 'last30', label: '30 kun' },
]

function StatCard({ label, value, sub, icon: Icon, cls }) {
  return (
    <div className={`analyticsCard ${cls || ''}`}>
      {Icon && <div className="analyticsCardIcon"><Icon size={22} /></div>}
      <div>
        <span className="analyticsCardLabel">{label}</span>
        <b className="analyticsCardValue">{value}</b>
        {sub && <small className="analyticsCardSub">{sub}</small>}
      </div>
    </div>
  )
}

export default function SalesAnalytics({ tr, data, orders, selectedBranchIds }) {
  /* local compare period */
  const [compareOn, setCompareOn]   = useState(false)
  const [preset1, setPreset1]       = useState('month')
  const [preset2, setPreset2]       = useState('last30')
  const [custom1, setCustom1]       = useState({ start: '', end: '' })
  const [custom2, setCustom2]       = useState({ start: '', end: '' })
  const [useCustom1, setUseCustom1] = useState(false)
  const [useCustom2, setUseCustom2] = useState(false)

  const range1 = useCustom1 && custom1.start ? custom1 : (getPresetRange(preset1) || {})
  const range2 = useCustom2 && custom2.start ? custom2 : (getPresetRange(preset2) || {})

  const calcPeriod = (range) => {
    if (!orders || !selectedBranchIds || !range.start) return { total: 0, count: 0, byBranch: {} }
    let total = 0, count = 0; const byBranch = {}
    orders
      .filter(o => selectedBranchIds.includes(o.branch_id))
      .filter(o => inDateRange(o.order_date || o.created_at, range.start, range.end))
      .forEach(o => {
        const a = num(o.total); total += a; count++
        const bn = o.branches?.name || 'Filial'
        byBranch[bn] = (byBranch[bn] || 0) + a
      })
    return { total, count, byBranch }
  }

  const p1 = useMemo(() => calcPeriod(range1), [orders, selectedBranchIds, range1.start, range1.end])
  const p2 = useMemo(() => calcPeriod(range2), [orders, selectedBranchIds, range2.start, range2.end])
  const diff = p1.total - p2.total
  const pct  = p2.total > 0 ? ((diff / p2.total) * 100).toFixed(1) : '—'

  return (
    <div className="salesAnalytics">

      {/* ── Top KPI cards ── */}
      <div className="analyticsKpiRow">
        <StatCard icon={IconBarChart}    cls="premium" label={tr.totalSales}  value={money(data.total)} />
        <StatCard icon={IconTrendUp}     cls={data.growth >= 0 ? 'good' : 'bad'} label={tr.growth} value={`${data.growth.toFixed(1)}%`} />
        <StatCard icon={IconLineChart}   cls=""        label="Kunlar soni"    value={data.trend.length} sub="Ma'lumot bor kun" />
        <StatCard icon={IconArrowUpDown} cls=""        label="To'lov usullari" value={data.methodRows.length + " tur"} />
      </div>

      {/* ── Compare toggle ── */}
      <div className="compareToggleBar">
        <button className={`compareToggleBtn ${compareOn ? 'active' : ''}`} onClick={() => setCompareOn(v => !v)}>
          <IconCalendar size={14} />
          {compareOn ? "Solishtirishni yopish" : "Davrlarni solishtirish"}
        </button>
      </div>

      {/* ── Period comparison ── */}
      {compareOn && (
        <div className="comparePanel">
          {/* Period 1 */}
          <div className="comparePeriodBox">
            <div className="comparePeriodTitle">
              <span className="compareDot p1" />
              <b>1-davr</b>
            </div>
            <div className="comparePresets">
              {PRESETS.map(p => (
                <button key={p.key}
                  className={`comparePill ${!useCustom1 && preset1 === p.key ? 'active' : ''}`}
                  onClick={() => { setPreset1(p.key); setUseCustom1(false) }}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="compareCustomRow">
              <input type="date" value={custom1.start} onChange={e => { setCustom1(v => ({ ...v, start: e.target.value })); setUseCustom1(true) }} />
              <span>—</span>
              <input type="date" value={custom1.end}   onChange={e => { setCustom1(v => ({ ...v, end: e.target.value   })); setUseCustom1(true) }} />
            </div>
            <div className="compareStat">
              <span>Jami savdo</span>
              <b>{money(p1.total)}</b>
            </div>
            <div className="compareStat">
              <span>Order soni</span>
              <b>{p1.count} ta</b>
            </div>
          </div>

          {/* Vs divider */}
          <div className="compareVs">
            <div className="compareVsLine" />
            <span className="compareVsBadge">VS</span>
            <div className="compareVsLine" />
            <div className={`compareDiffBadge ${diff >= 0 ? 'up' : 'down'}`}>
              {diff >= 0 ? '+' : ''}{money(diff)}
              <small>{pct !== '—' ? ` (${pct}%)` : ''}</small>
            </div>
          </div>

          {/* Period 2 */}
          <div className="comparePeriodBox">
            <div className="comparePeriodTitle">
              <span className="compareDot p2" />
              <b>2-davr</b>
            </div>
            <div className="comparePresets">
              {PRESETS.map(p => (
                <button key={p.key}
                  className={`comparePill ${!useCustom2 && preset2 === p.key ? 'active' : ''}`}
                  onClick={() => { setPreset2(p.key); setUseCustom2(false) }}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="compareCustomRow">
              <input type="date" value={custom2.start} onChange={e => { setCustom2(v => ({ ...v, start: e.target.value })); setUseCustom2(true) }} />
              <span>—</span>
              <input type="date" value={custom2.end}   onChange={e => { setCustom2(v => ({ ...v, end: e.target.value   })); setUseCustom2(true) }} />
            </div>
            <div className="compareStat">
              <span>Jami savdo</span>
              <b>{money(p2.total)}</b>
            </div>
            <div className="compareStat">
              <span>Order soni</span>
              <b>{p2.count} ta</b>
            </div>
          </div>
        </div>
      )}

      {/* ── Branch ranking ── */}
      <BranchRanking rows={data.branchRows} />

      {/* ── Charts ── */}
      <div className="analyticsChartsGrid">
        <Chart title={tr.trend}       rows={data.trend}      emptyText={tr.noData} />
        <Chart title={tr.branchSales} rows={data.branchRows} emptyText={tr.noData} />
      </div>
      {data.methodRows.length > 0 && (
        <Chart title="To'lov usullari" rows={data.methodRows} emptyText={tr.noData} type="donut" />
      )}
    </div>
  )
}
