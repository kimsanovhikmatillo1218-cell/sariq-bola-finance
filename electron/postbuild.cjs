/**
 * Post-build script for Electron mode.
 * 1. Copies public icons into dist-electron/ so they load via file://
 * 2. Rewrites hardcoded /sariq-bola-finance/ paths in index.html to ./
 */
const fs   = require('fs')
const path = require('path')

const root       = path.join(__dirname, '..')
const distEl     = path.join(root, 'dist-electron')
const publicDir  = path.join(root, 'public')

// Copy icons into dist-electron root
const icons = ['icon-192.png', 'icon-512.png', 'apple-icon.png', 'manifest.json', 'sw.js', 'favicon.svg']
for (const f of icons) {
  const src = path.join(publicDir, f)
  const dst = path.join(distEl, f)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst)
    console.log(`Copied ${f}`)
  }
}

// Rewrite index.html: replace absolute /sariq-bola-finance/ refs with ./
const htmlPath = path.join(distEl, 'index.html')
let html = fs.readFileSync(htmlPath, 'utf8')
html = html.replace(/\/sariq-bola-finance\//g, './')
// Remove SW registration (service worker not needed for local Electron build)
html = html.replace(/<script>[\s\S]*?serviceWorker[\s\S]*?<\/script>/g, '')
fs.writeFileSync(htmlPath, html, 'utf8')
console.log('Patched index.html')

console.log('Electron postbuild done.')
