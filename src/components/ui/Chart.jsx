import { money } from '../../utils'

export default function Chart({ title, rows, emptyText, danger }) {
  const max = Math.max(...rows.map(r => r.value), 1)
  return (
    <div className="chartBox">
      <h3>{title}</h3>
      {rows.length === 0 && <div className="empty">{emptyText}</div>}
      {rows.map(r => (
        <div className="chartRow" key={r.name}>
          <span className="chartLabel">{r.name}</span>
          <div className="chartBar">
            <div className={`chartFill ${danger ? 'danger' : ''}`} style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <span className="chartValue">{money(r.value)}</span>
        </div>
      ))}
    </div>
  )
}