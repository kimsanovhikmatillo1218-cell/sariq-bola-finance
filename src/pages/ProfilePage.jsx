import { useState, useEffect, useRef, useCallback } from 'react'
import Panel from '../components/ui/Panel'
import Field from '../components/ui/Field'
import Select from '../components/ui/Select'
import { avatarSrc } from '../utils'
import {
  IconSave, IconCamera, IconRobot, IconSend, IconEdit, IconTrash,
  IconCheck, IconX, IconBuilding, IconKey, IconPlus
} from '../components/ui/Icons'

/* ── per-branch telegram card ─────────────────────────────────────── */
function BranchTgCard({ branch, config, globalToken, onSave, onDelete, onTest }) {
  const connected = !!(config?.telegram_chat_id)
  const [edit, setEdit]     = useState(!connected)
  const [form, setForm]     = useState({ telegram_token: '', telegram_chat_id: config?.telegram_chat_id || '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setEdit(!connected)
    setForm({ telegram_token: '', telegram_chat_id: config?.telegram_chat_id || '' })
  }, [connected, config?.telegram_chat_id])

  const handleSave = async () => {
    setSaving(true)
    await onSave(branch.id, form)
    setSaving(false)
  }
  const handleTest = async () => {
    await onTest(branch.id, { ...form, telegram_chat_id: form.telegram_chat_id || config?.telegram_chat_id })
  }

  return (
    <div className={`branchTgCard ${connected && !edit ? 'connected' : 'editing'}`}>
      {/* header */}
      <div className="branchTgHeader">
        <div className="branchTgName">
          <IconBuilding size={15} />
          <strong>{branch.name}</strong>
          <span className="branchCode">{branch.code}</span>
        </div>
        <span className={`branchTgBadge ${connected ? 'on' : 'off'}`}>
          {connected ? <><IconCheck size={12} /> Ulangan</> : <><IconX size={12} /> Ulanmagan</>}
        </span>
      </div>

      {/* connected + not editing */}
      {connected && !edit && (
        <div className="branchTgInfo">
          <div className="branchTgRow">
            <span>Chat ID</span>
            <b>{config.telegram_chat_id}</b>
          </div>
          {config.telegram_token && (
            <div className="branchTgRow">
              <span>Token</span>
              <b>Alohida token saqlangan 🔒</b>
            </div>
          )}
          {!config.telegram_token && globalToken && (
            <div className="branchTgRow muted">
              <span>Token</span>
              <b>Global token ishlatilmoqda</b>
            </div>
          )}
          <div className="branchTgActions">
            <button className="secondary" onClick={() => setEdit(true)}><IconEdit size={14} /> Tahrirlash</button>
            <button className="secondary" onClick={handleTest}><IconSend size={14} /> Test</button>
            <button className="dangerBtn" onClick={() => onDelete(branch.id)}><IconTrash size={14} /></button>
          </div>
        </div>
      )}

      {/* editing / not connected */}
      {edit && (
        <div className="branchTgForm">
          <div className="branchTgHint">
            <IconKey size={13} />
            <span>
              Bot Token bo'sh qolsa — yuqoridagi Global Token ishlatiladi.
              Chat ID shu filial guruhining ID si.
            </span>
          </div>
          <div className="grid" style={{ gridTemplateColumns:'1fr 1fr' }}>
            <Field
              label="Bot Token (ixtiyoriy)"
              value={form.telegram_token}
              set={v => setForm(f => ({ ...f, telegram_token: v }))}
              placeholder="1234567890:AAFxxx... (bo'sh = global)"
            />
            <Field
              label="Chat ID (majburiy)"
              value={form.telegram_chat_id}
              set={v => setForm(f => ({ ...f, telegram_chat_id: v }))}
              placeholder="-1001234567890"
            />
          </div>
          <div className="actions" style={{ marginTop: 12 }}>
            <button className="primary" onClick={handleSave} disabled={saving || !form.telegram_chat_id}>
              <IconSave size={15} /> {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
            <button className="secondary" onClick={handleTest} disabled={!form.telegram_chat_id && !config?.telegram_chat_id}>
              <IconSend size={15} /> Test
            </button>
            {connected && (
              <button className="secondary" onClick={() => setEdit(false)}><IconX size={15} /> Bekor</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Canvas Avatar Cropper ───────────────────────────────────────── */
const CROP_SIZE = 320
function AvatarCropModal({ file, onConfirm, onCancel }) {
  const canvasRef   = useRef(null)
  const imgRef      = useRef(null)
  const dragRef     = useRef(null)
  const [pos, setPos]   = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      const fit = Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height)
      const w = img.width * fit, h = img.height * fit
      setImgSize({ w, h })
      setPos({ x: (CROP_SIZE - w) / 2, y: (CROP_SIZE - h) / 2 })
      setScale(1)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas || !imgRef.current) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE)
    const w = imgSize.w * scale, h = imgSize.h * scale
    ctx.drawImage(imgRef.current, pos.x, pos.y, w, h)
    // Dark overlay outside circle
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,.5)'
    ctx.fillRect(0, 0, CROP_SIZE, CROP_SIZE)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(CROP_SIZE/2, CROP_SIZE/2, CROP_SIZE/2, 0, Math.PI*2)
    ctx.fill()
    ctx.restore()
    // Circle border
    ctx.beginPath()
    ctx.arc(CROP_SIZE/2, CROP_SIZE/2, CROP_SIZE/2 - 1, 0, Math.PI*2)
    ctx.strokeStyle = 'rgba(250,189,0,.8)'; ctx.lineWidth = 2.5; ctx.stroke()
  }, [pos, scale, imgSize])

  useEffect(() => { draw() }, [draw])

  // Mouse/touch drag
  const startDrag = useCallback((clientX, clientY) => {
    dragRef.current = { startX: clientX - pos.x, startY: clientY - pos.y }
  }, [pos])

  const onMouseDown = e => startDrag(e.clientX, e.clientY)
  const onMouseMove = e => {
    if (!dragRef.current) return
    setPos({ x: e.clientX - dragRef.current.startX, y: e.clientY - dragRef.current.startY })
  }
  const onMouseUp = () => { dragRef.current = null }

  const onTouchStart = e => {
    const t = e.touches[0]; startDrag(t.clientX, t.clientY)
  }
  const onTouchMove = e => {
    e.preventDefault()
    if (!dragRef.current) return
    const t = e.touches[0]
    setPos({ x: t.clientX - dragRef.current.startX, y: t.clientY - dragRef.current.startY })
  }

  const onWheel = e => {
    e.preventDefault()
    setScale(s => Math.max(0.5, Math.min(4, s - e.deltaY * 0.002)))
  }

  const handleConfirm = () => {
    const canvas = canvasRef.current; if (!canvas) return
    // Draw final crop as a clean circle
    const out = document.createElement('canvas')
    out.width = out.height = CROP_SIZE
    const ctx = out.getContext('2d')
    ctx.beginPath()
    ctx.arc(CROP_SIZE/2, CROP_SIZE/2, CROP_SIZE/2, 0, Math.PI*2)
    ctx.clip()
    const w = imgSize.w * scale, h = imgSize.h * scale
    ctx.drawImage(imgRef.current, pos.x, pos.y, w, h)
    out.toBlob(blob => { if (blob) onConfirm(new File([blob], 'avatar.jpg', { type:'image/jpeg' })) }, 'image/jpeg', 0.92)
  }

  return (
    <div className="cropModalOverlay">
      <div className="cropModal">
        <div className="cropModalTitle">Rasmni qirqish</div>
        <div className="cropCanvasWrap">
          <canvas
            ref={canvasRef} width={CROP_SIZE} height={CROP_SIZE}
            className="cropCanvas"
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp}
            onWheel={onWheel}
          />
        </div>
        <div className="cropZoomRow">
          <span>Kichraytirish</span>
          <input type="range" min={50} max={400} value={Math.round(scale*100)}
            onChange={e => setScale(e.target.value / 100)} />
          <span>Kattalashtirish</span>
        </div>
        <p className="cropHint">Rasmni suring yoki zoom qiling — doira ichidagi qism saqlanadi</p>
        <div className="cropActions">
          <button className="primary" onClick={handleConfirm}>
            <IconCheck size={15} /> Saqlash
          </button>
          <button className="secondary" onClick={onCancel}>
            <IconX size={14} /> Bekor
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── main ProfilePage ─────────────────────────────────────────────── */
export default function ProfilePage({
  tr, profile, setProfile, lang, setLang, theme, setTheme,
  save, uploadAvatar, isAdmin, company, saveCompany, testTelegram,
  deleteCompany, branches, branchTelegrams,
  saveBranchTelegram, deleteBranchTelegram, testBranchTelegram
}) {
  const [tgForm, setTgForm] = useState({ telegram_token: '', telegram_chat_id: company?.telegram_chat_id || '' })
  const [tgEdit, setTgEdit] = useState(!company?.telegram_chat_id)
  const [cropFile, setCropFile] = useState(null)

  useEffect(() => {
    setTgForm({ telegram_token: '', telegram_chat_id: company?.telegram_chat_id || '' })
    setTgEdit(!company?.telegram_chat_id)
  }, [company?.telegram_chat_id])

  const isSaved = !!company?.telegram_chat_id && !tgEdit

  const handleAvatarChange = e => {
    const file = e.target.files?.[0]
    if (file) setCropFile(file)
    e.target.value = ''
  }

  const handleCropConfirm = async (croppedFile) => {
    setCropFile(null)
    await uploadAvatar(croppedFile)
  }

  return (
    <Panel title={tr.profile}>
      {cropFile && (
        <AvatarCropModal
          file={cropFile}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropFile(null)}
        />
      )}
      {/* ── Avatar + personal info ─── */}
      <div className="profileLayout">
        <label className="avatarEditWrap" title={tr.uploadPhoto || 'Rasm yuklash'}>
          <img src={avatarSrc(profile)} alt="avatar" />
          <div className="avatarEditOverlay">
            <IconCamera size={22} />
            <small>TAHRIRLASH</small>
          </div>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
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
              display={v => v === 'light' ? "Yorug' rejim" : "Qorong'u rejim"} />
          </div>
          <button className="primary" style={{ marginTop: 14, display:'flex', alignItems:'center', gap:7 }} onClick={save}>
            <IconSave size={16} /> {tr.save}
          </button>
        </div>
      </div>

      {/* ── Global Telegram bot ─── */}
      {isAdmin && (
        <div className="telegramSection">
          <h3 style={{ display:'flex', alignItems:'center', gap:8 }}>
            <IconRobot size={18} />
            Global Telegram Bot
          </h3>
          <p className="telegramHint">
            Barcha filiallarga umumiy bot. Filial bot tokeni bo'sh bo'lsa shu ishlatiladi.
          </p>

          {isSaved ? (
            <div className="tgSavedBox">
              <div className="tgConnectedBadge"><IconCheck size={13} /> Bot ulangan va faol</div>
              <div className="tgMasked">
                <div><span>Token</span><b>Serverda saqlangan 🔒</b></div>
                <div><span>Chat ID</span><b>{company.telegram_chat_id}</b></div>
              </div>
              <div className="actions" style={{ marginTop: 12 }}>
                <button className="secondary" onClick={() => setTgEdit(true)}><IconEdit size={14} /> Tahrirlash</button>
                <button className="secondary" onClick={() => testTelegram({ ...tgForm, telegram_chat_id: company?.telegram_chat_id || tgForm.telegram_chat_id })}>
                  <IconSend size={14} /> Test
                </button>
                <button className="dangerBtn" onClick={deleteCompany}><IconTrash size={14} /> O'chirish</button>
              </div>
            </div>
          ) : (
            <div className="tgEditBox">
              {company?.telegram_chat_id && (
                <div className="tgWarning">⚠️ Mavjud token serverda saqlangan. Yangi token kiritsangiz almashtiriladi.</div>
              )}
              <div className="grid">
                <Field label="Bot Token" value={tgForm.telegram_token} set={v => setTgForm({ ...tgForm, telegram_token: v })} placeholder="1234567890:AAFxxxxxxxxxxxxxxxx" />
                <Field label="Chat ID (Guruh ID)" value={tgForm.telegram_chat_id} set={v => setTgForm({ ...tgForm, telegram_chat_id: v })} placeholder="-1001234567890" />
              </div>
              <div className="tgHelpText">
                💡 Guruh uchun Chat ID manfiy son bo'ladi: <code>-1001234567890</code>
              </div>
              <div className="actions" style={{ marginTop: 14 }}>
                <button className="primary" style={{ display:'flex', alignItems:'center', gap:7 }} onClick={() => saveCompany(tgForm)}>
                  <IconSave size={15} /> Saqlash
                </button>
                <button className="secondary" style={{ display:'flex', alignItems:'center', gap:7 }} onClick={() => testTelegram(tgForm)}>
                  <IconSend size={15} /> Test
                </button>
                {company?.telegram_chat_id && (
                  <button className="secondary" onClick={() => setTgEdit(false)}><IconX size={15} /> Bekor</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Per-branch Telegram groups ─── */}
      {isAdmin && branches && branches.length > 0 && (
        <div className="telegramSection branchTelegramSection">
          <h3 style={{ display:'flex', alignItems:'center', gap:8 }}>
            <IconBuilding size={18} />
            Filial Telegram Guruhlar
          </h3>
          <p className="telegramHint">
            Har bir filialga alohida guruh. Order (2-smena) va kirim/chiqim qo'shilganda shu guruhga xabar boradi.
          </p>

          <div className="branchTelegramList">
            {branches.map(branch => (
              <BranchTgCard
                key={branch.id}
                branch={branch}
                config={(branchTelegrams || []).find(bt => bt.branch_id === branch.id)}
                globalToken={company?.telegram_token}
                onSave={saveBranchTelegram}
                onDelete={deleteBranchTelegram}
                onTest={testBranchTelegram}
              />
            ))}
          </div>
        </div>
      )}
    </Panel>
  )
}
