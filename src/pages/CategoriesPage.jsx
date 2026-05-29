import Panel from '../components/ui/Panel'
import Field from '../components/ui/Field'
import Select from '../components/ui/Select'
import { OP_TYPE } from '../constants'
import { IconEdit, IconTrash, IconX } from '../components/ui/Icons'

export default function CategoriesPage({ tr, categories, newCat, setNewCat, save, editCat, cancelEdit, startEdit, del, selectedIds, setSelectedIds, bulkDelete }) {
  const allIds      = categories.map(c => c.id)
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id))
  return (
    <Panel title={tr.categories}>
      <div className="grid">
        <Field label="Nomi (UZ)"     value={newCat.name}    set={v => setNewCat({ ...newCat, name: v })} />
        <Field label="Nomi (RU)"     value={newCat.name_ru} set={v => setNewCat({ ...newCat, name_ru: v })} />
        <Field label="Nomi (Кирилл)" value={newCat.name_cy} set={v => setNewCat({ ...newCat, name_cy: v })} />
        <Select label={tr.type} value={newCat.type} set={v => setNewCat({ ...newCat, type: v })}
          opts={[OP_TYPE.INCOME, OP_TYPE.EXPENSE]}
          display={v => v === OP_TYPE.INCOME ? tr.income : tr.outcome} />
      </div>
      <div className="actions">
        <button className="primary" onClick={save}>{editCat ? tr.edit : tr.create}</button>
        {editCat && (
          <button className="secondary" onClick={cancelEdit} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <IconX size={14} /> {tr.cancel}
          </button>
        )}
        {selectedIds.length > 0 && (
          <>
            <button className="dangerBtn" onClick={() => bulkDelete(selectedIds)}
              style={{ display:'flex', alignItems:'center', gap:5 }}>
              <IconTrash size={14} /> {selectedIds.length} ta
            </button>
            <button className="secondary" onClick={() => setSelectedIds([])}
              style={{ display:'flex', alignItems:'center', gap:5 }}>
              <IconX size={14} /> Bekor
            </button>
          </>
        )}
      </div>
      <div className="tableWrap" style={{ marginTop: 12 }}>
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" checked={allSelected} onChange={() => setSelectedIds(allSelected ? [] : allIds)} /></th>
              <th>#</th><th>Nomi (UZ)</th><th>Nomi (RU)</th><th>{tr.type}</th><th>{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:24, color:'var(--muted)' }}>Kategoriya yo'q</td></tr>
            )}
            {categories.map((c, i) => (
              <tr key={c.id} className={editCat?.id === c.id ? 'selectedRow' : ''}>
                <td>
                  <input type="checkbox" checked={selectedIds.includes(c.id)}
                    onChange={() => setSelectedIds(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])} />
                </td>
                <td>{i + 1}</td>
                <td>{c.name}</td>
                <td>{c.name_ru || '—'}</td>
                <td>
                  <span className={`typeBadge ${c.type === OP_TYPE.INCOME ? 'income' : 'outcome'}`}>
                    {c.type === OP_TYPE.INCOME ? tr.income : tr.outcome}
                  </span>
                </td>
                <td>
                  <button className="iconActionBtn" onClick={() => startEdit(c)} title="Tahrirlash"><IconEdit size={15} /></button>
                  <button className="iconActionBtn danger" onClick={() => del(c)} title="O'chirish"><IconTrash size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
