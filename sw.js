// Network-only: kesh saqlanmaydi, har doim serverdan yuklanadi
const BASE = '/sariq-bola-finance'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  // Barcha eski keshlarni o'chirish
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// Kesh SAQLANMAYDI — har doim tarmoqdan yuklanadi
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  // Supabase API so'rovlarini o'tkazib yuborish
  if (e.request.url.includes('supabase')) return
  // Boshqa barcha so'rovlar bevosita tarmoqdan
  // (kesh yozilmaydi, faqat o'qiladi — ammo kesh bo'sh)
})

// Push bildirishnomalari (kesh bilan bog'liq emas)
self.addEventListener('push', e => {
  if (!e.data) return
  const { title, body, icon } = e.data.json()
  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || BASE + '/favicon.svg',
      badge: BASE + '/favicon.svg',
      vibrate: [200, 100, 200]
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(clients.openWindow(BASE + '/'))
})
