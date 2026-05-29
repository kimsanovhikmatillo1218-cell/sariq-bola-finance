import { useEffect, useState } from 'react'

/* type: 'success' | 'error' | 'info' | 'warning' */
export default function Toast({ message, type = 'success', duration = 2800, onClose }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!message) return
    setVisible(true)
    setLeaving(false)
    const leaveTimer  = setTimeout(() => setLeaving(true), duration - 350)
    const closeTimer  = setTimeout(() => { setVisible(false); onClose?.() }, duration)
    return () => { clearTimeout(leaveTimer); clearTimeout(closeTimer) }
  }, [message])

  if (!visible || !message) return null

  const icons = {
    success: (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9"  x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={2.4} />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="8.1" strokeWidth={2.5} />
        <line x1="12" y1="12" x2="12" y2="16" />
      </svg>
    ),
  }

  const colors = {
    success: { bg:'#22c55e', progress:'#16a34a' },
    error:   { bg:'#ef4444', progress:'#b91c1c' },
    warning: { bg:'#f59e0b', progress:'#d97706' },
    info:    { bg:'#3b82f6', progress:'#2563eb' },
  }
  const c = colors[type] || colors.info

  return (
    <div className={`toastNew ${leaving ? 'toastLeave' : 'toastEnter'}`}>
      <span className="toastIcon" style={{ color: c.bg }}>{icons[type]}</span>
      <span className="toastMsg">{message}</span>
      <button className="toastClose" onClick={() => { setLeaving(true); setTimeout(() => { setVisible(false); onClose?.() }, 350) }}>
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div className="toastProgress" style={{
        '--dur': `${duration}ms`,
        '--bar-color': c.bg
      }} />
    </div>
  )
}
