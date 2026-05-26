import { money } from '../../utils'
import Panel from './Panel'

export default function BranchRanking({ rows }) {
  const max = Math.max(...rows.map(r => r.value), 1)
  return (
    <Panel title="Filial reytingi">
      {rows.length === 0 && <div className="empty">Ma'lumot yo'q</div>}
      <div className="rankingList">
        {rows.map((r, i) => (
          <div className="rankingItem" key={r.name}>
            <div className="rankNo">#{i + 1}</div>
            <div className="rankInfo">
              <b>{r.name}</b>
              <div><i style={{ width: `${(r.value / max) * 100}%` }} /></div>
            </div>
            <strong>{money(r.value)}</strong>
          </div>
        ))}
      </div>
    </Panel>
  )
}