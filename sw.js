/* PRERAK PWA Service Worker v3
   Page: STALE-WHILE-REVALIDATE — cached copy opens instantly, fresh copy downloads in the
   background; if it changed, open tabs get a PRK_UPDATE message (site shows a refresh toast).
   Static assets (manifest, icons): cache-first. Same-origin GET only. */
var CACHE = "prerak-cache-v6";
var ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./sahayak.html", "./sahayak/", "./sahayak/index.html", "./sahayak-manifest.json", "./sahayak-icon-192.png", "./sahayak-icon-512.png"];

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
      .then(function () {
        /* self-heal: when a NEW worker version takes over, refresh open tabs once
           so any page served from an old/poisoned cache is replaced instantly */
        return self.clients.matchAll({ type: "window" }).then(function (cs) {
          cs.forEach(function (c) { try { if (c.navigate) c.navigate(c.url); } catch (err) {} });
        });
      })
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

  /* manifests must NEVER be stale (app identity/scope lives here): network-first */
  if (url.pathname.endsWith("manifest.json")) {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy).catch(function(){}); });
        }
        return res;
      }).catch(function () { return caches.match(req); })
    );
    return;
  }

  var isPage = req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/");
  if (isPage) {
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then(function (cached) {
        var netP = fetch(req).then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy).catch(function(){}); });
            if (cached && sig(cached) && sig(res) && sig(cached) !== sig(res)) tellClients();
          }
          return res;
        }).catch(function () {
          return cached || caches.match("./index.html");
        });
        return cached || netP;   // each page served from ITS OWN cache entry
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
