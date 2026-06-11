const CACHE = 'veake-v1';
const BASE = self.registration.scope;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([BASE, BASE + 'index.html', BASE + 'manifest.json']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

self.addEventListener('message', e => {
  if (e.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, title, body, tag } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        tag,
        icon: BASE + 'icon-192.png',
        badge: BASE + 'icon-192.png',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        actions: [{ action: 'ok', title: '✓ Ok' }]
      });
    }, delay);
  }
  if (e.data.type === 'CANCEL_NOTIFICATION') {
    self.registration.getNotifications({ tag: e.data.tag })
      .then(ns => ns.forEach(n => n.close()));
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(cs => {
    if (cs.length) return cs[0].focus();
    return clients.openWindow(BASE);
  }));
});
