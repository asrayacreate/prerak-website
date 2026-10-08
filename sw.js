/* PRERAK PWA Service Worker v3
   Page: STALE-WHILE-REVALIDATE — cached copy opens instantly, fresh copy downloads in the
   background; if it changed, open tabs get a PRK_UPDATE message (site shows a refresh toast).
   Static assets (manifest, icons): cache-first. Same-origin GET only. */
var CACHE = "prerak-cache-v7";
var ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./sahayak.html", "./sahayak/", "./sahayak/index.html", "./sahayak-manifest.json", "./sahayak-icon-192.png", "./sahayak-icon-512.png"];
/* Site images (split out of index.html). Precached in the background on install so the
   app still shows every image offline. File names are content hashes — regenerate this
   list whenever img/ changes. */
var IMAGES = [
  "./img/01ec33768e19.webp",
  "./img/0234d9f88dc8.webp",
  "./img/02c907ba7bb8.webp",
  "./img/078548a1e9fa.webp",
  "./img/11f87958bed0.webp",
  "./img/1482e83a99f9.webp",
  "./img/155890ef0b90.webp",
  "./img/15d7db0dfd7c.webp",
  "./img/172506025285.webp",
  "./img/173a5cb9c2d6.jpg",
  "./img/1bc3625576f0.webp",
  "./img/284fa9f1157c.webp",
  "./img/2dcaf907efc6.webp",
  "./img/35a8f1dfb503.webp",
  "./img/3eaffecebf34.webp",
  "./img/414cf60b60d4.webp",
  "./img/42f8dd60059a.webp",
  "./img/4c3af3849211.webp",
  "./img/4c9b75e70050.webp",
  "./img/5207f11b8155.webp",
  "./img/5366a13013d5.webp",
  "./img/5544329e456f.webp",
  "./img/574e0e52ee13.webp",
  "./img/5c646e5fb760.webp",
  "./img/5ddbdaa251cc.webp",
  "./img/5f584bdca748.webp",
  "./img/6e24dbe520b0.webp",
  "./img/72fc64a3081f.webp",
  "./img/7ca0c03aab32.webp",
  "./img/7ee88477d9cc.webp",
  "./img/7f262554a21f.webp",
  "./img/7f568b1c2a38.webp",
  "./img/8af8d1946e4e.webp",
  "./img/8b4d249bc82e.webp",
  "./img/8ec6feee9075.webp",
  "./img/90361264d9ea.webp",
  "./img/93d0ddf94e08.jpg",
  "./img/9b68a0cd67c7.webp",
  "./img/9e3801603760.webp",
  "./img/9f314f0db43d.webp",
  "./img/aa21fbcd1359.webp",
  "./img/aac4db527bc6.webp",
  "./img/ac3d9ff7833a.webp",
  "./img/b07f0720f274.webp",
  "./img/b2c51636ddca.webp",
  "./img/b34167924250.jpg",
  "./img/bfa4f2c00972.webp",
  "./img/c1cc56f9cd04.webp",
  "./img/c33d336dda3a.webp",
  "./img/c6b0a044b7bf.webp",
  "./img/d69dd51e8e57.webp",
  "./img/db223ba9ec2d.webp",
  "./img/de11e807fd6a.webp",
  "./img/e5cdd92eea0c.webp",
  "./img/ea80410b4da0.webp",
  "./img/eb6c7e54ce8d.webp",
  "./img/f22ccd4f4dbb.webp",
  "./img/f29b1ef47395.webp",
  "./img/fa15b20233c3.webp",
  "./img/fb235621791e.jpg",
  "./img/fed7a06abcc4.jpg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(ASSETS.concat(IMAGES).map(function (u) { return c.add(u).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  var isUpdate = false;
  e.waitUntil(
    caches.keys().then(function (keys) {
      /* an older prerak-cache-* means this worker is an UPDATE, not the first install */
      isUpdate = keys.some(function (k) { return k !== CACHE && k.indexOf("prerak-cache-") === 0; });
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
      .then(function () {
        /* self-heal: when a NEW worker version takes over, refresh open tabs once
           so any page served from an old/poisoned cache is replaced instantly.
           Never on the first install: that page came straight from the network, and
           reloading it made every first visit load the whole site twice. */
        if (!isUpdate) return;
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
