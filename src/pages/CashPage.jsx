import { useState } from 'react'
import Panel from '../components/ui/Panel'
import Field from '../components/ui/Field'
import { money, num, cashDifferenceText } from '../utils'
import { CASH_ST } from '../constants'
import { IconEdit, IconTrash, IconCheck, IconSave, IconX } from '../components/ui/Icons'

export default function CashPage({ tr, rows, approve, isAdmin, editRow, setEditRow, editForm, setEditForm, saveCashEdit, delCash, dateFilter, setDateFilter }) {
  const [acceptValues, setAcceptValues] = useState({})
  const pending  = rows.filter(r => r.status === CASH_ST.PENDING)
  const approved = rows.filter(r => r.status === CASH_ST.APPROVED)

  return (
    <Panel title={tr.cash}>
      <div className="actions" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="field" style={{ minWidth: 160 }}>
          <label>{tr.start}</label>
          <input type="date" value={dateFilter.start} onChange={e => setDateFilter({ ...dateFilter, start: e.target.value })} />
        </div>
        <div className="field" style={{ minWidth: 160 }}>
          <label>{tr.end}</label>
          <input type="date" value={dateFilter.end} onChange={e => setDateFilter({ ...dateFilter, end: e.target.value })} />
        </div>
        <button className="secondary" style={{ alignSelf: 'flex-end' }} onClick={() => setDateFilter({ start: '', end: '' })}>
          <IconX size={14} style={{ marginRight: 4 }} /> Tozalash
        </button>
      </div>
      <div className="cards two" style={{ marginBottom: 16 }}>
        <div className="card"><span>Kutilayotgan ({pending.length} ta)</span><b>{money(pending.reduce((s,r) => s+num(r.expected_cash), 0))}</b></div>
        <div className="card good"><span>Qabul qilingan ({approved.length} ta)</span><b>{money(approved.reduce((s,r) => s+num(r.accepted_cash), 0))}</b></div>
      </div>
      {editRow && (
        <div className="cashEditBox">
          <h4 style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
            <IconEdit size={16} /> Inkassatsiyani tahrirlash
          </h4>
          <div className="grid">
            <Field label="Kutilgan summa" value={editForm.expected_cash ?? ''} set={v => setEditForm({ ...editForm, expected_cash: v })} />
            <Field label="Izoh" value={editForm.note ?? ''} set={v => setEditForm({ ...editForm, note: v })} text />
          </div>
          <div className="actions">
            <button className="primary" onClick={() => saveCashEdit(editRow, editForm)}>
              <IconSave size={15} style={{ marginRight: 5 }} /> Saqlash
            </button>
            <button className="secondary" onClick={() => setEditRow(null)}>
              <IconX size={14} style={{ marginRight: 5 }} /> Bekor
            </button>
          </div>
        </div>
      )}
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>{tr.branch}</th><th>{tr.date}</th><th>{tr.expected}</th>
              <th>{tr.accepted}</th><th>{tr.difference}</th><th>{tr.status}</th>
              <th>{tr.note}</th><th>{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={8} style={{ textAlign:'center', padding:28, color:'var(--muted)' }}>Ma'lumot yo'q</td></tr>}
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.branches?.name}</td>
                <td>{r.order_date}</td>
                <td>{money(r.expected_cash)}</td>
                <td>
                  {r.status === CASH_ST.PENDING
                    ? <input className="miniInput" placeholder={String(r.expected_cash)}
                        value={acceptValues[r.id] ?? ''}
                        onChange={e => setAcceptValues(v => ({ ...v, [r.id]: e.target.value }))} />
                    : money(r.accepted_cash)}
                </td>
                <td className={num(r.difference) < 0 ? 'red' : num(r.difference) > 0 ? 'green' : ''}>
                  {r.status === CASH_ST.APPROVED ? cashDifferenceText(r.difference) : '—'}
                </td>
                <td><span className={`status ${r.status}`}>{r.status === CASH_ST.PENDING ? 'Kutilmoqda' : 'Tasdiqlangan'}</span></td>
                <td>{r.note}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {r.status === CASH_ST.PENDING && (
                    <button className="iconActionBtn" title="Qabul" style={{ background:'var(--green)', color:'#fff', border:'none' }} onClick={() => {
                      const val = acceptValues[r.id]
                      approve(r, val !== undefined && val !== '' ? val : r.expected_cash)
                      setAcceptValues(v => { const n = { ...v }; delete n[r.id]; return n })
                    }}>
                      <IconCheck size={15} />
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button className="iconActionBtn" title="Tahrirlash" onClick={() => { setEditRow(r); setEditForm({ expected_cash: r.expected_cash, note: r.note || '' }) }}>
                        <IconEdit size={15} />
                      </button>
                      <button className="iconActionBtn danger" title="O'chirish" onClick={() => delCash(r)}>
                        <IconTrash size={15} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
