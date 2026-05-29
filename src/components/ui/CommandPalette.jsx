import { useState, useEffect, useRef, useMemo } from 'react'
import {
  IconHome, IconBarChart, IconClipboard, IconShoppingBag, IconArrowUpDown,
  IconHistory, IconFileText, IconCash, IconUsers, IconDollarSign,
  IconArchive, IconTag, IconBranch, IconUserCog, IconChat, IconSettings, IconSearch
} from './Icons'

const ALL_PAGES = [
  { key: 'dashboard',     Icon: IconHome,        section: 'Asosiy' },
  { key: 'salesAnalytics',Icon: IconBarChart,     section: 'Asosiy' },
  { key: 'order',         Icon: IconShoppingBag,  section: 'Savdo' },
  { key: 'orderReports',  Icon: IconClipboard,    section: 'Savdo' },
  { key: 'operation',     Icon: IconArrowUpDown,  section: 'Savdo' },
  { key: 'history',       Icon: IconHistory,      section: 'Savdo' },
  { key: 'reports',       Icon: IconFileText,     section: 'Moliya' },
  { key: 'cash',          Icon: IconCash,         section: 'Moliya' },
  { key: 'payroll',       Icon: IconDollarSign,   section: 'Moliya' },
  { key: 'payrollArchive',Icon: IconArchive,      section: 'Moliya' },
  { key: 'employees',     Icon: IconUsers,        section: 'Boshqaruv' },
  { key: 'categories',    Icon: IconTag,          section: 'Boshqaruv' },
  { key: 'branches',      Icon: IconBranch,       section: 'Boshqaruv' },
  { key: 'users',         Icon: IconUserCog,      section: 'Boshqaruv' },
  { key: 'chat',          Icon: IconChat,         section: 'Tizim' },
  { key: 'profile',       Icon: IconSettings,     section: 'Tizim' },
]

export default function CommandPalette({ open, onClose, changePage, can, tr }) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)
  const listRef  = useRef(null)

  const items = useMemo(() => {
    const q = query.toLowerCase().trim()
    return ALL_PAGES.filter(p => {
      if (!can(p.key)) return false
      if (!q) return true
      const label = (tr[p.key] || p.key).toLowerCase()
      return label.includes(q) || p.section.toLowerCase().includes(q)
    })
  }, [query, can, tr])

  useEffect(() => { if (open) { setQuery(''); setCursor(0); setTimeout(() => inputRef.current?.focus(), 30) } }, [open])
  useEffect(() => { setCursor(0) }, [query])

  const go = item => { changePage(item.key); onClose() }

  const handleKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, items.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
    if (e.key === 'Enter' && items[cursor]) go(items[cursor])
    if (e.key === 'Escape') onClose()
  }

  // Auto scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[cursor]
    el?.scrollIntoView({ block:'nearest' })
  }, [cursor])

  if (!open) return null

  return (
    <div className="cmdPaletteOverlay" onClick={onClose}>
      <div className="cmdPalette" onClick={e => e.stopPropagation()}>
        <div className="cmdSearch">
          <IconSearch size={16} />
          <input
            ref={inputRef}
            placeholder="Sahifa qidiring... (Ctrl+K)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
          />
          <kbd onClick={onClose}>Esc</kbd>
        </div>
        <div className="cmdList" ref={listRef}>
          {items.length === 0 && (
            <div className="cmdEmpty">Hech narsa topilmadi</div>
          )}
          {items.map((item, i) => {
            const { Icon } = item
            return (
              <button
                key={item.key}
                className={`cmdItem ${i === cursor ? 'active' : ''}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => go(item)}
              >
                <span className="cmdItemIcon"><Icon size={16} /></span>
                <span className="cmdItemLabel">{tr[item.key] || item.key}</span>
                <span className="cmdItemSection">{item.section}</span>
              </button>
            )
          })}
        </div>
        <div className="cmdFooter">
          <span><kbd>↑↓</kbd> Ko'chirish</span>
          <span><kbd>Enter</kbd> Ochish</span>
          <span><kbd>Esc</kbd> Yopish</span>
        </div>
      </div>
    </div>
  )
}
