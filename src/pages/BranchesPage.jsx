import { useState } from 'react'
import Panel from '../components/ui/Panel'
import Field from '../components/ui/Field'

export default function BranchesPage({ tr, branches, saveBranch, deleteBranch, toggleBranch }) {
  const [form, setForm]     = useState({ name: '', code: '', sort_order: '' })
  const [editId, setEditId] = useState(null)

  const startEdit = b => {
    setEditId(b.id)
    setForm({ name: b.name || '', code: b.code || '', sort_order: String(b.sort_order ?? '') })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancel = () => {
    setEditId(null)
    setForm({ name: '', code: '', sort_order: '' })
  }

  const handleSave = () => {
    saveBranch(form, editId, () => {
      setEditId(null)
      setForm({ name: '', code: '', sort_order: '' })
    })
  }

  return (
    <Panel title="🏪 Filiallar">
      {/* Form */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr) auto', alignItems: 'end', gap: 12 }}>
        <Field
          label="Filial nomi"
          value={form.name}
          set={v => setForm({ ...form, name: v })}
          placeholder="masalan: Prospekt"
        />
        <Field
          label="Kod (qisqa nom)"
          value={form.code}
          set={v => setForm({ ...form, code: v.toUpperCase() })}
          placeholder="masalan: PROSPEKT"
        />
        <Field
          label="Tartib raqami"
          value={form.sort_order}
          set={v => setForm({ ...form, sort_order: v })}
          type="number"
          placeholder="1, 2, 3..."
        />
        <div className="field">
          <label>&nbsp;</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="primary" onClick={handleSave}>
              {editId ? '💾 Saqlash' : '➕ Qo\'shish'}
            </button>
            {editId && (
              <button className="secondary" onClick={cancel}>✕ Bekor</button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="tableWrap" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Filial nomi</th>
              <th>Kod</th>
              <th>Tartib</th>
              <th>Holat</th>
              <th>{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {branches.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 28, color: 'var(--muted)' }}>
                  Filial yo'q
                </td>
              </tr>
            )}
            {branches.map((b, i) => (
              <tr key={b.id} className={editId === b.id ? 'selectedRow' : ''}>
                <td>{i + 1}</td>
                <td><b>{b.name}</b></td>
                <td><code style={{ background: 'var(--card2)', padding: '2px 8px', borderRadius: 6, fontSize: 13, borderRadius: 8, border: '1px solid var(--line)', fontFamily: 'monospace', fontWeight: 700 }}>{b.code}</code></td>
                <td>{b.sort_order ?? '—'}</td>
                <td>
                  <span
                    className={`typeBadge ${b.active ? 'income' : 'outcome'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleBranch(b)}
                    title="Holat o'zgartirish uchun bosing"
                  >
                    {b.active ? '✅ Faol' : '⛔ Nofaol'}
                  </span>
                </td>
                <td>
                  <button onClick={() => startEdit(b)} title="Tahrirlash">✏️</button>
                  <button onClick={() => deleteBranch(b)} title="O'chirish" style={{ marginLeft: 4 }}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info box */}
      <div style={{
        marginTop: 16, padding: '12px 16px', borderRadius: 14,
        background: 'var(--card2)', border: '1px solid var(--line)', color: 'var(--muted)', fontSize: 13, lineHeight: 1.7
      }}>
        💡 <b>Eslatma:</b> Filial nofaol qilinsa, tizimda ko'rinmaydi, lekin ma'lumotlari saqlanib qoladi.
        <br />
        🔑 <b>Kod</b> — buyurtma va hisobotlarda filiallarni aniqlash uchun. Katta harflarda yozing (PROSPEKT, MAKRO...).
      </div>
    </Panel>
  )
}
