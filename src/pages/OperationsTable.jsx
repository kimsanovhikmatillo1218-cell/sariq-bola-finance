import Panel from '../components/ui/Panel'
import { money, num } from '../utils'
import { ACCOUNTS, OP_TYPE } from '../constants'

export default function OperationsTable({
  tr, rows, catName, isAdmin, selectedIds, setSelectedIds, bulkDelete,
  edit, del, exportCSV, importCSV, downloadTemplate, printPDF, title,
  showFilters, filterOpen, setFilterOpen, reportFilter, setReportFilter, categories
}) {
  const allIds      = rows.map(r => r.id)
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id))
  const totalIncome  = rows.filter(r => r.type === OP_TYPE.INCOME).reduce((s, r) => s + num(r.amount), 0)
  const totalExpense = rows.filter(r => r.type === OP_TYPE.EXPENSE).reduce((s, r) => s + num(r.amount), 0)
  const balance      = totalIncome - totalExpense

  return (
    <Panel title={title || tr.history}>
      <div className="reportActions actions">
        {showFilters && (
          <button className={`secondary filterToggle ${filterOpen ? 'active' : ''}`} onClick={() => setFilterOpen(!filterOpen)}>
            🔍 Filter {filterOpen ? '▲' : '▼'}
          </button>
        )}
        {exportCSV && <button className="secondary" onClick={exportCSV}>📊 {tr.exportExcel}</button>}
        {isAdmin && importCSV && (
          <label className="secondary fileAction">📥 Import<input type="file" accept=".csv,.xlsx,.xls" onChange={importCSV} /></label>
        )}
        {downloadTemplate && <button className="secondary" onClick={downloadTemplate}>📋 Shablon</button>}
        {printPDF && <button className="secondary" onClick={printPDF}>🖨️ Print</button>}
        {isAdmin && selectedIds.length > 0 && (
          <>
            <button className="dangerBtn" onClick={() => bulkDelete(selectedIds)}>🗑 {selectedIds.length} ta o'chirish</button>
            <button className="secondary" onClick={() => setSelectedIds([])}>✕ Bekor</button>
          </>
        )}
      </div>
      {showFilters && filterOpen && (
        <div className="reportFilterBox">
          <div className="filterTitle"><b>🔍 Filtr</b><span>{rows.length} ta natija</span></div>
          <div className="grid filterGrid" style={{ gridTemplateColumns: 'repeat(3,1fr) auto' }}>
            <div className="field">
              <label>{tr.type}</label>
              <select value={reportFilter.type} onChange={e => setReportFilter({ ...reportFilter, type: e.target.value })}>
                <option value="ALL">Barchasi</option>
                <option value={OP_TYPE.INCOME}>{tr.income}</option>
                <option value={OP_TYPE.EXPENSE}>{tr.outcome}</option>
              </select>
            </div>
            <div className="field">
              <label>{tr.category}</label>
              <select value={reportFilter.category_id} onChange={e => setReportFilter({ ...reportFilter, category_id: e.target.value })}>
                <option value="ALL">Barchasi</option>
                {(categories || []).map(c => <option key={c.id} value={c.id}>{catName(c)}</option>)}
              </select>
            </div>
            <div className="field">
              <label>{tr.account}</label>
              <select value={reportFilter.account} onChange={e => setReportFilter({ ...reportFilter, account: e.target.value })}>
                <option value="ALL">Barchasi</option>
                {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="field filterResetField">
              <label>&nbsp;</label>
              <button className="secondary" onClick={() => setReportFilter({ type: 'ALL', category_id: 'ALL', account: 'ALL' })}>✕ Reset</button>
            </div>
          </div>
        </div>
      )}
      <div className="cards three" style={{ marginBottom: 12 }}>
        <div className="card good"><span>{tr.income}</span><b>{money(totalIncome)}</b></div>
        <div className="card bad"><span>{tr.outcome}</span><b>{money(totalExpense)}</b></div>
        <div className={`card ${balance >= 0 ? 'premium' : 'bad'}`}><span>Balans</span><b>{money(balance)}</b></div>
      </div>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              {isAdmin && <th><input type="checkbox" checked={allSelected} onChange={() => setSelectedIds(allSelected ? [] : allIds)} /></th>}
              <th>{tr.branch}</th><th>{tr.date}</th><th>{tr.type}</th>
              <th>{tr.category}</th><th>{tr.account}</th><th>{tr.amount}</th><th>{tr.note}</th>
              <th>{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={9} style={{ textAlign:'center', padding:28, color:'var(--muted)' }}>Ma'lumot yo'q</td></tr>}
            {rows.map(r => (
              <tr key={r.id} className={selectedIds.includes(r.id) ? 'selectedRow' : ''}>
                {isAdmin && (
                  <td><input type="checkbox" checked={selectedIds.includes(r.id)}
                    onChange={() => setSelectedIds(prev => prev.includes(r.id) ? prev.filter(x => x !== r.id) : [...prev, r.id])} /></td>
                )}
                <td>{r.branches?.name}</td>
                <td>{new Date(r.created_at).toLocaleString('uz-UZ')}</td>
                <td><span className={`typeBadge ${r.type === OP_TYPE.INCOME ? 'income' : 'outcome'}`}>{r.type === OP_TYPE.INCOME ? tr.income : tr.outcome}</span></td>
                <td>{catName(r.categories)}</td>
                <td>{r.account}</td>
                <td className={r.type === OP_TYPE.INCOME ? 'green' : 'red'}>{money(r.amount)}</td>
                <td>{r.note}</td>
                <td>
                  {edit && <button onClick={() => edit(r)}>✏️</button>}
                  {isAdmin && del && <button onClick={() => del(r)}>🗑</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}