const { app, BrowserWindow, shell, Menu, nativeImage, Tray } = require('electron')
const path = require('path')
const fs   = require('fs')

const APP_URL  = 'https://kimsanovhikmatillo1218-cell.github.io/sariq-bola-finance/'
const APP_NAME = 'Sariq Bola Finance'
const WIN_W    = 1280
const WIN_H    = 820

// Prefer the locally-built bundle (fast, works offline).
// Falls back to GitHub Pages if the local build doesn't exist.
const LOCAL_INDEX = path.join(__dirname, '..', 'dist-electron', 'index.html')
const LOAD_URL    = fs.existsSync(LOCAL_INDEX)
  ? `file://${LOCAL_INDEX.replace(/\\/g, '/')}`
  : APP_URL

let mainWindow = null
let tray       = null

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
    show: false,   // avoid white flash before content is ready
  })

  mainWindow.loadURL(LOAD_URL)

  mainWindow.once('ready-to-show', () => {
    mainWindow.setTitle(APP_NAME)   // keep title clean
    mainWindow.show()
    mainWindow.focus()
  })

  // Keep title clean after every navigation (SPA route changes, etc.)
  mainWindow.webContents.on('page-title-updated', (e) => {
    e.preventDefault()
    mainWindow.setTitle(APP_NAME)
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
    // Tray is optional — continue without it if creation fails
  }
}

// ── App lifecycle ────────────────────────────────────────────
app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  createWindow()
  createTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
