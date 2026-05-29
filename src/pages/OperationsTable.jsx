import { useState } from 'react'
import Panel from '../components/ui/Panel'
import { money, num } from '../utils'
import { ACCOUNTS, OP_TYPE } from '../constants'
import {
  IconDownload, IconUpload, IconClipboard, IconPrint,
  IconEdit, IconTrash, IconFilter, IconX, IconSearch
} from '../components/ui/Icons'

const SortIcon = ({ col, sortCol, sortDir }) => {
  if (sortCol !== col) return <span style={{ opacity:.25, fontSize:10, marginLeft:3 }}>⇅</span>
  return <span style={{ fontSize:10, marginLeft:3, color:'var(--yellow)' }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
}

export default function OperationsTable({
  tr, rows, catName, isAdmin, selectedIds, setSelectedIds, bulkDelete,
  edit, del, exportCSV, importCSV, downloadTemplate, printPDF, title,
  showFilters, filterOpen, setFilterOpen, reportFilter, setReportFilter, categories
}) {
  const [sortCol, setSortCol]   = useState('created_at')
  const [sortDir, setSortDir]   = useState('desc')
  const [search,  setSearch]    = useState('')

  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const filtered = rows.filter(r => {
    if (!search.trim()) return true
    const s = search.toLowerCase()
    return (
      (r.branches?.name || '').toLowerCase().includes(s) ||
      (catName(r.categories) || '').toLowerCase().includes(s) ||
      (r.note || '').toLowerCase().includes(s) ||
      String(r.amount).includes(s)
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    let va, vb
    if (sortCol === 'amount')     { va = num(a.amount);    vb = num(b.amount) }
    else if (sortCol === 'branch'){ va = a.branches?.name || ''; vb = b.branches?.name || '' }
    else if (sortCol === 'type')  { va = a.type || '';     vb = b.type || '' }
    else                          { va = a.created_at || ''; vb = b.created_at || '' }
    if (va < vb) return sortDir === 'asc' ? -1 : 1
    if (va > vb) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const allIds      = sorted.map(r => r.id)
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id))
  const totalIncome  = rows.filter(r => r.type === OP_TYPE.INCOME).reduce((s, r) => s + num(r.amount), 0)
  const totalExpense = rows.filter(r => r.type === OP_TYPE.EXPENSE).reduce((s, r) => s + num(r.amount), 0)
  const balance      = totalIncome - totalExpense

  return (
    <Panel title={title || tr.history}>
      <div className="reportActions actions">
        {showFilters && (
          <button className={`secondary filterToggle ${filterOpen ? 'active' : ''}`} onClick={() => setFilterOpen(!filterOpen)}>
            <IconFilter size={14} style={{ marginRight: 5 }} />
            Filter {filterOpen ? '▲' : '▼'}
          </button>
        )}
        {exportCSV && (
          <button className="secondary" onClick={exportCSV}>
            <IconDownload size={14} style={{ marginRight: 5 }} />{tr.exportExcel}
          </button>
        )}
        {isAdmin && importCSV && (
          <label className="secondary fileAction" style={{ cursor:'pointer' }}>
            <IconUpload size={14} style={{ marginRight: 5 }} /> Import
            <input type="file" accept=".csv,.xlsx,.xls" onChange={importCSV} style={{ display:'none' }} />
          </label>
        )}
        {downloadTemplate && (
          <button className="secondary" onClick={downloadTemplate}>
            <IconClipboard size={14} style={{ marginRight: 5 }} /> Shablon
          </button>
        )}
        {printPDF && (
          <button className="secondary" onClick={printPDF}>
            <IconPrint size={14} style={{ marginRight: 5 }} /> Print
          </button>
        )}
        {isAdmin && selectedIds.length > 0 && (
          <>
            <button className="dangerBtn" onClick={() => bulkDelete(selectedIds)}>
              <IconTrash size={14} style={{ marginRight: 5 }} />{selectedIds.length} ta o'chirish
            </button>
            <button className="secondary" onClick={() => setSelectedIds([])}>
              <IconX size={14} style={{ marginRight: 4 }} /> Bekor
            </button>
          </>
        )}

        {/* Search */}
        <div className="tableSearchBox">
          <IconSearch size={14} />
          <input
            placeholder="Qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="tableSearchClear" onClick={() => setSearch('')}><IconX size={12} /></button>}
        </div>
      </div>

      {showFilters && filterOpen && (
        <div className="reportFilterBox">
          <div className="filterTitle">
            <b><IconFilter size={13} style={{ marginRight:6 }} />Filtr</b>
            <span>{filtered.length} ta natija</span>
          </div>
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
              <button className="secondary" onClick={() => setReportFilter({ type: 'ALL', category_id: 'ALL', account: 'ALL' })}>
                <IconX size={13} style={{ marginRight:4 }} /> Reset
              </button>
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
              {isAdmin && <th style={{ width:36 }}><input type="checkbox" checked={allSelected} onChange={() => setSelectedIds(allSelected ? [] : allIds)} /></th>}
              <th className="sortable" onClick={() => handleSort('branch')}>
                {tr.branch}<SortIcon col="branch" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className="sortable" onClick={() => handleSort('created_at')}>
                {tr.date}<SortIcon col="created_at" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th className="sortable" onClick={() => handleSort('type')}>
                {tr.type}<SortIcon col="type" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th>{tr.category}</th><th>{tr.account}</th>
              <th className="sortable" onClick={() => handleSort('amount')}>
                {tr.amount}<SortIcon col="amount" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th>{tr.note}</th>
              <th>{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={isAdmin ? 10 : 9} style={{ textAlign:'center', padding:28, color:'var(--muted)' }}>Ma'lumot yo'q</td></tr>
            )}
            {sorted.map(r => (
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
                <td style={{ whiteSpace:'nowrap' }}>
                  {edit && <button className="iconActionBtn" title="Tahrirlash" onClick={() => edit(r)}><IconEdit size={14} /></button>}
                  {isAdmin && del && <button className="iconActionBtn danger" title="O'chirish" onClick={() => del(r)}><IconTrash size={14} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length > 0 && (
        <div className="tableFooter">{sorted.length} ta yozuv</div>
      )}
    </Panel>
  )
}
