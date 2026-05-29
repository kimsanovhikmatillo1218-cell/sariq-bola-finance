const CACHE_VER = 'sb-finance-v9'
const BASE      = '/sariq-bola-finance'

self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))  // delete ALL caches
      .then(() => self.clients.claim())
      .then(() => {
        // Tell every open tab to reload so it gets the fresh bundle
        return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
          .then(clients => clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' })))
      })
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('supabase')) return

  // Navigation: always try network first, fallback to cached index.html
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone()
          caches.open(CACHE_VER).then(c => c.put(e.request, clone))
          return res
        })
        .catch(() => caches.match(BASE + '/index.html'))
    )
    return
  }

  // Static assets: network first so updates are instant, cache as fallback
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE_VER).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request))
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
