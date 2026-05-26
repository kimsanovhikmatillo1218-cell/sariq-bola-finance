import Panel from '../components/ui/Panel'
import Field from '../components/ui/Field'
import Select from '../components/ui/Select'
import { money } from '../utils'
import { SALARY_T } from '../constants'

export default function EmployeesPage({ tr, employees, form, setForm, save, del, editEmp, setEditEmp, editForm, setEditForm, saveEdit }) {
  return (
    <Panel title={tr.employees}>
      <div className="grid">
        <Field label={tr.fullName} value={form.full_name} set={v => setForm({ ...form, full_name: v })} />
        <Field label={tr.position} value={form.position}  set={v => setForm({ ...form, position: v })} />
        <Field type="date" label={tr.hireDate} value={form.hire_date} set={v => setForm({ ...form, hire_date: v })} />
        <Select label={tr.salaryType} value={form.salary_type} set={v => setForm({ ...form, salary_type: v })}
          opts={[SALARY_T.HOURLY, SALARY_T.MONTHLY]} display={v => v === SALARY_T.HOURLY ? tr.hourly : tr.monthly} />
        {form.salary_type === SALARY_T.HOURLY
          ? <Field label={tr.hourlyRate}    value={form.hourly_rate}    set={v => setForm({ ...form, hourly_rate: v })} />
          : <Field label={tr.monthlySalary} value={form.monthly_salary} set={v => setForm({ ...form, monthly_salary: v })} />}
      </div>
      <button className="primary" onClick={save}>{tr.create}</button>

      {editEmp && (
        <div className="cashEditBox" style={{ marginTop: 20 }}>
          <h4>✏️ {tr.edit}</h4>
          <div className="grid">
            <Field label={tr.fullName} value={editForm.full_name ?? ''} set={v => setEditForm({ ...editForm, full_name: v })} />
            <Field label={tr.position} value={editForm.position ?? ''}  set={v => setEditForm({ ...editForm, position: v })} />
            <Field type="date" label={tr.hireDate} value={editForm.hire_date ?? ''} set={v => setEditForm({ ...editForm, hire_date: v })} />
            <Select label={tr.salaryType} value={editForm.salary_type ?? SALARY_T.HOURLY} set={v => setEditForm({ ...editForm, salary_type: v })}
              opts={[SALARY_T.HOURLY, SALARY_T.MONTHLY]} display={v => v === SALARY_T.HOURLY ? tr.hourly : tr.monthly} />
            {(editForm.salary_type || SALARY_T.HOURLY) === SALARY_T.HOURLY
              ? <Field label={tr.hourlyRate}    value={editForm.hourly_rate ?? ''}    set={v => setEditForm({ ...editForm, hourly_rate: v })} />
              : <Field label={tr.monthlySalary} value={editForm.monthly_salary ?? ''} set={v => setEditForm({ ...editForm, monthly_salary: v })} />}
          </div>
          <div className="actions">
            <button className="primary" onClick={() => saveEdit(editEmp, editForm)}>💾 {tr.save}</button>
            <button className="secondary" onClick={() => setEditEmp(null)}>✕ {tr.cancel}</button>
          </div>
        </div>
      )}

      <div className="tableWrap" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>#</th><th>{tr.fullName}</th><th>{tr.position}</th>
              <th>{tr.hireDate}</th><th>{tr.salaryType}</th><th>{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', padding:24, color:'var(--muted)' }}>Xodim yo'q</td></tr>}
            {employees.map((e, i) => (
              <tr key={e.id}>
                <td>{i + 1}</td><td>{e.full_name}</td><td>{e.position}</td><td>{e.hire_date}</td>
                <td>{e.salary_type === SALARY_T.HOURLY ? `${tr.hourly} — ${money(e.hourly_rate)} / soat` : `${tr.monthly} — ${money(e.monthly_salary)}`}</td>
                <td>
                  <button onClick={() => { setEditEmp(e); setEditForm({ full_name: e.full_name, position: e.position, hire_date: e.hire_date, salary_type: e.salary_type, hourly_rate: e.hourly_rate || '', monthly_salary: e.monthly_salary || '' }) }}>✏️</button>
                  <button onClick={() => del(e)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}