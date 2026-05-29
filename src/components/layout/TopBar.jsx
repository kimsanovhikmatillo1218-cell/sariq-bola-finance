import { PERIOD_PAGES } from '../../constants'
import {
  IconBell, IconSun, IconMoon, IconDatabase, IconRefresh,
  IconX, IconChat, IconCash, IconClipboard, IconCheck, IconSearch
} from '../ui/Icons'

const NOTIF_ICONS = {
  chat:         <IconChat size={14} />,
  cash:         <IconCash size={14} />,
  orderReports: <IconClipboard size={14} />,
}
const NOTIF_COLORS = {
  chat:         '#fabd00',
  cash:         '#22c55e',
  orderReports: '#3b82f6',
}

export default function TopBar({
  page, tr, period, setPeriod, lang, setLang, theme, setTheme,
  isAdmin, notifications, notificationCount, notificationKey,
  showNotifications, openNotifications, changePage, markAllRead,
  setNotificationsSeenKey, exportAllData, loadAll, onOpenSearch
}) {
  return (
    <header className="topbar entrance">
      <div className="topbarInfo">
        <h1>{tr[page] || tr.welcome}</h1>
        <p>{new Date().toLocaleString('uz-UZ')}</p>
      </div>
      <div className="topActions">
        {PERIOD_PAGES.includes(page) && (
          <>
            <input type="date" value={period.start} onChange={e => setPeriod({ ...period, start: e.target.value })} />
            <input type="date" value={period.end}   onChange={e => setPeriod({ ...period, end: e.target.value })} />
          </>
        )}

        {/* Language selector */}
        <div className="langBox">
          <span className={`flagBadge ${lang === 'ru' ? 'ru' : lang === 'cy' ? 'cy' : 'uz'}`} />
          <select className="langSelect" value={lang} onChange={e => setLang(e.target.value)}>
            <option value="uz">UZ</option>
            <option value="cy">ЎЗ</option>
            <option value="ru">RU</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="notificationWrap">
          <button className={`iconBtn notificationButton ${notificationCount > 0 ? 'hasNew' : ''}`} onClick={openNotifications} title="Bildirishnomalar">
            <IconBell size={17} />
            <span>Bildirishnoma</span>
            {notificationCount > 0 && <em className="topBadge">{notificationCount}</em>}
          </button>
          {showNotifications && (
            <div className="notificationPanel">
              <div className="notifHeader">
                <b>Bildirishnomalar</b>
                <button className="notifClose" onClick={openNotifications} title="Yopish">
                  <IconX size={14} />
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="notifEmpty">
                  <IconBell size={28} />
                  <span>Bildirishnomalar yo'q</span>
                </div>
              ) : (
                <div className="notifList">
                  {notifications.map(n => (
                    <button className="notificationItem" key={n.id} onClick={() => {
                      changePage(n.page)
                      if (n.page === 'chat') markAllRead()
                      localStorage.setItem('finance_notifications_seen_key', notificationKey)
                      setNotificationsSeenKey(notificationKey)
                      openNotifications()
                    }}>
                      <span className="notifIcon" style={{ background: `${NOTIF_COLORS[n.page] || '#94a3b8'}22`, color: NOTIF_COLORS[n.page] || '#94a3b8' }}>
                        {NOTIF_ICONS[n.page] || <IconBell size={14} />}
                      </span>
                      <div className="notifBody">
                        <strong>{n.title}</strong>
                        <span>{n.text}</span>
                      </div>
                      <span className="notifArrow">›</span>
                    </button>
                  ))}
                </div>
              )}

              {notifications.length > 0 && (
                <button className="notifMarkAll" onClick={() => {
                  markAllRead()
                  localStorage.setItem('finance_notifications_seen_key', notificationKey)
                  setNotificationsSeenKey(notificationKey)
                  openNotifications()
                }}>
                  <IconCheck size={13} /> Hammasini o'qildi deb belgilash
                </button>
              )}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          className={`themeSwitch ${theme === 'dark' ? 'active' : ''}`}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          title={theme === 'light' ? "Qorong'u rejim" : "Yorug' rejim"}
        >
          <span className="themeKnob">
            {theme === 'light' ? <IconSun size={14} /> : <IconMoon size={14} />}
          </span>
        </button>

        {/* Backup */}
        {isAdmin && (
          <button className="secondary backupBtn" onClick={exportAllData} title="Backup">
            <IconDatabase size={16} />
            <span>Backup</span>
          </button>
        )}

        {/* Search / Command palette */}
        {onOpenSearch && (
          <button className="secondary cmdTrigger" onClick={onOpenSearch} title="Sahifa qidirish (Ctrl+K)">
            <IconSearch size={15} />
            <span className="cmdTriggerHint">Ctrl+K</span>
          </button>
        )}

        {/* Refresh */}
        <button className="refreshBtn" onClick={loadAll} title={tr.refresh}>
          <IconRefresh size={16} />
          <span>{tr.refresh}</span>
        </button>
      </div>
    </header>
  )
}
