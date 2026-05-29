const CACHE_VER = 'sb-finance-v6'
const BASE      = '/sariq-bola-finance'

self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  // Delete ALL old caches on every activate so stale JS/CSS never gets served
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VER).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  // Never cache Supabase API calls
  if (e.request.url.includes('supabase')) return

  // Navigation requests: network first, fallback to cached index
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(BASE + '/index.html'))
    )
    return
  }

  // Static assets: cache first
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE_VER).then(c => c.put(e.request, clone))
        }
        return res
      })
      return cached || networkFetch
    })
  )
})

self.addEventListener('push', e => {
  if (!e.data) return
  const { title, body, icon } = e.data.json()
  e.waitUntil(
    self.registration.showNotification(title, {
      body, icon: icon || BASE + '/favicon.svg',
      badge: BASE + '/favicon.svg',
      vibrate: [200, 100, 200]
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(clients.openWindow(BASE + '/'))
})
