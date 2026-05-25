import { useEffect, useMemo, useState, useRef, Fragment } from 'react'
import { supabase } from './lib'
import * as XLSX from 'xlsx'
import './index.css'

const BASE = '/sariq-bola-finance/'
const LOGO = BASE + 'logo.png'
const BRANCH_ORDER = ['PROSPEKT', 'MAKRO', 'QOQON', 'TOSHKENT']
const ACCOUNTS = ['Naqd', 'Hisob raqam']
const MODULES = [
  'dashboard','salesAnalytics','order','orderReports','cash',
  'operation','history','reports','employees','payroll',
  'payrollArchive','categories','users','chat','profile'
]
const ROLE_LABELS = {
  ADMIN:'Admin', RAHBAR:'Rahbar', BOSH_MANAGER:'Bosh menejer',
  FILIAL_MANAGER:'Filial menejer', SMENA_MANAGER:'Smena menejer', BUXGALTER:'Buxgalter'
}

const TEXT = {
  uz: {
    dashboard:'Dashboard', salesAnalytics:'Savdo analitika', order:'Smena order',
    orderReports:'Filial orderlari', cash:'Inkassatsiya', operation:'Kirim / Chiqim',
    history:'Operatsiyalar', reports:'Hisobotlar', employees:'Xodimlar',
    payroll:'Oylik hisoblash', payrollArchive:'Oylik arxivi', categories:'Kategoriyalar',
    users:'Foydalanuvchilar', chat:'Chat', profile:'Profil', logout:'Chiqish',
    welcome:'Xush kelibsiz', refresh:'Yangilash', save:'Saqlash', create:'Yaratish',
    edit:'Tahrirlash', delete:"O'chirish", cancel:'Bekor qilish', start:'Boshlanish',
    end:'Tugash', branch:'Filial', all:'Umumiy', cashBalance:'Naqd balans',
    bankBalance:'Hisob raqam balans', incomeChart:"Kirimlar kategoriyalar bo'yicha",
    expenseChart:"Chiqimlar kategoriyalar bo'yicha", branchSales:"Filiallar bo'yicha savdo",
    trend:'Savdo trendi', totalSales:'Jami savdo', growth:"O'sish / pasayish",
    noData:"Ma'lumot yo'q", date:'Sana', shift:'Smena', total:'Jami savdo',
    uzcard:'Uzcard', humo:'Humo', rahmat:'Rahmat', rxmt:'RXMT', uzum:'Uzum', yandex:'Yandex',
    expense:'Xarajat', gum:'Jvachka soni', cashAmount:'Naqd summa',
    type:'Tur', account:'Hisob', category:'Kategoriya', amount:'Summa', note:'Izoh',
    income:'Kirim', outcome:'Chiqim', fullName:'Ism-familya', login:'Login',
    password:'Parol', role:'Lavozim', access:'Dostup', position:'Lavozim',
    hireDate:'Ishga kirgan sana', salaryType:'Ish haqi turi', hourly:'Soatbay',
    monthly:'Oylik', hourlyRate:'Soatiga', monthlySalary:'Oylik stavka',
    workedHours:'Ishlagan soat', extraHours:"Qo'shimcha soat", tax:"Daromad solig'i",
    lunch:'Tushlik', penalty:'Jarima', advance:'Avans', bonus:'Premiya',
    cashPaid:'Naqd berildi', cardPaid:'Plastik berildi', remaining:'Qoldiq',
    signature:'Imzo', exportExcel:'Excel yuklab olish', uploadPhoto:'Rasm yuklash',
    send:'Yuborish', chooseUser:'Foydalanuvchi tanlang', actions:'Amal', status:'Status',
    expected:'Kutilgan', accepted:'Qabul', difference:'Farq',
    categoryNameNeeded:'Kategoriya nomi kerak', categoryAdded:"Kategoriya qo'shildi",
    categoryUpdated:'Kategoriya yangilandi', categoryDeleted:"Kategoriya o'chirildi",
    saved:'Saqlandi', deleted:"O'chirildi", chooseBranch:'Filial tanlang'
  },
  ru: {
    dashboard:'Дашборд', salesAnalytics:'Аналитика продаж', order:'Сменный отчет',
    orderReports:'Отчеты филиалов', cash:'Инкассация', operation:'Приход / Расход',
    history:'Операции', reports:'Отчеты', employees:'Сотрудники',
    payroll:'Расчет зарплаты', payrollArchive:'Архив зарплаты', categories:'Категории',
    users:'Пользователи', chat:'Чат', profile:'Профиль', logout:'Выход',
    welcome:'Добро пожаловать', refresh:'Обновить', save:'Сохранить', create:'Создать',
    edit:'Изменить', delete:'Удалить', cancel:'Отмена', start:'Начало', end:'Конец',
    branch:'Филиал', all:'Общий', cashBalance:'Наличные', bankBalance:'Расчетный счет',
    incomeChart:'Приходы по категориям', expenseChart:'Расходы по категориям',
    branchSales:'Продажи по филиалам', trend:'Динамика продаж', totalSales:'Общая продажа',
    growth:'Рост / снижение', noData:'Нет данных', date:'Дата', shift:'Смена',
    total:'Общая продажа', uzcard:'Uzcard', humo:'Humo', rahmat:'Rahmat',
    rxmt:'RXMT', uzum:'Uzum', yandex:'Yandex', expense:'Расход', gum:'Кол-во жвачки',
    cashAmount:'Сумма наличными', type:'Тип', account:'Счет', category:'Категория',
    amount:'Сумма', note:'Комментарий', income:'Приход', outcome:'Расход',
    fullName:'Ф.И.О', login:'Логин', password:'Пароль', role:'Должность', access:'Доступ',
    position:'Должность', hireDate:'Дата приема', salaryType:'Тип оплаты',
    hourly:'Почасовая', monthly:'Месячная', hourlyRate:'За час', monthlySalary:'Оклад',
    workedHours:'Рабочие часы', extraHours:'Доп. часы', tax:'Подоходный налог',
    lunch:'Обед', penalty:'Штраф', advance:'Аванс', bonus:'Премия',
    cashPaid:'Наличными', cardPaid:'На карту', remaining:'Остаток', signature:'Подпись',
    exportExcel:'Скачать Excel', uploadPhoto:'Загрузить фото', send:'Отправить',
    chooseUser:'Выберите пользователя', actions:'Действие', status:'Статус',
    expected:'Ожидалось', accepted:'Принято', difference:'Разница',
    categoryNameNeeded:'Введите название', categoryAdded:'Категория добавлена',
    categoryUpdated:'Категория обновлена', categoryDeleted:'Категория удалена',
    saved:'Сохранено', deleted:'Удалено', chooseBranch:'Выберите филиал'
  },
  cy: {
    dashboard:'Дашборд', salesAnalytics:'Савдо аналитика', order:'Смена ордер',
    orderReports:'Филиал ордерлари', cash:'Инкассация', operation:'Кирим / Чиқим',
    history:'Операциялар', reports:'Ҳисоботлар', employees:'Ходимлар',
    payroll:'Ойлик ҳисоблаш', payrollArchive:'Ойлик архиви', categories:'Категориялар',
    users:'Фойдаланувчилар', chat:'Чат', profile:'Профил', logout:'Чиқиш',
    welcome:'Хуш келибсиз', refresh:'Янгилаш', save:'Сақлаш', create:'Яратиш',
    edit:'Таҳрирлаш', delete:'Ўчириш', cancel:'Бекор қилиш', start:'Бошланиш',
    end:'Тугаш', branch:'Филиал', all:'Умумий', cashBalance:'Нақд баланс',
    bankBalance:'Ҳисоб рақам баланс', incomeChart:'Киримлар категориялар бўйича',
    expenseChart:'Чиқимлар категориялар бўйича', branchSales:'Филиаллар бўйича савдо',
    trend:'Савдо тренди', totalSales:'Жами савдо', growth:'Ўсиш / пасайиш',
    noData:'Маълумот йўқ', date:'Сана', shift:'Смена', total:'Жами савдо',
    uzcard:'Uzcard', humo:'Humo', rahmat:'Rahmat', rxmt:'RXMT', uzum:'Uzum', yandex:'Yandex',
    expense:'Харажат', gum:'Жвачка сони', cashAmount:'Нақд сумма',
    type:'Тур', account:'Ҳисоб', category:'Категория', amount:'Сумма', note:'Изоҳ',
    income:'Кирим', outcome:'Чиқим', fullName:'Исм-фамилия', login:'Логин',
    password:'Парол', role:'Лавозим', access:'Доступ', position:'Лавозим',
    hireDate:'Ишга кирган сана', salaryType:'Иш ҳақи тури', hourly:'Соатбай',
    monthly:'Ойлик', hourlyRate:'Соатига', monthlySalary:'Ойлик ставка',
    workedHours:'Ишлаган соат', extraHours:'Қўшимча соат', tax:'Даромад солиғи',
    lunch:'Тушлик', penalty:'Жарима', advance:'Аванс', bonus:'Премия',
    cashPaid:'Нақд берилди', cardPaid:'Пластик берилди', remaining:'Қолдиқ',
    signature:'Имзо', exportExcel:'Excel юклаб олиш', uploadPhoto:'Расм юклаш',
    send:'Юбориш', chooseUser:'Фойдаланувчи танланг', actions:'Амал', status:'Статус',
    expected:'Кутилган', accepted:'Қабул', difference:'Фарқ',
    categoryNameNeeded:'Категория номи керак', categoryAdded:'Категория қўшилди',
    categoryUpdated:'Категория янгиланди', categoryDeleted:'Категория ўчирилди',
    saved:'Сақланди', deleted:'Ўчирилди', chooseBranch:'Филиал танланг'
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10)
const money = n => Number(n || 0).toLocaleString('ru-RU') + " so'm"
const num   = v => Number(v || 0)
const TELEGRAM_EDGE_FUNCTION = 'telegram-send'
const FINANCE_SIGN_IN_RPC = 'finance_sign_in'
const FINANCE_HASH_RPC = 'finance_hash_password'

async function hashPassword(value) {
  // Fallback only. Main authentication hashing is done in Supabase RPC.
  const raw = String(value || '')
  if (!raw) return ''
  const data = new TextEncoder().encode(raw)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}
async function serverHashPassword(value) {
  const raw = String(value || '')
  if (!raw) return ''
  const { data, error } = await supabase.rpc(FINANCE_HASH_RPC, { p_password: raw })
  if (error) throw error
  return data
}
function sameDay(a,b){ return localDateValue(a) === localDateValue(b) }

function avatarSrc(person) {
  const name = encodeURIComponent(person?.full_name || person?.login || 'User')
  return person?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
}
function localDateValue(d) { return d ? String(d).slice(0, 10) : '' }
function inDateRange(dateValue, start, end) {
  const d = localDateValue(dateValue)
  if (!d) return false
  if (start && d < start) return false
  if (end   && d > end)   return false
  return true
}
function cashDifferenceText(value) {
  const diff = num(value)
  if (diff > 0) return `Ortiqcha ${money(diff)}`
  if (diff < 0) return `Kamomad ${money(Math.abs(diff))}`
  return 'Teng'
}
function calcOrderExpected(row) {
  return num(row.total)
    - num(row.uzcard) - num(row.humo) - num(row.rahmat)
    - num(row.rxmt)   - num(row.uzum) - num(row.yandex)
    + num(row.expense) - num(row.gum_count) * 1000
}
function normalizeHeader(v) {
  return String(v||'').toLowerCase().replace(/[''`]/g,'').replace(/\s+/g,' ').trim()
}
function findColumn(headers, aliases) {
  const n = headers.map(normalizeHeader)
  return n.findIndex(h => aliases.some(a => h.includes(normalizeHeader(a))))
}
function readCell(row, index, fallback = '') {
  return index >= 0 ? row[index] : fallback
}
function toNumber(value) {
  const c = String(value??'').replace(/\s/g,'').replace(/,/g,'.').replace(/[^0-9.-]/g,'')
  return Number(c || 0)
}
function toDateTime(value) {
  const raw = String(value||'').trim()
  if (!raw) return new Date().toISOString()
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return `${raw.slice(0,10)}T00:00:00`
  const m = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}T00:00:00`
  const d = new Date(raw)
  if (!isNaN(d.getTime())) return d.toISOString()
  return new Date().toISOString()
}
function toDateOnly(v) { return toDateTime(v).slice(0, 10) }
function makeCSVRowsFromObjects(data) {
  if (!data?.length) return []
  const headers = Object.keys(data[0])
  return [headers, ...data.map(row => headers.map(h => {
    const v = row[h]
    return v && typeof v === 'object' ? JSON.stringify(v) : (v ?? '')
  }))]
}
function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(c=>`"${String(c??'').replaceAll('"','""')}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url)
}
function downloadXLSX(filename, sheets) {
  const wb = XLSX.utils.book_new()
  sheets.forEach(({name,data,colWidths}) => {
    const ws = XLSX.utils.aoa_to_sheet(data)
    if (colWidths) ws['!cols'] = colWidths.map(w=>({wch:w}))
    XLSX.utils.book_append_sheet(wb, ws, name)
  })
  XLSX.writeFile(wb, filename)
}
function parseCSV(text) {
  const rows=[];let row=[],cell='',quote=false
  for(let i=0;i<text.length;i++){
    const ch=text[i],next=text[i+1]
    if(ch==='"'&&quote&&next==='"'){cell+='"';i++;continue}
    if(ch==='"'){quote=!quote;continue}
    if(ch===','&&!quote){row.push(cell.trim());cell='';continue}
    if((ch==='\n'||ch==='\r')&&!quote){
      if(cell||row.length){row.push(cell.trim());rows.push(row)}
      row=[];cell='';if(ch==='\r'&&next==='\n')i++;continue
    }
    cell+=ch
  }
  if(cell||row.length){row.push(cell.trim());rows.push(row)}
  return rows.filter(r=>r.some(c=>String(c||'').trim()!==''))
}
function exportOperations(rows, tr, catName) {
  const data = [
    [tr.branch,tr.date,tr.type,tr.category,tr.account,tr.amount,tr.note],
    ...rows.map(r=>[
      r.branches?.name||'',
      new Date(r.created_at).toLocaleString('uz-UZ'),
      r.type==='Kirim'?tr.income:tr.outcome,
      catName(r.categories),
      r.account, r.amount, r.note||''
    ])
  ]
  downloadCSV('hisobot-operatsiyalar.csv', data)
}
function exportOrders(rows, tr) {
  const data = [
    [tr.branch,tr.date,tr.shift,tr.total,tr.uzcard,tr.humo,tr.rahmat,tr.rxmt,tr.uzum,tr.yandex,'Hisoblangan naqd',tr.cashAmount,'Kassa tafovuti',tr.expense,tr.gum],
    ...rows.map(r=>[
      r.branches?.name||'', r.order_date, r.shift_no,
      r.total,r.uzcard,r.humo,r.rahmat,r.rxmt,r.uzum,r.yandex,
      calcOrderExpected(r), r.cash_amount,
      num(r.cash_amount)-calcOrderExpected(r), r.expense, r.gum_count
    ])
  ]
  downloadCSV('filial-orderlari.csv', data)
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]       = useState(()=>JSON.parse(localStorage.getItem('finance_user')||'null'))
  const [page,setPage]       = useState(()=>{
    const s=localStorage.getItem('finance_page')||'dashboard'
    return window.innerWidth<=1024?'dashboard':s
  })
  const [loginVal,setLoginVal]   = useState(localStorage.getItem('finance_login')||'')
  const [password,setPassword]   = useState('')
  const [remember,setRemember]   = useState(true)
  const [showPass,setShowPass]   = useState(false)
  const [loading,setLoading]     = useState(false)
  const [toast,setToast]         = useState('')
  const [mobileMenu,setMobileMenu] = useState(false)
  const [showNotifications,setShowNotifications] = useState(false)
  const [notificationsSeenKey,setNotificationsSeenKey] = useState(
    ()=>localStorage.getItem('finance_notifications_seen_key')||''
  )

  const [branches,setBranches]         = useState([])
  const [users,setUsers]               = useState([])
  const [userBranches,setUserBranches] = useState([])
  const [permissions,setPermissions]   = useState([])
  const [categories,setCategories]     = useState([])
  const [operations,setOperations]     = useState([])
  const [orders,setOrders]             = useState([])
  const [cashRows,setCashRows]         = useState([])
  const [messages,setMessages]         = useState([])
  const [employees,setEmployees]       = useState([])
  const [payrollRuns,setPayrollRuns]   = useState([])
  const [payrollItems,setPayrollItems] = useState([])
  const [company,setCompany]           = useState(null)

  const [branch,setBranch]   = useState(localStorage.getItem('finance_branch')||'ALL')
  const [period,setPeriod]   = useState({
    start: localStorage.getItem('finance_period_start')||today(),
    end:   localStorage.getItem('finance_period_end')||today()
  })
  const [lang,setLang]   = useState(localStorage.getItem('finance_lang')||user?.language||'uz')
  const [theme,setTheme] = useState(localStorage.getItem('finance_theme')||user?.theme||'dark')

  const [op,setOp]           = useState({date:today(),type:'Kirim',account:'Naqd',category_id:'',amount:'',note:''})
  const [order,setOrder]     = useState({date:today(),shift_no:'1',total:'',uzcard:'',humo:'',rahmat:'',rxmt:'',uzum:'',yandex:'',expense:'',gum_count:'',cash_amount:'',manual_cash:false,note:''})
  const [employeeForm,setEmployeeForm] = useState({full_name:'',position:'',hire_date:today(),salary_type:'hourly',hourly_rate:'',monthly_salary:''})
  const [payroll,setPayroll] = useState({title:'',part_no:'1',period_start:today(),period_end:today(),rows:[]})
  const [newUser,setNewUser] = useState({id:null,full_name:'',login:'',password:'12345',role:'SMENA_MANAGER',branchIds:[],modules:['order']})
  const [newCat,setNewCat]   = useState({name:'',name_ru:'',name_cy:'',type:'Kirim'})
  const [editCat,setEditCat] = useState(null)
  const [chatUser,setChatUser] = useState('')
  const [chatText,setChatText] = useState('')
  const [profile,setProfile]   = useState({full_name:user?.full_name||'',phone:user?.phone||'',avatar_url:user?.avatar_url||''})
  const [editOp,setEditOp]     = useState(null)
  const [editOrder,setEditOrder] = useState(null)
  const [selectedOperationIds,setSelectedOperationIds] = useState([])
  const [selectedCategoryIds,setSelectedCategoryIds]   = useState([])
  const [reportFilterOpen,setReportFilterOpen] = useState(false)
  const [reportFilter,setReportFilter]         = useState({type:'ALL',category_id:'ALL',account:'ALL'})
  const [editCashRow,setEditCashRow]   = useState(null)
  const [editCashForm,setEditCashForm] = useState({})
  const [confirmModal,setConfirmModal] = useState({open:false,message:'',onConfirm:null})
  const [cashDateFilter,setCashDateFilter] = useState({start:'',end:''})
  const [editEmployee,setEditEmployee]     = useState(null)
  const [employeeEditForm,setEmployeeEditForm] = useState({})

  const tr        = TEXT[lang]||TEXT.uz
  const isAdmin   = user?.role==='ADMIN'
  const unreadCount  = messages.filter(m=>m.receiver_id===user?.id&&!m.is_read).length
  const loginReady   = loginVal.trim().length>0&&password.trim().length>0&&!loading
  const periodPages  = ['dashboard','salesAnalytics','orderReports','history','reports','payrollArchive']

  useEffect(()=>{document.body.className=theme;localStorage.setItem('finance_theme',theme)},[theme])
  useEffect(()=>{localStorage.setItem('finance_lang',lang)},[lang])
  useEffect(()=>{localStorage.setItem('finance_period_start',period.start);localStorage.setItem('finance_period_end',period.end)},[period])
  useEffect(()=>{loadBase()},[])
  useEffect(()=>{
    const close=()=>{if(window.innerWidth>1024)setMobileMenu(false)}
    window.addEventListener('resize',close); close()
    return ()=>window.removeEventListener('resize',close)
  },[])
  useEffect(()=>{
    if(!user)return
    const ch=supabase.channel('finance-realtime')
      .on('postgres_changes',{event:'*',schema:'public',table:'messages'},()=>loadMessages())
      .on('postgres_changes',{event:'*',schema:'public',table:'users'},()=>loadUsersAndAccess())
      .on('postgres_changes',{event:'*',schema:'public',table:'user_branches'},()=>loadUsersAndAccess())
      .on('postgres_changes',{event:'*',schema:'public',table:'permissions'},()=>loadUsersAndAccess())
      .on('postgres_changes',{event:'*',schema:'public',table:'operations'},()=>loadOperations())
      .on('postgres_changes',{event:'*',schema:'public',table:'shift_orders'},()=>loadOrders())
      .on('postgres_changes',{event:'*',schema:'public',table:'cash_collection'},()=>loadCashRows())
      .on('postgres_changes',{event:'*',schema:'public',table:'employees'},()=>loadPayrollData())
      .on('postgres_changes',{event:'*',schema:'public',table:'payroll_runs'},()=>loadPayrollData())
      .on('postgres_changes',{event:'*',schema:'public',table:'payroll_items'},()=>loadPayrollData())
      .on('postgres_changes',{event:'*',schema:'public',table:'company_settings'},()=>loadBase())
      .subscribe()
    return ()=>{supabase.removeChannel(ch)}
  },[user])
  useEffect(()=>{if(user)loadAll()},[user])
  useEffect(()=>{
    if(!user)return
    touchOnline()
    const t=setInterval(touchOnline,30000)
    return ()=>clearInterval(t)
  },[user?.id])
  useEffect(()=>{if(!chatUser||!user)return; markChatRead(chatUser)},[chatUser])
  useEffect(()=>{if(page==='chat'&&user)markAllMessagesRead()},[page])
  useEffect(()=>{if(employees.length)initPayrollRows()},[employees,branch])

  function notify(msg){setToast(msg);setTimeout(()=>setToast(''),2600)}
  function showConfirm(message,onConfirm){setConfirmModal({open:true,message,onConfirm})}
  function closeConfirm(){setConfirmModal({open:false,message:'',onConfirm:null})}
  function changePage(p){setPage(p);localStorage.setItem('finance_page',p)}
  function isOnline(u){
    if(!u?.last_seen)return false
    return Date.now()-new Date(u.last_seen).getTime()<70000
  }
  async function touchOnline(){
    if(!user?.id)return
    await supabase.from('users').update({last_seen:new Date().toISOString()}).eq('id',user.id)
  }
  async function markChatRead(senderId=chatUser){
    if(!user?.id||!senderId)return
    await supabase.from('messages').update({is_read:true}).eq('receiver_id',user.id).eq('sender_id',senderId).eq('is_read',false)
    await loadMessages()
  }
  async function markAllMessagesRead(){
    if(!user?.id)return
    await supabase.from('messages').update({is_read:true}).eq('receiver_id',user.id).eq('is_read',false)
    await loadMessages()
  }
  function openNotifications(){
    const next=!showNotifications
    setShowNotifications(next)
    if(next){
      localStorage.setItem('finance_notifications_seen_key',notificationKey)
      setNotificationsSeenKey(notificationKey)
    }
  }
  function catName(c){
    if(!c)return ''
    if(lang==='ru')return c.name_ru||c.name
    if(lang==='cy')return c.name_cy||c.name
    return c.name
  }
  function sortRows(obj){
    return Object.entries(obj).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}))
  }
  const calcCash = ()=>calcOrderExpected(order)

  async function loadBase(){
    const [b,c,comp]=await Promise.all([
      supabase.from('branches').select('*').eq('active',true),
      supabase.from('categories').select('*').eq('active',true).order('name'),
      supabase.from('company_settings').select('id,telegram_chat_id,created_at').order('created_at',{ascending:true}).limit(1).maybeSingle()
    ])
    const sortedBranches=(b.data||[]).sort((x,y)=>BRANCH_ORDER.indexOf(x.code)-BRANCH_ORDER.indexOf(y.code))
    const cleanCategories=(c.data||[]).filter(x=>!String(x.name||'').toLowerCase().includes('click'))
    setBranches(sortedBranches)
    setCategories(cleanCategories)
    setCompany(comp.data||null)
    const saved=localStorage.getItem('finance_branch')
    if(!saved||saved==='ALL'){setBranch('ALL');return}
    const byId=sortedBranches.find(x=>x.id===saved)
    const byCode=sortedBranches.find(x=>x.code===saved)
    if(byId)setBranch(byId.id)
    else if(byCode){setBranch(byCode.id);localStorage.setItem('finance_branch',byCode.id)}
    else{setBranch('ALL');localStorage.setItem('finance_branch','ALL')}
  }
  function showLoadError(scope, error){
    if(error)notify(`${scope}: ${error.message}`)
  }
  async function loadUsersAndAccess(){
    const [u,ub,p]=await Promise.all([
      supabase.from('users').select('*').order('created_at',{ascending:false}),
      supabase.from('user_branches').select('*'),
      supabase.from('permissions').select('*')
    ])
    showLoadError('Users error',u.error); showLoadError('User branches error',ub.error); showLoadError('Permissions error',p.error)
    setUsers(u.data||[]); setUserBranches(ub.data||[]); setPermissions(p.data||[])
  }
  async function loadOperations(){
    const {data,error}=await supabase.from('operations').select('*,branches(name,code),categories(name,type,name_ru,name_cy)').order('created_at',{ascending:false}).limit(5000)
    showLoadError('Operations error',error); setOperations(data||[])
  }
  async function loadOrders(){
    const {data,error}=await supabase.from('shift_orders').select('*,branches(name,code)').order('created_at',{ascending:false}).limit(5000)
    showLoadError('Orders error',error); setOrders(data||[])
  }
  async function loadCashRows(){
    const {data,error}=await supabase.from('cash_collection').select('*,branches(name,code)').order('created_at',{ascending:false}).limit(2000)
    showLoadError('Cash error',error); setCashRows(data||[])
  }
  async function loadMessages(){
    const {data,error}=await supabase.from('messages').select('*').order('created_at',{ascending:true}).limit(1500)
    showLoadError('Messages error',error); setMessages(data||[])
  }
  async function loadPayrollData(){
    const [emp,pr,pi]=await Promise.all([
      supabase.from('employees').select('*,branches(name,code)').order('created_at',{ascending:false}),
      supabase.from('payroll_runs').select('*,branches(name,code)').order('created_at',{ascending:false}),
      supabase.from('payroll_items').select('*,employees(full_name,position)').order('created_at',{ascending:false})
    ])
    showLoadError('Employees error',emp.error); showLoadError('Payroll runs error',pr.error); showLoadError('Payroll items error',pi.error)
    setEmployees(emp.data||[]); setPayrollRuns(pr.data||[]); setPayrollItems(pi.data||[])
  }
  async function loadAll(){
    setLoading(true)
    await Promise.all([loadUsersAndAccess(),loadOperations(),loadOrders(),loadCashRows(),loadMessages(),loadPayrollData()])
    setLoading(false)
  }

  async function refreshAfterTable(table){
    if(table==='operations')return loadOperations()
    if(table==='shift_orders')return loadOrders()
    if(table==='cash_collection')return loadCashRows()
    if(table==='users'||table==='user_branches'||table==='permissions')return loadUsersAndAccess()
    if(['employees','payroll_runs','payroll_items'].includes(table))return loadPayrollData()
    if(table==='categories')return loadBase()
    return loadAll()
  }

  async function signIn(){
    if(!loginVal||!password)return notify('Login va parol kiriting')
    setLoading(true)
    const login=loginVal.trim()
    const pass=password.trim()
    const {data,error}=await supabase.rpc(FINANCE_SIGN_IN_RPC,{p_login:login,p_password:pass})
    setLoading(false)
    if(error)return notify(error.message)
    const found=Array.isArray(data)?data[0]:data
    if(!found?.id)return notify('Login yoki parol xato')
    const safeUser={...found,password:undefined,password_hash:undefined}
    if(remember)localStorage.setItem('finance_login',login)
    else localStorage.removeItem('finance_login')
    localStorage.removeItem('finance_password')
    localStorage.setItem('finance_user',JSON.stringify(safeUser))
    setUser(safeUser); setPage('dashboard'); localStorage.setItem('finance_page','dashboard')
    setMobileMenu(false); setTheme(safeUser.theme||'dark'); setLang(safeUser.language||'uz')
    setProfile({full_name:safeUser.full_name||'',phone:safeUser.phone||'',avatar_url:safeUser.avatar_url||''})
    notify(`${TEXT[safeUser.language||'uz']?.welcome||'Xush kelibsiz'}, ${safeUser.full_name}`)
  }
  function logout(){
    localStorage.removeItem('finance_user')
    localStorage.removeItem('finance_password')
    setUser(null)
    setPassword('')
  }

  function can(module){
    if(!user)return false
    if(user.role==='ADMIN')return true
    const row=permissions.find(x=>x.user_id===user.id&&x.module===module)
    if(row)return !!row.can_view
    const roleMap={
      RAHBAR:['dashboard','salesAnalytics','orderReports','history','reports','payrollArchive','chat','profile'],
      BOSH_MANAGER:['dashboard','salesAnalytics','orderReports','history','reports','chat','profile'],
      FILIAL_MANAGER:['dashboard','salesAnalytics','orderReports','reports','chat','profile'],
      SMENA_MANAGER:['order','chat','profile'],
      BUXGALTER:['dashboard','cash','operation','history','reports','employees','payroll','payrollArchive','chat','profile']
    }
    return roleMap[user.role]?.includes(module)
  }
  function userAllowedBranches(u=user){
    if(!u)return []
    if(['ADMIN','RAHBAR','BOSH_MANAGER'].includes(u.role))return branches
    const ids=userBranches.filter(x=>x.user_id===u.id).map(x=>x.branch_id)
    return branches.filter(b=>ids.includes(b.id))
  }
  const allowedBranches=userAllowedBranches()
  const selectedBranchIds=useMemo(()=>{
    if(!allowedBranches.length)return []
    if(branch==='ALL')return allowedBranches.map(b=>b.id)
    const f=allowedBranches.find(b=>b.id===branch)||allowedBranches.find(b=>b.code===branch)
    return f?[f.id]:allowedBranches.map(b=>b.id)
  },[branch,allowedBranches])

  const notifications=useMemo(()=>{
    const list=[]
    const unread=messages.filter(m=>m.receiver_id===user?.id&&!m.is_read).length
    if(unread>0)list.push({id:`msg-${unread}`,title:'Yangi xabarlar',text:`${unread} ta o'qilmagan xabar bor`,page:'chat'})
    const pendingCash=cashRows.filter(x=>x.status==='PENDING'&&selectedBranchIds.includes(x.branch_id)).length
    if(pendingCash>0)list.push({id:`cash-${pendingCash}`,title:'Inkassatsiya',text:`${pendingCash} ta tasdiqlanmagan inkassatsiya`,page:'cash'})
    const todayOrders=orders.filter(o=>inDateRange(o.order_date||o.created_at,today(),today())&&selectedBranchIds.includes(o.branch_id)).length
    if(todayOrders>0)list.push({id:`orders-${todayOrders}`,title:'Bugungi orderlar',text:`${todayOrders} ta smena order kiritilgan`,page:'orderReports'})
    return list
  },[messages,cashRows,orders,selectedBranchIds,user?.id])
  const notificationKey=notifications.map(n=>n.id).join('|')
  const notificationCount=notificationKey&&notificationKey!==notificationsSeenKey?notifications.length:0

  const visibleOps=useMemo(()=>operations.filter(x=>{
    const bOk=branch==='ALL'||x.branch_id===branch||x.branches?.code===branch
    return bOk&&inDateRange(x.created_at,period.start,period.end)
  }),[operations,branch,period])
  const visibleOrders=useMemo(()=>orders.filter(x=>{
    const bOk=branch==='ALL'||x.branch_id===branch||x.branches?.code===branch
    return bOk&&inDateRange(x.order_date||x.created_at,period.start,period.end)
  }),[orders,branch,period])
  const visibleCash=useMemo(()=>cashRows.filter(x=>selectedBranchIds.includes(x.branch_id)),[cashRows,selectedBranchIds])
  const visibleCashFiltered=useMemo(()=>visibleCash.filter(x=>{
    if(cashDateFilter.start&&(x.order_date||'')<cashDateFilter.start)return false
    if(cashDateFilter.end&&(x.order_date||'')>cashDateFilter.end)return false
    return true
  }),[visibleCash,cashDateFilter])
  const filteredReportOps=useMemo(()=>visibleOps.filter(x=>{
    const tOk=reportFilter.type==='ALL'||x.type===reportFilter.type
    const cOk=reportFilter.category_id==='ALL'||x.category_id===reportFilter.category_id
    const aOk=reportFilter.account==='ALL'||x.account===reportFilter.account
    return tOk&&cOk&&aOk
  }),[visibleOps,reportFilter])
  const stats=useMemo(()=>{
    let cash=0,bank=0
    const income={},expense={}
    visibleOps.forEach(x=>{
      const amount=num(x.amount), sign=x.type==='Kirim'?1:-1
      if(x.account==='Naqd')cash+=amount*sign
      if(x.account==='Hisob raqam')bank+=amount*sign
      const name=catName(x.categories)||'Boshqa'
      if(x.type==='Kirim')income[name]=(income[name]||0)+amount
      if(x.type==='Chiqim')expense[name]=(expense[name]||0)+amount
    })
    return{cash,bank,incomeRows:sortRows(income),expenseRows:sortRows(expense)}
  },[visibleOps,lang])
  const salesStats=useMemo(()=>{
    const byDay={},byBranch={}
    let total=0
    visibleOrders.forEach(o=>{
      const day=localDateValue(o.order_date||o.created_at)
      const amount=num(o.total)
      total+=amount
      byDay[day]=(byDay[day]||0)+amount
      byBranch[o.branches?.name||'Filial']=(byBranch[o.branches?.name||'Filial']||0)+amount
    })
    const trend=Object.entries(byDay).sort((a,b)=>a[0].localeCompare(b[0])).map(([name,value])=>({name,value}))
    const branchRows=sortRows(byBranch)
    let growth=0
    if(trend.length>=2){
      const prev=trend[trend.length-2].value||1
      const cur=trend[trend.length-1].value
      growth=((cur-prev)/prev)*100
    }
    const byMethod={Uzcard:0,Humo:0,Rahmat:0,RXMT:0,Uzum:0,Yandex:0,Naqd:0}
    visibleOrders.forEach(o=>{
      byMethod.Uzcard+=num(o.uzcard); byMethod.Humo+=num(o.humo)
      byMethod.Rahmat+=num(o.rahmat); byMethod.RXMT+=num(o.rxmt)
      byMethod.Uzum+=num(o.uzum); byMethod.Yandex+=num(o.yandex)
      byMethod.Naqd+=num(o.cash_amount)
    })
    const methodRows=sortRows(byMethod).filter(r=>r.value>0)
    return{total,trend,branchRows,growth,methodRows}
  },[visibleOrders])

  async function audit(table,rowId,action,oldData,newData){
    await supabase.from('audit_logs').insert({user_id:user.id,table_name:table,row_id:String(rowId||''),action,old_data:oldData,new_data:newData})
  }

  async function saveOperation(){
    if(branch==='ALL')return notify(tr.chooseBranch)
    if(!op.category_id||!op.amount)return notify('Kategoriya va summa majburiy')
    const row={branch_id:branch,type:op.type,account:op.account,category_id:op.category_id,amount:num(op.amount),note:op.note,created_by:user.id,created_at:isAdmin?`${op.date}T00:00:00`:new Date().toISOString(),status:'ACTIVE'}
    const res=editOp
      ?await supabase.from('operations').update({...row,edited_by:user.id,edited_at:new Date().toISOString()}).eq('id',editOp.id).select().single()
      :await supabase.from('operations').insert(row).select().single()
    if(res.error)return notify(res.error.message)
    await audit('operations',res.data.id,editOp?'UPDATE':'INSERT',editOp,row)
    setEditOp(null)
    setOp({date:today(),type:'Kirim',account:'Naqd',category_id:'',amount:'',note:''})
    await loadOperations(); notify(tr.saved)
  }

  async function saveOrder(){
    if(branch==='ALL')return notify(tr.chooseBranch)
    if(!order.total)return notify('Jami savdo majburiy')
    const expectedCash=calcCash()
    const cash=String(order.cash_amount||'').trim()!==''?num(order.cash_amount):expectedCash
    const orderDate=isAdmin?order.date:today()
    const row={
      branch_id:branch, order_date:orderDate,
      shift_no:num(order.shift_no), total:num(order.total),
      uzcard:num(order.uzcard), humo:num(order.humo),
      rahmat:num(order.rahmat), rxmt:num(order.rxmt),
      uzum:num(order.uzum), yandex:num(order.yandex),
      expense:num(order.expense), gum_count:num(order.gum_count),
      gum_price:1000, cash_amount:cash,
      manual_cash:String(order.cash_amount||'').trim()!=='',
      note:order.note, status:'CLOSED', created_by:user.id
    }
    const res=editOrder
      ?await supabase.from('shift_orders').update({...row,edited_by:user.id,edited_at:new Date().toISOString()}).eq('id',editOrder.id).select().single()
      :await supabase.from('shift_orders').insert(row).select().single()
    if(res.error)return notify('Order xato: '+res.error.message)
    await audit('shift_orders',res.data.id,editOrder?'UPDATE':'INSERT',editOrder,row)
    if(num(row.shift_no)===2){
      const {data:s1Arr}=await supabase.from('shift_orders').select('cash_amount')
        .eq('branch_id',branch).eq('order_date',orderDate).eq('shift_no',1)
        .order('created_at',{ascending:false}).limit(1)
      const s1Cash=s1Arr&&s1Arr.length?num(s1Arr[0].cash_amount):0
      const combinedCash=s1Cash+cash
      const {data:oldCashArr}=await supabase.from('cash_collection').select('*')
        .eq('branch_id',branch).eq('order_date',orderDate)
        .order('created_at',{ascending:false}).limit(1)
      const oldCash=oldCashArr&&oldCashArr.length?oldCashArr[0]:null
      if(oldCash?.status!=='APPROVED'){
        const cashRes=oldCash?.id
          ?await supabase.from('cash_collection').update({expected_cash:combinedCash,note:'1+2 smena jami',status:'PENDING'}).eq('id',oldCash.id)
          :await supabase.from('cash_collection').insert({branch_id:branch,order_date:orderDate,expected_cash:combinedCash,status:'PENDING',note:'1+2 smena jami'})
        if(cashRes.error)return notify('Inkassatsiya xato: '+cashRes.error.message)
      }
      await sendTelegramReport(branch,orderDate)
      notify('2-smena saqlandi, inkassatsiya va Telegram yuborildi ✅')
    }else{
      notify('1-smena saqlandi ✅')
    }
    setEditOrder(null)
    setOrder({date:today(),shift_no:'1',total:'',uzcard:'',humo:'',rahmat:'',rxmt:'',uzum:'',yandex:'',expense:'',gum_count:'',cash_amount:'',manual_cash:false,note:''})
    await Promise.all([loadOrders(),loadCashRows()])
  }

  async function deleteRow(table,row){
    if(!isAdmin)return notify("Faqat admin o'chira oladi")
    showConfirm("Rostdan o'chirasizmi?",async()=>{
      const {error}=await supabase.from(table).delete().eq('id',row.id)
      if(error)return notify(error.message)
      await audit(table,row.id,'DELETE',row,null)
      await refreshAfterTable(table); notify(tr.deleted)
    })
  }
  async function deleteManyOperations(ids){
    if(!isAdmin)return notify("Faqat admin o'chira oladi")
    if(!ids?.length)return notify("Tanlangan qator yo'q")
    showConfirm(`${ids.length} ta operatsiyani o'chirasizmi?`,async()=>{
      const oldRows=operations.filter(x=>ids.includes(x.id))
      const {error}=await supabase.from('operations').delete().in('id',ids)
      if(error)return notify(error.message)
      await audit('operations',ids.join(','),'BULK_DELETE',oldRows,null)
      setSelectedOperationIds([]); await loadOperations()
      notify(`${ids.length} ta operatsiya o'chirildi`)
    })
  }
  async function deleteManyCategories(ids){
    if(!isAdmin)return notify("Faqat admin o'chira oladi")
    if(!ids?.length)return notify("Tanlangan kategoriya yo'q")
    showConfirm(`${ids.length} ta kategoriyani o'chirasizmi?`,async()=>{
      const {error}=await supabase.from('categories').update({active:false}).in('id',ids)
      if(error)return notify(error.message)
      setSelectedCategoryIds([]); await loadBase()
      notify(`${ids.length} ta kategoriya o'chirildi`)
    })
  }

  async function approveCash(row,acceptedValue){
    if(row.status==='APPROVED')return notify('Bu inkassatsiya allaqachon tasdiqlangan')
    const accepted=acceptedValue??row.expected_cash
    if(String(accepted||'').trim()==='')return
    const diff=num(accepted)-num(row.expected_cash)
    const {error}=await supabase.from('cash_collection').update({
      accepted_cash:num(accepted),difference:diff,status:'APPROVED',
      approved_by:user.id,approved_at:new Date().toISOString()
    }).eq('id',row.id)
    if(error)return notify(error.message)
    const noteText=`Inkassatsiya qabul: ${row.order_date}`
    const {data:existOp}=await supabase.from('operations').select('id')
      .eq('branch_id',row.branch_id).eq('note',noteText).limit(1)
    if(!existOp||!existOp.length){
      const savdoCatId=await ensureCategory('Savdo puli','Kirim')
      await supabase.from('operations').insert({
        branch_id:row.branch_id,type:'Kirim',account:'Naqd',
        category_id:savdoCatId,amount:num(accepted),
        note:noteText,created_by:user.id,
        created_at:new Date().toISOString(),status:'ACTIVE'
      })
    }
    await Promise.all([loadCashRows(),loadOperations()]); notify('Tasdiqlandi ✅')
  }
  async function deleteCashRow(row){
    if(!isAdmin)return notify("Faqat admin o'chira oladi")
    showConfirm("Inkassatsiyani o'chirasizmi?",async()=>{
      const {error}=await supabase.from('cash_collection').delete().eq('id',row.id)
      if(error)return notify(error.message)
      await audit('cash_collection',row.id,'DELETE',row,null)
      await loadCashRows(); notify(tr.deleted)
    })
  }
  async function saveCashEdit(row,form){
    const {error}=await supabase.from('cash_collection').update({expected_cash:num(form.expected_cash),note:form.note}).eq('id',row.id)
    if(error)return notify(error.message)
    await audit('cash_collection',row.id,'UPDATE',row,form)
    setEditCashRow(null); await loadCashRows(); notify(tr.saved)
  }

  async function sendTelegramViaEdge(payload){
    const {data,error}=await supabase.functions.invoke(TELEGRAM_EDGE_FUNCTION,{body:payload})
    if(error)throw error
    if(data?.ok===false)throw new Error(data.description||'Telegram yuborilmadi')
    return data
  }

  async function saveCompanySettings(form){
    const payload={
      telegram_token:String(form.telegram_token||'').trim(),
      telegram_chat_id:String(form.telegram_chat_id||'').trim()
    }
    if(!payload.telegram_token||!payload.telegram_chat_id)return notify('Token va Chat ID kiriting')
    const {data:existing,error:findError}=await supabase.from('company_settings').select('id').order('created_at',{ascending:true}).limit(1).maybeSingle()
    if(findError)return notify(findError.message)
    const res=existing?.id
      ?await supabase.from('company_settings').update(payload).eq('id',existing.id).select().single()
      :await supabase.from('company_settings').insert(payload).select().single()
    if(res.error)return notify(res.error.message)
    setCompany({id:res.data?.id,telegram_chat_id:payload.telegram_chat_id})
    await loadBase()
    notify('Telegram sozlamalari saqlandi ✅')
  }
  async function testTelegram(form){
    notify('Yuborilmoqda...')
    try{
      const token=String(form?.telegram_token||'').trim()
      const chatId=String(form?.telegram_chat_id||company?.telegram_chat_id||'').trim()
      if(token||chatId){
        await saveCompanySettings({telegram_token:token,telegram_chat_id:chatId})
      }
      await sendTelegramViaEdge({type:'test',text:'✅ Sariq Bola Finance — bot ulanishi muvaffaqiyatli tekshirildi!'})
      notify('✅ Test xabari muvaffaqiyatli yuborildi!')
    }catch(e){
      notify('❌ Telegram Edge Function xatosi: '+(e.message||"Noma'lum"))
    }
  }
  async function deleteTelegramSettings(){
    showConfirm("Telegram token va Chat ID ni o'chirasizmi?",async()=>{
      const {data:existing}=await supabase.from('company_settings').select('id')
        .order('created_at',{ascending:true}).limit(1).maybeSingle()
      if(!existing?.id)return
      const {error}=await supabase.from('company_settings')
        .update({telegram_token:'',telegram_chat_id:''}).eq('id',existing.id)
      if(error)return notify(error.message)
      setCompany(prev=>prev?{...prev,telegram_chat_id:''}:null)
      await loadBase()
      notify("Telegram sozlamalari o'chirildi")
    })
  }

  function toggle(arr,v){return arr.includes(v)?arr.filter(x=>x!==v):[...arr,v]}
  async function saveUser(){
    if(!newUser.full_name||!newUser.login)return notify('Ism va login majburiy')
    if(!newUser.id&&!newUser.password)return notify('Yangi foydalanuvchi uchun parol majburiy')
    const cleanLogin=String(newUser.login||'').trim()
    const duplicate=users.find(u=>u.login===cleanLogin&&u.id!==newUser.id&&u.active!==false)
    if(duplicate)return notify('Bu login band')
    const payload={full_name:newUser.full_name,login:cleanLogin,role:newUser.role,active:true}
    if(newUser.password){
      payload.password_hash=await serverHashPassword(newUser.password)
      payload.password=null
    }
    if(newUser.id){
      const {error}=await supabase.from('users').update(payload).eq('id',newUser.id)
      if(error)return notify(error.message)
      await supabase.from('user_branches').delete().eq('user_id',newUser.id)
      await supabase.from('permissions').delete().eq('user_id',newUser.id)
      for(const bid of newUser.branchIds){
        const {error:e}=await supabase.from('user_branches').insert({user_id:newUser.id,branch_id:bid})
        if(e)return notify(e.message)
      }
      for(const m of newUser.modules){
        const {error:e}=await supabase.from('permissions').insert({user_id:newUser.id,module:m,can_view:true,can_create:true,can_edit:false,can_delete:false})
        if(e)return notify(e.message)
      }
      notify('User yangilandi')
    }else{
      const {data,error}=await supabase.from('users').insert(payload).select().single()
      if(error)return notify(error.message)
      for(const bid of newUser.branchIds){
        const {error:e}=await supabase.from('user_branches').insert({user_id:data.id,branch_id:bid})
        if(e)return notify(e.message)
      }
      for(const m of newUser.modules){
        const {error:e}=await supabase.from('permissions').insert({user_id:data.id,module:m,can_view:true,can_create:true,can_edit:false,can_delete:false})
        if(e)return notify(e.message)
      }
      notify('User yaratildi')
    }
    setNewUser({id:null,full_name:'',login:'',password:'',role:'SMENA_MANAGER',branchIds:[],modules:['order']})
    await loadUsersAndAccess()
  }
  function editUserFn(u){
    const branchIds=userBranches.filter(x=>x.user_id===u.id).map(x=>x.branch_id)
    const modules=permissions.filter(x=>x.user_id===u.id&&x.can_view).map(x=>x.module)
    setNewUser({id:u.id,full_name:u.full_name||'',login:u.login||'',password:'',role:u.role||'SMENA_MANAGER',branchIds,modules:modules.length?modules:[]})
    window.scrollTo({top:0,behavior:'smooth'})
  }
  async function deactivateUser(u){
    showConfirm(`${u.full_name||u.login} ni o'chirasizmi?`,async()=>{
      await supabase.from('users').update({active:false}).eq('id',u.id)
      await loadUsersAndAccess(); notify("User o'chirildi")
    })
  }

  async function saveCategory(){
    if(!newCat.name)return notify(tr.categoryNameNeeded)
    if(editCat){
      const {error}=await supabase.from('categories').update({name:newCat.name,name_ru:newCat.name_ru,name_cy:newCat.name_cy,type:newCat.type}).eq('id',editCat.id)
      if(error)return notify(error.message)
      setEditCat(null); notify(tr.categoryUpdated)
    }else{
      const {error}=await supabase.from('categories').insert({name:newCat.name,name_ru:newCat.name_ru,name_cy:newCat.name_cy,type:newCat.type,active:true})
      if(error)return notify(error.message)
      notify(tr.categoryAdded)
    }
    setNewCat({name:'',name_ru:'',name_cy:'',type:'Kirim'})
    await loadBase()
  }
  function startEditCategory(cat){
    setEditCat(cat)
    setNewCat({name:cat.name||'',name_ru:cat.name_ru||'',name_cy:cat.name_cy||'',type:cat.type||'Kirim'})
    window.scrollTo({top:0,behavior:'smooth'})
  }
  async function deleteCategory(cat){
    showConfirm(`"${cat.name}" kategoriyani o'chirasizmi?`,async()=>{
      const {error}=await supabase.from('categories').update({active:false}).eq('id',cat.id)
      if(error)return notify(error.message)
      notify(tr.categoryDeleted); await loadBase()
    })
  }
  function cancelEditCategory(){setEditCat(null);setNewCat({name:'',name_ru:'',name_cy:'',type:'Kirim'})}

  async function saveEmployee(){
    if(branch==='ALL')return notify(tr.chooseBranch)
    if(!employeeForm.full_name)return notify('Xodim ismi kerak')
    const {error}=await supabase.from('employees').insert({branch_id:branch,full_name:employeeForm.full_name,position:employeeForm.position,hire_date:employeeForm.hire_date,salary_type:employeeForm.salary_type,hourly_rate:num(employeeForm.hourly_rate),monthly_salary:num(employeeForm.monthly_salary),active:true})
    if(error)return notify(error.message)
    setEmployeeForm({full_name:'',position:'',hire_date:today(),salary_type:'hourly',hourly_rate:'',monthly_salary:''})
    await loadPayrollData(); notify("Xodim qo'shildi")
  }
  async function deleteEmployee(emp){
    showConfirm(`${emp.full_name} ni o'chirasizmi?`,async()=>{
      const {error}=await supabase.from('employees').update({active:false}).eq('id',emp.id)
      if(error)return notify(error.message)
      await loadPayrollData(); notify("Xodim o'chirildi")
    })
  }
  async function updateEmployee(emp,form){
    const {error}=await supabase.from('employees').update({full_name:form.full_name,position:form.position,hire_date:form.hire_date,salary_type:form.salary_type,hourly_rate:num(form.hourly_rate),monthly_salary:num(form.monthly_salary)}).eq('id',emp.id)
    if(error)return notify(error.message)
    setEditEmployee(null); await loadPayrollData(); notify('Xodim yangilandi')
  }

  function initPayrollRows(){
    const rows=employees.filter(e=>e.active&&selectedBranchIds.includes(e.branch_id)).map(e=>({
      employee_id:e.id,full_name:e.full_name,position:e.position,
      worked_hours:'',extra_hours:'',hourly_rate:e.hourly_rate||'',base_salary:e.monthly_salary||'',
      tax:'',lunch:'',penalty:'',advance:'',bonus:'',cash_paid:'',card_paid:'',note:''
    }))
    setPayroll(p=>({...p,rows}))
  }
  function calcPayrollRow(r){
    const hoursSalary=(num(r.worked_hours)+num(r.extra_hours))*num(r.hourly_rate)
    const base=num(r.base_salary)||hoursSalary
    const total=base-num(r.tax)-num(r.lunch)-num(r.penalty)-num(r.advance)+num(r.bonus)
    const paid=num(r.cash_paid)+num(r.card_paid)
    return{total_salary:total,total_paid:paid,remaining:total-paid}
  }
  async function savePayroll(){
    if(branch==='ALL')return notify(tr.chooseBranch)
    if(!payroll.period_start||!payroll.period_end)return notify('Oylik davrini tanlang')
    if(payroll.period_start>payroll.period_end)return notify("Boshlanish sanasi tugash sanasidan katta bo‘lmasin")
    if(!payroll.rows?.length)return notify("Oylikda xodimlar yo'q")
    const validRows=payroll.rows.filter(r=>r.employee_id)
    if(!validRows.length)return notify("Saqlash uchun xodim topilmadi")
    const title=(payroll.title||`${new Date(payroll.period_start).getFullYear()} ${payroll.period_start.slice(5,7)} ${payroll.part_no}`).trim()
    const runRes=await supabase.from('payroll_runs').insert({title,branch_id:branch,period_start:payroll.period_start,period_end:payroll.period_end,part_no:num(payroll.part_no),created_by:user.id}).select().single()
    if(runRes.error)return notify(runRes.error.message)
    const items=validRows.map(r=>{
      const calc=calcPayrollRow(r)
      return{payroll_run_id:runRes.data.id,employee_id:r.employee_id,worked_hours:num(r.worked_hours),extra_hours:num(r.extra_hours),hourly_rate:num(r.hourly_rate),base_salary:num(r.base_salary),tax:num(r.tax),lunch:num(r.lunch),penalty:num(r.penalty),advance:num(r.advance),bonus:num(r.bonus),cash_paid:num(r.cash_paid),card_paid:num(r.card_paid),total_salary:calc.total_salary,total_paid:calc.total_paid,remaining:calc.remaining,note:r.note||''}
    })
    const itemRes=await supabase.from('payroll_items').insert(items)
    if(itemRes.error){
      await supabase.from('payroll_runs').delete().eq('id',runRes.data.id)
      return notify(itemRes.error.message)
    }
    await loadPayrollData(); notify('Oylik saqlandi')
  }
  function exportPayrollCurrent(){
    const rows=[
      ['№',tr.fullName,tr.position,tr.workedHours,tr.extraHours,tr.hourlyRate,tr.total,tr.tax,tr.lunch,tr.penalty,tr.advance,tr.bonus,tr.cashPaid,tr.cardPaid,tr.remaining,tr.signature],
      ...(payroll.rows||[]).map((r,i)=>{const calc=calcPayrollRow(r);return[i+1,r.full_name,r.position,r.worked_hours,r.extra_hours,r.hourly_rate,calc.total_salary,r.tax,r.lunch,r.penalty,r.advance,r.bonus,r.cash_paid,r.card_paid,calc.remaining,'']})
    ]
    downloadCSV('oylik.csv',rows)
  }

  async function saveProfile(){
    const payload={...profile,language:lang,theme}
    const {error}=await supabase.from('users').update(payload).eq('id',user.id)
    if(error)return notify(error.message)
    const updated={...user,...payload}
    setUser(updated); localStorage.setItem('finance_user',JSON.stringify(updated)); notify('Profil saqlandi')
  }
  async function uploadAvatar(fileOrEvent){
    const file=fileOrEvent?.target?.files?.[0]||fileOrEvent
    if(!file)return
    const ext=(file.name?.split('.').pop()||'jpg').toLowerCase()
    const filePath=`${user.id}/avatar-${Date.now()}.${ext}`
    const {error:uploadError}=await supabase.storage.from('avatars').upload(filePath,file,{cacheControl:'3600',upsert:true,contentType:file.type||'image/jpeg'})
    if(uploadError)return notify(uploadError.message)
    const {data}=supabase.storage.from('avatars').getPublicUrl(filePath)
    const avatar_url=data?.publicUrl
    if(!avatar_url)return notify('Rasm URL olinmadi')
    await supabase.from('users').update({avatar_url}).eq('id',user.id)
    const updatedUser={...user,avatar_url}
    setUser(updatedUser); setProfile(p=>({...p,avatar_url}))
    setUsers(prev=>prev.map(u=>u.id===user.id?{...u,avatar_url}:u))
    localStorage.setItem('finance_user',JSON.stringify(updatedUser))
    await loadUsersAndAccess(); notify('Rasm yuklandi')
  }

  async function sendMessage(){
    if(!chatUser||!chatText.trim())return
    const {error}=await supabase.from('messages').insert({sender_id:user.id,receiver_id:chatUser,message:chatText.trim(),is_read:false})
    if(error)return notify(error.message)
    setChatText(''); await loadMessages()
  }

  async function ensureCategory(name,type){
    const clean=String(name||'').trim()
    if(!clean)return null
    const found=categories.find(c=>c.type===type&&[c.name,c.name_ru,c.name_cy].filter(Boolean).some(v=>String(v).trim().toLowerCase()===clean.toLowerCase()))
    if(found)return found.id
    const {data,error}=await supabase.from('categories').insert({name:clean,name_ru:clean,name_cy:clean,type,active:true}).select().single()
    if(error)throw error
    return data.id
  }

  async function exportAllData(){
    if(!isAdmin)return notify('Faqat admin backup olishi mumkin')
    const tables=['users','branches','user_branches','permissions','categories','operations','shift_orders','cash_collection','employees','payroll_runs','payroll_items','messages','company_settings','audit_logs']
    const backup={system:'SARIQ BOLA PIZZA Finance',exported_at:new Date().toISOString(),tables:{}}
    let ok=0
    for(const table of tables){
      const{data,error}=await supabase.from(table).select('*')
      if(error){backup.tables[table]={error:error.message,rows:[]};continue}
      backup.tables[table]={rows:data||[]}
      if(data?.length)downloadCSV(`backup-${table}.csv`,makeCSVRowsFromObjects(data))
      ok++
    }
    const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json;charset=utf-8'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=url; a.download=`sariq-bola-full-backup-${today()}.json`
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    notify(`${ok} ta jadval backup qilindi`)
  }
  async function importOperationsCSV(e){
    const file=e.target.files?.[0]; e.target.value=''
    if(!file)return
    try{
      let parsed
      const isXlsx=/\.(xlsx|xls)$/i.test(file.name)
      if(isXlsx){
        const buf=await file.arrayBuffer(); const wb=XLSX.read(buf)
        const sheetName=wb.SheetNames.find(n=>!["Ko'rsatmalar","Ma'lumotnoma"].includes(n))||wb.SheetNames[0]
        parsed=XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{header:1,raw:false,dateNF:'yyyy-mm-dd'}).filter(r=>Array.isArray(r)&&r.some(c=>c!==undefined&&String(c||'').trim()!==''))
      }else{parsed=parseCSV(await file.text())}
      const header=parsed[0]||[],rows=parsed.slice(1)
      const col={
        branch:findColumn(header,['filial','branch','филиал']),
        date:findColumn(header,['sana','date','дата']),
        type:findColumn(header,['tur','type','тип']),
        category:findColumn(header,['kategoriya','category','категория']),
        account:findColumn(header,['hisob','account','счет']),
        amount:findColumn(header,['summa','amount','сумма']),
        note:findColumn(header,['izoh','note','комментарий'])
      }
      const insertRows=[]
      for(const r of rows){
        const branchName=String(readCell(r,col.branch,r[0])||'').trim()
        const branchRow=branches.find(b=>b.name===branchName||b.code===branchName||b.id===branchName)
        if(!branchRow)continue
        const typeRaw=String(readCell(r,col.type,r[2])||'').toLowerCase()
        const type=typeRaw.includes('chiq')||typeRaw.includes('расход')||typeRaw.includes('чиқ')?'Chiqim':'Kirim'
        const categoryId=await ensureCategory(readCell(r,col.category,r[3]),type)
        if(!categoryId)continue
        const accountRaw=String(readCell(r,col.account,r[4])||'').trim()
        const account=accountRaw.toLowerCase().includes('hisob')||accountRaw.toLowerCase().includes('банк')?'Hisob raqam':'Naqd'
        const created_at=toDateTime(readCell(r,col.date,r[1]))
        const amount=toNumber(readCell(r,col.amount,r[5]))
        const note=readCell(r,col.note,r[6])||'Excel import'
        const exists=operations.some(o=>o.branch_id===branchRow.id&&o.type===type&&o.account===account&&o.category_id===categoryId&&num(o.amount)===amount&&String(o.note||'')===String(note||'')&&sameDay(o.created_at,created_at))
        const alreadyInBatch=insertRows.some(o=>o.branch_id===branchRow.id&&o.type===type&&o.account===account&&o.category_id===categoryId&&num(o.amount)===amount&&String(o.note||'')===String(note||'')&&sameDay(o.created_at,created_at))
        if(exists||alreadyInBatch)continue
        insertRows.push({branch_id:branchRow.id,type,account,category_id:categoryId,amount,note,created_by:user.id,created_at,status:'ACTIVE'})
      }
      if(!insertRows.length)return notify('Import uchun mos qator topilmadi')
      const {error}=await supabase.from('operations').insert(insertRows)
      if(error)return notify(error.message)
      await loadBase(); await loadOperations()
      notify(`${insertRows.length} ta operatsiya import qilindi`)
    }catch(err){notify(err.message||'Import xatosi')}
  }
  async function importOrdersCSV(e){
    const file=e.target.files?.[0]; e.target.value=''
    if(!file)return
    try{
      let parsed
      const isXlsx=/\.(xlsx|xls)$/i.test(file.name)
      if(isXlsx){
        const buf=await file.arrayBuffer(); const wb=XLSX.read(buf)
        const sheetName=wb.SheetNames.find(n=>!["Ko'rsatmalar","Ma'lumotnoma"].includes(n))||wb.SheetNames[0]
        parsed=XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{header:1,raw:false,dateNF:'yyyy-mm-dd'}).filter(r=>Array.isArray(r)&&r.some(c=>c!==undefined&&String(c||'').trim()!==''))
      }else{parsed=parseCSV(await file.text())}
      const header=parsed[0]||[],rows=parsed.slice(1)
      const col={
        branch:findColumn(header,['filial','branch','филиал']),
        date:findColumn(header,['sana','date','дата']),
        shift:findColumn(header,['smena','shift','смена']),
        total:findColumn(header,['jami savdo','jami','total','общая продажа']),
        uzcard:findColumn(header,['uzcard']),humo:findColumn(header,['humo']),
        rahmat:findColumn(header,['rahmat']),rxmt:findColumn(header,['rxmt']),
        uzum:findColumn(header,['uzum']),yandex:findColumn(header,['yandex']),
        expense:findColumn(header,['xarajat','expense','расход']),
        gum:findColumn(header,['jvachka','жвачка','gum']),
        cash:findColumn(header,['naqd summa','naqd','наличные','cash']),
        note:findColumn(header,['izoh','note','комментарий'])
      }
      const insertRows=[]
      for(const r of rows){
        const branchName=String(readCell(r,col.branch,r[0])||'').trim()
        const branchRow=branches.find(b=>b.name===branchName||b.code===branchName||b.id===branchName)
        if(!branchRow)continue
        const draft={
          total:toNumber(readCell(r,col.total,r[3])),uzcard:toNumber(readCell(r,col.uzcard,r[4])),
          humo:toNumber(readCell(r,col.humo,r[5])),rahmat:toNumber(readCell(r,col.rahmat,r[6])),
          rxmt:toNumber(readCell(r,col.rxmt,r[7])),uzum:toNumber(readCell(r,col.uzum,r[8])),
          yandex:toNumber(readCell(r,col.yandex,r[9])),expense:toNumber(readCell(r,col.expense,r[10])),
          gum_count:toNumber(readCell(r,col.gum,r[11]))
        }
        const expectedCash=calcOrderExpected(draft)
        const actualCashRaw=readCell(r,col.cash,r[12])
        const actualCash=String(actualCashRaw||'').trim()!==''?toNumber(actualCashRaw):expectedCash
        const order_date=toDateOnly(readCell(r,col.date,r[1]))
        const shift_no=toNumber(readCell(r,col.shift,r[2]))||1
        const exists=orders.some(o=>o.branch_id===branchRow.id&&o.order_date===order_date&&num(o.shift_no)===shift_no)
        const alreadyInBatch=insertRows.some(o=>o.branch_id===branchRow.id&&o.order_date===order_date&&num(o.shift_no)===shift_no)
        if(exists||alreadyInBatch)continue
        insertRows.push({branch_id:branchRow.id,order_date,shift_no,...draft,gum_price:1000,cash_amount:actualCash,manual_cash:actualCash!==expectedCash,note:readCell(r,col.note,'')||'Excel import',status:'CLOSED',created_by:user.id})
      }
      if(!insertRows.length)return notify('Import uchun mos order topilmadi')
      const {error}=await supabase.from('shift_orders').insert(insertRows)
      if(error)return notify(error.message)
      const shift2Rows=insertRows.filter(r=>r.shift_no===2)
      for(const s2 of shift2Rows){
        const {data:existCash}=await supabase.from('cash_collection').select('id')
          .eq('branch_id',s2.branch_id).eq('order_date',s2.order_date).limit(1)
        if(existCash&&existCash.length)continue
        const {data:s1Arr}=await supabase.from('shift_orders').select('cash_amount')
          .eq('branch_id',s2.branch_id).eq('order_date',s2.order_date).eq('shift_no',1)
          .order('created_at',{ascending:false}).limit(1)
        const s1Cash=s1Arr&&s1Arr.length?num(s1Arr[0].cash_amount):0
        await supabase.from('cash_collection').insert({
          branch_id:s2.branch_id,order_date:s2.order_date,
          expected_cash:s1Cash+num(s2.cash_amount),
          status:'PENDING',note:'Excel import — 2-smena'
        })
      }
      await Promise.all([loadOrders(),loadCashRows()]); notify(`${insertRows.length} ta order import qilindi`)
    }catch(err){notify(err.message||'Import xatosi')}
  }
  function downloadOrdersTemplate(){
    const instrData=[
      ['ORDERLAR IMPORT SHABLONI — SARIQ BOLA FINANCE'],[''],
      ['QOIDALAR:'],
      ["1. \"Orderlar\" varaqasini to'ldirib, shu faylni yuklan"],
      ['2. Sana formati: YYYY-MM-DD  (masalan: 2025-01-15)'],
      ['3. Smena: 1 yoki 2'],
      ["4. Barcha summalar so'mda"],
      ["5. naqd maydonini bo'sh qoldirsa, avtomatik hisoblanadi"],
      [''],['FILIALLAR:'],
      ...branches.map(b=>[`  ${b.name}`,`(kod: ${b.code})`])
    ]
    const headers=['filial','sana','smena','jami_savdo','uzcard','humo','rahmat','rxmt','uzum','yandex','xarajat','jvachka','naqd','izoh']
    const exampleRows=branches.flatMap(b=>[
      [b.name,today(),1,0,0,0,0,0,0,0,0,0,'','Misol 1-smena'],
      [b.name,today(),2,0,0,0,0,0,0,0,0,0,'','Misol 2-smena']
    ])
    downloadXLSX('orderlar-shablon.xlsx',[
      {name:"Ko'rsatmalar",data:instrData,colWidths:[40,20]},
      {name:'Orderlar',data:[headers,...exampleRows],colWidths:[20,12,8,14,12,12,12,10,12,12,12,10,14,20]}
    ])
  }
  function downloadOperationsTemplate(){
    const refData=[
      ['OPERATSIYALAR IMPORT SHABLONI'],[''],
      ['Kirim kategoriyalari:'],
      ...categories.filter(c=>c.type==='Kirim').map(c=>['  '+c.name]),
      [''],['Chiqim kategoriyalari:'],
      ...categories.filter(c=>c.type==='Chiqim').map(c=>['  '+c.name]),
      [''],['Hisoblar:'],['  Naqd'],['  Hisob raqam'],
      [''],['Filiallar:'],
      ...branches.map(b=>['  '+b.name])
    ]
    const headers=['filial','sana','tur','kategoriya','hisob','summa','izoh']
    const exampleRows=branches.map(b=>[b.name,today(),'Kirim',categories.find(c=>c.type==='Kirim')?.name||'Savdo puli','Naqd',0,''])
    exampleRows.push([branches[0]?.name||'',today(),'Chiqim',categories.find(c=>c.type==='Chiqim')?.name||'Xarajatlar','Naqd',0,''])
    downloadXLSX('operatsiyalar-shablon.xlsx',[
      {name:"Ma'lumotnoma",data:refData,colWidths:[30]},
      {name:'Operatsiyalar',data:[headers,...exampleRows],colWidths:[20,12,10,25,16,14,25]}
    ])
  }

  async function sendTelegramReport(branchId,orderDate){
    try{
      const [s1res,s2res,usersRes,branchRes]=await Promise.all([
        supabase.from('shift_orders').select('*,branches(name)').eq('branch_id',branchId).eq('order_date',orderDate).eq('shift_no',1).order('created_at',{ascending:false}).limit(1),
        supabase.from('shift_orders').select('*,branches(name)').eq('branch_id',branchId).eq('order_date',orderDate).eq('shift_no',2).order('created_at',{ascending:false}).limit(1),
        supabase.from('users').select('id,full_name'),
        supabase.from('branches').select('name').eq('id',branchId).limit(1)
      ])
      const s1=Array.isArray(s1res.data)?s1res.data[0]:s1res.data
      const s2=Array.isArray(s2res.data)?s2res.data[0]:s2res.data
      const allUsers=usersRes.data||[]
      const branchArr=branchRes.data
      const branchName=(Array.isArray(branchArr)?branchArr[0]?.name:branchArr?.name)||s2?.branches?.name||s1?.branches?.name||"Noma'lum"
      const dateStr=orderDate.split('-').reverse().join('.')
      const fmt=n=>Number(n||0).toLocaleString('ru-RU')
      function fmtShift(r,label){
        if(!r)return[`🔹 ${label}`,'💰 Итого: 0','💵 Наличка: 0','💳 Uzcard: 0','💳 Humo: 0','🎁 Rahmat: 0','🎁 RXMT: 0','🛍 Uzum: 0','🚕 Yandex: 0','➖ Расход: 0','🍬 Жвачка (шт): 0','⚖️ Излишка/Недостача: 0','👤 Менеджер: —'].join('\n')
        const expected=calcOrderExpected(r)
        const cash=num(r.cash_amount)
        const diff=cash-expected
        const sign=diff>0?'+':''
        const mgr=allUsers.find(u=>u.id===r.created_by)?.full_name||'—'
        return[
          `🔹 ${label}`,
          `💰 Итого: ${fmt(r.total)}`,
          `💵 Наличка: ${fmt(r.cash_amount)}`,
          `💳 Uzcard: ${fmt(r.uzcard)}`,
          `💳 Humo: ${fmt(r.humo)}`,
          `🎁 Rahmat: ${fmt(r.rahmat)}`,
          `🎁 RXMT: ${fmt(r.rxmt)}`,
          `🛍 Uzum: ${fmt(r.uzum)}`,
          `🚕 Yandex: ${fmt(r.yandex)}`,
          `➖ Расход: ${fmt(r.expense)}`,
          `🍬 Жвачка (шт): ${num(r.gum_count)}`,
          `⚖️ Излишка/Недостача: ${sign}${diff.toLocaleString('ru-RU')}`,
          `👤 Менеджер: ${mgr}`
        ].join('\n')
      }
      const T=(a,b)=>num(a)+num(b)
      const jTotal=T(s1?.total,s2?.total), jCash=T(s1?.cash_amount,s2?.cash_amount)
      const jUzcard=T(s1?.uzcard,s2?.uzcard), jHumo=T(s1?.humo,s2?.humo)
      const jRahmat=T(s1?.rahmat,s2?.rahmat), jRxmt=T(s1?.rxmt,s2?.rxmt)
      const jUzum=T(s1?.uzum,s2?.uzum), jYandex=T(s1?.yandex,s2?.yandex)
      const jExp=T(s1?.expense,s2?.expense), jGum=T(s1?.gum_count,s2?.gum_count)
      const jExpected=calcOrderExpected({total:jTotal,uzcard:jUzcard,humo:jHumo,rahmat:jRahmat,rxmt:jRxmt,uzum:jUzum,yandex:jYandex,expense:jExp,gum_count:jGum})
      const jDiff=jCash-jExpected
      const jSign=jDiff>0?'+':''
      const text=[
        `🏪 Филиал: ${branchName}`,`📅 Дата: ${dateStr}`,'',
        fmtShift(s1,'1 СМЕНА'),'',fmtShift(s2,'2 СМЕНА'),'',
        '🔹 ИТОГ ЗА ДЕНЬ',
        `💰 Итого: ${fmt(jTotal)}`,`💵 Наличка: ${fmt(jCash)}`,
        `💳 Uzcard: ${fmt(jUzcard)}`,`💳 Humo: ${fmt(jHumo)}`,
        `🎁 Rahmat: ${fmt(jRahmat)}`,`🎁 RXMT: ${fmt(jRxmt)}`,
        `🛍 Uzum: ${fmt(jUzum)}`,`🚕 Yandex: ${fmt(jYandex)}`,
        `➖ Расход: ${fmt(jExp)}`,`🍬 Жвачка: ${jGum}`,
        `⚖️ Излишка/Недостача: ${jSign}${jDiff.toLocaleString('ru-RU')}`
      ].join('\n')
      await sendTelegramViaEdge({type:'report',text})
    }catch(e){console.error('Telegram xatosi:',e)}
  }

  // ── LOGIN ──
  if(!user){
    return(
      <div className="loginScreen">
        {toast&&<div className="toast">{toast}</div>}
        <div className="loginCard entrance">
          <img src={LOGO} className="loginLogo" onError={e=>{e.currentTarget.style.display='none'}} />
          <h1>SARIQ BOLA PIZZA</h1>
          <p>Finance Premium System</p>
          <div className="loginField">
            <span>👤</span>
            <input placeholder={tr.login} value={loginVal} onChange={e=>setLoginVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&loginReady&&signIn()} />
          </div>
          <div className="pass">
            <div className="loginField passField">
              <span>🔐</span>
              <input placeholder={tr.password} type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&loginReady&&signIn()} />
            </div>
            <button onClick={()=>setShowPass(!showPass)}>{showPass?'Yopish':"Ko'rish"}</button>
          </div>
          <label className="check">
            <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} />
            Meni eslab qol
          </label>
          <button className="primary loginSubmit" disabled={!loginReady} onClick={signIn}>{loading?'...':'Kirish'}</button>
          {(!loginVal.trim()||!password.trim())&&<div className="loginHint">Login va parol yozilgandan keyin kirish tugmasi yoqiladi</div>}
        </div>
      </div>
    )
  }

  // ── MAIN APP ──
  return(
    <div className={`app ${theme}`}>
      {toast&&<div className="toast">{toast}</div>}
      <ConfirmModal modal={confirmModal} close={closeConfirm} />
      {mobileMenu&&<div className="sidebarOverlay" onClick={()=>setMobileMenu(false)} />}
      <aside className={`sidebar ${mobileMenu?'open':''}`}>
        <button className="closeMenuBtn" onClick={()=>setMobileMenu(false)}>✕</button>
        <div className="brand">
          <img src={LOGO} onError={e=>{e.currentTarget.style.display='none'}} />
          <div><b>SARIQ BOLA</b><small>PIZZA</small></div>
        </div>
        <div className="profileMini" onClick={()=>{changePage('profile');setMobileMenu(false)}}>
          <img src={avatarSrc(user)} />
          <div><b>{user.full_name}</b><span>{ROLE_LABELS[user.role]||user.role}</span></div>
        </div>
        <nav className="sideNav">
          {MODULES.filter(m=>can(m)).map(m=>(
            <button key={m} className={`navBtn ${page===m?'active':''}`} onClick={()=>{changePage(m);setMobileMenu(false)}}>
              <span className="navLabel">{tr[m]}</span>
              {m==='chat'&&unreadCount>0&&<em className="badge">{unreadCount}</em>}
            </button>
          ))}
        </nav>
        <button className="logoutBtn" onClick={logout}>{tr.logout}</button>
      </aside>
      <main className="main">
        <header className="topbar entrance">
          <button className="mobileMenuBtn" onClick={()=>setMobileMenu(true)}><span/><span/><span/></button>
          <div className="topbarInfo">
            <h1>{tr[page]||tr.welcome}</h1>
            <p>{new Date().toLocaleString('uz-UZ')}</p>
          </div>
          <div className="topActions">
            {periodPages.includes(page)&&(
              <>
                <input type="date" value={period.start} onChange={e=>setPeriod({...period,start:e.target.value})} />
                <input type="date" value={period.end} onChange={e=>setPeriod({...period,end:e.target.value})} />
              </>
            )}
            <div className="langBox">
              <span className={`flagBadge ${lang==='ru'?'ru':lang==='cy'?'cy':'uz'}`}></span>
              <select className="langSelect" value={lang} onChange={e=>setLang(e.target.value)}>
                <option value="uz">UZ</option><option value="cy">ЎЗ</option><option value="ru">RU</option>
              </select>
            </div>
            <div className="notificationWrap">
              <button className="iconBtn notificationButton" onClick={openNotifications}>
                <span>Bildirishnoma</span>
                {notificationCount>0&&<em className="topBadge">{notificationCount}</em>}
              </button>
              {showNotifications&&(
                <div className="notificationPanel">
                  <b>Bildirishnomalar</b>
                  {notifications.length===0&&<p>Yangi bildirishnoma yo'q</p>}
                  {notifications.map(n=>(
                    <button className="notificationItem" key={n.id} onClick={()=>{
                      changePage(n.page)
                      if(n.page==='chat')markAllMessagesRead()
                      setShowNotifications(false)
                      localStorage.setItem('finance_notifications_seen_key',notificationKey)
                      setNotificationsSeenKey(notificationKey)
                    }}>
                      <strong>{n.title}</strong><span>{n.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className={`themeSwitch ${theme==='dark'?'active':''}`} onClick={()=>setTheme(theme==='light'?'dark':'light')}>
              <span className="themeKnob">{theme==='light'?'☀️':'🌙'}</span>
            </button>
            {isAdmin&&<button className="secondary backupBtn" onClick={exportAllData} title="Backup">💾 Backup</button>}
            <button className="refreshBtn" onClick={loadAll}>{tr.refresh}</button>
          </div>
        </header>

        {allowedBranches.length>0&&(
          <div className="branches">
            {allowedBranches.map(b=>(
              <button key={b.id} className={branch===b.id?'active':''} onClick={()=>{setBranch(b.id);localStorage.setItem('finance_branch',b.id)}}>{b.name}</button>
            ))}
            {allowedBranches.length>1&&(
              <button className={branch==='ALL'?'active':''} onClick={()=>{setBranch('ALL');localStorage.setItem('finance_branch','ALL')}}>{tr.all}</button>
            )}
          </div>
        )}

        {loading&&<div className="loaderLine" />}

        {page==='dashboard'&&<Dashboard tr={tr} stats={stats} />}
        {page==='salesAnalytics'&&<SalesAnalytics tr={tr} data={salesStats} />}
        {page==='order'&&<OrderPage tr={tr} isAdmin={isAdmin} order={order} setOrder={setOrder} calcCash={calcCash} saveOrder={saveOrder} editOrder={editOrder} />}
        {page==='operation'&&<OperationPage tr={tr} isAdmin={isAdmin} op={op} setOp={setOp} categories={categories} catName={catName} saveOperation={saveOperation} editOp={editOp} />}
        {page==='orderReports'&&(
          <OrdersPage tr={tr} rows={visibleOrders} isAdmin={isAdmin}
            edit={r=>{setEditOrder(r);setOrder({...r,date:r.order_date});changePage('order')}}
            del={r=>deleteRow('shift_orders',r)}
            exportCSV={()=>exportOrders(visibleOrders,tr)}
            importCSV={importOrdersCSV} downloadTemplate={downloadOrdersTemplate}
            printPDF={()=>window.print()} />
        )}
        {page==='cash'&&(
          <CashPage tr={tr} rows={visibleCashFiltered} approve={approveCash} isAdmin={isAdmin}
            editRow={editCashRow} setEditRow={setEditCashRow}
            editForm={editCashForm} setEditForm={setEditCashForm}
            saveCashEdit={saveCashEdit} delCash={deleteCashRow}
            dateFilter={cashDateFilter} setDateFilter={setCashDateFilter} />
        )}
        {page==='history'&&(
          <OperationsTable tr={tr} rows={visibleOps} catName={catName} isAdmin={isAdmin}
            selectedIds={selectedOperationIds} setSelectedIds={setSelectedOperationIds}
            bulkDelete={deleteManyOperations}
            edit={r=>{setEditOp(r);setOp({...r,date:localDateValue(r.created_at)});changePage('operation')}}
            del={r=>deleteRow('operations',r)} />
        )}
        {page==='reports'&&(
          <OperationsTable title={tr.reports}
            tr={tr} rows={filteredReportOps} catName={catName} isAdmin={isAdmin}
            selectedIds={selectedOperationIds} setSelectedIds={setSelectedOperationIds}
            bulkDelete={deleteManyOperations}
            exportCSV={()=>exportOperations(filteredReportOps,tr,catName)}
            importCSV={importOperationsCSV} downloadTemplate={downloadOperationsTemplate}
            printPDF={()=>window.print()}
            showFilters filterOpen={reportFilterOpen} setFilterOpen={setReportFilterOpen}
            reportFilter={reportFilter} setReportFilter={setReportFilter} categories={categories}
            edit={r=>{setEditOp(r);setOp({...r,date:localDateValue(r.created_at)});changePage('operation')}}
            del={r=>deleteRow('operations',r)} />
        )}
        {page==='employees'&&(
          <EmployeesPage tr={tr}
            employees={employees.filter(e=>selectedBranchIds.includes(e.branch_id)&&e.active!==false)}
            form={employeeForm} setForm={setEmployeeForm} save={saveEmployee} del={deleteEmployee}
            editEmp={editEmployee} setEditEmp={setEditEmployee}
            editForm={employeeEditForm} setEditForm={setEmployeeEditForm} saveEdit={updateEmployee} />
        )}
        {page==='payroll'&&<PayrollPage tr={tr} payroll={payroll} setPayroll={setPayroll} calc={calcPayrollRow} save={savePayroll} exportCSV={exportPayrollCurrent} />}
        {page==='payrollArchive'&&<PayrollArchive tr={tr} runs={payrollRuns.filter(r=>selectedBranchIds.includes(r.branch_id))} items={payrollItems} />}
        {page==='categories'&&isAdmin&&(
          <CategoriesPage tr={tr} categories={categories} newCat={newCat} setNewCat={setNewCat}
            save={saveCategory} editCat={editCat} cancelEdit={cancelEditCategory}
            startEdit={startEditCategory} del={deleteCategory}
            selectedIds={selectedCategoryIds} setSelectedIds={setSelectedCategoryIds}
            bulkDelete={deleteManyCategories} />
        )}
        {page==='users'&&isAdmin&&(
          <UsersPage tr={tr} users={users} branches={branches} modules={MODULES}
            newUser={newUser} setNewUser={setNewUser}
            save={saveUser} edit={editUserFn} deactivate={deactivateUser} />
        )}
        {page==='chat'&&(
          <ChatPage tr={tr} users={users.filter(u=>u.id!==user.id&&u.active!==false)}
            messages={messages} me={user}
            chatUser={chatUser} setChatUser={setChatUser}
            chatText={chatText} setChatText={setChatText}
            send={sendMessage} markChatRead={markChatRead} isOnline={isOnline} />
        )}
        {page==='profile'&&(
          <ProfilePage tr={tr} profile={profile} setProfile={setProfile}
            lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}
            save={saveProfile} uploadAvatar={uploadAvatar}
            isAdmin={isAdmin} company={company}
            saveCompany={saveCompanySettings} testTelegram={testTelegram}
            deleteCompany={deleteTelegramSettings} />
        )}
      </main>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function Dashboard({tr,stats}){
  return(
    <div className="dash">
      <div className="cards two">
        <div className="card premium"><span>{tr.cashBalance}</span><b>{money(stats.cash)}</b></div>
        <div className="card premium"><span>{tr.bankBalance}</span><b>{money(stats.bank)}</b></div>
      </div>
      <Chart title={tr.incomeChart} rows={stats.incomeRows} emptyText={tr.noData} />
      <Chart title={tr.expenseChart} rows={stats.expenseRows} emptyText={tr.noData} danger />
    </div>
  )
}

function SalesAnalytics({tr,data}){
  return(
    <div>
      <div className="cards three">
        <div className="card premium"><span>{tr.totalSales}</span><b>{money(data.total)}</b></div>
        <div className={`card premium ${data.growth>=0?'good':'bad'}`}><span>{tr.growth}</span><b>{data.growth.toFixed(1)}%</b></div>
        <div className="card premium"><span>Kunlar soni</span><b>{data.trend.length}</b></div>
      </div>
      <BranchRanking rows={data.branchRows} />
      <Chart title={tr.trend} rows={data.trend} emptyText={tr.noData} />
      <Chart title={tr.branchSales} rows={data.branchRows} emptyText={tr.noData} />
      {data.methodRows.length>0&&<Chart title="To'lov usullari" rows={data.methodRows} emptyText={tr.noData} />}
    </div>
  )
}

function BranchRanking({rows}){
  const max=Math.max(...rows.map(r=>r.value),1)
  return(
    <Panel title="Filial reytingi">
      {rows.length===0&&<div className="empty">Ma'lumot yo'q</div>}
      <div className="rankingList">
        {rows.map((r,i)=>(
          <div className="rankingItem" key={r.name}>
            <div className="rankNo">#{i+1}</div>
            <div className="rankInfo"><b>{r.name}</b><div><i style={{width:`${(r.value/max)*100}%`}} /></div></div>
            <strong>{money(r.value)}</strong>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function OrderPage({tr,isAdmin,order,setOrder,calcCash,saveOrder,editOrder}){
  const fields=[
    ['total',tr.total],['uzcard',tr.uzcard],['humo',tr.humo],
    ['rahmat',tr.rahmat],['rxmt',tr.rxmt],['uzum',tr.uzum],
    ['yandex',tr.yandex],['expense',tr.expense],['gum_count',tr.gum]
  ]
  const expectedCash=calcCash()
  const actualCash=String(order.cash_amount||'').trim()!==''?num(order.cash_amount):expectedCash
  const cashDiff=actualCash-expectedCash
  return(
    <Panel title={tr.order}>
      {isAdmin&&<Field type="date" label={tr.date} value={order.date} set={v=>setOrder({...order,date:v})} />}
      <div className="grid">
        <Select label={tr.shift} value={order.shift_no} set={v=>setOrder({...order,shift_no:v})} opts={['1','2']} />
        {fields.map(([k,label])=><Field key={k} label={label} value={order[k]??''} set={v=>setOrder({...order,[k]:v})} />)}
        <Field label="Kassadagi real naqd" value={order.cash_amount} set={v=>setOrder({...order,cash_amount:v})} />
      </div>
      <div className="cashDiffBox">
        <div><span>Hisoblangan naqd</span><b>{money(expectedCash)}</b></div>
        <div><span>Kassadagi real naqd</span><b>{money(actualCash)}</b></div>
        <div className={cashDiff<0?'badDiff':cashDiff>0?'goodDiff':''}>
          <span>Kassa tafovuti</span><b>{cashDifferenceText(cashDiff)}</b>
        </div>
      </div>
      <textarea placeholder={tr.note} value={order.note||''} onChange={e=>setOrder({...order,note:e.target.value})} />
      <button className="primary" onClick={saveOrder}>{editOrder?tr.edit:tr.save}</button>
    </Panel>
  )
}

function OperationPage({tr,isAdmin,op,setOp,categories,catName,saveOperation,editOp}){
  return(
    <Panel title={tr.operation}>
      {isAdmin&&<Field type="date" label={tr.date} value={op.date} set={v=>setOp({...op,date:v})} />}
      <div className="grid">
        <Select label={tr.type} value={op.type} set={v=>setOp({...op,type:v,category_id:''})} opts={['Kirim','Chiqim']} display={v=>v==='Kirim'?tr.income:tr.outcome} />
        <Select label={tr.account} value={op.account} set={v=>setOp({...op,account:v})} opts={ACCOUNTS} />
        <div className="field">
          <label>{tr.category}</label>
          <select value={op.category_id} onChange={e=>setOp({...op,category_id:e.target.value})}>
            <option value="">{tr.category}</option>
            {categories.filter(c=>c.type===op.type).map(c=><option key={c.id} value={c.id}>{catName(c)}</option>)}
          </select>
        </div>
        <Field label={tr.amount} value={op.amount} set={v=>setOp({...op,amount:v})} />
      </div>
      <textarea placeholder={tr.note} value={op.note||''} onChange={e=>setOp({...op,note:e.target.value})} />
      <button className="primary" onClick={saveOperation}>{editOp?tr.edit:tr.save}</button>
    </Panel>
  )
}

function OrdersPage({tr,rows,isAdmin,edit,del,exportCSV,importCSV,downloadTemplate,printPDF}){
  const grouped=useMemo(()=>{
    const map={}
    rows.forEach(r=>{
      const key=`${r.order_date||r.created_at?.slice(0,10)}_${r.branch_id}`
      if(!map[key])map[key]={date:r.order_date||r.created_at?.slice(0,10),branch:r.branches?.name,rows:[]}
      map[key].rows.push(r)
    })
    return Object.values(map).sort((a,b)=>String(b.date).localeCompare(String(a.date)))
  },[rows])
  return(
    <Panel title={tr.orderReports}>
      <div className="reportActions actions">
        <button className="secondary" onClick={exportCSV}>📊 {tr.exportExcel}</button>
        {isAdmin&&(
          <>
            <label className="secondary fileAction">📥 Import<input type="file" accept=".csv,.xlsx,.xls" onChange={importCSV} /></label>
            <button className="secondary" onClick={downloadTemplate}>📋 Shablon</button>
          </>
        )}
        <button className="secondary" onClick={printPDF}>🖨️ Print</button>
      </div>
      {rows.length===0&&<div className="empty">Ma'lumot yo'q</div>}
      {rows.length>0&&(
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>{tr.branch}</th><th>{tr.date}</th><th>{tr.shift}</th>
                <th>{tr.total}</th><th>{tr.uzcard}</th><th>{tr.humo}</th>
                <th>{tr.rahmat}</th><th>{tr.rxmt}</th><th>{tr.uzum}</th><th>{tr.yandex}</th>
                <th>Hisob. naqd</th><th>{tr.cashAmount}</th><th>Tafovut</th>
                <th>{tr.expense}</th><th>{tr.gum}</th>
                {isAdmin&&<th>{tr.actions}</th>}
              </tr>
            </thead>
            <tbody>
              {grouped.map(group=>{
                const jami=group.rows.reduce((s,r)=>({
                  total:s.total+num(r.total),uzcard:s.uzcard+num(r.uzcard),
                  humo:s.humo+num(r.humo),rahmat:s.rahmat+num(r.rahmat),
                  rxmt:s.rxmt+num(r.rxmt),uzum:s.uzum+num(r.uzum),
                  yandex:s.yandex+num(r.yandex),expense:s.expense+num(r.expense),
                  gum_count:s.gum_count+num(r.gum_count),cash_amount:s.cash_amount+num(r.cash_amount)
                }),{total:0,uzcard:0,humo:0,rahmat:0,rxmt:0,uzum:0,yandex:0,expense:0,gum_count:0,cash_amount:0})
                const jamiExp=calcOrderExpected(jami)
                const jamiDiff=jami.cash_amount-jamiExp
                return(
                  <Fragment key={group.date+group.branch}>
                    <tr className="orderGroupHeader">
                      <td colSpan={isAdmin?16:15}>📅 {group.date} — {group.branch}</td>
                    </tr>
                    {group.rows.map(r=>{
                      const exp=calcOrderExpected(r)
                      const diff=num(r.cash_amount)-exp
                      return(
                        <tr key={r.id}>
                          <td>{r.branches?.name}</td><td>{r.order_date}</td><td>{r.shift_no}-smena</td>
                          <td>{money(r.total)}</td><td>{money(r.uzcard)}</td><td>{money(r.humo)}</td>
                          <td>{money(r.rahmat)}</td><td>{money(r.rxmt)}</td><td>{money(r.uzum)}</td><td>{money(r.yandex)}</td>
                          <td>{money(exp)}</td><td>{money(r.cash_amount)}</td>
                          <td className={diff<0?'red':diff>0?'green':''}>{cashDifferenceText(diff)}</td>
                          <td>{money(r.expense)}</td><td>{r.gum_count}</td>
                          {isAdmin&&<td><button onClick={()=>edit(r)}>✏️</button><button onClick={()=>del(r)}>🗑</button></td>}
                        </tr>
                      )
                    })}
                    <tr className="orderJamiRow">
                      <td colSpan={3}><b>Jami:</b></td>
                      <td><b>{money(jami.total)}</b></td><td><b>{money(jami.uzcard)}</b></td><td><b>{money(jami.humo)}</b></td>
                      <td><b>{money(jami.rahmat)}</b></td><td><b>{money(jami.rxmt)}</b></td><td><b>{money(jami.uzum)}</b></td><td><b>{money(jami.yandex)}</b></td>
                      <td><b>{money(jamiExp)}</b></td><td><b>{money(jami.cash_amount)}</b></td>
                      <td className={jamiDiff<0?'red':jamiDiff>0?'green':''}><b>{cashDifferenceText(jamiDiff)}</b></td>
                      <td><b>{money(jami.expense)}</b></td><td><b>{jami.gum_count}</b></td>
                      {isAdmin&&<td/>}
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

function CashPage({tr,rows,approve,isAdmin,editRow,setEditRow,editForm,setEditForm,saveCashEdit,delCash,dateFilter,setDateFilter}){
  const [acceptValues,setAcceptValues]=useState({})
  const pending=rows.filter(r=>r.status==='PENDING')
  const approved=rows.filter(r=>r.status==='APPROVED')
  const totalExpected=pending.reduce((s,r)=>s+num(r.expected_cash),0)
  const totalAccepted=approved.reduce((s,r)=>s+num(r.accepted_cash),0)
  return(
    <Panel title={tr.cash}>
      <div className="actions" style={{marginBottom:14,flexWrap:'wrap'}}>
        <div className="field" style={{minWidth:160}}>
          <label>{tr.start}</label>
          <input type="date" value={dateFilter.start} onChange={e=>setDateFilter({...dateFilter,start:e.target.value})} />
        </div>
        <div className="field" style={{minWidth:160}}>
          <label>{tr.end}</label>
          <input type="date" value={dateFilter.end} onChange={e=>setDateFilter({...dateFilter,end:e.target.value})} />
        </div>
        <button className="secondary" style={{alignSelf:'flex-end'}} onClick={()=>setDateFilter({start:'',end:''})}>✕ Tozalash</button>
      </div>
      <div className="cards two" style={{marginBottom:16}}>
        <div className="card"><span>Kutilayotgan ({pending.length} ta)</span><b>{money(totalExpected)}</b></div>
        <div className="card good"><span>Qabul qilingan ({approved.length} ta)</span><b>{money(totalAccepted)}</b></div>
      </div>
      {editRow&&(
        <div className="cashEditBox">
          <h4>✏️ Inkassatsiyani tahrirlash</h4>
          <div className="grid">
            <Field label="Kutilgan summa" value={editForm.expected_cash??''} set={v=>setEditForm({...editForm,expected_cash:v})} />
            <Field label="Izoh" value={editForm.note??''} set={v=>setEditForm({...editForm,note:v})} text />
          </div>
          <div className="actions">
            <button className="primary" onClick={()=>saveCashEdit(editRow,editForm)}>💾 Saqlash</button>
            <button className="secondary" onClick={()=>setEditRow(null)}>✕ Bekor</button>
          </div>
        </div>
      )}
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>{tr.branch}</th><th>{tr.date}</th>
              <th>{tr.expected}</th><th>{tr.accepted}</th>
              <th>{tr.difference}</th><th>{tr.status}</th>
              <th>{tr.note}</th><th>{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length===0&&<tr><td colSpan={8} style={{textAlign:'center',padding:28,color:'var(--muted)'}}>Ma'lumot yo'q</td></tr>}
            {rows.map(r=>(
              <tr key={r.id}>
                <td>{r.branches?.name}</td>
                <td>{r.order_date}</td>
                <td>{money(r.expected_cash)}</td>
                <td>
                  {r.status==='PENDING'
                    ?<input className="miniInput" placeholder={String(r.expected_cash)} value={acceptValues[r.id]??''} onChange={e=>setAcceptValues(v=>({...v,[r.id]:e.target.value}))} />
                    :money(r.accepted_cash)}
                </td>
                <td className={num(r.difference)<0?'red':num(r.difference)>0?'green':''}>
                  {r.status==='APPROVED'?cashDifferenceText(r.difference):'—'}
                </td>
                <td><span className={`status ${r.status}`}>{r.status==='PENDING'?'Kutilmoqda':'Tasdiqlangan'}</span></td>
                <td>{r.note}</td>
                <td>
                  {r.status==='PENDING'&&(
                    <button className="primary" style={{padding:'8px 12px',fontSize:12}} onClick={()=>{
                      const val=acceptValues[r.id]
                      approve(r,val!==undefined&&val!==''?val:r.expected_cash)
                      setAcceptValues(v=>{const n={...v};delete n[r.id];return n})
                    }}>✅ Qabul</button>
                  )}
                  {isAdmin&&(
                    <>
                      <button onClick={()=>{setEditRow(r);setEditForm({expected_cash:r.expected_cash,note:r.note||''})}}>✏️</button>
                      <button onClick={()=>delCash(r)}>🗑</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function OperationsTable({tr,rows,catName,isAdmin,selectedIds,setSelectedIds,bulkDelete,edit,del,exportCSV,importCSV,downloadTemplate,printPDF,title,showFilters,filterOpen,setFilterOpen,reportFilter,setReportFilter,categories}){
  const allIds=rows.map(r=>r.id)
  const allSelected=allIds.length>0&&allIds.every(id=>selectedIds.includes(id))
  const totalIncome=rows.filter(r=>r.type==='Kirim').reduce((s,r)=>s+num(r.amount),0)
  const totalExpense=rows.filter(r=>r.type==='Chiqim').reduce((s,r)=>s+num(r.amount),0)
  const balance=totalIncome-totalExpense
  return(
    <Panel title={title||tr.history}>
      <div className="reportActions actions">
        {showFilters&&(
          <button className={`secondary filterToggle ${filterOpen?'active':''}`} onClick={()=>setFilterOpen(!filterOpen)}>
            🔍 Filter {filterOpen?'▲':'▼'}
          </button>
        )}
        {exportCSV&&<button className="secondary" onClick={exportCSV}>📊 {tr.exportExcel}</button>}
        {isAdmin&&importCSV&&(
          <label className="secondary fileAction">📥 Import<input type="file" accept=".csv,.xlsx,.xls" onChange={importCSV} /></label>
        )}
        {downloadTemplate&&<button className="secondary" onClick={downloadTemplate}>📋 Shablon</button>}
        {printPDF&&<button className="secondary" onClick={printPDF}>🖨️ Print</button>}
        {isAdmin&&selectedIds.length>0&&(
          <>
            <button className="dangerBtn" onClick={()=>bulkDelete(selectedIds)}>🗑 {selectedIds.length} ta o'chirish</button>
            <button className="secondary" onClick={()=>setSelectedIds([])}>✕ Bekor</button>
          </>
        )}
      </div>
      {showFilters&&filterOpen&&(
        <div className="reportFilterBox">
          <div className="filterTitle"><b>🔍 Filtr</b><span>{rows.length} ta natija</span></div>
          <div className="grid filterGrid" style={{gridTemplateColumns:'repeat(3,1fr) auto'}}>
            <div className="field">
              <label>{tr.type}</label>
              <select value={reportFilter.type} onChange={e=>setReportFilter({...reportFilter,type:e.target.value})}>
                <option value="ALL">Barchasi</option>
                <option value="Kirim">{tr.income}</option>
                <option value="Chiqim">{tr.outcome}</option>
              </select>
            </div>
            <div className="field">
              <label>{tr.category}</label>
              <select value={reportFilter.category_id} onChange={e=>setReportFilter({...reportFilter,category_id:e.target.value})}>
                <option value="ALL">Barchasi</option>
                {(categories||[]).map(c=><option key={c.id} value={c.id}>{catName(c)}</option>)}
              </select>
            </div>
            <div className="field">
              <label>{tr.account}</label>
              <select value={reportFilter.account} onChange={e=>setReportFilter({...reportFilter,account:e.target.value})}>
                <option value="ALL">Barchasi</option>
                {ACCOUNTS.map(a=><option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="field filterResetField">
              <label>&nbsp;</label>
              <button className="secondary" onClick={()=>setReportFilter({type:'ALL',category_id:'ALL',account:'ALL'})}>✕ Reset</button>
            </div>
          </div>
        </div>
      )}
      <div className="cards three" style={{marginBottom:12}}>
        <div className="card good"><span>{tr.income}</span><b>{money(totalIncome)}</b></div>
        <div className="card bad"><span>{tr.outcome}</span><b>{money(totalExpense)}</b></div>
        <div className={`card ${balance>=0?'premium':'bad'}`}><span>Balans</span><b>{money(balance)}</b></div>
      </div>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              {isAdmin&&<th><input type="checkbox" checked={allSelected} onChange={()=>setSelectedIds(allSelected?[]:allIds)} /></th>}
              <th>{tr.branch}</th><th>{tr.date}</th><th>{tr.type}</th>
              <th>{tr.category}</th><th>{tr.account}</th><th>{tr.amount}</th><th>{tr.note}</th>
              <th>{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length===0&&<tr><td colSpan={9} style={{textAlign:'center',padding:28,color:'var(--muted)'}}>Ma'lumot yo'q</td></tr>}
            {rows.map(r=>(
              <tr key={r.id} className={selectedIds.includes(r.id)?'selectedRow':''}>
                {isAdmin&&<td><input type="checkbox" checked={selectedIds.includes(r.id)} onChange={()=>setSelectedIds(prev=>prev.includes(r.id)?prev.filter(x=>x!==r.id):[...prev,r.id])} /></td>}
                <td>{r.branches?.name}</td>
                <td>{new Date(r.created_at).toLocaleString('uz-UZ')}</td>
                <td><span className={`typeBadge ${r.type==='Kirim'?'income':'expense'}`}>{r.type==='Kirim'?tr.income:tr.outcome}</span></td>
                <td>{catName(r.categories)}</td>
                <td>{r.account}</td>
                <td className={r.type==='Kirim'?'green':'red'}>{money(r.amount)}</td>
                <td>{r.note}</td>
                <td>
                  {edit&&<button onClick={()=>edit(r)}>✏️</button>}
                  {isAdmin&&del&&<button onClick={()=>del(r)}>🗑</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function EmployeesPage({tr,employees,form,setForm,save,del,editEmp,setEditEmp,editForm,setEditForm,saveEdit}){
  return(
    <Panel title={tr.employees}>
      <div className="grid">
        <Field label={tr.fullName} value={form.full_name} set={v=>setForm({...form,full_name:v})} />
        <Field label={tr.position} value={form.position} set={v=>setForm({...form,position:v})} />
        <Field type="date" label={tr.hireDate} value={form.hire_date} set={v=>setForm({...form,hire_date:v})} />
        <Select label={tr.salaryType} value={form.salary_type} set={v=>setForm({...form,salary_type:v})} opts={['hourly','monthly']} display={v=>v==='hourly'?tr.hourly:tr.monthly} />
        {form.salary_type==='hourly'
          ?<Field label={tr.hourlyRate} value={form.hourly_rate} set={v=>setForm({...form,hourly_rate:v})} />
          :<Field label={tr.monthlySalary} value={form.monthly_salary} set={v=>setForm({...form,monthly_salary:v})} />
        }
      </div>
      <button className="primary" onClick={save}>{tr.create}</button>
      {editEmp&&(
        <div className="cashEditBox" style={{marginTop:20}}>
          <h4>✏️ {tr.edit}</h4>
          <div className="grid">
            <Field label={tr.fullName} value={editForm.full_name??''} set={v=>setEditForm({...editForm,full_name:v})} />
            <Field label={tr.position} value={editForm.position??''} set={v=>setEditForm({...editForm,position:v})} />
            <Field type="date" label={tr.hireDate} value={editForm.hire_date??''} set={v=>setEditForm({...editForm,hire_date:v})} />
            <Select label={tr.salaryType} value={editForm.salary_type??'hourly'} set={v=>setEditForm({...editForm,salary_type:v})} opts={['hourly','monthly']} display={v=>v==='hourly'?tr.hourly:tr.monthly} />
            {(editForm.salary_type||'hourly')==='hourly'
              ?<Field label={tr.hourlyRate} value={editForm.hourly_rate??''} set={v=>setEditForm({...editForm,hourly_rate:v})} />
              :<Field label={tr.monthlySalary} value={editForm.monthly_salary??''} set={v=>setEditForm({...editForm,monthly_salary:v})} />
            }
          </div>
          <div className="actions">
            <button className="primary" onClick={()=>saveEdit(editEmp,editForm)}>💾 {tr.save}</button>
            <button className="secondary" onClick={()=>setEditEmp(null)}>✕ {tr.cancel}</button>
          </div>
        </div>
      )}
      <div className="tableWrap" style={{marginTop:16}}>
        <table>
          <thead>
            <tr>
              <th>#</th><th>{tr.fullName}</th><th>{tr.position}</th>
              <th>{tr.hireDate}</th><th>{tr.salaryType}</th><th>{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {employees.length===0&&<tr><td colSpan={6} style={{textAlign:'center',padding:24,color:'var(--muted)'}}>Xodim yo'q</td></tr>}
            {employees.map((e,i)=>(
              <tr key={e.id}>
                <td>{i+1}</td>
                <td>{e.full_name}</td>
                <td>{e.position}</td>
                <td>{e.hire_date}</td>
                <td>{e.salary_type==='hourly'?`${tr.hourly} — ${money(e.hourly_rate)} / soat`:`${tr.monthly} — ${money(e.monthly_salary)}`}</td>
                <td>
                  <button onClick={()=>{setEditEmp(e);setEditForm({full_name:e.full_name,position:e.position,hire_date:e.hire_date,salary_type:e.salary_type,hourly_rate:e.hourly_rate||'',monthly_salary:e.monthly_salary||''})}}>✏️</button>
                  <button onClick={()=>del(e)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function PayrollPage({tr,payroll,setPayroll,calc,save,exportCSV}){
  return(
    <Panel title={tr.payroll}>
      <div className="grid">
        <Field label="Sarlavha" value={payroll.title} set={v=>setPayroll({...payroll,title:v})} />
        <Select label="Qism" value={payroll.part_no} set={v=>setPayroll({...payroll,part_no:v})} opts={['1','2']} display={v=>`${v}-qism`} />
        <Field type="date" label={tr.start} value={payroll.period_start} set={v=>setPayroll({...payroll,period_start:v})} />
        <Field type="date" label={tr.end} value={payroll.period_end} set={v=>setPayroll({...payroll,period_end:v})} />
      </div>
      <div className="actions" style={{marginBottom:12}}>
        <button className="primary" onClick={save}>💾 {tr.save}</button>
        <button className="secondary" onClick={exportCSV}>📊 {tr.exportExcel}</button>
      </div>
      {payroll.rows.length===0&&<div className="empty">Xodim yo'q — avval filial tanlang</div>}
      {payroll.rows.length>0&&(
        <div className="tableWrap">
          <table className="payrollTable">
            <thead>
              <tr>
                <th>#</th><th>{tr.fullName}</th><th>{tr.position}</th>
                <th>{tr.workedHours}</th><th>{tr.extraHours}</th><th>{tr.hourlyRate}</th>
                <th>{tr.tax}</th><th>{tr.lunch}</th><th>{tr.penalty}</th>
                <th>{tr.advance}</th><th>{tr.bonus}</th>
                <th>{tr.cashPaid}</th><th>{tr.cardPaid}</th>
                <th>Jami</th><th>{tr.remaining}</th>
              </tr>
            </thead>
            <tbody>
              {payroll.rows.map((r,i)=>{
                const c=calc(r)
                const upd=(k,v)=>setPayroll(p=>({...p,rows:p.rows.map((x,j)=>j===i?{...x,[k]:v}:x)}))
                return(
                  <tr key={r.employee_id||i}>
                    <td>{i+1}</td>
                    <td>{r.full_name}</td>
                    <td>{r.position}</td>
                    {['worked_hours','extra_hours','hourly_rate','tax','lunch','penalty','advance','bonus','cash_paid','card_paid'].map(k=>(
                      <td key={k}><input className="miniInput" value={r[k]??''} onChange={e=>upd(k,e.target.value)} /></td>
                    ))}
                    <td><b>{money(c.total_salary)}</b></td>
                    <td className={c.remaining>0?'red':c.remaining<0?'green':''}><b>{money(c.remaining)}</b></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

function PayrollArchive({tr,runs,items}){
  const [openRun,setOpenRun]=useState(null)
  const runItems=items.filter(x=>x.payroll_run_id===openRun)
  return(
    <Panel title={tr.payrollArchive}>
      {runs.length===0&&<div className="empty">Arxiv bo'sh</div>}
      {runs.map(run=>(
        <div key={run.id} className="archiveRun">
          <div className="archiveRunHeader" onClick={()=>setOpenRun(openRun===run.id?null:run.id)}>
            <b>{run.title}</b>
            <span>{run.branches?.name} | {run.period_start} — {run.period_end}</span>
            <span>{openRun===run.id?'▲':'▼'}</span>
          </div>
          {openRun===run.id&&runItems.length>0&&(
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>{tr.fullName}</th><th>{tr.position}</th>
                    <th>{tr.workedHours}</th><th>{tr.extraHours}</th><th>{tr.hourlyRate}</th>
                    <th>{tr.tax}</th><th>{tr.lunch}</th><th>{tr.penalty}</th>
                    <th>{tr.advance}</th><th>{tr.bonus}</th>
                    <th>{tr.cashPaid}</th><th>{tr.cardPaid}</th>
                    <th>Jami</th><th>{tr.remaining}</th>
                  </tr>
                </thead>
                <tbody>
                  {runItems.map((r,i)=>(
                    <tr key={r.id}>
                      <td>{i+1}</td>
                      <td>{r.employees?.full_name}</td>
                      <td>{r.employees?.position}</td>
                      <td>{r.worked_hours}</td><td>{r.extra_hours}</td><td>{money(r.hourly_rate)}</td>
                      <td>{money(r.tax)}</td><td>{money(r.lunch)}</td><td>{money(r.penalty)}</td>
                      <td>{money(r.advance)}</td><td>{money(r.bonus)}</td>
                      <td>{money(r.cash_paid)}</td><td>{money(r.card_paid)}</td>
                      <td><b>{money(r.total_salary)}</b></td>
                      <td className={num(r.remaining)>0?'red':num(r.remaining)<0?'green':''}><b>{money(r.remaining)}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </Panel>
  )
}

function CategoriesPage({tr,categories,newCat,setNewCat,save,editCat,cancelEdit,startEdit,del,selectedIds,setSelectedIds,bulkDelete}){
  const allIds=categories.map(c=>c.id)
  const allSelected=allIds.length>0&&allIds.every(id=>selectedIds.includes(id))
  return(
    <Panel title={tr.categories}>
      <div className="grid">
        <Field label="Nomi (UZ)" value={newCat.name} set={v=>setNewCat({...newCat,name:v})} />
        <Field label="Nomi (RU)" value={newCat.name_ru} set={v=>setNewCat({...newCat,name_ru:v})} />
        <Field label="Nomi (Кирилл)" value={newCat.name_cy} set={v=>setNewCat({...newCat,name_cy:v})} />
        <Select label={tr.type} value={newCat.type} set={v=>setNewCat({...newCat,type:v})} opts={['Kirim','Chiqim']} display={v=>v==='Kirim'?tr.income:tr.outcome} />
      </div>
      <div className="actions">
        <button className="primary" onClick={save}>{editCat?tr.edit:tr.create}</button>
        {editCat&&<button className="secondary" onClick={cancelEdit}>✕ {tr.cancel}</button>}
        {selectedIds.length>0&&(
          <>
            <button className="dangerBtn" onClick={()=>bulkDelete(selectedIds)}>🗑 {selectedIds.length} ta</button>
            <button className="secondary" onClick={()=>setSelectedIds([])}>✕ Bekor</button>
          </>
        )}
      </div>
      <div className="tableWrap" style={{marginTop:12}}>
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" checked={allSelected} onChange={()=>setSelectedIds(allSelected?[]:allIds)} /></th>
              <th>#</th><th>Nomi (UZ)</th><th>Nomi (RU)</th><th>{tr.type}</th><th>{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {categories.length===0&&<tr><td colSpan={6} style={{textAlign:'center',padding:24,color:'var(--muted)'}}>Kategoriya yo'q</td></tr>}
            {categories.map((c,i)=>(
              <tr key={c.id} className={editCat?.id===c.id?'selectedRow':''}>
                <td><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={()=>setSelectedIds(prev=>prev.includes(c.id)?prev.filter(x=>x!==c.id):[...prev,c.id])} /></td>
                <td>{i+1}</td>
                <td>{c.name}</td>
                <td>{c.name_ru||'—'}</td>
                <td><span className={`typeBadge ${c.type==='Kirim'?'income':'expense'}`}>{c.type==='Kirim'?tr.income:tr.outcome}</span></td>
                <td>
                  <button onClick={()=>startEdit(c)}>✏️</button>
                  <button onClick={()=>del(c)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function UsersPage({tr,users,branches,modules,newUser,setNewUser,save,edit,deactivate}){
  function toggle(arr,v){return arr.includes(v)?arr.filter(x=>x!==v):[...arr,v]}
  return(
    <Panel title={tr.users}>
      <div className="grid">
        <Field label={tr.fullName} value={newUser.full_name} set={v=>setNewUser({...newUser,full_name:v})} />
        <Field label={tr.login} value={newUser.login} set={v=>setNewUser({...newUser,login:v})} />
        <Field label={tr.password} value={newUser.password} set={v=>setNewUser({...newUser,password:v})} />
        <div className="field">
          <label>{tr.role}</label>
          <select value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value})}>
            {['ADMIN','RAHBAR','BOSH_MANAGER','FILIAL_MANAGER','SMENA_MANAGER','BUXGALTER'].map(r=>(
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label>{tr.branch}</label>
        <div className="checkList">
          {branches.map(b=>(
            <label key={b.id} className="checkItem">
              <input type="checkbox" checked={newUser.branchIds.includes(b.id)} onChange={()=>setNewUser({...newUser,branchIds:toggle(newUser.branchIds,b.id)})} />
              {b.name}
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <label>{tr.access}</label>
        <div className="checkList">
          {modules.map(m=>(
            <label key={m} className="checkItem">
              <input type="checkbox" checked={newUser.modules.includes(m)} onChange={()=>setNewUser({...newUser,modules:toggle(newUser.modules,m)})} />
              {m}
            </label>
          ))}
        </div>
      </div>
      <button className="primary" onClick={save}>{newUser.id?tr.edit:tr.create}</button>
      <div className="tableWrap" style={{marginTop:16}}>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Rasm</th><th>{tr.fullName}</th><th>{tr.login}</th>
              <th>{tr.role}</th><th>Online</th><th>{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u=>u.active!==false).map((u,i)=>(
              <tr key={u.id}>
                <td>{i+1}</td>
                <td><img src={avatarSrc(u)} style={{width:32,height:32,borderRadius:'50%',objectFit:'cover'}} /></td>
                <td>{u.full_name}</td>
                <td>{u.login}</td>
                <td>{u.role}</td>
                <td>{u.last_seen?<span className={isOnlineStatic(u)?'onlineDot':'offlineDot'}>{isOnlineStatic(u)?'🟢':'⚫'}</span>:''}</td>
                <td>
                  <button onClick={()=>edit(u)}>✏️</button>
                  <button onClick={()=>deactivate(u)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
function isOnlineStatic(u){
  if(!u?.last_seen)return false
  return Date.now()-new Date(u.last_seen).getTime()<70000
}

function ChatPage({tr,users,messages,me,chatUser,setChatUser,chatText,setChatText,send,markChatRead,isOnline}){
  const endRef=useRef(null)
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'})},[messages,chatUser])
  const chatMessages=messages.filter(m=>
    (m.sender_id===me?.id&&m.receiver_id===chatUser)||
    (m.sender_id===chatUser&&m.receiver_id===me?.id)
  )
  function dateDivider(msgs){
    const result=[];let lastDate=''
    msgs.forEach(m=>{
      const d=m.created_at?.slice(0,10)
      if(d!==lastDate){result.push({type:'date',date:d});lastDate=d}
      result.push({type:'msg',...m})
    })
    return result
  }
  const unreadFrom=(uid)=>messages.filter(m=>m.sender_id===uid&&m.receiver_id===me?.id&&!m.is_read).length
  return(
    <div className="chatLayout">
      <div className="chatUsers">
        <div className="chatUsersTitle">💬 {tr.chat}</div>
        {users.map(u=>(
          <button key={u.id} className={`chatUserBtn ${chatUser===u.id?'active':''}`} onClick={()=>{setChatUser(u.id);markChatRead(u.id)}}>
            <div className="chatUserAvatar">
              <img src={avatarSrc(u)} />
              <span className={isOnline(u)?'onlineDot':'offlineDot'} />
            </div>
            <div className="chatUserInfo">
              <b>{u.full_name||u.login}</b>
              <small>{isOnline(u)?'Online':'Offline'}</small>
            </div>
            {unreadFrom(u.id)>0&&<em className="badge">{unreadFrom(u.id)}</em>}
          </button>
        ))}
      </div>
      <div className="chatMain">
        {!chatUser&&<div className="chatEmpty">Foydalanuvchi tanlang</div>}
        {chatUser&&(
          <>
            <div className="chatMessages">
              {dateDivider(chatMessages).map((item,i)=>{
                if(item.type==='date')return(<div key={`date-${i}`} className="chatDateDivider">{item.date}</div>)
                const mine=item.sender_id===me?.id
                return(
                  <div key={item.id} className={`chatBubble ${mine?'mine':'theirs'}`}>
                    <div className="bubbleText">{item.message}</div>
                    <div className="bubbleMeta">
                      {new Date(item.created_at).toLocaleTimeString('uz-UZ',{hour:'2-digit',minute:'2-digit'})}
                      {mine&&<span>{item.is_read?'✓✓':'✓'}</span>}
                    </div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>
            <div className="chatInput">
              <input placeholder={`${tr.send}...`} value={chatText} onChange={e=>setChatText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()} />
              <button className="primary" onClick={send}>{tr.send}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ProfilePage({tr,profile,setProfile,lang,setLang,theme,setTheme,save,uploadAvatar,isAdmin,company,saveCompany,testTelegram,deleteCompany}){
  const [tgForm,setTgForm]=useState({telegram_token:'',telegram_chat_id:company?.telegram_chat_id||''})
  const [tgEdit,setTgEdit]=useState(!company?.telegram_chat_id)
  useEffect(()=>{
    setTgForm({telegram_token:'',telegram_chat_id:company?.telegram_chat_id||''})
    if(company?.telegram_chat_id)setTgEdit(false)
  },[company?.telegram_chat_id])
  const isSaved=!!company?.telegram_chat_id&&!tgEdit
  return(
    <Panel title={tr.profile}>
      <div className="profileSection">
        <div className="avatarWrap">
          <img className="profileAvatar" src={avatarSrc(profile)} alt="avatar" />
          <label className="avatarUpload">
            📷 {tr.uploadPhoto}
            <input type="file" accept="image/*" onChange={uploadAvatar} />
          </label>
        </div>
        <div className="grid">
          <Field label={tr.fullName} value={profile.full_name} set={v=>setProfile({...profile,full_name:v})} />
          <Field label="Telefon" value={profile.phone||''} set={v=>setProfile({...profile,phone:v})} />
          <Select label="Til / Язык" value={lang} set={setLang} opts={['uz','cy','ru']} display={v=>v==='uz'?'O\'zbek (Lotin)':v==='cy'?'Ўзбек (Кирилл)':'Русский'} />
          <Select label="Tema" value={theme} set={setTheme} opts={['light','dark']} display={v=>v==='light'?'☀️ Yorug\'':'🌙 Qorong\'u'} />
        </div>
        <button className="primary" onClick={save}>💾 {tr.save}</button>
      </div>
      {isAdmin&&(
        <div className="telegramSection">
          <h3>🤖 Telegram Bot Sozlamalari</h3>
          <p className="telegramHint">2-smena saqlanganida avtomatik hisobot yuboriladi</p>
          {isSaved?(
            <div className="tgSavedBox">
              <div className="tgConnectedBadge">✅ Bot ulangan va faol</div>
              <div className="tgMasked">
                <div><span>Token:</span><b>Serverda saqlangan</b></div>
                <div><span>Chat ID:</span><b>{company.telegram_chat_id}</b></div>
              </div>
              <div className="actions" style={{marginTop:12}}>
                <button className="secondary" onClick={()=>setTgEdit(true)}>✏️ Tahrirlash</button>
                <button className="secondary" onClick={()=>testTelegram(tgForm)}>📨 Test yuborish</button>
                <button className="dangerBtn" onClick={deleteCompany}>🗑 O'chirish</button>
              </div>
            </div>
          ):(
            <div className="tgEditBox">
              {company?.telegram_chat_id&&<div className="tgWarning">⚠️ Mavjud token serverda saqlangan. Yangi token kiritsangiz almashtiriladi.</div>}
              <div className="grid">
                <Field label="Bot Token" value={tgForm.telegram_token} set={v=>setTgForm({...tgForm,telegram_token:v})} />
                <Field label="Chat ID" value={tgForm.telegram_chat_id} set={v=>setTgForm({...tgForm,telegram_chat_id:v})} />
              </div>
              <div className="actions">
                <button className="primary" onClick={()=>saveCompany(tgForm)}>💾 Saqlash</button>
                <button className="secondary" onClick={()=>testTelegram(tgForm)}>📨 Test</button>
                {company?.telegram_chat_id&&<button className="secondary" onClick={()=>setTgEdit(false)}>✕ Bekor</button>}
              </div>
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Panel({title,children}){
  return(
    <div className="panel entrance">
      {title&&<h2 className="panelTitle">{title}</h2>}
      {children}
    </div>
  )
}

function Chart({title,rows,emptyText,danger}){
  const max=Math.max(...rows.map(r=>r.value),1)
  return(
    <div className="chartBox">
      <h3>{title}</h3>
      {rows.length===0&&<div className="empty">{emptyText}</div>}
      {rows.map(r=>(
        <div className="chartRow" key={r.name}>
          <span className="chartLabel">{r.name}</span>
          <div className="chartBar">
            <div className={`chartFill ${danger?'danger':''}`} style={{width:`${(r.value/max)*100}%`}} />
          </div>
          <span className="chartValue">{money(r.value)}</span>
        </div>
      ))}
    </div>
  )
}

function Field({label,value,set,type='text',text}){
  return(
    <div className="field">
      <label>{label}</label>
      {text
        ?<textarea value={value??''} onChange={e=>set(e.target.value)} placeholder={label} />
        :<input type={type} value={value??''} onChange={e=>set(e.target.value)} placeholder={label} />
      }
    </div>
  )
}

function Select({label,value,set,opts,display}){
  return(
    <div className="field">
      <label>{label}</label>
      <select value={value??''} onChange={e=>set(e.target.value)}>
        {opts.map(o=><option key={o} value={o}>{display?display(o):o}</option>)}
      </select>
    </div>
  )
}

function ConfirmModal({modal,close}){
  if(!modal.open)return null
  return(
    <div className="confirmOverlay" onClick={close}>
      <div className="confirmBox" onClick={e=>e.stopPropagation()}>
        <p>{modal.message}</p>
        <div className="actions">
          <button className="dangerBtn" onClick={()=>{modal.onConfirm?.();close()}}>Ha, o'chirish</button>
          <button className="secondary" onClick={close}>Bekor</button>
        </div>
      </div>
    </div>
  )
}