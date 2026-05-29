import { useState } from 'react'
import Panel from '../components/ui/Panel'
import Field from '../components/ui/Field'
import Select from '../components/ui/Select'
import { money, num, cashDifferenceText } from '../utils'
import { IconSpinner, IconSave } from '../components/ui/Icons'

const FIELDS = [
  ['total','total'],['uzcard','uzcard'],['humo','humo'],
  ['rahmat','rahmat'],['rxmt','rxmt'],['click','Click'],
  ['uzum','uzum'],['yandex','yandex'],['expense','expense'],['gum_count','gum']
]

export default function OrderPage({ tr, isAdmin, order, setOrder, calcCash, saveOrder, editOrder }) {
  const [saving, setSaving] = useState(false)

  const expectedCash = calcCash()
  const actualCash   = String(order.cash_amount || '').trim() !== '' ? num(order.cash_amount) : expectedCash
  const cashDiff     = actualCash - expectedCash

  const handleSave = async () => {
    setSaving(true)
    try { await saveOrder() }
    finally { setSaving(false) }
  }

  return (
    <Panel title={tr.order}>
      {isAdmin && <Field type="date" label={tr.date} value={order.date} set={v => setOrder({ ...order, date: v })} />}
      <div className="grid">
        <Select label={tr.shift} value={order.shift_no} set={v => setOrder({ ...order, shift_no: v })} opts={['1','2']} />
        {FIELDS.map(([k, tKey]) => (
          <Field key={k} label={tr[tKey]} value={order[k] ?? ''} set={v => setOrder({ ...order, [k]: v })} />
        ))}
        <Field label="Kassadagi real naqd" value={order.cash_amount} set={v => setOrder({ ...order, cash_amount: v })} />
      </div>
      <div className="cashDiffBox">
        <div><span>Hisoblangan naqd</span><b>{money(expectedCash)}</b></div>
        <div><span>Kassadagi real naqd</span><b>{money(actualCash)}</b></div>
        <div className={cashDiff < 0 ? 'badDiff' : cashDiff > 0 ? 'goodDiff' : ''}>
          <span>Kassa tafovuti</span><b>{cashDifferenceText(cashDiff)}</b>
        </div>
      </div>
      <textarea placeholder={tr.note} value={order.note || ''} onChange={e => setOrder({ ...order, note: e.target.value })} />
      <button className="primary" onClick={handleSave} disabled={saving}
        style={{ display:'inline-flex', alignItems:'center', gap:7 }}>
        {saving ? <IconSpinner size={15} /> : <IconSave size={15} />}
        {saving ? 'Saqlanmoqda...' : (editOrder ? tr.edit : tr.save)}
      </button>
    </Panel>
  )
}
