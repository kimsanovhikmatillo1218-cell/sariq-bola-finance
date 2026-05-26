import { useState } from 'react'
import Panel from '../components/ui/Panel'
import { money, num } from '../utils'

export default function PayrollArchive({ tr, runs, items }) {
  const [openRun, setOpenRun] = useState(null)
  return (
    <Panel title={tr.payrollArchive}>
      {runs.length === 0 && <div className="empty">Arxiv bo'sh</div>}
      {runs.map(run => {
        const runItems = items.filter(x => x.payroll_run_id === run.id)
        return (
          <div key={run.id} className="archiveRun">
            <div className="archiveRunHeader" onClick={() => setOpenRun(openRun === run.id ? null : run.id)}>
              <b>{run.title}</b>
              <span>{run.branches?.name} | {run.period_start} — {run.period_end}</span>
              <span>{openRun === run.id ? '▲' : '▼'}</span>
            </div>
            {openRun === run.id && runItems.length > 0 && (
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th><th>{tr.fullName}</th><th>{tr.position}</th>
                      <th>{tr.workedHours}</th><th>{tr.extraHours}</th><th>{tr.hourlyRate}</th>
                      <th>{tr.tax}</th><th>{tr.lunch}</th><th>{tr.penalty}</th>
                      <th>{tr.advance}</th><th>{tr.bonus}</th>
                      <th>{tr.cashPaid}</th><th>{tr.cardPaid}</th>
                      <th>Jami</th><th>{tr.remaining}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runItems.map((r, i) => (
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td>{r.employees?.full_name}</td><td>{r.employees?.position}</td>
                        <td>{r.worked_hours}</td><td>{r.extra_hours}</td><td>{money(r.hourly_rate)}</td>
                        <td>{money(r.tax)}</td><td>{money(r.lunch)}</td><td>{money(r.penalty)}</td>
                        <td>{money(r.advance)}</td><td>{money(r.bonus)}</td>
                        <td>{money(r.cash_paid)}</td><td>{money(r.card_paid)}</td>
                        <td><b>{money(r.total_salary)}</b></td>
                        <td className={num(r.remaining) > 0 ? 'red' : num(r.remaining) < 0 ? 'green' : ''}><b>{money(r.remaining)}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </Panel>
  )
}