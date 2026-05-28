import * as XLSX from 'xlsx'

// ── Basic helpers ─────────────────────────────────────────────────────────────
export const today = () => new Date().toISOString().slice(0, 10)
export const money = n => Number(n || 0).toLocaleString('uz-UZ') + " so'm"
export const num   = v => Number(v) || 0

export const safeJsonParse = (s, fb = null) => {
  try { return JSON.parse(s) } catch { return fb }
}

export const isOnline = u => {
  if (!u?.last_seen) return false
  return Date.now() - new Date(u.last_seen).getTime() < 5 * 60 * 1000
}

// Handles both user objects {avatar_url, full_name} and plain URL strings
export const avatarSrc = (userOrUrl, name = 'U') => {
  if (userOrUrl && typeof userOrUrl === 'object') {
    const n = userOrUrl.full_name || userOrUrl.name || name
    return userOrUrl.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=f6b700&color=07111f&bold=true`
  }
  return userOrUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f6b700&color=07111f&bold=true`
}

// ── Date helpers ──────────────────────────────────────────────────────────────
export const localDateValue = d => d ? new Date(d).toISOString().slice(0, 10) : ''

export const inDateRange = (dateStr, from, to) => {
  if (!dateStr) return false
  const d = dateStr.slice(0, 10)
  if (from && d < from) return false
  if (to   && d > to)   return false
  return true
}

export const sameDay = (a, b) => a?.slice(0, 10) === b?.slice(0, 10)

// ── Finance helpers ───────────────────────────────────────────────────────────
export const cashDiffInfo = (closing, expected) => {
  const diff = num(closing) - num(expected)
  if (diff === 0) return { text: 'Mos', cls: 'green' }
  return { text: (diff > 0 ? '+' : '') + money(diff), cls: diff > 0 ? 'green' : 'red' }
}

/** Format cash difference as text: +500 000 so'm / -200 000 so'm / Mos */
export const cashDifferenceText = diff => {
  const d = num(diff)
  if (d === 0) return 'Mos'
  return (d > 0 ? '+' : '') + money(d)
}

/** Expected cash = total − all card payments − expense − gum×1000 */
export const calcOrderExpected = order =>
  num(order.total) - num(order.uzcard) - num(order.humo) -
  num(order.rahmat) - num(order.rxmt)  - num(order.uzum) -
  num(order.yandex) - num(order.expense) - num(order.gum_count) * 1000

export const calcExpected = row =>
  num(row.cash_amount) + num(row.card_amount) + num(row.delivery_amount)

// ── Auth ──────────────────────────────────────────────────────────────────────
// Client-side SHA-256 (no server RPC required)
export const serverHashPassword = async pw => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(pw)))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── Sort / Toggle ─────────────────────────────────────────────────────────────
/**
 * Converts a plain object { key: number, … } to
 * [ { name: key, value: number }, … ] sorted by value descending.
 */
export const sortRows = obj =>
  Object.entries(obj)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

export const toggle = (arr, item) =>
  arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]

// ── CSV injection protection ───────────────────────────────────────────────────
export const sanitizeCell = v => {
  const s = String(v ?? '')
  return /^[=+\-@]/.test(s) ? `'${s}` : s
}

// ── CSV download / parse ──────────────────────────────────────────────────────
/**
 * Convert an array of objects to a 2-D array (header row + data rows).
 * Used to build rows before passing to downloadCSV.
 */
export const makeCSVRowsFromObjects = rows => {
  if (!rows?.length) return []
  const keys = Object.keys(rows[0])
  return [keys.map(sanitizeCell), ...rows.map(r => keys.map(k => sanitizeCell(r[k])))]
}

/**
 * @param {string}   filename
 * @param {string[][]} rows   2-D array (first row = headers)
 */
export const downloadCSV = (filename, rows) => {
  if (!rows?.length) return
  const csv = rows.map(r => r.map(c => `"${sanitizeCell(c)}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href) }, 100)
}

/** Parse CSV text → 2-D array */
export const parseCSV = text => {
  const lines = text.split('\n').filter(l => l.trim())
  return lines.map(line => {
    const cells = []; let cur = '', inQ = false
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') inQ = !inQ
      else if (line[i] === ',' && !inQ) { cells.push(cur.trim()); cur = '' }
      else cur += line[i]
    }
    cells.push(cur.trim())
    return cells
  })
}

// ── XLSX download / parse ─────────────────────────────────────────────────────
/**
 * @param {string} filename
 * @param {{ name:string, data:any[][], colWidths?:number[] }[]} sheets
 */
export const downloadXLSX = (filename, sheets) => {
  const wb = XLSX.utils.book_new()
  sheets.forEach(({ name, data, colWidths }) => {
    const ws = XLSX.utils.aoa_to_sheet(data)
    if (colWidths) ws['!cols'] = colWidths.map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws, name)
  })
  XLSX.writeFile(wb, filename)
}

/** Parse an XLSX/XLS/CSV file → array-of-objects (first row = headers) */
export const parseXLSX = file => new Promise((res, rej) => {
  const reader = new FileReader()
  reader.onload = e => {
    const wb = XLSX.read(e.target.result, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    res(XLSX.utils.sheet_to_json(ws, { defval: '' }))
  }
  reader.onerror = rej
  reader.readAsArrayBuffer(file)
})

// ── Import column helpers ─────────────────────────────────────────────────────
export const normalizeHeader = h => String(h || '').toLowerCase().trim().replace(/\s+/g, '')

/** Find first column index whose header includes one of the aliases */
export const findColumn = (headers, aliases) => {
  const norm = headers.map(normalizeHeader)
  for (const alias of aliases) {
    const i = norm.findIndex(h => h.includes(normalizeHeader(alias)))
    if (i !== -1) return i
  }
  return -1
}

/** Safely read a cell; returns fallback if col === -1 */
export const readCell = (row, col, fallback = '') =>
  col >= 0 ? (row[col] ?? fallback) : fallback

/** Parse number from any cell value (handles comma-decimals) */
export const toNumber = v =>
  parseFloat(String(v || '').replace(/[^0-9.,-]/g, '').replace(',', '.')) || 0

export const toNum = toNumber   // alias used in some old imports

/** Excel serial date OR ISO string → ISO datetime string */
export const toDateTime = v => {
  if (!v) return new Date().toISOString()
  const s = String(v)
  if (/^\d{5,}$/.test(s)) {
    return new Date(Math.round((+s - 25569) * 86400 * 1000)).toISOString()
  }
  const d = new Date(s)
  return isNaN(d) ? new Date().toISOString() : d.toISOString()
}

/** Excel serial date OR any string → YYYY-MM-DD */
export const toDateOnly = v => {
  if (!v) return today()
  const s = String(v).trim()
  // Excel serial date
  if (/^\d{5,}$/.test(s)) {
    return new Date(Math.round((+s - 25569) * 86400 * 1000)).toISOString().slice(0, 10)
  }
  // DD.MM.YYYY format (old Russian/Uzbek Excel format, e.g. "10.05.2026")
  const dmy = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,'0')}-${dmy[1].padStart(2,'0')}`
  // ISO or any other parseable format
  const d = new Date(s)
  return isNaN(d) ? today() : d.toISOString().slice(0, 10)
}

export const toDate = toDateOnly   // alias

// ── Export helpers ────────────────────────────────────────────────────────────
export const exportOperations = (rows, tr, catName) => {
  const data = [
    [tr.branch, tr.date, tr.type, tr.category, tr.account, tr.amount, tr.description],
    ...rows.map(r => [
      r.branches?.name || '',
      new Date(r.created_at).toLocaleString('uz-UZ'),
      r.type,
      catName(r.categories),
      r.account,
      r.amount,
      r.note || ''
    ])
  ]
  downloadXLSX(`operatsiyalar-${today()}.xlsx`, [{
    name: 'Operatsiyalar',
    data,
    colWidths: [20, 18, 10, 22, 14, 14, 30]
  }])
}

export const exportOrders = (rows, tr) => {
  const n = num
  // DD.MM.YYYY formatida sana
  const fmtDate = d => d ? d.split('-').reverse().join('.') : ''

  // Sanasi bo'yicha guruhlash, so'ng shift_no bo'yicha
  const byDate = {}
  rows.forEach(r => {
    const date = r.order_date || r.created_at?.slice(0, 10) || ''
    if (!byDate[date]) byDate[date] = {}
    byDate[date][String(r.shift_no)] = r
  })

  const headers = [
    'Smena', 'Sana', 'Итого', 'Наличка',
    'Uzcard', 'Humo', 'Rahmat', 'Rxmt', 'Uzum', 'Yandex',
    'Расход', 'Жвачка (шт)', 'Излишка/Недостача'
  ]
  const dataRows = [headers]

  Object.keys(byDate).sort().forEach(date => {
    const s1 = byDate[date]['1'] || null
    const s2 = byDate[date]['2'] || null

    // Smena satri
    const shiftRow = (r, label) => {
      if (!r) return [label, fmtDate(date), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      const diff = n(r.cash_amount) - calcOrderExpected(r)
      return [
        label, fmtDate(date),
        n(r.total), n(r.cash_amount),
        n(r.uzcard), n(r.humo), n(r.rahmat), n(r.rxmt),
        n(r.uzum), n(r.yandex), n(r.expense), n(r.gum_count),
        diff
      ]
    }

    // ИТОГ satri
    const tTotal   = n(s1?.total)       + n(s2?.total)
    const tCash    = n(s1?.cash_amount) + n(s2?.cash_amount)
    const tUzcard  = n(s1?.uzcard)      + n(s2?.uzcard)
    const tHumo    = n(s1?.humo)        + n(s2?.humo)
    const tRahmat  = n(s1?.rahmat)      + n(s2?.rahmat)
    const tRxmt    = n(s1?.rxmt)        + n(s2?.rxmt)
    const tUzum    = n(s1?.uzum)        + n(s2?.uzum)
    const tYandex  = n(s1?.yandex)      + n(s2?.yandex)
    const tExpense = n(s1?.expense)     + n(s2?.expense)
    const tGum     = n(s1?.gum_count)   + n(s2?.gum_count)
    const tExpected = calcOrderExpected({
      total: tTotal, uzcard: tUzcard, humo: tHumo, rahmat: tRahmat,
      rxmt: tRxmt, uzum: tUzum, yandex: tYandex, expense: tExpense, gum_count: tGum
    })
    const tDiff = tCash - tExpected

    dataRows.push(shiftRow(s1, '1 смена'))
    dataRows.push(shiftRow(s2, '2 смена'))
    dataRows.push([
      'ИТОГ', fmtDate(date),
      tTotal, tCash, tUzcard, tHumo, tRahmat, tRxmt, tUzum, tYandex,
      tExpense, tGum, tDiff
    ])
  })

  downloadXLSX(`orderlar-${today()}.xlsx`, [{
    name: 'Orderlar',
    data: dataRows,
    colWidths: [10, 12, 14, 14, 12, 12, 12, 10, 12, 12, 12, 13, 18]
  }])
}
