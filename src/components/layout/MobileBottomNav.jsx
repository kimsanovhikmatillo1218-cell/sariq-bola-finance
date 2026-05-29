import {
  IconHome, IconShoppingBag, IconCash, IconChat, IconSettings
} from '../ui/Icons'

/* 5 most-used pages for bottom tab bar */
const TABS = [
  { key: 'dashboard',   Icon: IconHome,        label: 'Bosh' },
  { key: 'order',       Icon: IconShoppingBag, label: 'Order' },
  { key: 'cash',        Icon: IconCash,        label: 'Kassa' },
  { key: 'chat',        Icon: IconChat,        label: 'Chat' },
  { key: 'profile',     Icon: IconSettings,    label: 'Profil' },
]

export default function MobileBottomNav({ page, changePage, can, unreadCount }) {
  const visible = TABS.filter(t => can(t.key))
  if (visible.length < 2) return null
  return (
    <nav className="mobileBottomNav">
      {visible.map(({ key, Icon, label }) => (
        <button
          key={key}
          className={`mbnBtn ${page === key ? 'active' : ''}`}
          onClick={() => changePage(key)}
        >
          <span className="mbnIcon">
            <Icon size={20} />
            {key === 'chat' && unreadCount > 0 && (
              <span className="mbnBadge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </span>
          <span className="mbnLabel">{label}</span>
        </button>
      ))}
    </nav>
  )
}
