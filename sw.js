var CACHE = 'samchat-v1';
var FILES = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var url = e.request.url;
  if (e.request.method !== 'GET' || url.indexOf('firebaseio.com') > -1 || url.indexOf('googleapis.com') > -1) { return; }
  e.respondWith(fetch(e.request).catch(function () { return caches.match(e.request); }));
});
