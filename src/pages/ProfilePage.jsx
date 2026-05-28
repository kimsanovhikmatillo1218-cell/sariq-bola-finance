import { useState, useEffect } from 'react'
import Panel from '../components/ui/Panel'
import Field from '../components/ui/Field'
import Select from '../components/ui/Select'
import { avatarSrc } from '../utils'

export default function ProfilePage({ tr, profile, setProfile, lang, setLang, theme, setTheme, save, uploadAvatar, isAdmin, company, saveCompany, testTelegram, deleteCompany }) {
  const [tgForm, setTgForm] = useState({ telegram_token: '', telegram_chat_id: company?.telegram_chat_id || '' })
  const [tgEdit, setTgEdit] = useState(!company?.telegram_chat_id)

  useEffect(() => {
    setTgForm({ telegram_token: '', telegram_chat_id: company?.telegram_chat_id || '' })
    setTgEdit(!company?.telegram_chat_id)
  }, [company?.telegram_chat_id])

  const isSaved = !!company?.telegram_chat_id && !tgEdit

  return (
    <Panel title={tr.profile}>
      <div className="profileLayout">
        <label className="avatarEditWrap" title={tr.uploadPhoto || 'Rasm yuklash'}>
          <img src={avatarSrc(profile)} alt="avatar" />
          <div className="avatarEditOverlay">
            <span>📷</span>
            <small>TAHRIRLASH</small>
          </div>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadAvatar} />
        </label>

        <div className="profileRight">
          <div className="grid">
            <Field label={tr.fullName} value={profile.full_name} set={v => setProfile({ ...profile, full_name: v })} />
            <Field label="Telefon" value={profile.phone || ''} set={v => setProfile({ ...profile, phone: v })} />
            <Select label="Til / Язык" value={lang} set={setLang}
              opts={['uz', 'cy', 'ru']}
              display={v => v === 'uz' ? "O'zbek (Lotin)" : v === 'cy' ? 'Ўзбек (Кирилл)' : 'Русский'} />
            <Select label="Tema" value={theme} set={setTheme}
              opts={['light', 'dark']}
              display={v => v === 'light' ? "☀️ Yorug'" : "🌙 Qorong'u"} />
          </div>
          <button className="primary" style={{ marginTop: 14 }} onClick={save}>💾 {tr.save}</button>
        </div>
      </div>

      {isAdmin && (
        <div className="telegramSection">
          <h3>🤖 Telegram Bot Sozlamalari</h3>
          <p className="telegramHint">2-smena saqlanganida avtomatik hisobot yuboriladi</p>

          {isSaved ? (
            <div className="tgSavedBox">
              <div className="tgConnectedBadge">✅ Bot ulangan va faol</div>
              <div className="tgMasked">
                <div><span>Token:</span><b>Serverda saqlangan 🔒</b></div>
                <div><span>Chat ID:</span><b>{company.telegram_chat_id}</b></div>
              </div>
              <div className="actions" style={{ marginTop: 12 }}>
                <button className="secondary" onClick={() => setTgEdit(true)}>✏️ Tahrirlash</button>
                <button className="secondary" onClick={() => testTelegram({ ...tgForm, telegram_chat_id: company?.telegram_chat_id || tgForm.telegram_chat_id })}>📨 Test yuborish</button>
                <button className="dangerBtn" onClick={deleteCompany}>🗑 O'chirish</button>
              </div>
            </div>
          ) : (
            <div className="tgEditBox">
              {company?.telegram_chat_id && (
                <div className="tgWarning">⚠️ Mavjud token serverda saqlangan. Yangi token kiritsangiz almashtiriladi.</div>
              )}
              <div className="grid">
                <Field label="🔑 Bot Token" value={tgForm.telegram_token} set={v => setTgForm({ ...tgForm, telegram_token: v })} placeholder="1234567890:AAFxxxxxxxxxxxxxxxx" />
                <Field label="💬 Chat ID (Guruh ID)" value={tgForm.telegram_chat_id} set={v => setTgForm({ ...tgForm, telegram_chat_id: v })} placeholder="-1001234567890" />
              </div>
              <div className="tgHelpText">
                💡 Guruh uchun Chat ID manfiy son bo'ladi, masalan: <code>-1001234567890</code>
              </div>
              <div className="actions" style={{ marginTop: 14 }}>
                <button className="primary" onClick={() => saveCompany(tgForm)}>💾 Saqlash</button>
                <button className="secondary" onClick={() => testTelegram(tgForm)}>📨 Test yuborish</button>
                {company?.telegram_chat_id && (
                  <button className="secondary" onClick={() => setTgEdit(false)}>✕ Bekor qilish</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}
