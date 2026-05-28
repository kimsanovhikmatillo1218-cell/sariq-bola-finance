import Panel from '../components/ui/Panel'
import Field from '../components/ui/Field'
import { MODULES } from '../constants'
import { avatarSrc, isOnline, toggle } from '../utils'
import { IconEdit, IconTrash } from '../components/ui/Icons'

const ROLES = ['ADMIN','RAHBAR','BOSH_MANAGER','FILIAL_MANAGER','SMENA_MANAGER','BUXGALTER']

export default function UsersPage({ tr, users, branches, newUser, setNewUser, save, edit, deactivate }) {
  return (
    <Panel title={tr.users}>

      <div className="grid">
        <Field label={tr.fullName} value={newUser.full_name} set={v => setNewUser({ ...newUser, full_name: v })} />
        <Field label={tr.login}    value={newUser.login}     set={v => setNewUser({ ...newUser, login: v })} />
        <Field label={tr.password} value={newUser.password}  set={v => setNewUser({ ...newUser, password: v })}
          placeholder={newUser.id ? "Bo'sh qoldiring — o'zgarmaydi" : ''} />
        <div className="field">
          <label>{tr.role}</label>
          <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label>{tr.branch}</label>
        <div className="checkList">
          {branches.map(b => (
            <label key={b.id} className="checkItem">
              <input type="checkbox" checked={newUser.branchIds.includes(b.id)}
                onChange={() => setNewUser({ ...newUser, branchIds: toggle(newUser.branchIds, b.id) })} />
              {b.name}
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <label>{tr.access}</label>
        <div className="checkList">
          {MODULES.map(m => (
            <label key={m} className="checkItem">
              <input type="checkbox" checked={newUser.modules.includes(m)}
                onChange={() => setNewUser({ ...newUser, modules: toggle(newUser.modules, m) })} />
              {tr[m] || m}
            </label>
          ))}
        </div>
      </div>
      <button className="primary" onClick={save}>{newUser.id ? tr.edit : tr.create}</button>

      <div className="tableWrap" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Rasm</th><th>{tr.fullName}</th>
              <th>{tr.login}</th><th>Parol</th><th>{tr.role}</th>
              <th>Online</th><th>{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.active !== false).map((u, i) => (
              <tr key={u.id}>
                <td>{i + 1}</td>
                <td><img src={avatarSrc(u)} style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover' }} alt="" /></td>
                <td>{u.full_name}</td>
                <td>{u.login}</td>
                <td>
                  {u.password
                    ? <code style={{ fontSize:12, background:'var(--card2)', padding:'2px 6px', borderRadius:6 }}>{u.password}</code>
                    : <span style={{ color:'var(--muted)', fontSize:12 }}>—</span>
                  }
                </td>
                <td>{u.role}</td>
                <td>
                  <span className={`typeBadge ${isOnline(u) ? 'income' : 'outcome'}`}>
                    {isOnline(u) ? '🟢 Online' : '⚫ Offline'}
                  </span>
                </td>
                <td>
                  <button className="iconActionBtn" onClick={() => edit(u)} title="Tahrirlash"><IconEdit size={15} /></button>
                  <button className="iconActionBtn danger" onClick={() => deactivate(u)} title="O'chirish"><IconTrash size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
