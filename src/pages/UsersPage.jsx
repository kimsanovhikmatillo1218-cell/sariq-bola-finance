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
              <th>Holat</th><th>{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.active !== false).map((u, i) => {
              const online = isOnline(u)
              return (
                <tr key={u.id}>
                  <td>{i + 1}</td>
                  <td style={{ position:'relative' }}>
                    <img src={avatarSrc(u)} style={{ width:34, height:34, borderRadius:'50%', objectFit:'cover', display:'block' }} alt="" />
                    <span style={{
                      position:'absolute', bottom:6, right:6,
                      width:9, height:9, borderRadius:'50%',
                      background: online ? '#22c55e' : 'var(--muted)',
                      border: '2px solid var(--card)',
                      boxSizing:'border-box'
                    }} title={online ? 'Online' : 'Offline'} />
                  </td>
                  <td>{u.full_name}</td>
                  <td>{u.login}</td>
                  <td>
                    {u.password
                      ? <code style={{ fontSize:12, background:'var(--card2)', padding:'2px 6px', borderRadius:6 }}>{u.password}</code>
                      : <span style={{ color:'var(--muted)', fontSize:12 }}>—</span>
                    }
                  </td>
                  <td>
                    <span style={{
                      display:'inline-flex', alignItems:'center', gap:4,
                      fontSize:12, fontWeight:600, color:'var(--text)'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      display:'inline-flex', alignItems:'center', gap:5,
                      padding:'3px 9px', borderRadius:20, fontSize:12, fontWeight:600,
                      background: online ? 'rgba(34,197,94,.12)' : 'rgba(120,120,120,.1)',
                      color: online ? '#16a34a' : 'var(--muted)',
                    }}>
                      <span style={{
                        width:7, height:7, borderRadius:'50%', flexShrink:0,
                        background: online ? '#22c55e' : 'var(--muted)',
                        boxShadow: online ? '0 0 5px #22c55e' : 'none'
                      }} />
                      {online ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td>
                    <button className="iconActionBtn" onClick={() => edit(u)} title="Tahrirlash"><IconEdit size={15} /></button>
                    <button className="iconActionBtn danger" onClick={() => deactivate(u)} title="O'chirish"><IconTrash size={15} /></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
