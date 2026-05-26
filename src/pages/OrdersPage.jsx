import { useMemo, Fragment } from 'react'
import Panel from '../components/ui/Panel'
import { money, num, localDateValue, cashDifferenceText, calcOrderExpected } from '../utils'

export default function OrdersPage({ tr, rows, isAdmin, edit, del, exportCSV, importCSV, downloadTemplate, printPDF }) {
  const grouped = useMemo(() => {
    const map = {}
    rows.forEach(r => {
      const key = `${r.order_date || r.created_at?.slice(0,10)}_${r.branch_id}`
      if (!map[key]) map[key] = { date: r.order_date || r.created_at?.slice(0,10), branch: r.branches?.name, rows: [] }
      map[key].rows.push(r)
    })
    return Object.values(map).sort((a, b) => String(b.date).localeCompare(String(a.date)))
  }, [rows])

  return (
    <Panel title={tr.orderReports}>
      <div className="reportActions actions">
        <button className="secondary" onClick={exportCSV}>📊 {tr.exportExcel}</button>
        {isAdmin && (
          <>
            <label className="secondary fileAction">📥 Import<input type="file" accept=".csv,.xlsx,.xls" onChange={importCSV} /></label>
            <button className="secondary" onClick={downloadTemplate}>📋 Shablon</button>
          </>
        )}
        <button className="secondary" onClick={printPDF}>🖨️ Print</button>
      </div>
      {rows.length === 0 && <div className="empty">Ma'lumot yo'q</div>}
      {rows.length > 0 && (
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>{tr.branch}</th><th>{tr.date}</th><th>{tr.shift}</th>
                <th>{tr.total}</th><th>{tr.uzcard}</th><th>{tr.humo}</th>
                <th>{tr.rahmat}</th><th>{tr.rxmt}</th><th>{tr.uzum}</th><th>{tr.yandex}</th>
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
                  rxmt: s.rxmt + num(r.rxmt), uzum: s.uzum + num(r.uzum),
                  yandex: s.yandex + num(r.yandex), expense: s.expense + num(r.expense),
                  gum_count: s.gum_count + num(r.gum_count), cash_amount: s.cash_amount + num(r.cash_amount)
                }), { total:0,uzcard:0,humo:0,rahmat:0,rxmt:0,uzum:0,yandex:0,expense:0,gum_count:0,cash_amount:0 })
                const jamiExp  = calcOrderExpected(jami)
                const jamiDiff = jami.cash_amount - jamiExp
                return (
                  <Fragment key={group.date + group.branch}>
                    <tr className="orderGroupHeader">
                      <td colSpan={isAdmin ? 16 : 15}>📅 {group.date} — {group.branch}</td>
                    </tr>
                    {group.rows.map(r => {
                      const exp = calcOrderExpected(r), diff = num(r.cash_amount) - exp
                      return (
                        <tr key={r.id}>
                          <td>{r.branches?.name}</td><td>{r.order_date}</td><td>{r.shift_no}-smena</td>
                          <td>{money(r.total)}</td><td>{money(r.uzcard)}</td><td>{money(r.humo)}</td>
                          <td>{money(r.rahmat)}</td><td>{money(r.rxmt)}</td><td>{money(r.uzum)}</td><td>{money(r.yandex)}</td>
                          <td>{money(exp)}</td><td>{money(r.cash_amount)}</td>
                          <td className={diff < 0 ? 'red' : diff > 0 ? 'green' : ''}>{cashDifferenceText(diff)}</td>
                          <td>{money(r.expense)}</td><td>{r.gum_count}</td>
                          {isAdmin && <td><button onClick={() => edit(r)}>✏️</button><button onClick={() => del(r)}>🗑</button></td>}
                        </tr>
                      )
                    })}
                    <tr className="orderJamiRow">
                      <td colSpan={3}><b>Jami:</b></td>
                      <td><b>{money(jami.total)}</b></td><td><b>{money(jami.uzcard)}</b></td><td><b>{money(jami.humo)}</b></td>
                      <td><b>{money(jami.rahmat)}</b></td><td><b>{money(jami.rxmt)}</b></td><td><b>{money(jami.uzum)}</b></td><td><b>{money(jami.yandex)}</b></td>
                      <td><b>{money(jamiExp)}</b></td><td><b>{money(jami.cash_amount)}</b></td>
                      <td className={jamiDiff < 0 ? 'red' : jamiDiff > 0 ? 'green' : ''}><b>{cashDifferenceText(jamiDiff)}</b></td>
                      <td><b>{money(jami.expense)}</b></td><td><b>{jami.gum_count}</b></td>
                      {isAdmin && <td />}
                    </tr>
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}