import { useState } from 'react'
import Panel from '../components/ui/Panel'
import Field from '../components/ui/Field'
import Select from '../components/ui/Select'
import { ACCOUNTS, OP_TYPE } from '../constants'
import { IconSpinner, IconSave } from '../components/ui/Icons'

export default function OperationPage({ tr, isAdmin, op, setOp, categories, catName, saveOperation, editOp }) {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try { await saveOperation() }
    finally { setSaving(false) }
  }

  return (
    <Panel title={tr.operation}>
      {isAdmin && <Field type="date" label={tr.date} value={op.date} set={v => setOp({ ...op, date: v })} />}
      <div className="grid">
        <Select label={tr.type} value={op.type}
          set={v => setOp({ ...op, type: v, category_id: '' })}
          opts={[OP_TYPE.INCOME, OP_TYPE.EXPENSE]}
          display={v => v === OP_TYPE.INCOME ? tr.income : tr.outcome} />
        <Select label={tr.account} value={op.account} set={v => setOp({ ...op, account: v })} opts={ACCOUNTS} />
        <div className="field">
          <label>{tr.category}</label>
          <select value={op.category_id} onChange={e => setOp({ ...op, category_id: e.target.value })}>
            <option value="">{tr.category}</option>
            {categories.filter(c => c.type === op.type).map(c => (
              <option key={c.id} value={c.id}>{catName(c)}</option>
            ))}
          </select>
        </div>
        <Field label={tr.amount} value={op.amount} set={v => setOp({ ...op, amount: v })} />
      </div>
      <textarea placeholder={tr.note} value={op.note || ''} onChange={e => setOp({ ...op, note: e.target.value })} />
      <button className="primary" onClick={handleSave} disabled={saving}
        style={{ display:'inline-flex', alignItems:'center', gap:7 }}>
        {saving ? <IconSpinner size={15} /> : <IconSave size={15} />}
        {saving ? 'Saqlanmoqda...' : (editOp ? tr.edit : tr.save)}
      </button>
    </Panel>
  )
}
