/* PRERAK PWA Service Worker v3
   Page: STALE-WHILE-REVALIDATE — cached copy opens instantly, fresh copy downloads in the
   background; if it changed, open tabs get a PRK_UPDATE message (site shows a refresh toast).
   Static assets (manifest, icons): cache-first. Same-origin GET only. */
var CACHE = "prerak-cache-v3";
var ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(ASSETS.map(function (u) { return c.add(u).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function sig(res) {
  try { return (res.headers.get("etag") || "") + "|" + (res.headers.get("last-modified") || ""); }
  catch (e) { return ""; }
}
function tellClients() {
  self.clients.matchAll({ type: "window" }).then(function (cs) {
    cs.forEach(function (c) { try { c.postMessage({ type: "PRK_UPDATE" }); } catch (e) {} });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url; try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  var isPage = req.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/");
  if (isPage) {
    e.respondWith(
      caches.match("./index.html").then(function (cached) {
        var netP = fetch(req).then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put("./index.html", copy).catch(function(){}); });
            if (cached && sig(cached) && sig(res) && sig(cached) !== sig(res)) tellClients();
          }
          return res;
        }).catch(function () { return cached; });
        return cached || netP;   // instant when cached; network on first-ever visit
      })
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(function (m) {
      if (m) return m;
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy).catch(function(){}); });
        }
        return res;
      });
    })
  );
});
