import { useMemo, Fragment, useState } from 'react'
import Panel from '../components/ui/Panel'
import { money, num, cashDifferenceText, calcOrderExpected } from '../utils'
import { IconDownload, IconUpload, IconClipboard, IconPrint, IconEdit, IconTrash, IconCalendar, IconSearch, IconX } from '../components/ui/Icons'

function SortIcon({ col, sort }) {
  const active = sort.col === col
  const color  = active ? 'var(--accent)' : 'var(--muted)'
  return (
    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke={color} strokeWidth={2.2}
      strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft:3, flexShrink:0 }}>
      {(!active || sort.dir === 'asc')
        ? <path d="M12 5v14M5 12l7-7 7 7" opacity={active && sort.dir === 'asc' ? 1 : .35} />
        : <path d="M12 5v14M5 12l7 7 7-7" />}
    </svg>
  )
}

export default function OrdersPage({ tr, rows, isAdmin, edit, del, exportCSV, importCSV, downloadTemplate, printPDF }) {
  const [search, setSearch] = useState('')
  const [sort, setSort]     = useState({ col: 'date', dir: 'desc' })

  const handleSort = col => setSort(s => s.col === col && s.dir === 'desc' ? { col, dir:'asc' } : { col, dir:'desc' })

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return q ? rows.filter(r => (r.branches?.name || '').toLowerCase().includes(q)) : rows
  }, [rows, search])

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(r => {
      const key = `${r.order_date || r.created_at?.slice(0,10)}_${r.branch_id}`
      if (!map[key]) map[key] = { date: r.order_date || r.created_at?.slice(0,10), branch: r.branches?.name, rows: [] }
      map[key].rows.push(r)
    })
    const arr = Object.values(map)
    arr.sort((a, b) => {
      let cmp = 0
      if (sort.col === 'date')   cmp = String(a.date).localeCompare(String(b.date))
      if (sort.col === 'branch') cmp = String(a.branch).localeCompare(String(b.branch))
      return sort.dir === 'desc' ? -cmp : cmp
    })
    return arr
  }, [filtered, sort])

  const grandTotal = useMemo(() => filtered.reduce((s, r) => ({
    total:   s.total   + num(r.total),
    uzcard:  s.uzcard  + num(r.uzcard),
    humo:    s.humo    + num(r.humo),
    rahmat:  s.rahmat  + num(r.rahmat),
    rxmt:    s.rxmt    + num(r.rxmt),
    click:   s.click   + num(r.click),
    uzum:    s.uzum    + num(r.uzum),
    yandex:  s.yandex  + num(r.yandex),
    expense: s.expense + num(r.expense),
    gum_count:    s.gum_count    + num(r.gum_count),
    cash_amount:  s.cash_amount  + num(r.cash_amount),
  }), { total:0,uzcard:0,humo:0,rahmat:0,rxmt:0,click:0,uzum:0,yandex:0,expense:0,gum_count:0,cash_amount:0 }), [filtered])

  const grandExp  = calcOrderExpected(grandTotal)
  const grandDiff = grandTotal.cash_amount - grandExp

  return (
    <Panel title={tr.orderReports}>
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:12 }}>
        {/* Search */}
        <div className="tableSearchBox" style={{ flex:'1 1 180px', maxWidth:260 }}>
          <IconSearch size={14} />
          <input
            placeholder="Filial bo'yicha qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="tableSearchClear" onClick={() => setSearch('')}><IconX size={12} /></button>
          )}
        </div>

        <div className="reportActions actions" style={{ margin:0, flex:'1 1 auto', justifyContent:'flex-end' }}>
          <button className="secondary" onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <IconDownload size={14} />{tr.exportExcel}
          </button>
          {isAdmin && (
            <>
              <label className="secondary fileAction" style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                <IconUpload size={14} /> Import
                <input type="file" accept=".csv,.xlsx,.xls" onChange={importCSV} style={{ display:'none' }} />
              </label>
              <button className="secondary" style={{ display:'flex', alignItems:'center', gap:6 }} onClick={downloadTemplate}>
                <IconClipboard size={14} /> Shablon
              </button>
            </>
          )}
          <button className="secondary" style={{ display:'flex', alignItems:'center', gap:6 }} onClick={printPDF}>
            <IconPrint size={14} /> Print
          </button>
        </div>
      </div>

      {filtered.length === 0 && <div className="empty">Ma'lumot yo'q</div>}
      {filtered.length > 0 && (
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('branch')}>
                  {tr.branch} <SortIcon col="branch" sort={sort} />
                </th>
                <th className="sortable" onClick={() => handleSort('date')}>
                  {tr.date} <SortIcon col="date" sort={sort} />
                </th>
                <th>{tr.shift}</th>
                <th>{tr.total}</th><th>{tr.uzcard}</th><th>{tr.humo}</th>
                <th>{tr.rahmat}</th><th>{tr.rxmt}</th><th>Click</th><th>{tr.uzum}</th><th>{tr.yandex}</th>
                <th>Hisob. naqd</th><th>{tr.cashAmount}</th><th>Tafovut</th>
                <th>{tr.expense}</th><th>{tr.gum}</th>
                {isAdmin && <th>{tr.actions}</th>}
              </tr>
            </thead>
            <tbody>
              {grouped.map(group => {
                const jami = group.rows.reduce((s, r) => ({
                  total: s.total + num(r.total), uzcard: s.uzcard + num(r.uzcard),
                  humo: s.humo + num(r.humo), rahmat: s.rahmat + num(r.rahmat),
                  rxmt: s.rxmt + num(r.rxmt), click: s.click + num(r.click),
                  uzum: s.uzum + num(r.uzum), yandex: s.yandex + num(r.yandex),
                  expense: s.expense + num(r.expense),
                  gum_count: s.gum_count + num(r.gum_count), cash_amount: s.cash_amount + num(r.cash_amount)
                }), { total:0,uzcard:0,humo:0,rahmat:0,rxmt:0,click:0,uzum:0,yandex:0,expense:0,gum_count:0,cash_amount:0 })
                const jamiExp  = calcOrderExpected(jami)
                const jamiDiff = jami.cash_amount - jamiExp
                return (
                  <Fragment key={group.date + group.branch}>
                    <tr className="orderGroupHeader">
                      <td colSpan={isAdmin ? 17 : 16}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                          <IconCalendar size={13} /> {group.date} — {group.branch}
                        </span>
                      </td>
                    </tr>
                    {group.rows.map(r => {
                      const exp = calcOrderExpected(r), diff = num(r.cash_amount) - exp
                      return (
                        <tr key={r.id}>
                          <td>{r.branches?.name}</td><td>{r.order_date}</td><td>{r.shift_no}-smena</td>
                          <td>{money(r.total)}</td><td>{money(r.uzcard)}</td><td>{money(r.humo)}</td>
                          <td>{money(r.rahmat)}</td><td>{money(r.rxmt)}</td><td>{money(r.click)}</td><td>{money(r.uzum)}</td><td>{money(r.yandex)}</td>
                          <td>{money(exp)}</td><td>{money(r.cash_amount)}</td>
                          <td className={diff < 0 ? 'red' : diff > 0 ? 'green' : ''}>{cashDifferenceText(diff)}</td>
                          <td>{money(r.expense)}</td><td>{r.gum_count}</td>
                          {isAdmin && (
                            <td style={{ whiteSpace:'nowrap' }}>
                              <button className="iconActionBtn" title="Tahrirlash" onClick={() => edit(r)}><IconEdit size={14} /></button>
                              <button className="iconActionBtn danger" title="O'chirish" onClick={() => del(r)}><IconTrash size={14} /></button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                    <tr className="orderJamiRow">
                      <td colSpan={3}><b>Jami:</b></td>
                      <td><b>{money(jami.total)}</b></td><td><b>{money(jami.uzcard)}</b></td><td><b>{money(jami.humo)}</b></td>
                      <td><b>{money(jami.rahmat)}</b></td><td><b>{money(jami.rxmt)}</b></td><td><b>{money(jami.click)}</b></td><td><b>{money(jami.uzum)}</b></td><td><b>{money(jami.yandex)}</b></td>
                      <td><b>{money(jamiExp)}</b></td><td><b>{money(jami.cash_amount)}</b></td>
                      <td className={jamiDiff < 0 ? 'red' : jamiDiff > 0 ? 'green' : ''}><b>{cashDifferenceText(jamiDiff)}</b></td>
                      <td><b>{money(jami.expense)}</b></td><td><b>{jami.gum_count}</b></td>
                      {isAdmin && <td />}
                    </tr>
                  </Fragment>
                )
              })}
            </tbody>

            {/* Grand total */}
            {grouped.length > 1 && (
              <tfoot>
                <tr className="grandTotalRow">
                  <td colSpan={3}><b>Umumiy jami</b></td>
                  <td><b>{money(grandTotal.total)}</b></td>
                  <td><b>{money(grandTotal.uzcard)}</b></td>
                  <td><b>{money(grandTotal.humo)}</b></td>
                  <td><b>{money(grandTotal.rahmat)}</b></td>
                  <td><b>{money(grandTotal.rxmt)}</b></td>
                  <td><b>{money(grandTotal.click)}</b></td>
                  <td><b>{money(grandTotal.uzum)}</b></td>
                  <td><b>{money(grandTotal.yandex)}</b></td>
                  <td><b>{money(grandExp)}</b></td>
                  <td><b>{money(grandTotal.cash_amount)}</b></td>
                  <td className={grandDiff < 0 ? 'red' : grandDiff > 0 ? 'green' : ''}><b>{cashDifferenceText(grandDiff)}</b></td>
                  <td><b>{money(grandTotal.expense)}</b></td>
                  <td><b>{grandTotal.gum_count}</b></td>
                  {isAdmin && <td />}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Footer count */}
      {filtered.length > 0 && (
        <div className="tableFooter">
          <span>{filtered.length} ta yozuv</span>
          {search && <span style={{ color:'var(--accent)', fontWeight:700 }}>· "{search}" bo'yicha filtrlangan</span>}
        </div>
      )}
    </Panel>
  )
}
