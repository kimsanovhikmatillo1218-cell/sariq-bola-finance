import * as XLSX from 'xlsx'
import { supabase } from '../lib'
import { HASH_RPC, OP_TYPE } from '../constants'

export const today = () => new Date().toISOString().slice(0, 10)

export const money = n => {
  const val = Number(n || 0)
  return Number.isFinite(val) ? val.toLocaleString('ru-RU') + " so'm" : "0 so'm"
}

export const num = v => {
  const val = Number(v || 0)
  return Number.isFinite(val) ? val : 0
}

export const safeJsonParse = (value, fallback = null) => {
  try { return value ? JSON.parse(value) : fallback }
  catch { return fallback }
}

export const isOnline = u => {
  if (!u?.last_seen) return false
  return Date.now() - new Date(u.last_seen).getTime() < 70000
}

export const avatarSrc = person => {
  const name = encodeURIComponent(person?.full_name || person?.login || 'User')
  return person?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
}

export const localDateValue = d => d ? String(d).slice(0, 10) : ''

export const inDateRange = (dateValue, start, end) => {
  const d = localDateValue(dateValue)
  if (!d) return false
  if (start && d < start) return false
  if (end && d > end) return false
  return true
}

export const sameDay = (a, b) => localDateValue(a) === localDateValue(b)

export const cashDifferenceText = value => {
  const diff = num(value)
  if (diff > 0) return `Ortiqcha ${money(diff)}`
  if (diff < 0) return `Kamomad ${money(Math.abs(diff))}`
  return 'Teng'
}

export const calcOrderExpected = row =>
  num(row.total)
  - num(row.uzcard) - num(row.humo) - num(row.rahmat)
  - num(row.rxmt)   - num(row.uzum) - num(row.yandex)
  + num(row.expense) - num(row.gum_count) * 1000

export const serverHashPassword = async value => {
  const raw = String(value || '')
  if (!raw) return ''
  const { data, error } = await supabase.rpc(HASH_RPC, { p_password: raw })
  if (error) throw error
  return data
}

export const normalizeHeader = v =>
  String(v || '').toLowerCase().replace(/[''`]/g, '').replace(/\s+/g, ' ').trim()

export const findColumn = (headers, aliases) => {
  const n = headers.map(normalizeHeader)
  return n.findIndex(h => aliases.some(a => h.includes(normalizeHeader(a))))
}

export const readCell = (row, index, fallback = '') =>
  index >= 0 ? row[index] : fallback

export const toNumber = value => {
  const c = String(value ?? '').replace(/\s/g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, '')
  return Number(c || 0)
}

export const toDateTime = value => {
  const raw = String(value || '').trim()
  if (!raw) return new Date().toISOString()
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return `${raw.slice(0, 10)}T00:00:00`
  const m = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}T00:00:00`
  const d = new Date(raw)
  if (!isNaN(d.getTime())) return d.toISOString()
  return new Date().toISOString()
}

export const toDateOnly = v => toDateTime(v).slice(0, 10)

export const sortRows = obj =>
  Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

export const toggle = (arr, v) =>
  arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]

// CSV injection himoyasi
const sanitizeCell = value => {
  const s = String(value ?? '')
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
}

export const makeCSVRowsFromObjects = data => {
  if (!data?.length) return []
  const headers = Object.keys(data[0])
  return [headers, ...data.map(row => headers.map(h => {
    const v = row[h]
    return v && typeof v === 'object' ? JSON.stringify(v) : (v ?? '')
  }))]
}

export const downloadCSV = (filename, rows) => {
  const csv = rows.map(r => r.map(c => `"${sanitizeCell(c)}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}

export const downloadXLSX = (filename, sheets) => {
  const wb = XLSX.utils.book_new()
  sheets.forEach(({ name, data, colWidths }) => {
    const ws = XLSX.utils.aoa_to_sheet(data)
    if (colWidths) ws['!cols'] = colWidths.map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws, name)
  })
  XLSX.writeFile(wb, filename)
}

export const parseCSV = text => {
  const rows = []; let row = [], cell = '', quote = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1]
    if (ch === '"' && quote && next === '"') { cell += '"'; i++; continue }
    if (ch === '"') { quote = !quote; continue }
    if (ch === ',' && !quote) { row.push(cell.trim()); cell = ''; continue }
    if ((ch === '\n' || ch === '\r') && !quote) {
      if (cell || row.length) { row.push(cell.trim()); rows.push(row) }
      row = []; cell = ''; if (ch === '\r' && next === '\n') i++; continue
    }
    cell += ch
  }
  if (cell || row.length) { row.push(cell.trim()); rows.push(row) }
  return rows.filter(r => r.some(c => String(c || '').trim() !== ''))
}

export const exportOperations = (rows, tr, catName) => {
  const data = [
    [tr.branch, tr.date, tr.type, tr.category, tr.account, tr.amount, tr.note],
    ...rows.map(r => [
      r.branches?.name || '',
      new Date(r.created_at).toLocaleString('uz-UZ'),
      r.type === OP_TYPE.INCOME ? tr.income : tr.outcome,
      catName(r.categories),
      r.account, r.amount, r.note || ''
    ])
  ]
  downloadCSV('hisobot-operatsiyalar.csv', data)
}

export const exportOrders = (rows, tr) => {
  const data = [
    [tr.branch, tr.date, tr.shift, tr.total, tr.uzcard, tr.humo, tr.rahmat,
      tr.rxmt, tr.uzum, tr.yandex, 'Hisoblangan naqd', tr.cashAmount, 'Tafovut', tr.expense, tr.gum],
    ...rows.map(r => [
      r.branches?.name || '', r.order_date, r.shift_no,
      r.total, r.uzcard, r.humo, r.rahmat, r.rxmt, r.uzum, r.yandex,
      calcOrderExpected(r), r.cash_amount,
      num(r.cash_amount) - calcOrderExpected(r), r.expense, r.gum_count
    ])
  ]
  downloadCSV('filial-orderlari.csv', data)
}