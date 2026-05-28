import { PERIOD_PAGES } from '../../constants'
import { IconBell, IconSun, IconMoon, IconDatabase, IconRefresh } from '../ui/Icons'

export default function TopBar({
  page, tr, period, setPeriod, lang, setLang, theme, setTheme,
  isAdmin, notifications, notificationCount, notificationKey,
  showNotifications, openNotifications, changePage, markAllRead,
  setNotificationsSeenKey, exportAllData, loadAll
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
          <button className="iconBtn notificationButton" onClick={openNotifications} title="Bildirishnomalar">
            <IconBell size={17} />
            <span>Bildirishnoma</span>
            {notificationCount > 0 && <em className="topBadge">{notificationCount}</em>}
          </button>
          {showNotifications && (
            <div className="notificationPanel">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:9 }}>
                <b>Bildirishnomalar</b>
                <button onClick={openNotifications} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:16, padding:'2px 6px', borderRadius:8, cursor:'pointer' }}>✕</button>
              </div>
              {notifications.length === 0 && <p>Yangi bildirishnoma yo'q</p>}
              {notifications.map(n => (
                <button className="notificationItem" key={n.id} onClick={() => {
                  changePage(n.page)
                  if (n.page === 'chat') markAllRead()
                  localStorage.setItem('finance_notifications_seen_key', notificationKey)
                  setNotificationsSeenKey(notificationKey)
                  openNotifications()
                }}>
                  <strong>{n.title}</strong><span>{n.text}</span>
                </button>
              ))}
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

        {/* Refresh */}
        <button className="refreshBtn" onClick={loadAll} title={tr.refresh}>
          <IconRefresh size={16} />
          <span>{tr.refresh}</span>
        </button>
      </div>
    </header>
  )
}
