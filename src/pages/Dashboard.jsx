import Chart from '../components/ui/Chart'
import { money } from '../utils'

export default function Dashboard({ tr, stats }) {
  return (
    <div className="dash">
      <div className="cards two">
        <div className="card premium"><span>{tr.cashBalance}</span><b>{money(stats.cash)}</b></div>
        <div className="card premium"><span>{tr.bankBalance}</span><b>{money(stats.bank)}</b></div>
      </div>
      <Chart title={tr.incomeChart}  rows={stats.incomeRows}  emptyText={tr.noData} />
      <Chart title={tr.expenseChart} rows={stats.expenseRows} emptyText={tr.noData} danger />
    </div>
  )
}