const { app, BrowserWindow, shell, Menu, nativeImage, Tray } = require('electron')
const path  = require('path')
const https = require('https')

const APP_URL  = 'https://kimsanovhikmatillo1218-cell.github.io/sariq-bola-finance/'
const APP_NAME = 'Sariq Bola Finance'
const WIN_W    = 1280
const WIN_H    = 820

let mainWindow = null
let tray       = null

function checkNetwork(cb) {
  const req = https.get('https://kimsanovhikmatillo1218-cell.github.io', res => {
    cb(res.statusCode < 500)
  })
  req.on('error', () => cb(false))
  req.setTimeout(5000, () => { req.destroy(); cb(false) })
}

function createWindow() {
  const iconPath = path.join(__dirname, '..', 'public', 'icon-512.png')
  const icon     = nativeImage.createFromPath(iconPath)

  mainWindow = new BrowserWindow({
    width:  WIN_W,
    height: WIN_H,
    minWidth:  400,
    minHeight: 500,
    title:  APP_NAME,
    icon,
    backgroundColor: '#f4f6fb',
    webPreferences: {
      nodeIntegration:     false,
      contextIsolation:    true,
      webSecurity:         true,
      allowRunningInsecureContent: false,
    },
    autoHideMenuBar: true,
    show: false,    // show after ready-to-show to avoid white flash
  })

  // Show loading screen first, then load real URL
  mainWindow.loadURL(APP_URL)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  // Open external links in the default browser, not inside the app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

function createTray() {
  try {
    const iconPath = path.join(__dirname, '..', 'public', 'icon-192.png')
    const icon     = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
    tray = new Tray(icon)
    tray.setToolTip(APP_NAME)
    const menu = Menu.buildFromTemplate([
      { label: 'Ochish',   click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus() } else createWindow() } },
      { type:  'separator' },
      { label: 'Yopish',   click: () => app.quit() },
    ])
    tray.setContextMenu(menu)
    tray.on('double-click', () => { if (mainWindow) { mainWindow.show(); mainWindow.focus() } })
  } catch (e) {
    // Tray icon is optional — continue without it if creation fails
  }
}

// ── App lifecycle ────────────────────────────────────────────
app.whenReady().then(() => {
  // Remove default menu bar
  Menu.setApplicationMenu(null)

  createWindow()
  createTray()

  // Connectivity check — if offline show a retry prompt via title
  checkNetwork(ok => {
    if (!ok && mainWindow) {
      mainWindow.webContents.executeJavaScript(`
        document.title = 'SB Finance — Internet yo\\'q, sahifa yuklanmoqda...'
      `).catch(() => {})
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
