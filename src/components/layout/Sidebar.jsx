import { MODULES, ROLE_LABELS, LOGO } from '../../constants'
import { avatarSrc } from '../../utils'

export default function Sidebar({ user, page, can, tr, unreadCount, changePage, logout, mobileMenu, setMobileMenu }) {
  return (
    <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
      <button className="closeMenuBtn" onClick={() => setMobileMenu(false)}>✕</button>
      <div className="brand">
        <img src={LOGO} onError={e => { e.currentTarget.style.display = 'none' }} alt="" />
        <div><b>SARIQ BOLA</b><small>PIZZA</small></div>
      </div>
      <div className="profileMini" onClick={() => { changePage('profile'); setMobileMenu(false) }}>
        <img src={avatarSrc(user)} alt="" />
        <div>
          <b>{user.full_name}</b>
          <span>{ROLE_LABELS[user.role] || user.role}</span>
        </div>
      </div>
      <nav className="sideNav">
        {MODULES.filter(m => can(m)).map(m => (
          <button key={m} className={`navBtn ${page === m ? 'active' : ''}`}
            onClick={() => { changePage(m); setMobileMenu(false) }}>
            <span className="navLabel">{tr[m]}</span>
            {m === 'chat' && unreadCount > 0 && <em className="badge">{unreadCount}</em>}
          </button>
        ))}
      </nav>
      <button className="logoutBtn" onClick={logout}>{tr.logout}</button>
    </aside>
  )
}