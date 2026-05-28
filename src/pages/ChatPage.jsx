import { useEffect, useRef } from 'react'
import { avatarSrc } from '../utils'

export default function ChatPage({ tr, users, messages, me, chatUser, setChatUser, chatText, setChatText, send, markChatRead, isOnline }) {
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, chatUser])

  const chatMessages = messages.filter(m =>
    (m.sender_id === me?.id && m.receiver_id === chatUser) ||
    (m.sender_id === chatUser && m.receiver_id === me?.id)
  )
  const unreadFrom = uid => messages.filter(m => m.sender_id === uid && m.receiver_id === me?.id && !m.is_read).length

  function withDateDividers(msgs) {
    const result = []; let lastDate = ''
    msgs.forEach(m => {
      const d = m.created_at?.slice(0, 10)
      if (d !== lastDate) { result.push({ type: 'date', date: d }); lastDate = d }
      result.push({ type: 'msg', ...m })
    })
    return result
  }

  return (
    <div className="chatLayout">
      <div className="chatUsers">
        <div className="chatUsersTitle">💬 {tr.chat}</div>
        {users.map(u => (
          <button key={u.id} className={`chatUserBtn ${chatUser === u.id ? 'active' : ''}`}
            onClick={() => { setChatUser(u.id); markChatRead(u.id) }}>
            <div className="chatUserAvatar">
              <img src={avatarSrc(u)} alt="" />
              <span className={isOnline(u) ? 'onlineDot online' : 'onlineDot'} />
            </div>
            <div className="chatUserInfo">
              <b>{u.full_name || u.login}</b>
              <small>{isOnline(u) ? 'Online' : 'Offline'}</small>
            </div>
            {unreadFrom(u.id) > 0 && <em className="badge">{unreadFrom(u.id)}</em>}
          </button>
        ))}
      </div>
      <div className="chatMain">
        {!chatUser && <div className="chatEmpty">Foydalanuvchi tanlang</div>}
        {chatUser && (
          <>
            <div className="chatMessages">
              {withDateDividers(chatMessages).map((item, i) => {
                if (item.type === 'date') return <div key={`d-${i}`} className="chatDateDivider"><span>{item.date}</span></div>
                const mine = item.sender_id === me?.id
                return (
                  <div key={item.id} className={`chatBubble ${mine ? 'mine' : 'theirs'}`}>
                    <div className="bubbleText">{item.message}</div>
                    <div className="bubbleMeta">
                      {new Date(item.created_at).toLocaleTimeString('uz-UZ', { hour:'2-digit', minute:'2-digit' })}
                      {mine && <span>{item.is_read ? '✓✓' : '✓'}</span>}
                    </div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>
            <div className="chatInput">
              <input placeholder={`${tr.send}...`} value={chatText} onChange={e => setChatText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} />
              <button className="primary" onClick={send}>{tr.send}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}