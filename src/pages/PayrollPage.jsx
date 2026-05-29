import Panel from '../components/ui/Panel'
import Field from '../components/ui/Field'
import Select from '../components/ui/Select'
import { money } from '../utils'
import { IconSave, IconDownload } from '../components/ui/Icons'

export default function PayrollPage({ tr, payroll, setPayroll, calc, save, exportCSV }) {
  return (
    <Panel title={tr.payroll}>
      <div className="grid">
        <Field label="Sarlavha" value={payroll.title} set={v => setPayroll({ ...payroll, title: v })} />
        <Select label="Qism" value={payroll.part_no} set={v => setPayroll({ ...payroll, part_no: v })} opts={['1','2']} display={v => `${v}-qism`} />
        <Field type="date" label={tr.start} value={payroll.period_start} set={v => setPayroll({ ...payroll, period_start: v })} />
        <Field type="date" label={tr.end}   value={payroll.period_end}   set={v => setPayroll({ ...payroll, period_end: v })} />
      </div>
      <div className="actions" style={{ marginBottom: 12 }}>
        <button className="primary" onClick={save} style={{ display:'flex', alignItems:'center', gap:6 }}><IconSave size={15} /> {tr.save}</button>
        <button className="secondary" onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:6 }}><IconDownload size={15} /> {tr.exportExcel}</button>
      </div>
      {payroll.rows.length === 0 && <div className="empty">Xodim yo'q — avval filial tanlang</div>}
      {payroll.rows.length > 0 && (
        <div className="tableWrap">
          <table className="payrollTable">
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
              {payroll.rows.map((r, i) => {
                const c   = calc(r)
                const upd = (k, v) => setPayroll(p => ({ ...p, rows: p.rows.map((x, j) => j === i ? { ...x, [k]: v } : x) }))
                return (
                  <tr key={r.employee_id || i}>
                    <td>{i + 1}</td><td>{r.full_name}</td><td>{r.position}</td>
                    {['worked_hours','extra_hours','hourly_rate','tax','lunch','penalty','advance','bonus','cash_paid','card_paid'].map(k => (
                      <td key={k}><input className="miniInput" value={r[k] ?? ''} onChange={e => upd(k, e.target.value)} /></td>
                    ))}
                    <td><b>{money(c.total_salary)}</b></td>
                    <td className={c.remaining > 0 ? 'red' : c.remaining < 0 ? 'green' : ''}><b>{money(c.remaining)}</b></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}