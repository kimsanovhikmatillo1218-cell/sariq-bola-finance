import { useState, useMemo, useCallback, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../lib'
import {
  BRANCH_ORDER, ROLE_MODULES, MODULES, TEXT, OP_TYPE, CASH_ST,
  SIGN_IN_RPC
} from '../constants'
import {
  today, num, safeJsonParse, isOnline, localDateValue, inDateRange,
  sameDay, calcOrderExpected, serverHashPassword, sortRows,
  findColumn, readCell, toNumber, toDateTime, toDateOnly,
  makeCSVRowsFromObjects, downloadCSV, downloadXLSX, parseCSV,
  exportOperations, exportOrders
} from '../utils'

export default function useAppData() {
  // ── Auth & UI state ──────────────────────────────────────────────────────
  const [user, setUser]       = useState(() => safeJsonParse(localStorage.getItem('finance_user')))
  const [page, setPage]       = useState(() => {
    const s = localStorage.getItem('finance_page') || 'dashboard'
    return window.innerWidth <= 1024 ? 'dashboard' : s
  })
  const [loginVal, setLoginVal]   = useState(localStorage.getItem('finance_login') || '')
  const [password, setPassword]   = useState('')
  const [remember, setRemember]   = useState(true)
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [toast, setToast]         = useState('')
  const [mobileMenu, setMobileMenu]           = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationsSeenKey, setNotificationsSeenKey] = useState(
    () => localStorage.getItem('finance_notifications_seen_key') || ''
  )
  const [confirmModal, setConfirmModal] = useState({ open: false, message: '', onConfirm: null })

  // ── Data state ───────────────────────────────────────────────────────────
  const [branches, setBranches]       = useState([])
  const [allBranches, setAllBranches] = useState([])
  const [users, setUsers]             = useState([])
  const [userBranches, setUserBranches] = useState([])
  const [permissions, setPermissions] = useState([])
  const [categories, setCategories]   = useState([])
  const [operations, setOperations]   = useState([])
  const [orders, setOrders]           = useState([])
  const [cashRows, setCashRows]       = useState([])
  const [messages, setMessages]       = useState([])
  const [employees, setEmployees]     = useState([])
  const [payrollRuns, setPayrollRuns] = useState([])
  const [payrollItems, setPayrollItems] = useState([])
  const [company, setCompany]         = useState(null)
  const [branchTelegrams, setBranchTelegrams] = useState(null) // null = not loaded yet

  // ── Filters & preferences ────────────────────────────────────────────────
  const [branch, setBranchState] = useState(localStorage.getItem('finance_branch') || 'ALL')
  const [period, setPeriod]      = useState({
    start: localStorage.getItem('finance_period_start') || today(),
    end:   localStorage.getItem('finance_period_end')   || today()
  })
  const [lang, setLang]   = useState(localStorage.getItem('finance_lang') || user?.language || 'uz')
  const [theme, setTheme] = useState(localStorage.getItem('finance_theme') || user?.theme || 'dark')

  // ── Form state ───────────────────────────────────────────────────────────
  const [op, setOp]       = useState({ date: today(), type: OP_TYPE.INCOME, account: 'Naqd', category_id: '', amount: '', note: '' })
  const [order, setOrder] = useState({ date: today(), shift_no: '1', total: '', uzcard: '', humo: '', rahmat: '', rxmt: '', uzum: '', yandex: '', expense: '', gum_count: '', cash_amount: '', note: '' })
  const [employeeForm, setEmployeeForm] = useState({ full_name: '', position: '', hire_date: today(), salary_type: 'hourly', hourly_rate: '', monthly_salary: '' })
  const [payroll, setPayroll]   = useState({ title: '', part_no: '1', period_start: today(), period_end: today(), rows: [] })
  const [newUser, setNewUser]   = useState({ id: null, full_name: '', login: '', password: '12345', role: 'SMENA_MANAGER', branchIds: [], modules: ['order'] })
  const [newCat, setNewCat]     = useState({ name: '', name_ru: '', name_cy: '', type: OP_TYPE.INCOME })
  const [editCat, setEditCat]   = useState(null)
  const [chatUser, setChatUser] = useState('')
  const [chatText, setChatText] = useState('')
  const [profile, setProfile]   = useState({ full_name: user?.full_name || '', phone: user?.phone || '', avatar_url: user?.avatar_url || '' })
  const [editOp, setEditOp]     = useState(null)
  const [editOrder, setEditOrder] = useState(null)
  const [selectedOperationIds, setSelectedOperationIds] = useState([])
  const [selectedCategoryIds, setSelectedCategoryIds]   = useState([])
  const [reportFilterOpen, setReportFilterOpen] = useState(false)
  const [reportFilter, setReportFilter]         = useState({ type: 'ALL', category_id: 'ALL', account: 'ALL' })
  const [editCashRow, setEditCashRow]   = useState(null)
  const [editCashForm, setEditCashForm] = useState({})
  const [cashDateFilter, setCashDateFilter]     = useState({ start: '', end: '' })
  const [editEmployee, setEditEmployee]         = useState(null)
  const [employeeEditForm, setEmployeeEditForm] = useState({})

  // ── Derived ──────────────────────────────────────────────────────────────
  const tr        = TEXT[lang] || TEXT.uz
  const isAdmin   = user?.role === 'ADMIN'
  const loginReady = loginVal.trim().length > 0 && password.trim().length > 0 && !loading
  const unreadCount = messages.filter(m => m.receiver_id === user?.id && !m.is_read).length

  const notify      = useCallback(msg => { setToast(msg); setTimeout(() => setToast(''), 2600) }, [])
  const showConfirm = useCallback((message, onConfirm) => setConfirmModal({ open: true, message, onConfirm }), [])
  const closeConfirm = useCallback(() => setConfirmModal({ open: false, message: '', onConfirm: null }), [])
  const changePage  = useCallback(p => { setPage(p); localStorage.setItem('finance_page', p) }, [])
  const setBranch   = useCallback(id => { setBranchState(id); localStorage.setItem('finance_branch', id) }, [])
  const catName     = useCallback(c => {
    if (!c) return ''
    if (lang === 'ru') return c.name_ru || c.name
    if (lang === 'cy') return c.name_cy || c.name
    return c.name
  }, [lang])
  const calcCash    = useCallback(() => calcOrderExpected(order), [order])

  const allowedBranches = useMemo(() => {
    if (!user) return []
    if (['ADMIN','RAHBAR','BOSH_MANAGER'].includes(user.role)) return branches
    const ids = userBranches.filter(x => x.user_id === user.id).map(x => x.branch_id)
    return branches.filter(b => ids.includes(b.id))
  }, [user, branches, userBranches])

  const selectedBranchIds = useMemo(() => {
    if (!allowedBranches.length) return []
    if (branch === 'ALL') return allowedBranches.map(b => b.id)
    const f = allowedBranches.find(b => b.id === branch)
    return f ? [f.id] : allowedBranches.map(b => b.id)
  }, [branch, allowedBranches])

  const can = useCallback(module => {
    if (!user) return false
    if (user.role === 'ADMIN') return true
    const userPerms = permissions.filter(x => x.user_id === user.id)
    if (userPerms.length > 0) {
      // Explicit ruxsatlar mavjud — FAQAT shularga ko'ra ko'rsatamiz
      const row = userPerms.find(x => x.module === module)
      return row ? !!row.can_view : false
    }
    // Hech qanday explicit ruxsat yo'q — role defaults ishlatiladi
    return ROLE_MODULES[user.role]?.includes(module) ?? false
  }, [user, permissions])

  // Ruxsat berilmagan sahifada bo'lsa — birinchi ruxsatli sahifaga yo'naltir
  useEffect(() => {
    if (!user || user.role === 'ADMIN') return
    const userPerms = permissions.filter(x => x.user_id === user.id)
    if (!userPerms.length) return // role defaults — redirect kerak emas
    const allowed = userPerms.filter(x => x.can_view).map(x => x.module)
    if (!allowed.includes(page)) {
      const first = MODULES.find(m => allowed.includes(m))
      if (first) setPage(first)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, permissions])

  const userAllowedBranches = useCallback(u => {
    if (!u) return []
    if (['ADMIN','RAHBAR','BOSH_MANAGER'].includes(u.role)) return branches
    const ids = userBranches.filter(x => x.user_id === u.id).map(x => x.branch_id)
    return branches.filter(b => ids.includes(b.id))
  }, [branches, userBranches])

  // ── Notifications ────────────────────────────────────────────────────────
  const notifications = useMemo(() => {
    const list = []
    const unread = messages.filter(m => m.receiver_id === user?.id && !m.is_read).length
    if (unread > 0) list.push({ id: `msg-${unread}`, title: 'Yangi xabarlar', text: `${unread} ta o'qilmagan`, page: 'chat' })
    const pending = cashRows.filter(x => x.status === CASH_ST.PENDING && selectedBranchIds.includes(x.branch_id)).length
    if (pending > 0) list.push({ id: `cash-${pending}`, title: 'Inkassatsiya', text: `${pending} ta tasdiqlanmagan`, page: 'cash' })
    const todayOrders = orders.filter(o => inDateRange(o.order_date || o.created_at, today(), today()) && selectedBranchIds.includes(o.branch_id)).length
    if (todayOrders > 0) list.push({ id: `ord-${todayOrders}`, title: 'Bugungi orderlar', text: `${todayOrders} ta kiritilgan`, page: 'orderReports' })
    return list
  }, [messages, cashRows, orders, selectedBranchIds, user?.id])

  const notificationKey   = notifications.map(n => n.id).join('|')
  const notificationCount = notificationKey && notificationKey !== notificationsSeenKey ? notifications.length : 0

  const openNotifications = useCallback(() => {
    setShowNotifications(v => {
      if (!v) {
        localStorage.setItem('finance_notifications_seen_key', notificationKey)
        setNotificationsSeenKey(notificationKey)
      }
      return !v
    })
  }, [notificationKey])

  // ── Visible data ─────────────────────────────────────────────────────────
  const visibleOps = useMemo(() => operations.filter(x => {
    const bOk = branch === 'ALL' || x.branch_id === branch
    return bOk && inDateRange(x.created_at, period.start, period.end)
  }), [operations, branch, period])

  const visibleOrders = useMemo(() => orders.filter(x => {
    const bOk = branch === 'ALL' || x.branch_id === branch
    return bOk && inDateRange(x.order_date || x.created_at, period.start, period.end)
  }), [orders, branch, period])

  const visibleCash = useMemo(() =>
    cashRows.filter(x => selectedBranchIds.includes(x.branch_id)),
  [cashRows, selectedBranchIds])

  const visibleCashFiltered = useMemo(() => visibleCash.filter(x => {
    if (cashDateFilter.start && (x.order_date || '') < cashDateFilter.start) return false
    if (cashDateFilter.end   && (x.order_date || '') > cashDateFilter.end)   return false
    return true
  }), [visibleCash, cashDateFilter])

  const filteredReportOps = useMemo(() => visibleOps.filter(x => {
    const tOk = reportFilter.type        === 'ALL' || x.type        === reportFilter.type
    const cOk = reportFilter.category_id === 'ALL' || x.category_id === reportFilter.category_id
    const aOk = reportFilter.account     === 'ALL' || x.account     === reportFilter.account
    return tOk && cOk && aOk
  }), [visibleOps, reportFilter])

  const stats = useMemo(() => {
    // Naqd/Bank BALANS — tanlangan filial bo'yicha barcha vaqt uchun (period filtr yo'q)
    // Bu to'g'ri hisob-kitob: bank hisob raqami kabi umumiy qoldiq ko'rsatiladi
    let cash = 0, bank = 0
    operations.filter(x => selectedBranchIds.includes(x.branch_id)).forEach(x => {
      const amount = num(x.amount), sign = x.type === OP_TYPE.INCOME ? 1 : -1
      if (x.account === 'Naqd')        cash += amount * sign
      if (x.account === 'Hisob raqam') bank += amount * sign
    })
    // Kirim/Chiqim diagrammalari — tanlangan davr uchun (period filtr bor)
    const income = {}, expense = {}
    visibleOps.forEach(x => {
      const name = catName(x.categories) || 'Boshqa'
      if (x.type === OP_TYPE.INCOME)  income[name]  = (income[name]  || 0) + num(x.amount)
      if (x.type === OP_TYPE.EXPENSE) expense[name] = (expense[name] || 0) + num(x.amount)
    })
    return { cash, bank, incomeRows: sortRows(income), expenseRows: sortRows(expense) }
  }, [operations, selectedBranchIds, visibleOps, catName])

  const salesStats = useMemo(() => {
    const byDay = {}, byBranch = {}; let total = 0
    visibleOrders.forEach(o => {
      const day = localDateValue(o.order_date || o.created_at), amount = num(o.total)
      total += amount
      byDay[day] = (byDay[day] || 0) + amount
      byBranch[o.branches?.name || 'Filial'] = (byBranch[o.branches?.name || 'Filial'] || 0) + amount
    })
    const trend = Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0])).map(([name, value]) => ({ name, value }))
    const branchRows = sortRows(byBranch)
    let growth = 0
    if (trend.length >= 2) {
      const prev = trend[trend.length - 2].value || 1
      growth = ((trend[trend.length - 1].value - prev) / prev) * 100
    }
    const byMethod = { Uzcard: 0, Humo: 0, Rahmat: 0, RXMT: 0, Uzum: 0, Yandex: 0, Naqd: 0 }
    visibleOrders.forEach(o => {
      byMethod.Uzcard += num(o.uzcard); byMethod.Humo   += num(o.humo)
      byMethod.Rahmat += num(o.rahmat); byMethod.RXMT   += num(o.rxmt)
      byMethod.Uzum   += num(o.uzum);  byMethod.Yandex += num(o.yandex)
      byMethod.Naqd   += num(o.cash_amount)
    })
    return { total, trend, branchRows, growth, methodRows: sortRows(byMethod).filter(r => r.value > 0) }
  }, [visibleOrders])

  // ── Payroll init (FIX: proper deps) ─────────────────────────────────────
  const initPayrollRows = useCallback(() => {
    const rows = employees
      .filter(e => e.active && selectedBranchIds.includes(e.branch_id))
      .map(e => ({
        employee_id: e.id, full_name: e.full_name, position: e.position,
        worked_hours: '', extra_hours: '',
        hourly_rate: e.hourly_rate || '', base_salary: e.monthly_salary || '',
        tax: '', lunch: '', penalty: '', advance: '', bonus: '',
        cash_paid: '', card_paid: '', note: ''
      }))
    setPayroll(p => ({ ...p, rows }))
  }, [employees, selectedBranchIds])

  const calcPayrollRow = useCallback(r => {
    const hoursSalary = (num(r.worked_hours) + num(r.extra_hours)) * num(r.hourly_rate)
    const base  = num(r.base_salary) || hoursSalary
    const total = base - num(r.tax) - num(r.lunch) - num(r.penalty) - num(r.advance) + num(r.bonus)
    const paid  = num(r.cash_paid) + num(r.card_paid)
    return { total_salary: total, total_paid: paid, remaining: total - paid }
  }, [])

  // ── Load functions ───────────────────────────────────────────────────────
  const loadBase = useCallback(async () => {
    const [b, bAll, c, comp] = await Promise.all([
      supabase.from('branches').select('*').eq('active', true),
      supabase.from('branches').select('*').order('sort_order'),
      supabase.from('categories').select('*').eq('active', true).order('name'),
      supabase.from('company_settings').select('id,telegram_token,telegram_chat_id,created_at').order('created_at', { ascending: true }).limit(1).maybeSingle()
    ])
    const sorted = (b.data || []).sort((x, y) => BRANCH_ORDER.indexOf(x.code) - BRANCH_ORDER.indexOf(y.code))
    const clean  = (c.data || []).filter(x => !String(x.name || '').toLowerCase().includes('click'))
    setBranches(sorted); setAllBranches(bAll.data || []); setCategories(clean); setCompany(comp.data || null)
    // Load per-branch telegram configs (graceful if table doesn't exist yet)
    supabase.from('branch_telegram').select('*').then(({ data, error }) => {
      if (!error) setBranchTelegrams(data || [])
      // else: table doesn't exist yet — leave branchTelegrams as null (shows migration hint)
    })
    const saved = localStorage.getItem('finance_branch')
    if (!saved || saved === 'ALL') { setBranchState('ALL'); return }
    const found = sorted.find(x => x.id === saved) || sorted.find(x => x.code === saved)
    if (found) { setBranchState(found.id); localStorage.setItem('finance_branch', found.id) }
    else       { setBranchState('ALL'); localStorage.setItem('finance_branch', 'ALL') }
  }, [])

  const loadUsersAndAccess = useCallback(async () => {
    const [u, ub, p] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('user_branches').select('*'),
      supabase.from('permissions').select('*')
    ])
    setUsers(u.data || []); setUserBranches(ub.data || []); setPermissions(p.data || [])
  }, [])

  const loadOperations = useCallback(async () => {
    const { data } = await supabase.from('operations')
      .select('*,branches(name,code),categories(name,type,name_ru,name_cy)')
      .order('created_at', { ascending: false }).limit(5000)
    setOperations(data || [])
  }, [])

  const loadOrders = useCallback(async () => {
    const { data } = await supabase.from('shift_orders')
      .select('*,branches(name,code)').order('created_at', { ascending: false }).limit(5000)
    setOrders(data || [])
  }, [])

  const loadCashRows = useCallback(async () => {
    const { data } = await supabase.from('cash_collection')
      .select('*,branches(name,code)').order('created_at', { ascending: false }).limit(2000)
    setCashRows(data || [])
  }, [])

  const loadMessages = useCallback(async () => {
    const { data } = await supabase.from('messages')
      .select('*').order('created_at', { ascending: true }).limit(1500)
    setMessages(data || [])
  }, [])

  const loadPayrollData = useCallback(async () => {
    const [emp, pr, pi] = await Promise.all([
      supabase.from('employees').select('*,branches(name,code)').order('created_at', { ascending: false }),
      supabase.from('payroll_runs').select('*,branches(name,code)').order('created_at', { ascending: false }),
      supabase.from('payroll_items').select('*,employees(full_name,position)').order('created_at', { ascending: false })
    ])
    setEmployees(emp.data || []); setPayrollRuns(pr.data || []); setPayrollItems(pi.data || [])
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([loadUsersAndAccess(), loadOperations(), loadOrders(), loadCashRows(), loadMessages(), loadPayrollData()])
    } finally { setLoading(false) }
  }, [loadUsersAndAccess, loadOperations, loadOrders, loadCashRows, loadMessages, loadPayrollData])

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.className = theme
    localStorage.setItem('finance_theme', theme)
  }, [theme])

  useEffect(() => { localStorage.setItem('finance_lang', lang) }, [lang])

  useEffect(() => {
    localStorage.setItem('finance_period_start', period.start)
    localStorage.setItem('finance_period_end', period.end)
  }, [period])

  // FIX: session yani localStorage ni server bilan tekshirish (security)
  useEffect(() => {
    const stored = safeJsonParse(localStorage.getItem('finance_user'))
    if (!stored?.id) return
    supabase.from('users')
      .select('id,role,full_name,active,language,theme,avatar_url,phone,last_seen')
      .eq('id', stored.id).eq('active', true).single()
      .then(({ data }) => {
        if (!data) { localStorage.removeItem('finance_user'); setUser(null); return }
        const fresh = { ...stored, ...data, password: undefined, password_hash: undefined }
        localStorage.setItem('finance_user', JSON.stringify(fresh))
        setUser(fresh)
        setLang(fresh.language || 'uz')
        setTheme(fresh.theme || 'dark')
      })
  }, [])

  useEffect(() => { loadBase() }, [loadBase])

  useEffect(() => {
    const close = () => { if (window.innerWidth > 1024) setMobileMenu(false) }
    window.addEventListener('resize', close); close()
    return () => window.removeEventListener('resize', close)
  }, [])

  useEffect(() => {
    const onError = e => { console.error(e?.error || e?.message || e); notify('Xatolik yuz berdi') }
    const onUnhandled = e => { console.error(e?.reason || e); notify('Xatolik yuz berdi') }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandled)
    return () => { window.removeEventListener('error', onError); window.removeEventListener('unhandledrejection', onUnhandled) }
  }, [notify])

  useEffect(() => { if (user) loadAll() }, [user, loadAll])

  useEffect(() => {
    if (!user) return
    const ch = supabase.channel('finance-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, loadMessages)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, loadUsersAndAccess)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_branches' }, loadUsersAndAccess)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'permissions' }, loadUsersAndAccess)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'branches' }, loadBase)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, loadBase)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'operations' }, loadOperations)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shift_orders' }, loadOrders)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cash_collection' }, loadCashRows)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, loadPayrollData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payroll_runs' }, loadPayrollData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payroll_items' }, loadPayrollData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'company_settings' }, loadBase)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [user, loadMessages, loadUsersAndAccess, loadOperations, loadOrders, loadCashRows, loadPayrollData, loadBase])

  useEffect(() => {
    if (!user?.id) return
    const touch = () => supabase.from('users').update({ last_seen: new Date().toISOString() }).eq('id', user.id)
    touch(); const t = setInterval(touch, 30000); return () => clearInterval(t)
  }, [user?.id])

  // FIX: initPayrollRows endi to'g'ri dep bilan
  useEffect(() => {
    if (employees.length) initPayrollRows()
  }, [employees, selectedBranchIds, initPayrollRows])

  useEffect(() => {
    if (!chatUser || !user) return
    supabase.from('messages').update({ is_read: true })
      .eq('receiver_id', user.id).eq('sender_id', chatUser).eq('is_read', false)
      .then(() => loadMessages())
  }, [chatUser, user, loadMessages])

  useEffect(() => {
    if (page === 'chat' && user?.id) {
      supabase.from('messages').update({ is_read: true }).eq('receiver_id', user.id).eq('is_read', false)
        .then(() => loadMessages())
    }
  }, [page, user?.id, loadMessages])

  // ── Audit ────────────────────────────────────────────────────────────────
  const audit = useCallback(async (table, rowId, action, oldData, newData) => {
    try {
      await supabase.from('audit_logs').insert({
        user_id: user?.id || null, table_name: table,
        row_id: String(rowId || ''), action, old_data: oldData, new_data: newData
      })
    } catch (e) { console.warn('Audit skipped:', e?.message) }
  }, [user?.id])

  const ensureCategory = useCallback(async (name, type) => {
    const clean = String(name || '').trim()
    if (!clean) return null
    // 1. Lokal state dan qidirish (tez yo'l)
    const localFound = categories.find(c =>
      c.type === type &&
      [c.name, c.name_ru, c.name_cy].filter(Boolean).some(v => v.trim().toLowerCase() === clean.toLowerCase())
    )
    if (localFound) return localFound.id
    // 2. DB dan to'g'ridan-to'g'ri qidirish (lokal stateda bo'lmasligi mumkin)
    const { data: dbFound } = await supabase.from('categories')
      .select('id').eq('type', type).ilike('name', clean).limit(1).maybeSingle()
    if (dbFound?.id) return dbFound.id
    // 3. Yangi kategoriya yaratish
    const { data, error } = await supabase.from('categories')
      .insert({ name: clean, name_ru: clean, name_cy: clean, type, active: true })
      .select('id').single()
    if (error) {
      // Unique constraint xatosi bo'lsa — qayta qidirish
      const { data: retry } = await supabase.from('categories')
        .select('id').eq('type', type).ilike('name', clean).limit(1).maybeSingle()
      if (retry?.id) return retry.id
      throw error
    }
    return data.id
  }, [categories])

  // ── Auth ─────────────────────────────────────────────────────────────────
  const signIn = useCallback(async () => {
    if (!loginVal.trim() || !password.trim()) return notify(tr.loginRequired)
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc(SIGN_IN_RPC, { p_login: loginVal.trim(), p_password: password.trim() })
      if (error) return notify(error.message)
      const found = Array.isArray(data) ? data[0] : data
      if (!found?.id) return notify(tr.loginError)
      const safeUser = { ...found, password: undefined, password_hash: undefined }
      if (remember) localStorage.setItem('finance_login', loginVal.trim())
      else localStorage.removeItem('finance_login')
      localStorage.setItem('finance_user', JSON.stringify(safeUser))
      setUser(safeUser); changePage('dashboard'); setMobileMenu(false)
      setTheme(safeUser.theme || 'dark'); setLang(safeUser.language || 'uz')
      setProfile({ full_name: safeUser.full_name || '', phone: safeUser.phone || '', avatar_url: safeUser.avatar_url || '' })
      notify(`${TEXT[safeUser.language || 'uz']?.welcome || 'Xush kelibsiz'}, ${safeUser.full_name}`)
    } catch (e) { notify('Login xato: ' + (e.message || "Noma'lum")) }
    finally { setLoading(false) }
  }, [loginVal, password, remember, tr, changePage, notify])

  const logout = useCallback(() => {
    localStorage.removeItem('finance_user')
    localStorage.removeItem('finance_page')
    setUser(null); setPassword('')
    // Barcha data state ni tozalash — boshqa foydalanuvchi kirsa eski ma'lumot ko'rinmasin
    setBranches([]); setAllBranches([]); setUsers([]); setUserBranches([])
    setPermissions([]); setCategories([]); setOperations([]); setOrders([])
    setCashRows([]); setMessages([]); setEmployees([]); setPayrollRuns([])
    setPayrollItems([]); setCompany(null)
    setSelectedOperationIds([]); setSelectedCategoryIds([])
    setPage('dashboard')
  }, [])

  // ── CRUD: Operations ──────────────────────────────────────────────────────
  const saveOperation = useCallback(async () => {
    if (branch === 'ALL') return notify(tr.chooseBranch)
    if (!op.category_id || !op.amount) return notify(tr.categoryRequired)
    const row = {
      branch_id: branch, type: op.type, account: op.account,
      category_id: op.category_id, amount: num(op.amount), note: op.note,
      created_by: user.id,
      created_at: isAdmin ? `${op.date}T00:00:00` : new Date().toISOString(),
      status: 'active'
    }
    const res = editOp
      ? await supabase.from('operations').update(row).eq('id', editOp.id).select().single()
      : await supabase.from('operations').insert(row).select().single()
    if (res.error) return notify(res.error.message)
    await audit('operations', res.data.id, editOp ? 'UPDATE' : 'INSERT', editOp, row)
    // Telegram notification (only on new insert, not edits)
    if (!editOp) sendOperationNotification(branch, row)
    setEditOp(null)
    setOp({ date: today(), type: OP_TYPE.INCOME, account: 'Naqd', category_id: '', amount: '', note: '' })
    await loadOperations(); notify(tr.saveOk)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch, op, editOp, isAdmin, user, tr, audit, loadOperations, notify])

  const deleteRow = useCallback((table, row) => {
    if (!isAdmin) return notify(tr.adminOnly)
    showConfirm(tr.confirmDelete, async () => {
      const { error } = await supabase.from(table).delete().eq('id', row.id)
      if (error) return notify(error.message)
      await audit(table, row.id, 'DELETE', row, null)
      if (table === 'operations') await loadOperations()
      else if (table === 'shift_orders') await loadOrders()
      else if (table === 'cash_collection') await loadCashRows()
      notify(tr.deleteOk)
    })
  }, [isAdmin, tr, showConfirm, audit, loadOperations, loadOrders, loadCashRows, notify])

  const deleteManyOperations = useCallback(ids => {
    if (!isAdmin) return notify(tr.adminOnly)
    if (!ids?.length) return notify(tr.noSelected)
    showConfirm(`${ids.length} ta operatsiyani o'chirasizmi?`, async () => {
      const oldRows = operations.filter(x => ids.includes(x.id))
      const { error } = await supabase.from('operations').delete().in('id', ids)
      if (error) return notify(error.message)
      await audit('operations', ids.join(','), 'BULK_DELETE', oldRows, null)
      setSelectedOperationIds([]); await loadOperations()
      notify(`${ids.length} ta operatsiya o'chirildi`)
    })
  }, [isAdmin, tr, operations, showConfirm, audit, loadOperations, notify])

  const deleteManyCategories = useCallback(ids => {
    if (!isAdmin) return notify(tr.adminOnly)
    if (!ids?.length) return notify(tr.noSelected)
    showConfirm(`${ids.length} ta kategoriyani o'chirasizmi?`, async () => {
      const { error } = await supabase.from('categories').update({ active: false }).in('id', ids)
      if (error) return notify(error.message)
      setSelectedCategoryIds([]); await loadBase()
      notify(`${ids.length} ta kategoriya o'chirildi`)
    })
  }, [isAdmin, tr, showConfirm, loadBase, notify])

  // To'g'ridan-to'g'ri Telegram Bot API ga murojaat
  // branchId berilsa — shu filial konfigini qidiradi, topilmasa global token/chatId ishlatiladi
  const sendTelegramViaEdge = useCallback(async (payload, branchId) => {
    let branchToken = '', branchChatId = ''
    if (branchId && Array.isArray(branchTelegrams)) {
      const bt = branchTelegrams.find(x => x.branch_id === branchId)
      if (bt) { branchToken = String(bt.telegram_token || '').trim(); branchChatId = String(bt.telegram_chat_id || '').trim() }
    }
    const token  = String(payload.telegram_token  || branchToken  || company?.telegram_token  || '').trim()
    const chatId = String(payload.telegram_chat_id || branchChatId || company?.telegram_chat_id || '').trim()
    if (!token)  throw new Error('Bot Token kiritilmagan. Avval Profil → Telegram sozlamalarini saqlang.')
    if (!chatId) throw new Error('Chat ID kiritilmagan. Avval Profil → Telegram sozlamalarini saqlang.')
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: payload.text, parse_mode: 'HTML' })
    })
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody.description || `HTTP xato: ${res.status}`)
    }
    const data = await res.json()
    if (!data.ok) throw new Error(data.description || 'Telegram yuborilmadi')
    return data
  }, [company?.telegram_token, company?.telegram_chat_id, branchTelegrams])

  const sendTelegramReport = useCallback(async (branchId, orderDate) => {
    try {
      const [s1res, s2res, usersRes, branchRes] = await Promise.all([
        supabase.from('shift_orders').select('*,branches(name)').eq('branch_id', branchId).eq('order_date', orderDate).eq('shift_no', 1).order('created_at', { ascending: false }).limit(1),
        supabase.from('shift_orders').select('*,branches(name)').eq('branch_id', branchId).eq('order_date', orderDate).eq('shift_no', 2).order('created_at', { ascending: false }).limit(1),
        supabase.from('users').select('id,full_name'),
        supabase.from('branches').select('name').eq('id', branchId).limit(1)
      ])
      const s1 = s1res.data?.[0], s2 = s2res.data?.[0]
      const allUsers = usersRes.data || []
      const branchName = branchRes.data?.[0]?.name || s2?.branches?.name || s1?.branches?.name || "Noma'lum"
      const dateStr = orderDate.split('-').reverse().join('.')
      const fmt = n => Number(n || 0).toLocaleString('ru-RU')
      const fmtShift = (r, label) => {
        if (!r) return [`🔹 ${label}`, '💰 Итого: 0', '💵 Наличка: 0'].join('\n')
        const expected = calcOrderExpected(r), cash = num(r.cash_amount), diff = cash - expected
        const sign = diff > 0 ? '+' : ''
        const mgr = allUsers.find(u => u.id === r.created_by)?.full_name || '—'
        return [
          `🔹 ${label}`, `💰 Итого: ${fmt(r.total)}`, `💵 Наличка: ${fmt(r.cash_amount)}`,
          `💳 Uzcard: ${fmt(r.uzcard)}`, `💳 Humo: ${fmt(r.humo)}`,
          `🎁 Rahmat: ${fmt(r.rahmat)}`, `🎁 RXMT: ${fmt(r.rxmt)}`,
          `🛍 Uzum: ${fmt(r.uzum)}`, `🚕 Yandex: ${fmt(r.yandex)}`,
          `➖ Расход: ${fmt(r.expense)}`, `🍬 Жвачка: ${num(r.gum_count)}`,
          `⚖️ Излишка/Недостача: ${sign}${diff.toLocaleString('ru-RU')}`, `👤 Менеджер: ${mgr}`
        ].join('\n')
      }
      const T = (a, b) => num(a) + num(b)
      const jTotal = T(s1?.total, s2?.total), jCash = T(s1?.cash_amount, s2?.cash_amount)
      const jUzcard = T(s1?.uzcard, s2?.uzcard), jHumo = T(s1?.humo, s2?.humo)
      const jRahmat = T(s1?.rahmat, s2?.rahmat), jRxmt = T(s1?.rxmt, s2?.rxmt)
      const jUzum = T(s1?.uzum, s2?.uzum), jYandex = T(s1?.yandex, s2?.yandex)
      const jExp = T(s1?.expense, s2?.expense), jGum = T(s1?.gum_count, s2?.gum_count)
      const jExpected = calcOrderExpected({ total: jTotal, uzcard: jUzcard, humo: jHumo, rahmat: jRahmat, rxmt: jRxmt, uzum: jUzum, yandex: jYandex, expense: jExp, gum_count: jGum })
      const jDiff = jCash - jExpected, jSign = jDiff > 0 ? '+' : ''
      const text = [
        `🏪 Филиал: ${branchName}`, `📅 Дата: ${dateStr}`, '',
        fmtShift(s1, '1 СМЕНА'), '', fmtShift(s2, '2 СМЕНА'), '',
        '🔹 ИТОГ ЗА ДЕНЬ',
        `💰 Итого: ${fmt(jTotal)}`, `💵 Наличка: ${fmt(jCash)}`,
        `💳 Uzcard: ${fmt(jUzcard)}`, `💳 Humo: ${fmt(jHumo)}`,
        `🎁 Rahmat: ${fmt(jRahmat)}`, `🎁 RXMT: ${fmt(jRxmt)}`,
        `🛍 Uzum: ${fmt(jUzum)}`, `🚕 Yandex: ${fmt(jYandex)}`,
        `➖ Расход: ${fmt(jExp)}`, `🍬 Жвачка: ${jGum}`,
        `⚖️ Излишка/Недостача: ${jSign}${jDiff.toLocaleString('ru-RU')}`
      ].join('\n')
      // Order hisoboti FAQAT global telegramga boradi (filial telegram emas)
      await sendTelegramViaEdge({ type: 'report', text })
    } catch (e) { console.error('Telegram xatosi:', e) }
  }, [sendTelegramViaEdge])

  // ── Telegram: operation notification ────────────────────────────────────
  const sendOperationNotification = useCallback(async (branchId, opRow) => {
    try {
      const hasBranchTg = Array.isArray(branchTelegrams) && branchTelegrams.some(bt => bt.branch_id === branchId && bt.telegram_chat_id)
      const hasGlobal   = !!(company?.telegram_chat_id)
      if (!hasBranchTg && !hasGlobal) return

      const branchObj  = allBranches.find(b => b.id === branchId)
      const branchName = branchObj?.name || "Noma'lum"
      const cat        = categories.find(c => c.id === opRow.category_id)
      const catLabel   = cat?.name || "Noma'lum"
      const isIncome   = opRow.type === OP_TYPE.INCOME
      const typeIcon   = isIncome ? '📥' : '📤'
      const typeLabel  = isIncome ? 'KIRIM' : 'CHIQIM'
      const sign       = isIncome ? '+' : '−'
      const fmt = n => Number(n || 0).toLocaleString('ru-RU')
      const dateStr = new Date().toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric' })
      const timeStr = new Date().toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' })

      const text = [
        `<b>🏪 ${branchName}</b>`,
        `${typeIcon} <b>${typeLabel}</b>`,
        ``,
        `📂 Kategoriya: ${catLabel}`,
        `💰 Summa: <b>${sign}${fmt(opRow.amount)} so'm</b>`,
        `🏦 Hisob: ${opRow.account || 'Naqd'}`,
        opRow.note ? `📝 Izoh: ${opRow.note}` : null,
        `⏰ ${dateStr} ${timeStr}`
      ].filter(Boolean).join('\n')

      await sendTelegramViaEdge({ text }, branchId)
    } catch (e) { console.error('Operation Telegram xatosi:', e) }
  }, [branchTelegrams, company?.telegram_chat_id, allBranches, categories, sendTelegramViaEdge])

  // ── CRUD: Orders ──────────────────────────────────────────────────────────
  const saveOrder = useCallback(async () => {
    if (branch === 'ALL') return notify(tr.chooseBranch)
    if (!order.total) return notify(tr.orderTotalRequired)
    const expectedCash = calcOrderExpected(order)
    const cash = String(order.cash_amount || '').trim() !== '' ? num(order.cash_amount) : expectedCash
    const orderDate = isAdmin ? order.date : today()
    const row = {
      branch_id: branch, order_date: orderDate, shift_no: num(order.shift_no),
      total: num(order.total), uzcard: num(order.uzcard), humo: num(order.humo),
      rahmat: num(order.rahmat), rxmt: num(order.rxmt), uzum: num(order.uzum),
      yandex: num(order.yandex), expense: num(order.expense), gum_count: num(order.gum_count),
      gum_price: 1000, cash_amount: cash,
      manual_cash: String(order.cash_amount || '').trim() !== '',
      note: order.note, status: 'CLOSED', created_by: user.id
    }
    const res = editOrder
      ? await supabase.from('shift_orders').update(row).eq('id', editOrder.id).select().single()
      : await supabase.from('shift_orders').insert(row).select().single()
    if (res.error) return notify('Order xato: ' + res.error.message)
    await audit('shift_orders', res.data.id, editOrder ? 'UPDATE' : 'INSERT', editOrder, row)
    if (num(row.shift_no) === 2) {
      const { data: s1Arr } = await supabase.from('shift_orders').select('cash_amount')
        .eq('branch_id', branch).eq('order_date', orderDate).eq('shift_no', 1)
        .order('created_at', { ascending: false }).limit(1)
      const s1Cash = s1Arr?.length ? num(s1Arr[0].cash_amount) : 0
      const combined = s1Cash + cash
      const { data: oldCashArr } = await supabase.from('cash_collection').select('*')
        .eq('branch_id', branch).eq('order_date', orderDate).order('created_at', { ascending: false }).limit(1)
      const oldCash = oldCashArr?.length ? oldCashArr[0] : null
      if (oldCash?.status !== CASH_ST.APPROVED) {
        const cashRes = oldCash?.id
          ? await supabase.from('cash_collection').update({ expected_cash: combined, note: '1+2 smena jami', status: CASH_ST.PENDING }).eq('id', oldCash.id)
          : await supabase.from('cash_collection').insert({ branch_id: branch, order_date: orderDate, expected_cash: combined, status: CASH_ST.PENDING, note: '1+2 smena jami' })
        if (cashRes.error) return notify('Inkassatsiya xato: ' + cashRes.error.message)
      }
      sendTelegramReport(branch, orderDate)
      notify('2-smena saqlandi ✅')
    } else {
      notify('1-smena saqlandi ✅')
    }
    setEditOrder(null)
    setOrder({ date: today(), shift_no: '1', total: '', uzcard: '', humo: '', rahmat: '', rxmt: '', uzum: '', yandex: '', expense: '', gum_count: '', cash_amount: '', note: '' })
    await Promise.all([loadOrders(), loadCashRows()])
  }, [branch, order, editOrder, isAdmin, user, tr, audit, loadOrders, loadCashRows, notify, sendTelegramReport])

  // ── CRUD: Cash ────────────────────────────────────────────────────────────
  const approveCash = useCallback(async (row, acceptedValue) => {
    if (row.status === CASH_ST.APPROVED) return notify(tr.alreadyApproved)
    const accepted = acceptedValue ?? row.expected_cash
    if (String(accepted || '').trim() === '') return
    const { error } = await supabase.from('cash_collection').update({
      accepted_cash: num(accepted), status: CASH_ST.APPROVED,
      approved_by: user.id, approved_at: new Date().toISOString()
    }).eq('id', row.id)
    if (error) return notify(error.message)

    // Inkassatsiya qabul qilinganda savdodan tushgan naqd pul balansga qo'shiladi
    // noteText da row.id ishlatiladi — eski o'chirilgan operatsiyalar bilan aralashmasin
    // created_at = order_date (Dashboard period filter bilan mos bo'lsin)
    try {
      const noteText = `Inkassatsiya qabul: ${row.order_date} [${row.id}]`
      const { data: existOp } = await supabase.from('operations').select('id')
        .eq('branch_id', row.branch_id).eq('note', noteText).limit(1)
      if (!existOp?.length) {
        const savdoCatId = await ensureCategory('Savdo puli', OP_TYPE.INCOME)
        if (savdoCatId) {
          const { error: opErr } = await supabase.from('operations').insert({
            branch_id: row.branch_id, type: OP_TYPE.INCOME, account: 'Naqd',
            category_id: savdoCatId, amount: num(accepted),
            note: noteText, created_by: user.id,
            created_at: `${row.order_date}T12:00:00`,
            status: 'active'
          })
          if (opErr) notify('Balansga qo\'shishda xato: ' + opErr.message)
        } else {
          notify('Kategoriya topilmadi — balansga qo\'shilmadi')
        }
      }
    } catch (opErr) {
      console.error('Inkassatsiya operatsiya yaratishda xato:', opErr)
      notify('Balansga qo\'shishda xato: ' + (opErr.message || 'Noma\'lum'))
    }
    await Promise.all([loadCashRows(), loadOperations()]); notify(tr.approveOk)
  }, [tr, user, ensureCategory, loadCashRows, loadOperations, notify])

  const saveCashEdit = useCallback(async (row, form) => {
    const { error } = await supabase.from('cash_collection')
      .update({ expected_cash: num(form.expected_cash), note: form.note }).eq('id', row.id)
    if (error) return notify(error.message)
    await audit('cash_collection', row.id, 'UPDATE', row, form)
    setEditCashRow(null); await loadCashRows(); notify(tr.saveOk)
  }, [audit, loadCashRows, tr, notify])

  const deleteCashRow = useCallback(row => {
    if (!isAdmin) return notify(tr.adminOnly)
    showConfirm("Inkassatsiyani o'chirasizmi?", async () => {
      const { error } = await supabase.from('cash_collection').delete().eq('id', row.id)
      if (error) return notify(error.message)
      await audit('cash_collection', row.id, 'DELETE', row, null)
      await loadCashRows(); notify(tr.deleteOk)
    })
  }, [isAdmin, tr, showConfirm, audit, loadCashRows, notify])

  // ── CRUD: Users ───────────────────────────────────────────────────────────
  const saveUser = useCallback(async () => {
    if (!newUser.full_name || !newUser.login) return notify(tr.userNameRequired)
    if (!newUser.id && !newUser.password) return notify(tr.passwordRequired)
    const cleanLogin = String(newUser.login || '').trim()
    const duplicate = users.find(u => u.login === cleanLogin && u.id !== newUser.id && u.active !== false)
    if (duplicate) return notify(tr.userLoginBusy)
    const payload = { full_name: newUser.full_name, login: cleanLogin, role: newUser.role, active: true }
    if (newUser.password) {
      try {
        payload.password_hash = await serverHashPassword(newUser.password)
        // password ustuni mavjud bo'lsa plain text ham saqlaymiz (admin ko'rishi uchun)
        if (users.some(u => 'password' in u)) payload.password = newUser.password
      } catch (e) { return notify('Parol hash xatosi: ' + (e.message || "Noma'lum")) }
    }
    if (newUser.id) {
      const { error } = await supabase.from('users').update(payload).eq('id', newUser.id)
      if (error) return notify(error.message)
      await supabase.from('user_branches').delete().eq('user_id', newUser.id)
      await supabase.from('permissions').delete().eq('user_id', newUser.id)
      for (const bid of newUser.branchIds) {
        await supabase.from('user_branches').insert({ user_id: newUser.id, branch_id: bid })
      }
      for (const m of newUser.modules) {
        await supabase.from('permissions').insert({ user_id: newUser.id, module: m, can_view: true, can_create: true, can_edit: false, can_delete: false })
      }
      notify('User yangilandi')
    } else {
      const { data, error } = await supabase.from('users').insert(payload).select().single()
      if (error) return notify(error.message)
      for (const bid of newUser.branchIds) {
        await supabase.from('user_branches').insert({ user_id: data.id, branch_id: bid })
      }
      for (const m of newUser.modules) {
        await supabase.from('permissions').insert({ user_id: data.id, module: m, can_view: true, can_create: true, can_edit: false, can_delete: false })
      }
      notify('User yaratildi')
    }
    setNewUser({ id: null, full_name: '', login: '', password: '', role: 'SMENA_MANAGER', branchIds: [], modules: ['order'] })
    await loadUsersAndAccess()
  }, [newUser, users, tr, loadUsersAndAccess, notify])

  const editUserFn = useCallback(u => {
    const branchIds = userBranches.filter(x => x.user_id === u.id).map(x => x.branch_id)
    const modules   = permissions.filter(x => x.user_id === u.id && x.can_view).map(x => x.module)
    setNewUser({ id: u.id, full_name: u.full_name || '', login: u.login || '', password: u.password || '', role: u.role || 'SMENA_MANAGER', branchIds, modules: modules.length ? modules : [] })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [userBranches, permissions])

  const deactivateUser = useCallback(u => {
    showConfirm(`${u.full_name || u.login} ni o'chirasizmi?`, async () => {
      await supabase.from('users').update({ active: false }).eq('id', u.id)
      await loadUsersAndAccess(); notify("User o'chirildi")
    })
  }, [showConfirm, loadUsersAndAccess, notify])

  // ── CRUD: Categories ──────────────────────────────────────────────────────
  const saveCategory = useCallback(async () => {
    if (!newCat.name) return notify(tr.categoryNameNeeded)
    if (editCat) {
      const { error } = await supabase.from('categories').update({ name: newCat.name, name_ru: newCat.name_ru, name_cy: newCat.name_cy, type: newCat.type }).eq('id', editCat.id)
      if (error) return notify(error.message)
      setEditCat(null); notify(tr.categoryUpdated)
    } else {
      const { error } = await supabase.from('categories').insert({ name: newCat.name, name_ru: newCat.name_ru, name_cy: newCat.name_cy, type: newCat.type, active: true })
      if (error) return notify(error.message)
      notify(tr.categoryAdded)
    }
    setNewCat({ name: '', name_ru: '', name_cy: '', type: OP_TYPE.INCOME }); await loadBase()
  }, [newCat, editCat, tr, loadBase, notify])

  const startEditCategory = useCallback(cat => {
    setEditCat(cat)
    setNewCat({ name: cat.name || '', name_ru: cat.name_ru || '', name_cy: cat.name_cy || '', type: cat.type || OP_TYPE.INCOME })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const deleteCategory = useCallback(cat => {
    showConfirm(`"${cat.name}" kategoriyani o'chirasizmi?`, async () => {
      const { error } = await supabase.from('categories').update({ active: false }).eq('id', cat.id)
      if (error) return notify(error.message)
      notify(tr.categoryDeleted); await loadBase()
    })
  }, [showConfirm, tr, loadBase, notify])

  const cancelEditCategory = useCallback(() => {
    setEditCat(null); setNewCat({ name: '', name_ru: '', name_cy: '', type: OP_TYPE.INCOME })
  }, [])

  // ── CRUD: Branches ────────────────────────────────────────────────────────
  const saveBranch = useCallback(async (form, editId, onSuccess) => {
    if (!isAdmin) return notify(tr.adminOnly)
    const name = String(form.name || '').trim()
    const code = String(form.code || '').trim().toUpperCase()
    if (!name) return notify('Filial nomini kiriting')
    if (!code) return notify('Filial kodini kiriting')
    const payload = { name, code, sort_order: Number(form.sort_order) || 0 }
    if (editId) {
      const { error } = await supabase.from('branches').update(payload).eq('id', editId)
      if (error) return notify(error.message)
      await audit('branches', editId, 'UPDATE', null, payload)
      notify('Filial yangilandi')
    } else {
      const dup = (await supabase.from('branches').select('id').eq('code', code).limit(1)).data
      if (dup?.length) return notify('Bu kodli filial allaqachon mavjud')
      const { data, error } = await supabase.from('branches').insert({ ...payload, active: true }).select().single()
      if (error) return notify(error.message)
      await audit('branches', data.id, 'INSERT', null, payload)
      notify('Filial qo\'shildi')
    }
    await loadBase()
    onSuccess?.()
  }, [isAdmin, tr, audit, loadBase, notify])

  const toggleBranch = useCallback(b => {
    if (!isAdmin) return notify(tr.adminOnly)
    const msg = b.active ? `"${b.name}" ni nofaol qilasizmi?` : `"${b.name}" ni faollashtirасizmi?`
    showConfirm(msg, async () => {
      const { error } = await supabase.from('branches').update({ active: !b.active }).eq('id', b.id)
      if (error) return notify(error.message)
      await audit('branches', b.id, 'UPDATE', { active: b.active }, { active: !b.active })
      await loadBase()
      notify(b.active ? 'Filial nofaol qilindi' : 'Filial faollashtirildi')
    })
  }, [isAdmin, tr, showConfirm, audit, loadBase, notify])

  const deleteBranch = useCallback(b => {
    if (!isAdmin) return notify(tr.adminOnly)
    showConfirm(`"${b.name}" filialini to'liq o'chirasizmi? Bu amalni qaytarib bo'lmaydi!`, async () => {
      const { error } = await supabase.from('branches').delete().eq('id', b.id)
      if (error) return notify("O'chirib bo'lmadi: " + error.message)
      await audit('branches', b.id, 'DELETE', b, null)
      await loadBase()
      notify('Filial o\'chirildi')
    })
  }, [isAdmin, tr, showConfirm, audit, loadBase, notify])

  // ── CRUD: Employees ───────────────────────────────────────────────────────
  const saveEmployee = useCallback(async () => {
    if (branch === 'ALL') return notify(tr.chooseBranch)
    if (!employeeForm.full_name) return notify(tr.employeeNameRequired)
    const { error } = await supabase.from('employees').insert({
      branch_id: branch, full_name: employeeForm.full_name, position: employeeForm.position,
      hire_date: employeeForm.hire_date, salary_type: employeeForm.salary_type,
      hourly_rate: num(employeeForm.hourly_rate), monthly_salary: num(employeeForm.monthly_salary), active: true
    })
    if (error) return notify(error.message)
    setEmployeeForm({ full_name: '', position: '', hire_date: today(), salary_type: 'hourly', hourly_rate: '', monthly_salary: '' })
    await loadPayrollData(); notify("Xodim qo'shildi")
  }, [branch, employeeForm, tr, loadPayrollData, notify])

  const deleteEmployee = useCallback(emp => {
    showConfirm(`${emp.full_name} ni o'chirasizmi?`, async () => {
      const { error } = await supabase.from('employees').update({ active: false }).eq('id', emp.id)
      if (error) return notify(error.message)
      await loadPayrollData(); notify("Xodim o'chirildi")
    })
  }, [showConfirm, loadPayrollData, notify])

  const updateEmployee = useCallback(async (emp, form) => {
    const { error } = await supabase.from('employees').update({
      full_name: form.full_name, position: form.position, hire_date: form.hire_date,
      salary_type: form.salary_type, hourly_rate: num(form.hourly_rate), monthly_salary: num(form.monthly_salary)
    }).eq('id', emp.id)
    if (error) return notify(error.message)
    setEditEmployee(null); await loadPayrollData(); notify('Xodim yangilandi')
  }, [loadPayrollData, notify])

  // ── Payroll ───────────────────────────────────────────────────────────────
  const savePayroll = useCallback(async () => {
    if (branch === 'ALL') return notify(tr.chooseBranch)
    if (!payroll.period_start || !payroll.period_end) return notify(tr.payrollPeriodRequired)
    if (payroll.period_start > payroll.period_end) return notify(tr.payrollStartEndError)
    const validRows = (payroll.rows || []).filter(r => r.employee_id)
    if (!validRows.length) return notify(tr.payrollNoEmployees)
    const title = (payroll.title || `${new Date(payroll.period_start).getFullYear()} ${payroll.period_start.slice(5, 7)} ${payroll.part_no}`).trim()
    const runRes = await supabase.from('payroll_runs').insert({
      title, branch_id: branch, period_start: payroll.period_start,
      period_end: payroll.period_end, part_no: num(payroll.part_no), created_by: user.id
    }).select().single()
    if (runRes.error) return notify(runRes.error.message)
    const items = validRows.map(r => {
      const calc = calcPayrollRow(r)
      return {
        payroll_run_id: runRes.data.id, employee_id: r.employee_id,
        worked_hours: num(r.worked_hours), extra_hours: num(r.extra_hours),
        hourly_rate: num(r.hourly_rate), base_salary: num(r.base_salary),
        tax: num(r.tax), lunch: num(r.lunch), penalty: num(r.penalty),
        advance: num(r.advance), bonus: num(r.bonus),
        cash_paid: num(r.cash_paid), card_paid: num(r.card_paid),
        total_salary: calc.total_salary, total_paid: calc.total_paid,
        remaining: calc.remaining, note: r.note || ''
      }
    })
    const itemRes = await supabase.from('payroll_items').insert(items)
    if (itemRes.error) {
      await supabase.from('payroll_runs').delete().eq('id', runRes.data.id)
      return notify(itemRes.error.message)
    }
    await loadPayrollData(); notify('Oylik saqlandi')
  }, [branch, payroll, user, tr, calcPayrollRow, loadPayrollData, notify])

  const exportPayrollCurrent = useCallback(() => {
    const rows = [
      ['№', tr.fullName, tr.position, tr.workedHours, tr.extraHours, tr.hourlyRate,
        tr.total, tr.tax, tr.lunch, tr.penalty, tr.advance, tr.bonus,
        tr.cashPaid, tr.cardPaid, tr.remaining, tr.signature],
      ...(payroll.rows || []).map((r, i) => {
        const calc = calcPayrollRow(r)
        return [i + 1, r.full_name, r.position, r.worked_hours, r.extra_hours, r.hourly_rate,
          calc.total_salary, r.tax, r.lunch, r.penalty, r.advance, r.bonus,
          r.cash_paid, r.card_paid, calc.remaining, '']
      })
    ]
    downloadCSV('oylik.csv', rows)
  }, [payroll, tr, calcPayrollRow])

  // ── Profile ───────────────────────────────────────────────────────────────
  const saveProfile = useCallback(async () => {
    const payload = { ...profile, language: lang, theme }
    const { error } = await supabase.from('users').update(payload).eq('id', user.id)
    if (error) return notify(error.message)
    const updated = { ...user, ...payload }
    setUser(updated); localStorage.setItem('finance_user', JSON.stringify(updated)); notify('Profil saqlandi')
  }, [profile, lang, theme, user, notify])

  const uploadAvatar = useCallback(async fileOrEvent => {
    const file = fileOrEvent?.target?.files?.[0] || fileOrEvent
    if (!file) return
    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase()
    const filePath = `${user.id}/avatar-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars')
      .upload(filePath, file, { cacheControl: '3600', upsert: true, contentType: file.type || 'image/jpeg' })
    if (uploadError) return notify(uploadError.message)
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    const avatar_url = data?.publicUrl
    if (!avatar_url) return notify('Rasm URL olinmadi')
    await supabase.from('users').update({ avatar_url }).eq('id', user.id)
    const updatedUser = { ...user, avatar_url }
    setUser(updatedUser); setProfile(p => ({ ...p, avatar_url }))
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, avatar_url } : u))
    localStorage.setItem('finance_user', JSON.stringify(updatedUser))
    await loadUsersAndAccess(); notify('Rasm yuklandi')
  }, [user, loadUsersAndAccess, notify])

  // ── Chat ──────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!chatUser || !chatText.trim()) return
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id, receiver_id: chatUser, message: chatText.trim(), is_read: false
    })
    if (error) return notify(error.message)
    setChatText(''); await loadMessages()
  }, [chatUser, chatText, user, loadMessages, notify])

  const markChatRead = useCallback(async senderId => {
    if (!user?.id || !senderId) return
    await supabase.from('messages').update({ is_read: true })
      .eq('receiver_id', user.id).eq('sender_id', senderId).eq('is_read', false)
    await loadMessages()
  }, [user?.id, loadMessages])

  const markAllRead = useCallback(async () => {
    if (!user?.id) return
    await supabase.from('messages').update({ is_read: true })
      .eq('receiver_id', user.id).eq('is_read', false)
    await loadMessages()
  }, [user?.id, loadMessages])

  // ── Telegram ──────────────────────────────────────────────────────────────
  const saveCompanySettings = useCallback(async form => {
    const payload = {
      telegram_token:   String(form.telegram_token || '').trim(),
      telegram_chat_id: String(form.telegram_chat_id || '').trim()
    }
    if (!payload.telegram_token || !payload.telegram_chat_id) return notify('Token va Chat ID kiriting')
    const { data: existing } = await supabase.from('company_settings').select('id')
      .order('created_at', { ascending: true }).limit(1).maybeSingle()
    const res = existing?.id
      ? await supabase.from('company_settings').update(payload).eq('id', existing.id).select().single()
      : await supabase.from('company_settings').insert(payload).select().single()
    if (res.error) return notify(res.error.message)
    // loadBase() ni chaqirmayamiz — u company ni null ga o'zgartirishi mumkin (race condition)
    setCompany(prev => ({
      ...(prev || {}),
      id: res.data?.id ?? existing?.id ?? prev?.id,
      telegram_token:   payload.telegram_token,
      telegram_chat_id: payload.telegram_chat_id
    }))
    notify(tr.telegramSaved)
  }, [tr, notify])

  const testTelegram = useCallback(async form => {
    notify(tr.telegramTest)
    try {
      const token  = String(form?.telegram_token  || '').trim()
      const chatId = String(form?.telegram_chat_id || company?.telegram_chat_id || '').trim()
      // Yangi token kiritilgan bo'lsa — avval saqlaymiz
      if (token && chatId) await saveCompanySettings({ telegram_token: token, telegram_chat_id: chatId })
      // Token va chatId ni payload ga o'tkazamiz (saveCompanySettings stale closure muammosidan himoya)
      await sendTelegramViaEdge({
        type: 'test',
        text: '✅ Sariq Bola Finance — bot ulanishi tekshirildi!',
        telegram_token:   token  || company?.telegram_token,
        telegram_chat_id: chatId || company?.telegram_chat_id
      })
      notify(tr.telegramOk)
    } catch (e) { notify(tr.telegramErr + (e.message || "Noma'lum")) }
  }, [tr, company, saveCompanySettings, sendTelegramViaEdge, notify])

  const deleteTelegramSettings = useCallback(() => {
    showConfirm("Telegram token va Chat ID ni o'chirasizmi?", async () => {
      const { data: existing } = await supabase.from('company_settings').select('id')
        .order('created_at', { ascending: true }).limit(1).maybeSingle()
      if (!existing?.id) return
      const { error } = await supabase.from('company_settings')
        .update({ telegram_token: '', telegram_chat_id: '' }).eq('id', existing.id)
      if (error) return notify(error.message)
      setCompany(prev => prev ? { ...prev, telegram_token: '', telegram_chat_id: '' } : null)
      notify("Telegram sozlamalari o'chirildi")
    })
  }, [showConfirm, notify])

  // ── Per-branch Telegram CRUD ──────────────────────────────────────────────
  const saveBranchTelegram = useCallback(async (branchId, form) => {
    if (!form.telegram_chat_id?.trim()) return notify('Chat ID kiritilmagan')
    const payload = {
      branch_id:        branchId,
      telegram_token:   String(form.telegram_token   || '').trim(),
      telegram_chat_id: String(form.telegram_chat_id || '').trim()
    }
    const existing = (branchTelegrams || []).find(bt => bt.branch_id === branchId)
    const res = existing?.id
      ? await supabase.from('branch_telegram').update(payload).eq('id', existing.id).select().single()
      : await supabase.from('branch_telegram').insert(payload).select().single()
    if (res.error) { notify(res.error.message); return }
    setBranchTelegrams(prev => {
      const list = (prev || []).filter(bt => bt.branch_id !== branchId)
      return [...list, { ...(existing || {}), ...payload, id: res.data?.id ?? existing?.id }]
    })
    notify('Filial Telegram saqlandi ✅')
  }, [branchTelegrams, notify])

  const deleteBranchTelegram = useCallback(branchId => {
    showConfirm("Filial Telegram konfigini o'chirasizmi?", async () => {
      const existing = (branchTelegrams || []).find(bt => bt.branch_id === branchId)
      if (!existing?.id) return
      const { error } = await supabase.from('branch_telegram').delete().eq('id', existing.id)
      if (error) return notify(error.message)
      setBranchTelegrams(prev => (prev || []).filter(bt => bt.branch_id !== branchId))
      notify("Filial Telegram o'chirildi")
    })
  }, [branchTelegrams, showConfirm, notify])

  const testBranchTelegram = useCallback(async (branchId, form) => {
    notify('Test xabar yuborilmoqda...')
    try {
      const branchObj = allBranches.find(b => b.id === branchId)
      const text = `✅ <b>${branchObj?.name || 'Filial'}</b> — Sariq Bola Finance bot ulanishi tekshirildi!`
      await sendTelegramViaEdge({
        text,
        telegram_token:   String(form?.telegram_token   || '').trim() || undefined,
        telegram_chat_id: String(form?.telegram_chat_id || '').trim() || undefined
      }, branchId)
      notify('Test xabar yuborildi ✅')
    } catch (e) { notify('Telegram xatosi: ' + (e.message || "Noma'lum")) }
  }, [allBranches, sendTelegramViaEdge, notify])



  // ── Import / Export ───────────────────────────────────────────────────────
  const exportAllData = useCallback(async () => {
    if (!isAdmin) return notify(tr.backupAdminOnly)
    const tables = ['users','branches','user_branches','permissions','categories','operations','shift_orders','cash_collection','employees','payroll_runs','payroll_items','messages','company_settings','audit_logs']
    const backup = { system: 'SARIQ BOLA PIZZA Finance', exported_at: new Date().toISOString(), tables: {} }
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*')
      backup.tables[table] = error ? { error: error.message, rows: [] } : { rows: data || [] }
      if (data?.length) downloadCSV(`backup-${table}.csv`, makeCSVRowsFromObjects(data))
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `sariq-bola-backup-${today()}.json`
    document.body.appendChild(a); a.click()
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 100)
    notify(`${tables.length} ta jadval backup qilindi`)
  }, [isAdmin, tr, notify])

  const parseXlsxOrCsv = async file => {
    if (/\.(xlsx|xls)$/i.test(file.name)) {
      const buf = await file.arrayBuffer(); const wb = XLSX.read(buf)
      const sheetName = wb.SheetNames.find(n => !["Ko'rsatmalar","Ma'lumotnoma"].includes(n)) || wb.SheetNames[0]
      return XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, raw: false, dateNF: 'yyyy-mm-dd' })
        .filter(r => Array.isArray(r) && r.some(c => c !== undefined && String(c || '').trim() !== ''))
    }
    return parseCSV(await file.text())
  }

  const importOperationsCSV = useCallback(async e => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    try {
      const parsed = await parseXlsxOrCsv(file)
      const header = parsed[0] || [], rows = parsed.slice(1)
      const col = {
        branch:   findColumn(header, ['filial','branch','филиал']),
        date:     findColumn(header, ['sana','date','дата']),
        type:     findColumn(header, ['tur','type','тип']),
        category: findColumn(header, ['kategoriya','category','категория']),
        account:  findColumn(header, ['hisob','account','счет']),
        amount:   findColumn(header, ['summa','amount','сумма']),
        note:     findColumn(header, ['izoh','note','комментарий'])
      }
      const insertRows = []
      for (const r of rows) {
        const branchName = String(readCell(r, col.branch, r[0]) || '').trim()
        const branchRow  = branches.find(b => b.name === branchName || b.code === branchName || b.id === branchName)
        if (!branchRow) continue
        const typeRaw = String(readCell(r, col.type, r[2]) || '').toLowerCase()
        const type    = typeRaw.includes('chiq') || typeRaw.includes('расход') || typeRaw.includes('чиқ') ? OP_TYPE.EXPENSE : OP_TYPE.INCOME
        const categoryId = await ensureCategory(readCell(r, col.category, r[3]), type)
        if (!categoryId) continue
        const accountRaw = String(readCell(r, col.account, r[4]) || '').trim()
        const account    = accountRaw.toLowerCase().includes('hisob') || accountRaw.toLowerCase().includes('банк') ? 'Hisob raqam' : 'Naqd'
        const created_at = toDateTime(readCell(r, col.date, r[1]))
        const amount     = toNumber(readCell(r, col.amount, r[5]))
        const note       = readCell(r, col.note, r[6]) || 'Excel import'
        const exists = operations.some(o =>
          o.branch_id === branchRow.id && o.type === type && o.account === account &&
          o.category_id === categoryId && num(o.amount) === amount &&
          String(o.note || '') === String(note || '') && sameDay(o.created_at, created_at)
        )
        const inBatch = insertRows.some(o =>
          o.branch_id === branchRow.id && o.type === type && o.account === account &&
          o.category_id === categoryId && num(o.amount) === amount &&
          String(o.note || '') === String(note || '') && sameDay(o.created_at, created_at)
        )
        if (exists || inBatch) continue
        insertRows.push({ branch_id: branchRow.id, type, account, category_id: categoryId, amount, note, created_by: user.id, created_at, status: 'ACTIVE' })
      }
      if (!insertRows.length) return notify(tr.importNoRows)
      const { error } = await supabase.from('operations').insert(insertRows)
      if (error) return notify(error.message)
      await loadBase(); await loadOperations()
      notify(`${insertRows.length} ta operatsiya import qilindi`)
    } catch (err) { notify(err.message || 'Import xatosi') }
  }, [branches, operations, categories, user, tr, ensureCategory, loadBase, loadOperations, notify])

  const importOrdersCSV = useCallback(async e => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    try {
      const parsed = await parseXlsxOrCsv(file)
      const header = parsed[0] || [], rows = parsed.slice(1)
      const col = {
        branch:  findColumn(header, ['filial','branch','филиал']),
        smena:   findColumn(header, ['smena','shift','смена']),
        date:    findColumn(header, ['sana','date','дата']),
        total:   findColumn(header, ['jami savdo','jami','total','общая продажа','jami_savdo','итого']),
        uzcard:  findColumn(header, ['uzcard']), humo: findColumn(header, ['humo']),
        rahmat:  findColumn(header, ['rahmat']), rxmt: findColumn(header, ['rxmt']),
        uzum:    findColumn(header, ['uzum']),   yandex: findColumn(header, ['yandex']),
        expense: findColumn(header, ['xarajat','expense','расход']),
        gum:     findColumn(header, ['jvachka','жвачка','gum']),
        cash:    findColumn(header, ['nalichka','наличка','naqd summa','naqd','наличные','cash']),
        note:    findColumn(header, ['izoh','note','комментарий'])
      }

      // Eski format: filial | sana | smena(number) | ...
      // Yangi format: filial | smena(label) | sana | итого | наличка | ...
      // Fark: yangi formatda smena ustuni labeldan oldin keladi, sana ikkinchi pozitsiyada
      const isNewFormat = col.smena >= 0 && col.smena < col.date

      const insertRows = []
      for (const r of rows) {
        // Filial ustuni yoki birinchi ustun
        const branchName = String(readCell(r, col.branch, r[0]) || '').trim()
        const branchRow  = branches.find(b => b.name === branchName || b.code === branchName || b.id === branchName)
        if (!branchRow) continue

        // Smena: yangi formatda label ("1 smena"/"2 смена"), eskisida raqam
        const smenaRaw = String(readCell(r, col.smena, isNewFormat ? r[1] : r[2]) || '').trim().toLowerCase()
        // ИТОГ satrlarini o'tkazib yuborish
        if (/итог|итого|jami|total/i.test(smenaRaw)) continue
        // Smena raqamini label yoki raqamdan chiqarish
        const shift_no = /^2|.*2.*sm/i.test(smenaRaw) ? 2 : (toNumber(smenaRaw) || 1)

        const dateCol = isNewFormat ? r[2] : r[1]
        const order_date = toDateOnly(readCell(r, col.date, dateCol))

        // Yangi formatda ustun tartibi: filial | smena | sana | итого | наличка | uzcard | ...
        // Eski: filial | sana | smena | jami | uzcard | ...
        const offset = isNewFormat ? 1 : 0   // yangi formatda ustunlar 1 ga siljigan

        const draft = {
          total:     toNumber(readCell(r, col.total,   r[3 + offset])),
          uzcard:    toNumber(readCell(r, col.uzcard,  r[5 + offset])),
          humo:      toNumber(readCell(r, col.humo,    r[6 + offset])),
          rahmat:    toNumber(readCell(r, col.rahmat,  r[7 + offset])),
          rxmt:      toNumber(readCell(r, col.rxmt,    r[8 + offset])),
          uzum:      toNumber(readCell(r, col.uzum,    r[9 + offset])),
          yandex:    toNumber(readCell(r, col.yandex,  r[10 + offset])),
          expense:   toNumber(readCell(r, col.expense, r[11 + offset])),
          gum_count: toNumber(readCell(r, col.gum,     r[12 + offset]))
        }
        const expectedCash  = calcOrderExpected(draft)
        // Yangi formatda nalichka = r[4] (smena|sana|итого|наличка|...)
        const cashFallback  = isNewFormat ? r[4] : r[12]
        const actualCashRaw = readCell(r, col.cash, cashFallback)
        const actualCash    = String(actualCashRaw || '').trim() !== '' ? toNumber(actualCashRaw) : expectedCash
        const noteCol       = isNewFormat ? r[13] : r[13]
        const exists  = orders.some(o => o.branch_id === branchRow.id && o.order_date === order_date && num(o.shift_no) === shift_no)
        const inBatch = insertRows.some(o => o.branch_id === branchRow.id && o.order_date === order_date && num(o.shift_no) === shift_no)
        if (exists || inBatch) continue
        insertRows.push({ branch_id: branchRow.id, order_date, shift_no, ...draft, gum_price: 1000, cash_amount: actualCash, manual_cash: actualCash !== expectedCash, note: readCell(r, col.note, noteCol) || 'Excel import', status: 'CLOSED', created_by: user.id })
      }
      if (!insertRows.length) return notify(tr.importOrdersNoRows)
      const { error } = await supabase.from('shift_orders').insert(insertRows)
      if (error) return notify(error.message)
      for (const s2 of insertRows.filter(r => r.shift_no === 2)) {
        const { data: existCash } = await supabase.from('cash_collection').select('id').eq('branch_id', s2.branch_id).eq('order_date', s2.order_date).limit(1)
        if (existCash?.length) continue
        const { data: s1Arr } = await supabase.from('shift_orders').select('cash_amount').eq('branch_id', s2.branch_id).eq('order_date', s2.order_date).eq('shift_no', 1).order('created_at', { ascending: false }).limit(1)
        const s1Cash = s1Arr?.length ? num(s1Arr[0].cash_amount) : 0
        await supabase.from('cash_collection').insert({ branch_id: s2.branch_id, order_date: s2.order_date, expected_cash: s1Cash + num(s2.cash_amount), status: CASH_ST.PENDING, note: 'Excel import — 2-smena' })
      }
      await Promise.all([loadOrders(), loadCashRows()])
      notify(`${insertRows.length} ta order import qilindi`)
    } catch (err) { notify(err.message || 'Import xatosi') }
  }, [branches, orders, user, tr, loadOrders, loadCashRows, notify])

  const downloadOrdersTemplate = useCallback(() => {
    // DD.MM.YYYY format — matches screenshot & toDateOnly parser
    const fmtDate = d => d ? d.split('-').reverse().join('.') : ''
    const todayFmt = fmtDate(today())

    const instrData = [
      ['ORDERLAR IMPORT SHABLONI'], [''],
      ['QOIDALAR:'],
      ["1. \"Orderlar\" varaqasini to'ldiring"],
      [`2. Sana formati: KK.OO.YYYY  (masalan: ${todayFmt})`],
      ['3. Smena ustuniga:  "1 smena"  yoki  "2 smena"  deb yozing'],
      ["4. Наличка bo'sh qolsa — Итого minus karta to'lovlari avtomatik hisoblanadi"],
      ["5. Barcha summalar so'mda (tiyin emas)"],
      ["6. ИТОГ satrlarini qo'shmang — tizim o'zi hisoblaydi"],
      [''],
      ['FILIALLAR:'],
      ...branches.map(b => [`  ${b.name}`, `(kod: ${b.code})`])
    ]

    // Columns match screenshot exactly (без Click — u bazada yo'q)
    const headers = [
      'filial', 'smena', 'sana', 'итого', 'наличка',
      'uzcard', 'humo', 'rahmat', 'rxmt', 'uzum', 'yandex',
      'расход', 'жвачка', 'izoh'
    ]

    const exampleRows = branches.flatMap(b => [
      [b.name, '1 smena', todayFmt, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, 'Misol 1-smena'],
      [b.name, '2 smena', todayFmt, 0, '', 0, 0, 0, 0, 0, 0, 0, 0, 'Misol 2-smena']
    ])

    downloadXLSX('orderlar-shablon.xlsx', [
      { name: "Ko'rsatmalar", data: instrData, colWidths: [48, 22] },
      { name: 'Orderlar', data: [headers, ...exampleRows],
        colWidths: [22, 10, 13, 14, 14, 12, 12, 12, 10, 12, 12, 12, 13, 22] }
    ])
  }, [branches])

  const downloadOperationsTemplate = useCallback(() => {
    const refData = [
      ['OPERATSIYALAR IMPORT SHABLONI'],[''],
      ['Kirim kategoriyalari:'], ...categories.filter(c => c.type === OP_TYPE.INCOME).map(c => ['  ' + c.name]),
      [''],['Chiqim kategoriyalari:'], ...categories.filter(c => c.type === OP_TYPE.EXPENSE).map(c => ['  ' + c.name]),
      [''],['Hisoblar:'],['  Naqd'],['  Hisob raqam'],[''],['Filiallar:'],
      ...branches.map(b => ['  ' + b.name])
    ]
    const headers = ['filial','sana','tur','kategoriya','hisob','summa','izoh']
    const exampleRows = branches.map(b => [b.name, today(), 'Kirim', categories.find(c => c.type === OP_TYPE.INCOME)?.name || 'Savdo puli', 'Naqd', 0, ''])
    exampleRows.push([branches[0]?.name || '', today(), 'Chiqim', categories.find(c => c.type === OP_TYPE.EXPENSE)?.name || 'Xarajatlar', 'Naqd', 0, ''])
    downloadXLSX('operatsiyalar-shablon.xlsx', [
      { name: "Ma'lumotnoma", data: refData, colWidths: [30] },
      { name: 'Operatsiyalar', data: [headers, ...exampleRows], colWidths: [20,12,10,25,16,14,25] }
    ])
  }, [branches, categories])

  // ── Return everything ────────────────────────────────────────────────────
  return {
    // state
    user, page, loginVal, setLoginVal, password, setPassword, remember, setRemember,
    showPass, setShowPass, loading, toast, mobileMenu, setMobileMenu,
    showNotifications, confirmModal,
    branches, allBranches, users, categories, operations, orders, cashRows,
    messages, employees, payrollRuns, payrollItems, company, branchTelegrams,
    branch, period, setPeriod, lang, setLang, theme, setTheme,
    op, setOp, order, setOrder, employeeForm, setEmployeeForm,
    payroll, setPayroll, newUser, setNewUser, newCat, setNewCat, editCat,
    chatUser, setChatUser, chatText, setChatText, profile, setProfile,
    editOp, setEditOp, editOrder, setEditOrder,
    selectedOperationIds, setSelectedOperationIds,
    selectedCategoryIds, setSelectedCategoryIds,
    reportFilterOpen, setReportFilterOpen, reportFilter, setReportFilter,
    editCashRow, setEditCashRow, editCashForm, setEditCashForm,
    cashDateFilter, setCashDateFilter, editEmployee, setEditEmployee,
    employeeEditForm, setEmployeeEditForm,
    // computed
    tr, isAdmin, loginReady, unreadCount, allowedBranches, selectedBranchIds,
    notifications, notificationKey, notificationCount,
    visibleOps, visibleOrders, visibleCash, visibleCashFiltered,
    filteredReportOps, stats, salesStats,
    // functions
    notify, showConfirm, closeConfirm, changePage, setBranch,
    catName, calcCash, can, userAllowedBranches, isOnline,
    initPayrollRows, calcPayrollRow,
    loadAll, loadBase, loadOperations, loadOrders, loadCashRows, loadMessages, loadPayrollData,
    signIn, logout, saveOperation, saveOrder, deleteRow, deleteManyOperations, deleteManyCategories,
    approveCash, saveCashEdit, deleteCashRow,
    saveUser, editUserFn, deactivateUser,
    saveCategory, startEditCategory, deleteCategory, cancelEditCategory,
    saveBranch, toggleBranch, deleteBranch,
    saveEmployee, deleteEmployee, updateEmployee,
    savePayroll, exportPayrollCurrent,
    saveProfile, uploadAvatar, sendMessage, markChatRead, markAllRead,
    saveCompanySettings, testTelegram, deleteTelegramSettings,
    saveBranchTelegram, deleteBranchTelegram, testBranchTelegram,
    exportAllData, importOperationsCSV, importOrdersCSV,
    downloadOrdersTemplate, downloadOperationsTemplate,
    exportOperations: (rows) => exportOperations(rows, tr, catName),
    exportOrders: (rows) => exportOrders(rows, tr),
    openNotifications,
  }
}