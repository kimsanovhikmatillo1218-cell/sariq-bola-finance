import { useEffect, useRef } from 'react'
import { LOGO } from '../constants'
import { IconUser, IconLock, IconEye, IconEyeOff } from '../components/ui/Icons'

/* Animated 4K background canvas */
function AnimatedBg() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf, W, H
    const particles = []
    const PIZZA_COLORS = ['rgba(250,189,0,', 'rgba(255,216,77,', 'rgba(255,200,0,']
    const count = 55

    function resize() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }

    function rand(min, max) { return Math.random() * (max - min) + min }

    function initParticles() {
      particles.length = 0
      for (let i = 0; i < count; i++) {
        const r = rand(2, 18)
        particles.push({
          x: rand(0, W), y: rand(0, H),
          r,
          vx: rand(-0.25, 0.25), vy: rand(-0.22, 0.22),
          alpha: rand(0.04, 0.22),
          color: PIZZA_COLORS[Math.floor(Math.random() * PIZZA_COLORS.length)],
          pulse: rand(0, Math.PI * 2),
          pulseSpeed: rand(0.012, 0.03),
          shape: Math.random() > 0.65 ? 'slice' : 'circle'
        })
      }
    }

    function drawSlice(x, y, r, alpha, color, angle) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, r, -Math.PI / 6, Math.PI / 6)
      ctx.closePath()
      ctx.fillStyle = color + alpha + ')'
      ctx.fill()
      ctx.restore()
    }

    function drawOrb(x, y, r, alpha, color) {
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r)
      grd.addColorStop(0, color + (alpha * 1.5) + ')')
      grd.addColorStop(0.5, color + alpha + ')')
      grd.addColorStop(1, color + '0)')
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()
    }

    let t = 0
    function draw() {
      ctx.clearRect(0, 0, W, H)

      // Draw big background gradient orbs
      drawOrb(W * 0.15, H * 0.2,  W * 0.28, 0.055, 'rgba(250,189,0,')
      drawOrb(W * 0.85, H * 0.75, W * 0.22, 0.03,  'rgba(255,160,0,')
      drawOrb(W * 0.5,  H * 0.5,  W * 0.15, 0.018, 'rgba(73,75,214,')

      // Animated grid lines
      ctx.strokeStyle = 'rgba(250,189,0,0.035)'
      ctx.lineWidth   = 1
      const gridSize  = 60
      const ox = (t * 0.15) % gridSize
      for (let x = -gridSize + ox; x < W + gridSize; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = -gridSize + ox; y < H + gridSize; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      // Particles
      particles.forEach(p => {
        p.pulse += p.pulseSpeed
        const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse))
        if (p.shape === 'slice') {
          drawSlice(p.x, p.y, p.r, a, p.color, p.pulse * 0.5)
        } else {
          drawOrb(p.x, p.y, p.r * 2.5, a * 0.5, p.color)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = p.color + a + ')'
          ctx.fill()
        }
        p.x += p.vx; p.y += p.vy
        if (p.x < -p.r * 3) p.x = W + p.r * 3
        if (p.x > W + p.r * 3) p.x = -p.r * 3
        if (p.y < -p.r * 3) p.y = H + p.r * 3
        if (p.y > H + p.r * 3) p.y = -p.r * 3
      })

      t++
      raf = requestAnimationFrame(draw)
    }

    resize()
    initParticles()
    draw()
    window.addEventListener('resize', () => { resize(); initParticles() })
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} style={{
    position:'fixed', inset:0, width:'100%', height:'100%',
    pointerEvents:'none', zIndex:0
  }} />
}

export default function LoginPage({
  tr, loginVal, setLoginVal, password, setPassword,
  remember, setRemember, showPass, setShowPass,
  loginReady, loading, signIn, toast
}) {
  const onKey = e => e.key === 'Enter' && loginReady && signIn()

  return (
    <div className="loginScreen">
      <AnimatedBg />
      {toast && <div className="toast loginToast">{toast}</div>}

      {/* Floating decorative orbs */}
      <div className="loginOrb loginOrb1" />
      <div className="loginOrb loginOrb2" />
      <div className="loginOrb loginOrb3" />

      <div className="loginCard entrance">
        <div className="loginLogoWrap">
          <img src={LOGO} className="loginLogo" onError={e => { e.currentTarget.style.display = 'none' }} alt="" />
        </div>
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
          <button className="eyeBtn" onClick={() => setShowPass(!showPass)} type="button">
            {showPass ? <IconEyeOff size={17} /> : <IconEye size={17} />}
          </button>
        </div>

        <label className="check">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
          {tr.rememberMe || 'Meni eslab qol'}
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
