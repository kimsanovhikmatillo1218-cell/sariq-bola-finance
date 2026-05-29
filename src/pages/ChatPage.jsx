import { useEffect, useRef, useState } from 'react'
import { avatarSrc } from '../utils'
import { IconSend, IconCamera, IconX } from '../components/ui/Icons'

/* Detect special message types */
function parseMessage(msg) {
  if (!msg) return { type: 'text', content: msg }
  if (msg.startsWith('[img]:'))  return { type: 'image', content: msg.slice(6) }
  if (msg.startsWith('[vid]:'))  return { type: 'video', content: msg.slice(6) }
  return { type: 'text', content: msg }
}

function MessageContent({ msg }) {
  const { type, content } = parseMessage(msg)
  if (type === 'image') {
    return (
      <a href={content} target="_blank" rel="noopener noreferrer" className="chatMediaLink">
        <img src={content} alt="rasm" className="chatMediaImg" loading="lazy" />
      </a>
    )
  }
  if (type === 'video') {
    return (
      <video src={content} controls className="chatMediaVideo" />
    )
  }
  return <span className="bubbleText">{content}</span>
}

/* Read receipt checkmarks */
function ReadTick({ isRead }) {
  return (
    <svg viewBox="0 0 16 10" width={16} height={10} fill="none"
      className={`readTick ${isRead ? 'read' : 'sent'}`}>
      {isRead ? (
        <>
          <polyline points="1 5 5 9 15 1" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="5 5 9 9 15 1" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
        </>
      ) : (
        <polyline points="1 5 5 9 15 1" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
  )
}

/* Media preview before send */
function MediaPreview({ file, onRemove }) {
  const url = URL.createObjectURL(file)
  const isVideo = file.type?.startsWith('video/')
  return (
    <div className="chatMediaPreview">
      {isVideo
        ? <video src={url} className="chatMediaPreviewItem" />
        : <img src={url} alt="" className="chatMediaPreviewItem" />
      }
      <button className="chatMediaRemove" onClick={onRemove}><IconX size={14} /></button>
    </div>
  )
}

export default function ChatPage({ tr, users, messages, me, chatUser, setChatUser, chatText, setChatText, send, sendMedia, markChatRead, isOnline }) {
  const endRef    = useRef(null)
  const fileRef   = useRef(null)
  const inputRef  = useRef(null)
  const [pendingFile, setPendingFile] = useState(null)
  const [sending, setSending] = useState(false)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, chatUser])

  const chatMessages = messages.filter(m =>
    (m.sender_id === me?.id && m.receiver_id === chatUser) ||
    (m.sender_id === chatUser && m.receiver_id === me?.id)
  )
  const unreadFrom = uid => messages.filter(m => m.sender_id === uid && m.receiver_id === me?.id && !m.is_read).length
  const activeChatUser = users.find(u => u.id === chatUser)

  function withDateDividers(msgs) {
    const result = []; let lastDate = ''
    msgs.forEach(m => {
      const d = m.created_at?.slice(0, 10)
      if (d !== lastDate) { result.push({ type: 'date', date: d }); lastDate = d }
      result.push({ type: 'msg', ...m })
    })
    return result
  }

  const handleSend = async () => {
    if (sending) return
    setSending(true)
    try {
      if (pendingFile) {
        await sendMedia(pendingFile)
        setPendingFile(null)
      } else if (chatText.trim()) {
        await send()
      }
    } finally { setSending(false) }
    inputRef.current?.focus()
  }

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleFileChange = e => {
    const file = e.target.files?.[0]
    if (file) setPendingFile(file)
    e.target.value = ''
  }

  const canSend = (pendingFile || chatText.trim()) && !sending

  return (
    <div className="chatLayout">

      {/* ── User list ── */}
      <div className="chatUsers">
        <div className="chatUsersTitle">
          <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.85} strokeLinecap="round" strokeLinejoin="round" style={{ opacity:.7 }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {tr.chat}
        </div>
        {users.map(u => (
          <button key={u.id} className={`chatUserBtn ${chatUser === u.id ? 'active' : ''}`}
            onClick={() => { setChatUser(u.id); markChatRead(u.id) }}>
            <div className="chatUserAvatar">
              <img src={avatarSrc(u)} alt="" />
              <span className={isOnline(u) ? 'onlineDot online' : 'onlineDot'} />
            </div>
            <div className="chatUserInfo">
              <b>{u.full_name || u.login}</b>
              <small className={isOnline(u) ? 'onlineText' : ''}>{isOnline(u) ? 'Online' : 'Offline'}</small>
            </div>
            {unreadFrom(u.id) > 0 && <em className="badge">{unreadFrom(u.id)}</em>}
          </button>
        ))}
      </div>

      {/* ── Chat main area ── */}
      <div className="chatMain">
        {!chatUser && (
          <div className="chatEmpty">
            <svg viewBox="0 0 24 24" width={48} height={48} fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" style={{ opacity:.25 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Foydalanuvchi tanlang</span>
          </div>
        )}

        {chatUser && activeChatUser && (
          <>
            {/* Chat header */}
            <div className="chatHeader">
              <div className="chatHeaderAvatar">
                <img src={avatarSrc(activeChatUser)} alt="" />
                <span className={isOnline(activeChatUser) ? 'onlineDot online' : 'onlineDot'} />
              </div>
              <div className="chatHeaderInfo">
                <b>{activeChatUser.full_name || activeChatUser.login}</b>
                <small className={isOnline(activeChatUser) ? 'onlineText' : ''}>
                  {isOnline(activeChatUser) ? 'Online' : 'Offline'}
                </small>
              </div>
            </div>

            {/* Messages */}
            <div className="chatMessages">
              {chatMessages.length === 0 && (
                <div className="chatMessagesEmpty">
                  <span>Xabarlar yo'q. Birinchi bo'lib yozing!</span>
                </div>
              )}
              {withDateDividers(chatMessages).map((item, i) => {
                if (item.type === 'date') return (
                  <div key={`d-${i}`} className="chatDateDivider"><span>{item.date}</span></div>
                )
                const mine = item.sender_id === me?.id
                const { type } = parseMessage(item.message)
                return (
                  <div key={item.id} className={`chatBubble ${mine ? 'mine' : 'theirs'} ${type !== 'text' ? 'mediaBubble' : ''}`}>
                    <MessageContent msg={item.message} />
                    <div className="bubbleMeta">
                      <span className="bubbleTime">
                        {new Date(item.created_at).toLocaleTimeString('uz-UZ', { hour:'2-digit', minute:'2-digit' })}
                      </span>
                      {mine && <ReadTick isRead={item.is_read} />}
                    </div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>

            {/* Input area */}
            <div className="chatInputWrap">
              {pendingFile && (
                <MediaPreview file={pendingFile} onRemove={() => setPendingFile(null)} />
              )}
              <div className="chatInput">
                <button className="chatAttachBtn" title="Rasm/Video" onClick={() => fileRef.current?.click()}>
                  <IconCamera size={18} />
                </button>
                <input
                  ref={inputRef}
                  placeholder={pendingFile ? "Izoh qo'shing yoki yuboring…" : `Xabar yozing…`}
                  value={chatText}
                  onChange={e => setChatText(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={sending}
                />
                <button
                  className={`chatSendBtn ${canSend ? 'active' : ''}`}
                  onClick={handleSend}
                  disabled={!canSend}
                >
                  <IconSend size={18} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  style={{ display:'none' }}
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
