import Chart from '../components/ui/Chart'
import BranchRanking from '../components/ui/BranchRanking'
import { money } from '../utils'

export default function SalesAnalytics({ tr, data }) {
  return (
    <div>
      <div className="cards three">
        <div className="card premium"><span>{tr.totalSales}</span><b>{money(data.total)}</b></div>
        <div className={`card premium ${data.growth >= 0 ? 'good' : 'bad'}`}>
          <span>{tr.growth}</span><b>{data.growth.toFixed(1)}%</b>
        </div>
        <div className="card premium"><span>Kunlar soni</span><b>{data.trend.length}</b></div>
      </div>
      <BranchRanking rows={data.branchRows} />
      <Chart title={tr.trend}       rows={data.trend}      emptyText={tr.noData} />
      <Chart title={tr.branchSales} rows={data.branchRows} emptyText={tr.noData} />
      {data.methodRows.length > 0 && <Chart title="To'lov usullari" rows={data.methodRows} emptyText={tr.noData} />}
    </div>
  )
}