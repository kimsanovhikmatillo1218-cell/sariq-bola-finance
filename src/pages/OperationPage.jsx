import Panel from '../components/ui/Panel'
import Field from '../components/ui/Field'
import Select from '../components/ui/Select'
import { ACCOUNTS, OP_TYPE } from '../constants'

export default function OperationPage({ tr, isAdmin, op, setOp, categories, catName, saveOperation, editOp }) {
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
      <button className="primary" onClick={saveOperation}>{editOp ? tr.edit : tr.save}</button>
    </Panel>
  )
}