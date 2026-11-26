// يحفظ التطبيق للعمل دون إنترنت، ويجلب أحدث نسخة عند توفر الاتصال.
// الفيديوهات لا تُحفظ (حتى لا تمتلئ ذاكرة الهاتف)، والصور المحفوظة محدودة العدد.
const CACHE = "siits-v4";
const MAX_ITEMS = 120;
const FILES = ["./", "index.html", "content.js", "images/logo.png", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
function trim(c) { c.keys().then(ks => { if (ks.length > MAX_ITEMS) Promise.all(ks.slice(0, ks.length - MAX_ITEMS).filter(k => !FILES.some(f => k.url.endsWith("/" + f.replace("./", "")))).map(k => c.delete(k))) }) }
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  if (e.request.headers.has("range") || /\.(mp4|webm|mov|pdf)$/i.test(u.pathname)) return; // الفيديو وملفات PDF من الشبكة مباشرة
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => {
    if (r.ok && r.status === 200) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy).then(() => trim(c))); }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
