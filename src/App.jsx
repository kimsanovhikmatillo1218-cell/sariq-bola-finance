import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib'
import './index.css'

const ACCOUNTS = ['Naqd', 'Bank', 'Click']
const MONEY = n => Number(n || 0).toLocaleString('ru-RU') + " so‘m"

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('finance_user') || 'null'))
  const [page, setPage] = useState(localStorage.getItem('finance_page') || 'dashboard')
  const [login, setLogin] = useState(localStorage.getItem('finance_login') || '')
  const [password, setPassword] = useState(localStorage.getItem('finance_password') || '')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(true)

  const [branches, setBranches] = useState([])
  const [categories, setCategories] = useState([])
  const [operations, setOperations] = useState([])
  const [orders, setOrders] = useState([])
  const [cashRows, setCashRows] = useState([])
  const [branch, setBranch] = useState(localStorage.getItem('finance_branch') || '')
  const [loading, setLoading] = useState(false)

  const [op, setOp] = useState({
    type: 'Kirim',
    account: 'Naqd',
    category_id: '',
    amount: '',
    note: '',
    search: ''
  })

  const [order, setOrder] = useState({
    shift_no: '1',
    total: '',
    uzcard: '',
    humo: '',
    rahmat: '',
    rxmt: '',
    click: '',
    uzum: '',
    yandex: '',
    expense: '',
    gum_count: '',
    note: ''
  })

  const [report, setReport] = useState({ start: '', end: '', type: 'ALL', account: 'ALL' })
  const [orderReport, setOrderReport] = useState({ start: '', end: '' })

  useEffect(() => { loadBase() }, [])
  useEffect(() => { if (user) loadAll() }, [user, branch])

  function changePage(p) {
    setPage(p)
    localStorage.setItem('finance_page', p)
  }

  async function loadBase() {
    const [{ data: b }, { data: c }] = await Promise.all([
      supabase.from('branches').select('*').eq('active', true).order('name'),
      supabase.from('categories').select('*').eq('active', true).order('name')
    ])

    setBranches(b || [])
    setCategories(c || [])

    if (!branch && b?.length) {
      setBranch(b[0].id)
      localStorage.setItem('finance_branch', b[0].id)
    }
  }

  async function loadAll() {
    setLoading(true)

    const [{ data: ops }, { data: ords }, { data: cash }] = await Promise.all([
      supabase.from('operations').select('*, branches(name), categories(name), users(full_name)').order('created_at', { ascending: false }).limit(1000),
      supabase.from('shift_orders').select('*, branches(name), users(full_name)').order('created_at', { ascending: false }).limit(1000),
      supabase.from('cash_collection').select('*, branches(name)').order('created_at', { ascending: false }).limit(1000)
    ])

    setOperations(ops || [])
    setOrders(ords || [])
    setCashRows(cash || [])
    setLoading(false)
  }

  async function signIn() {
    if (!login || !password) return alert('Login va parol kiriting')
    setLoading(true)

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('login', login.trim())
      .eq('password', password.trim())
      .eq('active', true)
      .maybeSingle()

    setLoading(false)

    if (error) return alert('Xatolik: ' + error.message)
    if (!data) return alert('Login yoki parol xato')

    if (remember) {
      localStorage.setItem('finance_login', login)
      localStorage.setItem('finance_password', password)
    }

    localStorage.setItem('finance_user', JSON.stringify(data))
    setUser(data)
  }

  function logout() {
    localStorage.removeItem('finance_user')
    setUser(null)
  }

  function selectBranch(id) {
    setBranch(id)
    localStorage.setItem('finance_branch', id)
  }

  const visibleOps = useMemo(() => {
    if (branch === 'ALL') return operations
    return operations.filter(x => x.branch_id === branch)
  }, [operations, branch])

  const visibleOrders = useMemo(() => {
    if (branch === 'ALL') return orders
    return orders.filter(x => x.branch_id === branch)
  }, [orders, branch])

  const visibleCash = useMemo(() => {
    if (branch === 'ALL') return cashRows
    return cashRows.filter(x => x.branch_id === branch)
  }, [cashRows, branch])

  const orderReportRows = useMemo(() => {
    let rows = [...visibleOrders]
    if (orderReport.start) rows = rows.filter(x => new Date(x.order_date) >= new Date(orderReport.start))
    if (orderReport.end) rows = rows.filter(x => new Date(x.order_date) <= new Date(orderReport.end))
    return rows
  }, [visibleOrders, orderReport])

  const reportRows = useMemo(() => {
    let rows = [...visibleOps]

    if (report.type !== 'ALL') rows = rows.filter(x => x.type === report.type)
    if (report.account !== 'ALL') rows = rows.filter(x => x.account === report.account)

    if (report.start) rows = rows.filter(x => new Date(x.created_at) >= new Date(report.start))

    if (report.end) {
      const e = new Date(report.end)
      e.setHours(23, 59, 59, 999)
      rows = rows.filter(x => new Date(x.created_at) <= e)
    }

    return rows
  }, [visibleOps, report])

  const stats = useMemo(() => {
    let kirim = 0, chiqim = 0, naqd = 0, bank = 0, click = 0
    const incomeCats = {}
    const expenseCats = {}

    visibleOps.forEach(x => {
      const amount = Number(x.amount || 0)
      const cat = x.categories?.name || 'Boshqa'

      if (x.type === 'Kirim') {
        kirim += amount
        incomeCats[cat] = (incomeCats[cat] || 0) + amount

        if (x.account === 'Naqd') naqd += amount
        if (x.account === 'Bank') bank += amount
        if (x.account === 'Click') click += amount
      } else {
        chiqim += amount
        expenseCats[cat] = (expenseCats[cat] || 0) + amount

        if (x.account === 'Naqd') naqd -= amount
        if (x.account === 'Bank') bank -= amount
        if (x.account === 'Click') click -= amount
      }
    })

    const topIncome = Object.entries(incomeCats).sort((a, b) => b[1] - a[1])[0] || ['Yo‘q', 0]
    const topExpense = Object.entries(expenseCats).sort((a, b) => b[1] - a[1])[0] || ['Yo‘q', 0]

    const orderTotal = visibleOrders.reduce((s, x) => s + Number(x.total || 0), 0)
    const orderCash = visibleOrders.reduce((s, x) => s + Number(x.cash_amount || 0), 0)
    const orderExpense = visibleOrders.reduce((s, x) => s + Number(x.expense || 0), 0)

    return {
      kirim,
      chiqim,
      sof: kirim - chiqim,
      naqd,
      bank,
      click,
      jami: naqd + bank + click,
      topIncome,
      topExpense,
      orderTotal,
      orderCash,
      orderExpense
    }
  }, [visibleOps, visibleOrders])

  const filteredCategories = categories.filter(c => {
    const okType = c.type === op.type
    const okSearch = !op.search || c.name.toLowerCase().includes(op.search.toLowerCase())
    return okType && okSearch
  })

  function orderCash() {
    return Number(order.total || 0)
      - Number(order.uzcard || 0)
      - Number(order.humo || 0)
      - Number(order.rahmat || 0)
      - Number(order.rxmt || 0)
      - Number(order.click || 0)
      - Number(order.uzum || 0)
      - Number(order.yandex || 0)
      + Number(order.expense || 0)
      - Number(order.gum_count || 0) * 1000
  }

  async function saveOperation() {
    if (!branch || branch === 'ALL') return alert('Filial tanlang')
    if (!op.category_id || !op.amount || !op.note.trim()) {
      return alert('Kategoriya, summa va izoh majburiy')
    }

    setLoading(true)

    const { error } = await supabase.from('operations').insert({
      branch_id: branch,
      type: op.type,
      category_id: op.category_id,
      account: op.account,
      amount: Number(op.amount),
      note: op.note,
      created_by: user.id,
      status: 'ACTIVE'
    })

    setLoading(false)

    if (error) return alert(error.message)

    setOp({ type: 'Kirim', account: 'Naqd', category_id: '', amount: '', note: '', search: '' })
    await loadAll()
    alert('Saqlandi ✅')
  }

  async function saveOrder() {
    if (!branch || branch === 'ALL') return alert('Filial tanlang')
    if (!order.total) return alert('Itogo majburiy')

    const cash = orderCash()
    setLoading(true)

    const { error } = await supabase.from('shift_orders').insert({
      branch_id: branch,
      shift_no: Number(order.shift_no),
      order_date: new Date().toISOString().slice(0, 10),
      total: Number(order.total || 0),
      uzcard: Number(order.uzcard || 0),
      humo: Number(order.humo || 0),
      rahmat: Number(order.rahmat || 0),
      rxmt: Number(order.rxmt || 0),
      click: Number(order.click || 0),
      uzum: Number(order.uzum || 0),
      yandex: Number(order.yandex || 0),
      expense: Number(order.expense || 0),
      gum_count: Number(order.gum_count || 0),
      gum_price: 1000,
      cash_amount: cash,
      note: order.note,
      status: 'CLOSED',
      created_by: user.id
    })

    if (error) {
      setLoading(false)
      return alert(error.message)
    }

    if (Number(order.shift_no) === 2) {
      await supabase.from('cash_collection').insert({
        branch_id: branch,
        order_date: new Date().toISOString().slice(0, 10),
        expected_cash: cash,
        status: 'PENDING',
        note: '2-smena yopildi'
      })
    }

    setLoading(false)

    setOrder({
      shift_no: '1',
      total: '',
      uzcard: '',
      humo: '',
      rahmat: '',
      rxmt: '',
      click: '',
      uzum: '',
      yandex: '',
      expense: '',
      gum_count: '',
      note: ''
    })

    await loadAll()
    alert('Order yopildi ✅')
  }

  async function approveCash(row) {
    const accepted = prompt('Qabul qilingan naqd summa:', row.expected_cash)
    if (!accepted) return

    const diff = Number(accepted) - Number(row.expected_cash)
    setLoading(true)

    const { error } = await supabase.from('cash_collection').update({
      accepted_cash: Number(accepted),
      difference: diff,
      status: 'APPROVED',
      approved_by: user.id,
      approved_at: new Date().toISOString()
    }).eq('id', row.id)

    if (error) {
      setLoading(false)
      return alert(error.message)
    }

    const inkCat = categories.find(c => c.name.toLowerCase().includes('inkass'))

    await supabase.from('operations').insert({
      branch_id: row.branch_id,
      type: 'Kirim',
      category_id: inkCat?.id || null,
      account: 'Naqd',
      amount: Number(accepted),
      note: `Inkassatsiya. Farq: ${MONEY(diff)}`,
      created_by: user.id,
      status: 'ACTIVE'
    })

    setLoading(false)
    await loadAll()
  }

  function downloadCsv(filename, head, body) {
    const csv = [head, ...body].map(row =>
      row.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(';')
    ).join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
  }

  function exportOperationsCsv() {
    const head = ['Filial', 'Sana', 'Tur', 'Kategoriya', 'Hisob', 'Summa', 'Izoh', 'Kim']

    const body = reportRows.map(r => [
      r.branches?.name || '',
      new Date(r.created_at).toLocaleString('uz-UZ'),
      r.type,
      r.categories?.name || '',
      r.account,
      r.amount,
      r.note || '',
      r.users?.full_name || ''
    ])

    downloadCsv('operatsiyalar-hisoboti.csv', head, body)
  }

  function exportOrdersCsv() {
    const head = [
      'Filial', 'Sana', 'Smena', 'Manager', 'Itogo',
      'Uzcard', 'Humo', 'Rahmat', 'Rxmt', 'Click',
      'Uzum', 'Yandex', 'Rasxod', 'Jvachka', 'Naqd', 'Izoh'
    ]

    const body = orderReportRows.map(r => [
      r.branches?.name || '',
      r.order_date,
      r.shift_no,
      r.users?.full_name || '',
      r.total,
      r.uzcard,
      r.humo,
      r.rahmat,
      r.rxmt,
      r.click,
      r.uzum,
      r.yandex,
      r.expense,
      r.gum_count,
      r.cash_amount,
      r.note || ''
    ])

    downloadCsv('filial-orderlari.csv', head, body)
  }

  if (!user) {
    return (
      <div className="loginScreen">
        <div className="loginCard">
          <div className="logo">🍕</div>
          <h1>SARIQ BOLA PIZZA</h1>
          <p>Finance Premium System</p>

          <label>Login</label>
          <input
            value={login}
            onChange={e => setLogin(e.target.value)}
            placeholder="admin"
            autoComplete="username"
          />

          <label>Parol</label>
          <div className="passBox">
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type={showPass ? 'text' : 'password'}
              placeholder="12345"
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}>👁</button>
          </div>

          <div className="remember">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            <span>Meni eslab qol</span>
          </div>

          <button className="primary full" onClick={signIn}>
            {loading ? 'Kirilmoqda...' : '🔐 Kirish'}
          </button>

          <small>Admin: admin / 12345</small>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">🍕 SARIQ BOLA<br />FINANCE PRO</div>

        <div className="profile">
          <b>{user.full_name}</b>
          <span>{user.role}</span>
        </div>

        <Menu id="dashboard" page={page} setPage={changePage} text="📊 Dashboard" />
        <Menu id="order" page={page} setPage={changePage} text="📋 Smena order" />
        <Menu id="orderReports" page={page} setPage={changePage} text="🧾 Filial orderlari" />
        <Menu id="cash" page={page} setPage={changePage} text="💵 Inkassatsiya" />
        <Menu id="operation" page={page} setPage={changePage} text="➕ Kirim / Chiqim" />
        <Menu id="history" page={page} setPage={changePage} text="📒 Operatsiyalar" />
        <Menu id="reports" page={page} setPage={changePage} text="📈 Hisobotlar" />

        <button className="logout" onClick={logout}>🚪 Chiqish</button>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h2>Finance Dashboard</h2>
            <span>{new Date().toLocaleString('uz-UZ')}</span>
          </div>
          <button className="darkBtn" onClick={loadAll}>
            {loading ? 'Yuklanmoqda...' : '🔄 Yangilash'}
          </button>
        </div>

        <div className="branchTabs">
          {branches.map(b => (
            <button
              key={b.id}
              className={branch === b.id ? 'active' : ''}
              onClick={() => selectBranch(b.id)}
            >
              {b.name}
            </button>
          ))}
          <button className={branch === 'ALL' ? 'active' : ''} onClick={() => selectBranch('ALL')}>
            Umumiy
          </button>
        </div>

        {page === 'dashboard' && (
          <>
            <div className="cards">
              <Card title="💵 Naqd balans" value={MONEY(stats.naqd)} />
              <Card title="🏦 Bank balans" value={MONEY(stats.bank)} />
              <Card title="💳 Click balans" value={MONEY(stats.click)} />
              <Card title="🧾 Jami balans" value={MONEY(stats.jami)} />
            </div>

            <div className="cards">
              <Card title="📋 Order savdo" value={MONEY(stats.orderTotal)} />
              <Card title="💵 Order naqd" value={MONEY(stats.orderCash)} />
              <Card title="🍽 Personal ovqat" value={MONEY(stats.orderExpense)} />
              <Card title="🔥 Top rasxod" value={MONEY(stats.topExpense[1])} sub={stats.topExpense[0]} />
            </div>

            <div className="cards">
              <Card title="💰 Top kirim" value={MONEY(stats.topIncome[1])} sub={stats.topIncome[0]} />
              <Card title="📈 Umumiy kirim" value={MONEY(stats.kirim)} />
              <Card title="📉 Umumiy chiqim" value={MONEY(stats.chiqim)} />
              <Card title="⚖️ Sof natija" value={MONEY(stats.sof)} />
            </div>
          </>
        )}

        {page === 'order' && (
          <section className="panel">
            <h3>📋 Smena order yopish</h3>

            <div className="grid">
              <Field title="Itogo" k="total" data={order} setData={setOrder} />
              <div>
                <label>Smena</label>
                <select value={order.shift_no} onChange={e => setOrder({ ...order, shift_no: e.target.value })}>
                  <option value="1">1-smena</option>
                  <option value="2">2-smena</option>
                </select>
              </div>
              <Field title="Uzcard" k="uzcard" data={order} setData={setOrder} />
              <Field title="Humo" k="humo" data={order} setData={setOrder} />
              <Field title="Rahmat" k="rahmat" data={order} setData={setOrder} />
              <Field title="Rxmt" k="rxmt" data={order} setData={setOrder} />
              <Field title="Click" k="click" data={order} setData={setOrder} />
              <Field title="Uzum" k="uzum" data={order} setData={setOrder} />
              <Field title="Yandex" k="yandex" data={order} setData={setOrder} />
              <Field title="Rasxod / Personal ovqat" k="expense" data={order} setData={setOrder} />
              <Field title="Jvachka soni" k="gum_count" data={order} setData={setOrder} />
              <div className="cashResult">
                <span>Hisoblangan naqd</span>
                <b>{MONEY(orderCash())}</b>
              </div>
            </div>

            <label>Izoh</label>
            <textarea value={order.note} onChange={e => setOrder({ ...order, note: e.target.value })} />

            <button className="primary" onClick={saveOrder}>✅ Order yopish</button>
          </section>
        )}

        {page === 'orderReports' && (
          <section className="panel">
            <h3>🧾 Filial orderlari</h3>

            <div className="grid">
              <div>
                <label>Boshlanish</label>
                <input type="date" value={orderReport.start} onChange={e => setOrderReport({ ...orderReport, start: e.target.value })} />
              </div>
              <div>
                <label>Tugash</label>
                <input type="date" value={orderReport.end} onChange={e => setOrderReport({ ...orderReport, end: e.target.value })} />
              </div>
              <div>
                <label>Excel / CSV</label>
                <button className="successBtn" onClick={exportOrdersCsv}>⬇️ Yuklash</button>
              </div>
            </div>

            <OrdersTable rows={orderReportRows} />
          </section>
        )}

        {page === 'cash' && <CashTable rows={visibleCash} approve={approveCash} />}

        {page === 'operation' && (
          <section className="panel">
            <h3>➕ Buxgalter kirim / chiqim</h3>

            <div className="grid">
              <div>
                <label>Tur</label>
                <select value={op.type} onChange={e => setOp({ ...op, type: e.target.value, category_id: '' })}>
                  <option>Kirim</option>
                  <option>Chiqim</option>
                </select>
              </div>

              <div>
                <label>Hisob</label>
                <select value={op.account} onChange={e => setOp({ ...op, account: e.target.value })}>
                  {ACCOUNTS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label>Kategoriya qidirish</label>
                <input value={op.search} onChange={e => setOp({ ...op, search: e.target.value })} placeholder="Masalan: savdo" />
              </div>

              <div>
                <label>Summa</label>
                <input type="number" value={op.amount} onChange={e => setOp({ ...op, amount: e.target.value })} />
              </div>
            </div>

            <label>Kategoriya</label>
            <select value={op.category_id} onChange={e => setOp({ ...op, category_id: e.target.value })}>
              <option value="">Tanlang</option>
              {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <label>Izoh</label>
            <textarea value={op.note} onChange={e => setOp({ ...op, note: e.target.value })} />

            <button className="primary" onClick={saveOperation}>💾 Saqlash</button>
          </section>
        )}

        {page === 'history' && <OperationsTable rows={visibleOps} />}

        {page === 'reports' && (
          <section className="panel">
            <h3>📈 Hisobotlar</h3>

            <div className="grid">
              <div>
                <label>Boshlanish</label>
                <input type="date" value={report.start} onChange={e => setReport({ ...report, start: e.target.value })} />
              </div>

              <div>
                <label>Tugash</label>
                <input type="date" value={report.end} onChange={e => setReport({ ...report, end: e.target.value })} />
              </div>

              <div>
                <label>Tur</label>
                <select value={report.type} onChange={e => setReport({ ...report, type: e.target.value })}>
                  <option value="ALL">Hammasi</option>
                  <option>Kirim</option>
                  <option>Chiqim</option>
                </select>
              </div>

              <div>
                <label>Hisob</label>
                <select value={report.account} onChange={e => setReport({ ...report, account: e.target.value })}>
                  <option value="ALL">Hammasi</option>
                  {ACCOUNTS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <button className="successBtn" onClick={exportOperationsCsv}>⬇️ Excel / CSV yuklash</button>

            <OperationsTable rows={reportRows} />
          </section>
        )}
      </main>
    </div>
  )
}

function Menu({ id, page, setPage, text }) {
  return <button className={page === id ? 'active' : ''} onClick={() => setPage(id)}>{text}</button>
}

function Card({ title, value, sub }) {
  return (
    <div className="card">
      <span>{title}</span>
      <b>{value}</b>
      {sub && <small>{sub}</small>}
    </div>
  )
}

function Field({ title, k, data, setData }) {
  return (
    <div>
      <label>{title}</label>
      <input type="number" value={data[k]} onChange={e => setData({ ...data, [k]: e.target.value })} />
    </div>
  )
}

function OperationsTable({ rows }) {
  return (
    <section className="panel">
      <h3>📒 Operatsiyalar</h3>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Filial</th>
              <th>Sana</th>
              <th>Tur</th>
              <th>Kategoriya</th>
              <th>Hisob</th>
              <th>Summa</th>
              <th>Izoh</th>
              <th>Kim</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && <tr><td colSpan="8">Ma’lumot yo‘q</td></tr>}

            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.branches?.name}</td>
                <td>{new Date(r.created_at).toLocaleString('uz-UZ')}</td>
                <td>{r.type}</td>
                <td>{r.categories?.name}</td>
                <td>{r.account}</td>
                <td>{MONEY(r.amount)}</td>
                <td>{r.note}</td>
                <td>{r.users?.full_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function OrdersTable({ rows }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Filial</th>
            <th>Sana</th>
            <th>Smena</th>
            <th>Manager</th>
            <th>Itogo</th>
            <th>Uzcard</th>
            <th>Humo</th>
            <th>Rahmat</th>
            <th>Rxmt</th>
            <th>Click</th>
            <th>Uzum</th>
            <th>Yandex</th>
            <th>Rasxod</th>
            <th>Jvachka</th>
            <th>Naqd</th>
            <th>Izoh</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 && <tr><td colSpan="16">Order yo‘q</td></tr>}

          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.branches?.name}</td>
              <td>{r.order_date}</td>
              <td>{r.shift_no}</td>
              <td>{r.users?.full_name}</td>
              <td>{MONEY(r.total)}</td>
              <td>{MONEY(r.uzcard)}</td>
              <td>{MONEY(r.humo)}</td>
              <td>{MONEY(r.rahmat)}</td>
              <td>{MONEY(r.rxmt)}</td>
              <td>{MONEY(r.click)}</td>
              <td>{MONEY(r.uzum)}</td>
              <td>{MONEY(r.yandex)}</td>
              <td>{MONEY(r.expense)}</td>
              <td>{r.gum_count}</td>
              <td>{MONEY(r.cash_amount)}</td>
              <td>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CashTable({ rows, approve }) {
  return (
    <section className="panel">
      <h3>💵 Inkassatsiya tasdiqlash</h3>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Filial</th>
              <th>Sana</th>
              <th>Hisoblangan</th>
              <th>Qabul</th>
              <th>Farq</th>
              <th>Status</th>
              <th>Amal</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && <tr><td colSpan="7">Inkassatsiya yo‘q</td></tr>}

            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.branches?.name}</td>
                <td>{r.order_date}</td>
                <td>{MONEY(r.expected_cash)}</td>
                <td>{MONEY(r.accepted_cash)}</td>
                <td>{MONEY(r.difference)}</td>
                <td>{r.status}</td>
                <td>
                  {r.status === 'PENDING' && (
                    <button className="successBtn" onClick={() => approve(r)}>Tasdiq</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}