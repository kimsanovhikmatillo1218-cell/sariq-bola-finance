import { LOGO } from '../constants'

export default function LoginPage({ tr, loginVal, setLoginVal, password, setPassword, remember, setRemember, showPass, setShowPass, loginReady, loading, signIn, toast }) {
  const onKey = e => e.key === 'Enter' && loginReady && signIn()
  return (
    <div className="loginScreen">
      {toast && <div className="toast">{toast}</div>}
      <div className="loginCard entrance">
        <img src={LOGO} className="loginLogo" onError={e => { e.currentTarget.style.display = 'none' }} alt="" />
        <h1>SARIQ BOLA PIZZA</h1>
        <p>Finance Premium System</p>
        <div className="loginField">
          <span>👤</span>
          <input placeholder={tr.login} value={loginVal} onChange={e => setLoginVal(e.target.value)} onKeyDown={onKey} />
        </div>
        <div className="pass">
          <div className="loginField passField">
            <span>🔐</span>
            <input placeholder={tr.password} type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey} />
          </div>
          <button onClick={() => setShowPass(!showPass)}>{showPass ? 'Yopish' : "Ko'rish"}</button>
        </div>
        <label className="check">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
          Meni eslab qol
        </label>
        <button className="primary loginSubmit" disabled={!loginReady} onClick={signIn}>
          {loading ? '...' : 'Kirish'}
        </button>
        {(!loginVal.trim() || !password.trim()) && (
          <div className="loginHint">Login va parol yozilgandan keyin kirish tugmasi yoqiladi</div>
        )}
      </div>
    </div>
  )
}