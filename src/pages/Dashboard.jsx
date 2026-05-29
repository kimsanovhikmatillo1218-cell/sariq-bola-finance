import { useState, useMemo } from 'react'
import Chart from '../components/ui/Chart'
import { money, num } from '../utils'
import {
  IconTrendUp, IconArrowUpDown, IconCash, IconDollarSign,
  IconBarChart, IconChevronDown, IconCheck
} from '../components/ui/Icons'

const PERIODS = [
  { label: 'Bugun',        days: 0  },
  { label: 'Kecha',        days: 1  },
  { label: 'Oxirgi 7 kun', days: 7  },
  { label: 'Oxirgi 30 kun',days: 30 },
  { label: 'Bu oy',        days: -1 },
]

function TrendBadge({ value, prev }) {
  if (!prev) return null
  const pct = prev === 0 ? 100 : ((value - prev) / Math.abs(prev)) * 100
  const up  = pct >= 0
  return (
    <span className={`trendBadge ${up ? 'up' : 'down'}`}>
      <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        {up ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
      </svg>
      {Math.abs(pct).toFixed(1)}%
    </span>
  )
}

function KpiCard({ icon: Icon, iconClass, label, value, prev, hint, color }) {
  return (
    <div className={`dashCard ${color || ''}`}>
      <div className={`dashCardIcon ${iconClass || ''}`}><Icon size={20} /></div>
      <div className="dashCardBody">
        <span className="dashCardLabel">{label}</span>
        <b className="dashCardValue">{value}</b>
        {hint && <small className="dashCardHint">{hint}</small>}
      </div>
      {prev !== undefined && (
        <div className="dashCardTrend">
          <TrendBadge value={num(value?.replace(/[^0-9]/g, ''))} prev={prev} />
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ tr, stats, operations, selectedBranchIds, period }) {
  const [compareOpen, setCompareOpen] = useState(false)
  const [quickPeriod, setQuickPeriod] = useState(null)

  // Compute current period totals from operations
  const periodTotals = useMemo(() => {
    if (!operations || !selectedBranchIds) return { income: 0, expense: 0 }
    let income = 0, expense = 0
    operations
      .filter(x => selectedBranchIds.includes(x.branch_id))
      .filter(x => {
        if (!period?.start && !period?.end) return true
        const d = (x.created_at || '').slice(0, 10)
        if (period.start && d < period.start) return false
        if (period.end   && d > period.end)   return false
        return true
      })
      .forEach(x => {
        const a = num(x.amount)
        if (x.type === 'Kirim')  income  += a
        if (x.type === 'Chiqim') expense += a
      })
    return { income, expense, profit: income - expense }
  }, [operations, selectedBranchIds, period])

  // Previous period for comparison
  const prevTotals = useMemo(() => {
    if (!operations || !selectedBranchIds || !period?.start || !period?.end) return null
    const startD = new Date(period.start)
    const endD   = new Date(period.end)
    const dayMs  = 86400000
    const days   = Math.max(1, Math.round((endD - startD) / dayMs) + 1)
    const prevEnd   = new Date(startD - dayMs).toISOString().slice(0, 10)
    const prevStart = new Date(startD - dayMs * days).toISOString().slice(0, 10)
    let income = 0, expense = 0
    operations
      .filter(x => selectedBranchIds.includes(x.branch_id))
      .filter(x => {
        const d = (x.created_at || '').slice(0, 10)
        return d >= prevStart && d <= prevEnd
      })
      .forEach(x => {
        const a = num(x.amount)
        if (x.type === 'Kirim')  income  += a
        if (x.type === 'Chiqim') expense += a
      })
    return { income, expense, profit: income - expense }
  }, [operations, selectedBranchIds, period])

  return (
    <div className="dash">
      {/* ── KPI row ── */}
      <div className="dashKpiGrid">
        <KpiCard
          icon={IconCash} iconClass="yellow"
          label={tr.cashBalance}
          value={money(stats.cash)}
          hint="Jami naqd qoldiq"
          color="premium"
        />
        <KpiCard
          icon={IconDollarSign} iconClass="blue"
          label={tr.bankBalance}
          value={money(stats.bank)}
          hint="Bank hisob raqami"
          color=""
        />
        <KpiCard
          icon={IconTrendUp} iconClass="green"
          label={tr.totalIncome || "Davr kirimi"}
          value={money(periodTotals.income)}
          prev={prevTotals?.income}
          color="good"
        />
        <KpiCard
          icon={IconArrowUpDown} iconClass="red"
          label={tr.totalExpense || "Davr chiqimi"}
          value={money(periodTotals.expense)}
          prev={prevTotals?.expense}
          color="bad"
        />
      </div>

      {/* ── Profit summary bar ── */}
      {(periodTotals.income > 0 || periodTotals.expense > 0) && (
        <div className="dashProfitBar">
          <div className="dashProfitLabel">
            <span>Sof foyda</span>
            <b className={periodTotals.profit >= 0 ? 'green' : 'red'}>{money(periodTotals.profit)}</b>
          </div>
          <div className="dashProfitTrack">
            <div
              className={`dashProfitFill ${periodTotals.profit >= 0 ? 'pos' : 'neg'}`}
              style={{ width: `${Math.min(100, periodTotals.income > 0 ? (periodTotals.profit / periodTotals.income) * 100 : 0)}%` }}
            />
          </div>
          {prevTotals && (
            <div className="dashProfitCompare">
              <span>Oldingi davr:</span>
              <b className={prevTotals.profit >= 0 ? 'green' : 'red'}>{money(prevTotals.profit)}</b>
              <TrendBadge value={periodTotals.profit} prev={prevTotals.profit} />
            </div>
          )}
        </div>
      )}

      {/* ── Charts ── */}
      <div className="dashChartsGrid">
        <Chart title={tr.incomeChart}  rows={stats.incomeRows}  emptyText={tr.noData} />
        <Chart title={tr.expenseChart} rows={stats.expenseRows} emptyText={tr.noData} danger />
      </div>
    </div>
  )
}
