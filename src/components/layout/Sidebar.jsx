import { MODULES, ROLE_LABELS, LOGO } from '../../constants'
import { avatarSrc } from '../../utils'
import {
  IconHome, IconBarChart, IconClipboard, IconShoppingBag, IconArrowUpDown,
  IconHistory, IconFileText, IconCash, IconUsers, IconDollarSign,
  IconArchive, IconTag, IconBranch, IconUserCog, IconChat, IconSettings
} from '../ui/Icons'

const NAV_ICONS = {
  dashboard:      IconHome,
  salesAnalytics: IconBarChart,
  orderReports:   IconClipboard,
  order:          IconShoppingBag,
  operation:      IconArrowUpDown,
  history:        IconHistory,
  reports:        IconFileText,
  cash:           IconCash,
  employees:      IconUsers,
  payroll:        IconDollarSign,
  payrollArchive: IconArchive,
  categories:     IconTag,
  branches:       IconBranch,
  users:          IconUserCog,
  chat:           IconChat,
  profile:        IconSettings,
}

/* Section dividers — shown only if at least one item in group is visible */
const SECTIONS = [
  { label: 'Asosiy',     items: ['dashboard', 'salesAnalytics'] },
  { label: 'Savdo',      items: ['order', 'orderReports', 'operation', 'history'] },
  { label: 'Moliya',     items: ['reports', 'cash', 'payroll', 'payrollArchive'] },
  { label: 'Boshqaruv',  items: ['employees', 'categories', 'branches', 'users'] },
  { label: 'Tizim',      items: ['chat', 'profile'] },
]

export default function Sidebar({ user, page, can, tr, unreadCount, changePage, logout, mobileMenu, setMobileMenu }) {
  return (
    <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
      <button className="closeMenuBtn" onClick={() => setMobileMenu(false)}>✕</button>

      {/* ── Brand ── */}
      <div className="brand">
        <img src={LOGO} onError={e => { e.currentTarget.style.display = 'none' }} alt="" />
        <div><b>SARIQ BOLA</b><small>PIZZA</small></div>
      </div>

      {/* ── Profile mini ── */}
      <div className="profileMini" onClick={() => { changePage('profile'); setMobileMenu(false) }}>
        <img src={avatarSrc(user)} alt="" />
        <div>
          <b>{user.full_name}</b>
          <span>{ROLE_LABELS[user.role] || user.role}</span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="sideNav">
        {SECTIONS.map(section => {
          const visible = section.items.filter(m => can(m))
          if (!visible.length) return null
          return (
            <div key={section.label}>
              <div className="navSection">{section.label}</div>
              {visible.map(m => {
                const Icon = NAV_ICONS[m]
                return (
                  <button key={m} className={`navBtn ${page === m ? 'active' : ''}`}
                    onClick={() => { changePage(m); setMobileMenu(false) }}>
                    {Icon && (
                      <span className="navIcon">
                        <Icon size={15} />
                      </span>
                    )}
                    <span className="navLabel">{tr[m]}</span>
                    {m === 'chat' && unreadCount > 0 && <em className="badge">{unreadCount}</em>}
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* ── Logout ── */}
      <button className="logoutBtn" onClick={logout}>
        <svg viewBox="0 0 24 24" width={15} height={15} fill="none"
          stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        {tr.logout}
      </button>
    </aside>
  )
}
