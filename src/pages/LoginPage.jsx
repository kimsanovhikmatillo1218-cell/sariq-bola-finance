import { LOGO } from '../constants'
import { IconUser, IconLock, IconEye, IconEyeOff } from '../components/ui/Icons'

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
          <span className="loginFieldIcon"><IconUser size={17} /></span>
          <input
            placeholder={tr.login}
            value={loginVal}
            onChange={e => setLoginVal(e.target.value)}
            onKeyDown={onKey}
            autoComplete="username"
          />
        </div>

        <div className="pass">
          <div className="loginField passField">
            <span className="loginFieldIcon"><IconLock size={17} /></span>
            <input
              placeholder={tr.password}
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={onKey}
              autoComplete="current-password"
            />
          </div>
          <button className="eyeBtn" onClick={() => setShowPass(!showPass)} type="button" title={showPass ? 'Yopish' : "Ko'rish"}>
            {showPass ? <IconEyeOff size={17} /> : <IconEye size={17} />}
          </button>
        </div>

        <label className="check">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
          Meni eslab qol
        </label>

        <button className="primary loginSubmit" disabled={!loginReady} onClick={signIn}>
          {loading ? <span className="loginSpinner" /> : 'Kirish'}
        </button>

        {(!loginVal.trim() || !password.trim()) && (
          <div className="loginHint">Login va parol yozilgandan keyin kirish tugmasi yoqiladi</div>
        )}
      </div>
    </div>
  )
}
