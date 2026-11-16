/* App shell cache so the System opens offline. Bump VERSION to ship an update. */
const VERSION = "system-v1";
const SHELL = ["./", "index.html", "config.js", "manifest.webmanifest", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js",
  "https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  /* live data always goes to the network */
  if (u.hostname.endsWith("supabase.co") || u.hostname.endsWith("openfoodfacts.org")) return;
  const isShell = u.origin === location.origin || u.hostname === "cdn.jsdelivr.net" || u.hostname.endsWith("googleapis.com") || u.hostname.endsWith("gstatic.com");
  if (!isShell) return;
  /* network first for the app page so updates arrive; cache first for libraries and fonts */
  if (u.origin === location.origin && (e.request.mode === "navigate" || u.pathname.endsWith(".html") || u.pathname.endsWith("config.js"))) {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(ca => ca.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(ca => ca.put(e.request, c)); return r; })));
});
