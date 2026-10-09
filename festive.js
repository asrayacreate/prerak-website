/* Prerak Multipurpose — Dashain–Tihar festive theme (temporary).
   index.html loads this file only while the theme is on (see PRK_FESTIVE / FEST_END there), and only
   after the page has fully loaded and the browser is idle. Everything is decorative: small elements
   animated with transform/opacity (no layout work), pointer-events off, nothing in admin mode, no
   motion for "reduce motion" users, and the music never starts without a click. */
(function () {
  "use strict";
  if (window.prkFestive) return;
  var doc = document;
  var cfg = window.PRK_FESTIVE || {};
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var lite = !!(navigator.connection && navigator.connection.saveData);
  var running = false, fx = null, btn = null, css = null, io = null, mo = null, heroOn = true;
  var lights = null, corners = [], greet = null, chip = null;
  var timers = [], bursts = 0, MAX_BURSTS = 30, greets = 0, MAX_GREETS = 4;

  function small() { return innerWidth < 768; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function idle() { return running && !doc.hidden && !doc.body.classList.contains("admin-mode"); }
  function rm(el) { if (el && el.parentNode) el.parentNode.removeChild(el); }
  function vis(el) { if (!el) return null; var cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden") return null; var r = el.getBoundingClientRect(); return r.width && r.height ? r : null; }
  function navBottom() { var n = doc.getElementById("mainNav"); return n ? Math.max(0, n.getBoundingClientRect().bottom) : 100; }
  function noticeBottom() { var w = vis(doc.querySelector("#ntc-wrap .ntc-bar")) || vis(doc.getElementById("ntc-wrap")); return w ? Math.max(0, w.bottom) : 0; }
  function svgUrl(svg) { return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")'; }

  /* ── artwork ── */
  function marigold() {
    var p = "", i;
    for (i = 0; i < 12; i++) p += '<ellipse rx="3.1" ry="6" transform="rotate(' + i * 30 + ') translate(0 -5.2)" fill="#f97316"/>';
    for (i = 0; i < 9; i++) p += '<ellipse rx="2.3" ry="4.2" transform="rotate(' + (i * 40 + 15) + ') translate(0 -3.4)" fill="#fbbf24"/>';
    return svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -12 24 24">' + p + '<circle r="2.6" fill="#c2410c"/></svg>');
  }
  var JAMARA = svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 26"><g fill="none" stroke-linecap="round" stroke-width="2.1">' +
    '<path d="M7 25C7 16 5 8 2 1" stroke="#65a30d"/><path d="M7 25C7 15 8 7 11 0" stroke="#84cc16"/><path d="M7 25C7 17 7 10 7 3" stroke="#bef264"/></g></svg>');
  function kiteSvg(cls, w) {
    return '<svg class="' + cls + '" viewBox="0 0 60 122" width="' + w + '" height="' + Math.round(w * 122 / 60) + '">' +
      '<path d="M30 2 54 34 30 74 6 34Z" fill="#dc2626"/><path d="M30 2 54 34H30Z" fill="#fbbf24"/><path d="M30 34H6l24 40Z" fill="#1d4ed8"/>' +
      '<path d="M30 2v72M6 34h48" stroke="#7c2d12" stroke-width="1.3"/>' +
      '<path d="M30 74c-5 12 6 20 0 32-3 7 2 11 0 16" stroke="#7c2d12" stroke-width="1.1" fill="none"/>' +
      '<path d="M23 84l7 4-7 4zM37 84l-7 4 7 4zM23 99l7 4-7 4zM37 99l-7 4 7 4z" fill="#f97316"/></svg>';
  }
  var DIYA = '<svg viewBox="0 0 64 34" width="46" height="25" aria-hidden="true"><defs><linearGradient id="prkDg" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#f59e0b"/><stop offset=".55" stop-color="#c2410c"/><stop offset="1" stop-color="#7c2d12"/></linearGradient></defs>' +
    '<path d="M3 12c8 3 50 3 58 0-3 12-14 20-29 20S6 24 3 12Z" fill="url(#prkDg)"/><path d="M3 12c8-3 50-3 58 0-8 3-50 3-58 0Z" fill="#fbbf24"/>' +
    '<path d="M48 11c5-1 10-4 12-8-1 5-5 9-10 10Z" fill="#c2410c"/>' +
    '<g fill="#fde68a"><circle cx="16" cy="21" r="1.6"/><circle cx="24" cy="24" r="1.6"/><circle cx="32" cy="25" r="1.6"/><circle cx="40" cy="24" r="1.6"/><circle cx="48" cy="21" r="1.6"/></g></svg>';
  var NOTE = '<svg class="ic-play" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 17.5V5.8l10-2.3v11.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="17.5" r="2.6" fill="currentColor"/><circle cx="16.5" cy="15.2" r="2.6" fill="currentColor"/></svg>';
  var PAUSE = '<svg class="ic-pause" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>';

  function addCss() {
    if (css) return;
    css = doc.createElement("style");
    css.id = "prkFestiveCss";
    css.textContent =
      "#prkFx{position:fixed;inset:0;pointer-events:none;z-index:9000;overflow:hidden;contain:strict}" +
      "body.admin-mode #prkFx,body.admin-mode #prkMusic,body.admin-mode #prkLights,body.admin-mode .prk-cd,body.admin-mode #prkGreet,body.admin-mode #prkNow,body.admin-mode #prkYt{display:none!important}" +
      /* falling: one element falls, its child sways */
      "#prkFx .pf{position:absolute;top:0;animation:prkFallY linear both}" +
      "#prkFx .pf>i{display:block;animation:prkSway ease-in-out infinite alternate}" +
      "#prkFx .mg{width:22px;height:22px;background:" + marigold() + " center/contain no-repeat}" +
      "#prkFx .pt{width:8px;height:12px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:linear-gradient(160deg,#fde047,#f97316 70%)}" +
      "#prkFx .tk{width:9px;height:9px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fca5a5,#dc2626 45%,#7f1d1d)}" +
      "#prkFx .jm{width:13px;height:24px;background:" + JAMARA + " center/contain no-repeat}" +
      "#prkFx .kt{display:block;width:17px;height:auto}" +
      "@keyframes prkFallY{from{transform:translate3d(0,-40px,0)}to{transform:translate3d(0,110vh,0)}}" +
      "@keyframes prkSway{from{transform:translate3d(-16px,0,0) rotate(-35deg)}to{transform:translate3d(16px,0,0) rotate(35deg)}}" +
      /* kite over the hero */
      "#prkFx .kite{position:absolute;right:5vw;top:var(--kt,124px);width:46px;height:auto;transform-origin:50% 8%;animation:prkKite 5.5s ease-in-out infinite alternate;transition:opacity .6s}" +
      "#prkFx.off-hero .kite{opacity:0}" +
      "@keyframes prkKite{0%{transform:translate3d(0,0,0) rotate(-9deg)}50%{transform:translate3d(-14px,8px,0) rotate(4deg)}100%{transform:translate3d(-26px,-6px,0) rotate(10deg)}}" +
      /* firecrackers */
      "#prkFx .bst{position:absolute;width:0;height:0}" +
      "#prkFx .rk{position:absolute;left:-1px;top:0;width:2px;height:18px;border-radius:2px;background:linear-gradient(#fff7cc,rgba(251,146,60,0))}" +
      "#prkFx .fl{position:absolute;left:-14px;top:-14px;width:28px;height:28px;border-radius:50%;background:radial-gradient(circle,#fff 0,rgba(255,240,180,.9) 30%,rgba(255,200,80,0) 70%);opacity:0}" +
      "#prkFx .sp{position:absolute;left:-2.5px;top:-2.5px;width:5px;height:5px;border-radius:50%;opacity:0}" +
      /* jhilimili string lights under the notice bar */
      "#prkLights{position:fixed;left:0;right:0;top:var(--lt,36px);height:18px;z-index:9095;pointer-events:none;contain:strict}" +
      "#prkLights svg{position:absolute;left:0;top:0}" +
      "#prkLights i{position:absolute;width:6px;height:9px;border-radius:50% 50% 45% 45%/60% 60% 40% 40%;animation:prkTw 1.6s ease-in-out infinite alternate}" +
      "#prkLights i::before{content:'';position:absolute;left:1px;top:-2px;width:4px;height:3px;border-radius:1px;background:#3f3f46}" +
      "#prkLights i.t1{animation-duration:1.15s;animation-delay:-.5s}#prkLights i.t2{animation-duration:2.1s;animation-delay:-1.2s}" +
      "@keyframes prkTw{from{opacity:.3}to{opacity:1}}" +
      /* diyas in the bottom corners */
      ".prk-cd{position:fixed;bottom:8px;z-index:8990;width:46px;height:40px;pointer-events:none}" +
      ".prk-cd svg{position:absolute;left:0;bottom:0}" +
      ".prk-cd .gl{position:absolute;left:3px;bottom:6px;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle,rgba(253,186,40,.55),rgba(253,186,40,0) 65%);animation:prkGlow 2.2s ease-in-out infinite alternate}" +
      ".prk-cd .fm{position:absolute;left:50%;bottom:19px;width:9px;height:15px;margin-left:-4.5px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(circle at 50% 70%,#fffbe6 0,#fde047 35%,#f97316 78%);box-shadow:0 0 10px 3px rgba(253,186,40,.6);transform-origin:50% 100%;animation:prkFlicker 1.1s ease-in-out infinite alternate}" +
      ".prk-cd.r .fm{animation-duration:1.35s;animation-delay:-.4s}" +
      "@keyframes prkGlow{from{opacity:.55;transform:scale(.9)}to{opacity:1;transform:scale(1.08)}}" +
      /* greetings now and then */
      "#prkGreet{position:fixed;left:50%;top:var(--gt,124px);z-index:9085;width:min(520px,calc(100vw - 24px));display:flex;gap:12px;align-items:flex-start;padding:13px 44px 13px 14px;border-radius:16px;" +
      "background:linear-gradient(135deg,#fffaf0,#fde68a);border:1px solid #f59e0b;border-left:5px solid #b91c1c;box-shadow:0 14px 34px rgba(124,45,18,.28);font-family:'Noto Sans Devanagari',inherit;" +
      "opacity:0;visibility:hidden;transform:translate3d(-50%,-12px,0);transition:opacity .45s,transform .45s,visibility 0s .45s}" +
      "#prkGreet.on{opacity:1;visibility:visible;transform:translate3d(-50%,0,0);transition:opacity .45s,transform .45s}" +
      "#prkGreet .g-ic{flex:none;font-size:1.6rem;line-height:1.1}" +
      "#prkGreet .g-tx{display:flex;flex-direction:column;gap:3px;min-width:0}" +
      "html body #prkGreet b{color:#7f1d1d!important;-webkit-text-fill-color:#7f1d1d!important;font-size:.95rem;line-height:1.45}" +
      "html body #prkGreet span{color:#3b2508!important;-webkit-text-fill-color:#3b2508!important;font-size:.84rem;line-height:1.55}" +
      "html body #prkGreet small{color:#92400e!important;-webkit-text-fill-color:#92400e!important;font-size:.74rem;font-weight:700}" +
      "#prkGreet .g-x{position:absolute;right:8px;top:8px;width:30px;height:30px;border:0;border-radius:50%;background:rgba(127,29,29,.1);color:#7f1d1d;font-size:.8rem;cursor:pointer}" +
      "#prkGreet .g-x:hover{background:rgba(127,29,29,.18)}#prkGreet .g-x:focus-visible{outline:3px solid #1d4ed8;outline-offset:2px}" +
      /* music button (a lit diya + note) */
      "#prkMusic{position:fixed;left:16px;bottom:92px;z-index:9050;display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;padding:0;border-radius:50%;" +
      "border:1px solid rgba(146,64,14,.35);background:linear-gradient(135deg,#fde68a,#fbbf24 55%,#f59e0b);color:#1a1208;font-family:inherit;" +
      "box-shadow:0 6px 18px rgba(180,83,9,.35);cursor:pointer;opacity:0;transform:translate3d(0,8px,0);transition:opacity .4s,transform .4s,box-shadow .3s}" +
      "#prkMusic.in{opacity:1;transform:none}" +
      "#prkMusic:hover{box-shadow:0 8px 22px rgba(180,83,9,.45)}" +
      "#prkMusic:focus-visible{outline:3px solid #1d4ed8;outline-offset:3px}" +
      "#prkMusic .prk-diya{display:block;position:absolute;top:-7px;right:-3px;width:16px;height:16px}" +
      "#prkMusic::after{content:'';position:absolute;inset:-4px;border-radius:50%;border:2px solid rgba(251,191,36,.75);opacity:0;pointer-events:none}" +
      "#prkMusic[aria-pressed=true]::after{animation:prkRing 1.8s ease-out infinite}" +
      "@keyframes prkRing{from{transform:scale(.92);opacity:.9}to{transform:scale(1.35);opacity:0}}" +
      "#prkMusic .ic-pause{display:none}#prkMusic[aria-pressed=true] .ic-pause{display:block}#prkMusic[aria-pressed=true] .ic-play{display:none}" +
      "#prkMusic[aria-pressed=true]{box-shadow:0 0 0 4px rgba(251,191,36,.35),0 6px 18px rgba(180,83,9,.35)}" +
      "html[data-t] body:not(.admin-mode) #prkMusic{color:#1a1208!important}" +
      /* "now playing" credit */
      "#prkNow{position:fixed;left:16px;z-index:9050;padding:7px 12px;border-radius:999px;background:rgba(26,18,8,.92);border:1px solid rgba(251,191,36,.55);font-size:.74rem;font-weight:700;white-space:nowrap;pointer-events:none;" +
      "opacity:0;transform:translate3d(0,6px,0);transition:opacity .35s,transform .35s}" +
      "#prkNow.on{opacity:1;transform:none}html body #prkNow,html body #prkNow span{color:#fde68a!important;-webkit-text-fill-color:#fde68a!important}" +
      /* the YouTube player: hidden (sound only) … */
      "#prkYtHidden{position:fixed;left:0;bottom:0;width:200px;height:200px;overflow:hidden;opacity:.01;pointer-events:none;z-index:-1}" +
      "#prkYtHidden iframe{width:200px;height:200px;border:0}" +
      /* … or, with ytHidden:false, shown in a small card while it plays */
      "#prkYt{position:fixed;left:16px;bottom:150px;z-index:9060;width:min(372px,calc(100vw - 32px));padding:8px;border-radius:16px;" +
      "background:linear-gradient(160deg,#13254a,#1a1208);border:1px solid rgba(251,191,36,.6);box-shadow:0 14px 34px rgba(0,0,0,.38),0 0 0 3px rgba(251,191,36,.14);" +
      "opacity:0;visibility:hidden;transform:translate3d(0,12px,0);transition:opacity .3s,transform .3s,visibility 0s .3s}" +
      "#prkYt.on{opacity:1;visibility:visible;transform:none;transition:opacity .3s,transform .3s}" +
      "#prkYt .yt-h{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 2px 8px 4px;font-weight:800;font-size:.76rem}" +
      "#prkYt .yt-t{display:flex;align-items:center;gap:7px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      "#prkYt .yt-t .prk-diya{display:inline-block;position:relative;width:16px;height:16px;flex:none}" +
      "html body #prkYt .yt-h span{color:#fde68a!important;-webkit-text-fill-color:#fde68a!important}" +
      "#prkYt .yt-x{flex:none;width:32px;height:32px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:.85rem;cursor:pointer}" +
      "#prkYt .yt-v{position:relative;width:100%;height:200px;border-radius:10px;overflow:hidden;background:#000}" +
      "#prkYt .yt-v iframe{position:absolute;inset:0;width:100%;height:100%;border:0}" +
      "@media(max-width:768px){#prkFx .kite{width:30px;right:12px}#prkMusic{bottom:150px}#prkGreet{padding:11px 40px 11px 12px}#prkGreet .g-ic{font-size:1.35rem}" +
      ".prk-cd{transform:scale(.75)}.prk-cd.l{transform-origin:0 100%}.prk-cd.r{transform-origin:100% 100%}}" +
      "@media (prefers-reduced-motion:reduce){#prkFx .kite,#prkLights i,.prk-cd .fm,.prk-cd .gl,#prkMusic[aria-pressed=true]::after{animation:none}#prkLights i{opacity:.9}#prkGreet,#prkGreet.on{transition:none}}";
    doc.head.appendChild(css);
  }

  /* ── jhilimili: a sagging wire with twinkling bulbs just under the notice bar ── */
  var LCOL = ["#ff4d4d", "#ffd23f", "#3ddc84", "#4dabff", "#ff9f1c", "#ff6ad5"];
  function buildLights() {
    if (!lights) return;
    var W = innerWidth, seg = W < 768 ? 78 : 120, sag = W < 768 ? 5 : 7, step = W < 768 ? 26 : 30, d = "M0 2", x, html = "";
    for (x = 0; x < W; x += seg) d += "Q" + (x + seg / 2) + " " + (2 + 2 * sag) + " " + (x + seg) + " 2";
    html = '<svg width="' + W + '" height="18" aria-hidden="true"><path d="' + d + '" fill="none" stroke="#3f3f46" stroke-width="1.2" opacity=".85"/></svg>';
    for (var k = 0, bx = step / 2; bx < W - 3; bx += step, k++) {
      var t = (bx % seg) / seg, y = 2 + 4 * sag * t * (1 - t), c = LCOL[k % LCOL.length];
      html += '<i class="t' + (k % 3) + '" style="left:' + (bx - 3).toFixed(1) + "px;top:" + (y + 1.5).toFixed(1) + "px;background:" + c + ";box-shadow:0 0 6px " + c + '"></i>';
    }
    lights.innerHTML = html;
  }
  function placeLights() { if (lights) lights.style.setProperty("--lt", Math.round(noticeBottom()) + "px"); }

  /* ── diyas in the bottom corners, clear of the chat / call buttons and the mobile call bar ── */
  function placeCorners() {
    if (!corners.length) return;
    var cta = vis(doc.querySelector(".mob-cta")), bar = cta && cta.top > innerHeight * .7, bottom = (bar ? innerHeight - cta.top + 3 : 8);
    var fab = vis(doc.getElementById("prkAiFab")), stack = vis(doc.getElementById("prkFabWrap"));
    var left = fab && fab.left < 120 && fab.bottom > innerHeight - bottom - 70 ? fab.right + 10 : 10;
    var right = stack && stack.right > innerWidth - 120 && stack.bottom > innerHeight - bottom - 70 ? innerWidth - stack.left + 10 : 10;
    corners[0].style.cssText = "left:" + Math.round(left) + "px;bottom:" + Math.round(bottom) + "px";
    if (corners[1]) corners[1].style.cssText = "right:" + Math.round(right) + "px;bottom:" + Math.round(bottom) + "px";
  }
  function makeCorners() {
    ["l", "r"].forEach(function (side) {
      var d = doc.createElement("div");
      d.className = "prk-cd " + side; d.setAttribute("aria-hidden", "true");
      d.innerHTML = '<i class="gl"></i>' + DIYA.replace('id="prkDg"', 'id="prkDg' + side + '"').replace("url(#prkDg)", "url(#prkDg" + side + ")") + '<i class="fm"></i>';
      doc.body.appendChild(d); corners.push(d);
    });
    placeCorners();
  }

  /* ── falling marigolds, tika, jamara and little kites: a ~45 s shower, again every 2.5 min ── */
  function pick() { var r = Math.random(); return r < .38 ? "mg" : r < .48 ? "pt" : r < .66 ? "tk" : r < .86 ? "jm" : "kt"; }
  function shower() {
    if (!running) return;
    if (idle()) {
      var n = small() ? 8 : 14;
      for (var i = 0; i < n; i++) {
        var p = doc.createElement("span"), type = pick(), c, dur = rnd(9, 15) * (type === "kt" ? 1.25 : 1);
        if (type === "kt") { c = doc.createElement("i"); c.innerHTML = kiteSvg("kt", 17); } else { c = doc.createElement("i"); c.className = type; }
        p.className = "pf";
        p.style.left = rnd(2, 96).toFixed(1) + "%";
        p.style.animationDuration = dur.toFixed(2) + "s";
        p.style.animationDelay = rnd(0, dur).toFixed(2) + "s";
        p.style.animationIterationCount = "3";
        c.style.animationDuration = rnd(2.2, 3.6).toFixed(2) + "s";
        if (type === "mg") { var k = rnd(.7, 1.15).toFixed(2); c.style.width = c.style.height = Math.round(22 * k) + "px"; }
        p.appendChild(c);
        p.addEventListener("animationend", function (e) { if (e.target === this) rm(this); });
        fx.appendChild(p);
      }
    }
    later(shower, 150000);
  }

  /* ── light firecrackers over the hero, every 6–11 s ── */
  var COLS = ["#fde047", "#fb923c", "#f43f5e", "#facc15", "#fff7ed", "#c084fc", "#34d399"];
  function cracker() {
    if (!running) return;
    if (idle() && heroOn && bursts < MAX_BURSTS && fx.animate) {
      bursts++;
      var x = rnd(.1, .9) * innerWidth, top = navBottom() + 40, y = rnd(top, Math.max(top + 20, innerHeight * .45));
      var b = doc.createElement("div"); b.className = "bst"; b.style.left = x.toFixed(0) + "px"; b.style.top = y.toFixed(0) + "px";
      var rk = doc.createElement("i"); rk.className = "rk"; b.appendChild(rk);
      fx.appendChild(b);
      var rise = rnd(140, 220);
      rk.animate([{ transform: "translate3d(0," + rise + "px,0)", opacity: 0 }, { transform: "translate3d(0," + rise * .5 + "px,0)", opacity: 1, offset: .3 }, { transform: "translate3d(0,0,0)", opacity: .2 }],
        { duration: 560, easing: "cubic-bezier(.3,.6,.4,1)", fill: "forwards" });
      later(function () {
        rm(rk);
        var fl = doc.createElement("i"); fl.className = "fl"; b.appendChild(fl);
        fl.animate([{ transform: "scale(.2)", opacity: 1 }, { transform: "scale(1.7)", opacity: 0 }], { duration: 420, easing: "ease-out", fill: "forwards" });
        var n = small() ? 12 : 16, base = COLS[Math.floor(rnd(0, COLS.length))], far = small() ? .75 : 1;
        for (var i = 0; i < n; i++) {
          var s = doc.createElement("i"), col = i % 3 ? base : COLS[Math.floor(rnd(0, COLS.length))];
          var a = i / n * Math.PI * 2 + rnd(-.15, .15), d = rnd(46, 80) * far, dx = Math.cos(a) * d, dy = Math.sin(a) * d;
          s.className = "sp"; s.style.background = col; s.style.boxShadow = "0 0 6px " + col;
          b.appendChild(s);
          s.animate([{ transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
            { transform: "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0) scale(.9)", opacity: 1, offset: .7 },
            { transform: "translate3d(" + (dx * 1.08).toFixed(1) + "px," + (dy * 1.08 + 14).toFixed(1) + "px,0) scale(.4)", opacity: 0 }],
            { duration: rnd(900, 1250), easing: "cubic-bezier(.15,.75,.35,1)", fill: "forwards" });
        }
        later(function () { rm(b); }, 1400);
      }, 560);
    }
    later(cracker, rnd(6000, 11000));
  }

  /* ── greetings now and then (Devanagari): first after ~10 s, then every 2.5 min, at most 4 per visit ── */
  function greetBlocked() {
    var ex = doc.getElementById("exitOv");
    return (ex && ex.classList.contains("show")) || doc.body.classList.contains("modal-open") || doc.documentElement.style.overflow === "hidden";
  }
  function showGreet() {
    if (!running) return;
    var off = false; try { off = sessionStorage.getItem("prkGreetOff") === "1"; } catch (e) {}
    if (off || greets >= MAX_GREETS) return;
    if (idle() && !greetBlocked() && window.prkFestGreet) {
      var g = window.prkFestGreet(greets % 2 ? "all" : "now");
      if (!greet) {
        greet = doc.createElement("div"); greet.id = "prkGreet"; greet.setAttribute("role", "status"); greet.setAttribute("lang", "ne");
        doc.body.appendChild(greet);
      }
      greet.innerHTML = '<span class="g-ic" aria-hidden="true"></span><div class="g-tx"><b></b><span></span><small></small></div><button type="button" class="g-x" aria-label="शुभकामना बन्द गर्नुहोस्">✕</button>';
      greet.querySelector(".g-ic").textContent = g.ico;
      greet.querySelector("b").textContent = g.t;
      greet.querySelector(".g-tx span").textContent = g.b;
      greet.querySelector("small").textContent = window.PRK_GREET_SIGN || "";
      greet.querySelector(".g-x").addEventListener("click", function () { greet.classList.remove("on"); try { sessionStorage.setItem("prkGreetOff", "1"); } catch (e) {} });
      greet.style.setProperty("--gt", Math.round(navBottom() + 12) + "px");
      greets++;
      void greet.offsetWidth; greet.classList.add("on");
      later(function () { if (greet) greet.classList.remove("on"); }, 9000);
    }
    later(showGreet, 150000);
  }

  /* ── music: an original festive dhun played by the browser (bansuri-like lead, madal, bells,
        drone) — no download. PRK_FESTIVE.musicUrl plays your own file instead. ── */
  function Engine(ac, dest) {
    var B = 60 / 96, SA = 293.66;
    var RAT = { S: 1, R: 9 / 8, G: 5 / 4, M: 4 / 3, P: 3 / 2, D: 5 / 3, N: 15 / 8 };
    function hz(tok) { var m = /^([SRGMPDN])([',]*)$/.exec(tok), f = SA * RAT[m[1]]; for (var i = 0; i < m[2].length; i++) f *= m[2][i] === "'" ? 2 : .5; return f; }
    var TUNE =
      "S':1 D:.5 P:.5 G:1 P:1|D:.5 S':.5 D:.5 P:.5 G:2|G:.5 P:.5 D:1 P:.5 G:.5 R:1|G:1 R:.5 S:.5 S:2|" +
      "S:.5 R:.5 G:1 P:1 D:1|S':1.5 R':.5 S':1 D:1|P:.5 D:.5 S':.5 D:.5 P:1 G:1|R:.5 G:.5 P:.5 G:.5 S:2|" +
      "P:1 D:1 S':1 R':1|G':.5 R':.5 S':1 D:2|S':.5 D:.5 P:.5 G:.5 P:1 D:1|P:2 -:1 G:.5 P:.5|" +
      "D:1 P:.5 G:.5 R:1 G:1|P:.5 G:.5 R:.5 S:.5 R:2|G:.5 P:.5 D:.5 S':.5 D:.5 P:.5 G:1|R:1 G:.5 R:.5 S:2";
    var EV = [], beat = 0, prev = null;
    TUNE.split("|").forEach(function (bar) {
      bar.trim().split(/\s+/).forEach(function (t) {
        var a = t.split(":"), d = +a[1];
        if (a[0] !== "-") { var f = hz(a[0]); EV.push({ b: beat, k: "fl", f: f, p: prev, d: d }); prev = f; } else prev = null;
        beat += d;
      });
    });
    var LOOP = beat;
    for (var bar = 0; bar < LOOP / 4; bar++) {
      var pat = bar % 4 === 3 ? "D.tnttnt" : "D.tnDtnt";
      for (var i = 0; i < 8; i++) if (pat[i] !== ".") EV.push({ b: bar * 4 + i / 2, k: pat[i] });
      EV.push({ b: bar * 4 + 1, k: "j" }); EV.push({ b: bar * 4 + 3, k: "j" });
      if (bar % 8 === 0) EV.push({ b: bar * 4, k: "bell" });
    }
    EV.sort(function (a, b) { return a.b - b.b; });

    var noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), nd = noise.getChannelData(0);
    for (var j = 0; j < nd.length; j++) nd[j] = Math.random() * 2 - 1;
    var comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.connect(dest);
    var lead = ac.createGain(); lead.gain.value = .9; lead.connect(comp);
    var dl = ac.createDelay(1), fb = ac.createGain(), lp = ac.createBiquadFilter(), wet = ac.createGain();
    dl.delayTime.value = .23; fb.gain.value = .28; lp.type = "lowpass"; lp.frequency.value = 2600; wet.gain.value = .22;
    lead.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); wet.connect(comp);
    var perc = ac.createGain(); perc.gain.value = .8; perc.connect(comp);

    function env(g, t, peak, decay) { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + decay); }
    function noiseHit(t, type, freq, q, peak, decay) {
      var n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      n.buffer = noise; f.type = type; f.frequency.value = freq; f.Q.value = q; env(g, t, peak, decay);
      n.connect(f); f.connect(g); g.connect(perc); n.start(t, Math.random() * .5, decay + .05);
    }
    function tone(t, type, f0, f1, peak, decay, out) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + decay * .55);
      env(g, t, peak, decay); o.connect(g); g.connect(out || perc); o.start(t); o.stop(t + decay + .05);
    }
    function flute(f, p, d, t) {
      var len = d * B, end = t + len, st = p && Math.abs(p - f) > 1 ? p : f;
      var o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), g2 = ac.createGain(), v = ac.createOscillator(), vg = ac.createGain(), vg2 = ac.createGain();
      o.type = "sine"; o2.type = "triangle";
      o.frequency.setValueAtTime(st, t); o2.frequency.setValueAtTime(st * 2, t);
      if (st !== f) { o.frequency.exponentialRampToValueAtTime(f, t + .07); o2.frequency.exponentialRampToValueAtTime(f * 2, t + .07); }
      v.frequency.value = 5.3; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * .007, t + Math.min(.35, len * .6)); vg2.gain.value = 2;
      v.connect(vg); vg.connect(o.frequency); vg.connect(vg2); vg2.connect(o2.frequency);
      var pk = .26, rel = Math.min(.18, len * .35);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(pk, t + .045);
      g.gain.setValueAtTime(pk * .92, Math.max(t + .05, end - rel)); g.gain.exponentialRampToValueAtTime(.0001, end + .04);
      g2.gain.value = .12; o.connect(g); o2.connect(g2); g2.connect(g); g.connect(lead);
      var n = ac.createBufferSource(), bp = ac.createBiquadFilter(), ng = ac.createGain();
      n.buffer = noise; bp.type = "bandpass"; bp.frequency.value = f * 2; bp.Q.value = 1.5;
      ng.gain.setValueAtTime(.05, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .09);
      n.connect(bp); bp.connect(ng); ng.connect(lead);
      o.start(t); o2.start(t); v.start(t); n.start(t, Math.random() * .5, .12);
      o.stop(end + .06); o2.stop(end + .06); v.stop(end + .06);
    }
    function play(e, t) {
      if (e.k === "fl") flute(e.f, e.p, e.d, t);
      else if (e.k === "D") tone(t, "sine", 150, 62, .55, .42);             /* madal: dhin */
      else if (e.k === "n") tone(t, "sine", 240, 190, .22, .2);             /* madal: na */
      else if (e.k === "t") { noiseHit(t, "bandpass", 2200, 1, .18, .07); tone(t, "sine", 380, 380, .08, .05); } /* madal: ta */
      else if (e.k === "j") noiseHit(t, "highpass", 7000, .7, .05, .12);    /* jhyali */
      else if (e.k === "bell") [[1, .06, 2.4], [2.76, .025, 1.3], [5.4, .012, .8]].forEach(function (h) { tone(t, "sine", 1174.7 * h[0], 1174.7 * h[0], h[1], h[2], comp); });
    }
    var idx = 0, t0 = 0;
    return {
      start: function (t) {
        t0 = t; idx = 0;
        [[SA / 2, .024], [SA * .75, .018]].forEach(function (d) {   /* tanpura-like drone */
          var o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
          o.type = "sawtooth"; o.frequency.value = d[0]; f.type = "lowpass"; f.frequency.value = 700;
          g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(d[1], t + 2);
          o.connect(f); f.connect(g); g.connect(comp); o.start(t);
        });
      },
      schedule: function (until) {
        for (;;) {
          var e = EV[idx], t = t0 + e.b * B;
          if (t > until) break;
          play(e, t);
          if (++idx >= EV.length) { idx = 0; t0 += LOOP * B; }
        }
      },
      loopSeconds: LOOP * B
    };
  }

  /* ── music player ──
     1) PRK_FESTIVE.musicUrl: your own licensed mp3, played without any visible player.
     2) PRK_FESTIVE.youtube: a YouTube video (Sur Sudha — Dashain Mangal Dhun), through the YouTube
        IFrame Player API, loaded only on the first click. ytHidden:true keeps the player hidden
        (sound only); ytHidden:false shows it in a small card while it plays.
     3) Otherwise (or if YouTube can't play the video here) the built-in festive dhun. */
  var Music = (function () {
    var ctx = null, out = null, eng = null, tick = null, el = null, on = false;
    var yt = { host: null, player: null, ready: false, loading: false, want: false, failed: false, timer: null, check: null };
    var hidden = cfg.ytHidden !== false;
    function set(v) { on = v; if (btn) { btn.setAttribute("aria-pressed", v ? "true" : "false"); btn.setAttribute("aria-label", v ? "Pause Dashain Mangal Dhun" : "Play Dashain Mangal Dhun"); } }
    function nowPlaying(text) {
      if (!btn) return;
      if (!chip) { chip = doc.createElement("div"); chip.id = "prkNow"; chip.setAttribute("aria-hidden", "true"); doc.body.appendChild(chip); }
      var r = btn.getBoundingClientRect();
      chip.style.bottom = Math.round(innerHeight - r.top + 10) + "px";
      chip.textContent = text;
      void chip.offsetWidth; chip.classList.add("on");
      clearTimeout(chip._t); chip._t = setTimeout(function () { if (chip) chip.classList.remove("on"); }, 4500);
    }

    function synthPlay() {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctx) { ctx = new AC(); out = ctx.createGain(); out.gain.value = 0; out.connect(ctx.destination); eng = Engine(ctx, out); eng.start(ctx.currentTime + .08); }
      var r = ctx.resume && ctx.resume();
      out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(.55, ctx.currentTime, .25);
      clearInterval(tick); eng.schedule(ctx.currentTime + .35);
      tick = setInterval(function () { try { eng.schedule(ctx.currentTime + .35); } catch (e) {} }, 90);
      set(true); nowPlaying("♪ चाडपर्वको मंगल धुन");
      /* started outside a click (YouTube fallback) and the browser said no: show "Play" again */
      if (r && r.then) r.then(function () { if (ctx && ctx.state !== "running") synthPause(); }, function () { synthPause(); });
    }
    function synthPause() {
      set(false);
      if (ctx) {
        clearInterval(tick);
        out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(0, ctx.currentTime, .08);
        setTimeout(function () { if (!on && ctx && ctx.suspend) ctx.suspend(); }, 400);
      }
    }

    function ytHost() {
      if (yt.host) return;
      var c = yt.host = doc.createElement("div");
      if (hidden) {
        c.id = "prkYtHidden"; c.setAttribute("aria-hidden", "true");
        c.innerHTML = '<div id="prkYtPlayer"></div>';
      } else {
        c.id = "prkYt"; c.setAttribute("role", "region"); c.setAttribute("aria-label", "Festive music player");
        c.innerHTML = '<div class="yt-h"><span class="yt-t"><span class="prk-diya" aria-hidden="true"></span>' +
          '<span class="en">Dashain Mangal Dhun</span><span class="ne np">दशैं मंगल धुन</span> · Sur Sudha</span>' +
          '<button type="button" class="yt-x" aria-label="Close music player">✕</button></div>' +
          '<div class="yt-v"><div id="prkYtPlayer"></div></div>';
        c.querySelector(".yt-x").addEventListener("click", function () { pause(); if (btn) btn.focus(); });
      }
      doc.body.appendChild(c);
    }
    function ytShow(v) {
      if (hidden || !yt.host) return;
      if (v && btn) { var r = btn.getBoundingClientRect(); yt.host.style.bottom = Math.round(innerHeight - r.top + 10) + "px"; }
      yt.host.classList.toggle("on", v);
    }
    function ytFail() {
      if (yt.failed) return;
      yt.failed = true; clearTimeout(yt.timer); clearTimeout(yt.check);
      try { if (yt.player && yt.player.destroy) yt.player.destroy(); } catch (e) {}
      yt.player = null; ytShow(false);
      if (yt.want) { yt.want = false; synthPlay(); } else set(false);
    }
    function ytApi(cb) {
      if (window.YT && window.YT.Player) { cb(); return; }
      var prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { if (prev) { try { prev(); } catch (e) {} } cb(); };
      if (!doc.getElementById("prkYtApi")) {
        var s = doc.createElement("script"); s.id = "prkYtApi"; s.async = true; s.src = "https://www.youtube.com/iframe_api";
        s.onerror = ytFail; doc.head.appendChild(s);
      }
    }
    /* phones may refuse a start that wasn't directly inside the tap: then show "Play" again, the next tap works */
    function ytCheck() { clearTimeout(yt.check); yt.check = setTimeout(function () { try { if (yt.want && yt.player && yt.player.getPlayerState && yt.player.getPlayerState() !== 1 && yt.player.getPlayerState() !== 3) { yt.want = false; set(false); ytShow(false); } } catch (e) {} }, 5000); }
    function ytPlay() {
      yt.want = true; ytHost(); ytShow(true); set(true);
      if (yt.player && yt.ready) { yt.player.playVideo(); ytCheck(); return; }
      if (yt.loading) return;
      yt.loading = true;
      yt.timer = setTimeout(function () { if (!yt.ready) ytFail(); }, 15000);
      var id = String(cfg.youtube);
      ytApi(function () {
        if (yt.failed || !yt.host) return;
        try {
          yt.player = new YT.Player("prkYtPlayer", {
            host: "https://www.youtube-nocookie.com", videoId: id, width: hidden ? "200" : "100%", height: hidden ? "200" : "100%",
            playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, loop: 1, playlist: id, playsinline: 1, rel: 0, iv_load_policy: 3 },
            events: {
              onReady: function () {
                yt.ready = true; clearTimeout(yt.timer);
                try { var f = yt.host && yt.host.querySelector("iframe"); if (hidden && f) { f.setAttribute("tabindex", "-1"); f.setAttribute("aria-hidden", "true"); } } catch (e) {}
                try { yt.player.setVolume(75); } catch (e) {}
                if (yt.want) { yt.player.playVideo(); ytCheck(); }
              },
              onStateChange: function (e) {
                if (e.data === 1) { if (!on || !yt.shown) nowPlaying("♪ दशैं मंगल धुन · सुर सुधा"); yt.shown = true; set(true); ytShow(true); }
                else if (e.data === 2 || e.data === 0) { yt.want = false; yt.shown = false; set(false); ytShow(false); }
              },
              onError: ytFail
            }
          });
        } catch (e) { ytFail(); }
      });
    }
    function ytPause() { yt.want = false; yt.shown = false; clearTimeout(yt.check); set(false); try { if (yt.player && yt.ready) yt.player.pauseVideo(); } catch (e) {} ytShow(false); }

    function useYt() { return !!cfg.youtube && !cfg.musicUrl && !yt.failed; }
    function play() {
      if (cfg.musicUrl) {
        if (!el) { el = new Audio(cfg.musicUrl); el.loop = true; el.volume = .6; }
        var pr = el.play(); set(true); nowPlaying("♪ दशैं मंगल धुन");
        if (pr && pr.catch) pr.catch(function () { set(false); });
        return;
      }
      if (useYt()) ytPlay(); else synthPlay();
    }
    function pause() {
      if (el) { el.pause(); set(false); }
      if (yt.host) ytPause();
      synthPause();
      if (chip) chip.classList.remove("on");
    }
    return {
      toggle: function () { try { on ? pause() : play(); } catch (e) { set(false); } },
      pause: function () { if (on || yt.want) pause(); },
      stop: function () {
        pause();
        if (ctx && ctx.close) { try { ctx.close(); } catch (e) {} } ctx = out = eng = null;
        if (el) { el.removeAttribute("src"); el = null; }
        clearTimeout(yt.timer); clearTimeout(yt.check);
        try { if (yt.player && yt.player.destroy) yt.player.destroy(); } catch (e) {}
        rm(yt.host); rm(chip); chip = null;
        yt = { host: null, player: null, ready: false, loading: false, want: false, failed: yt.failed, timer: null, check: null };
      },
      playing: function () { return on; }
    };
  })();

  function placeBtn() {
    if (!btn) return;
    var e = doc.getElementById("prkAiFab"), r = e && e.getBoundingClientRect();
    btn.style.bottom = r && r.height && r.left < 140 && r.top > innerHeight * .4 && getComputedStyle(e).display !== "none" ? Math.round(innerHeight - r.top + 12) + "px" : "";
  }
  function makeButton() {
    btn = doc.createElement("button");
    btn.id = "prkMusic"; btn.type = "button";
    btn.title = "दशैं मंगल धुन बजाउनुहोस् · Dashain Mangal Dhun";
    btn.innerHTML = '<span class="prk-diya" aria-hidden="true"></span>' + NOTE + PAUSE;
    btn.addEventListener("click", function () { Music.toggle(); });
    doc.body.appendChild(btn);
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", "Play Dashain Mangal Dhun");
    placeBtn();
    later(function () { if (btn) btn.classList.add("in"); }, 60);
  }

  var rz = null;
  function relayout() { if (fx) fx.style.setProperty("--kt", Math.round(navBottom() + 14) + "px"); buildLights(); placeLights(); placeCorners(); placeBtn(); }
  function onResize() { clearTimeout(rz); rz = setTimeout(relayout, 150); }
  function onVis() { if (doc.hidden) Music.pause(); }

  function start() {
    if (running) return;
    running = true;
    try {
      addCss();
      fx = doc.createElement("div"); fx.id = "prkFx"; fx.setAttribute("aria-hidden", "true");
      fx.style.setProperty("--kt", Math.round(navBottom() + 14) + "px");
      doc.body.appendChild(fx);
      if (cfg.kite !== false) fx.insertAdjacentHTML("beforeend", kiteSvg("kite", 46));
      if (cfg.lights !== false) {
        lights = doc.createElement("div"); lights.id = "prkLights"; lights.setAttribute("aria-hidden", "true");
        doc.body.appendChild(lights); buildLights(); placeLights();
        /* the notice bar can be closed (✕): the lights move up with it */
        mo = new MutationObserver(function () { placeLights(); });
        mo.observe(doc.body, { attributes: true, attributeFilter: ["class"] });
      }
      if (cfg.diyas !== false) makeCorners();
      if (!reduce && !lite && cfg.petals !== false) later(shower, 400);
      if (!reduce && !lite && cfg.crackers !== false) later(cracker, 1800);
      if (cfg.greetings !== false) later(showGreet, 10000);
      if (cfg.music !== false) makeButton();
      var hero = doc.getElementById("home");
      if (hero && window.IntersectionObserver) {
        io = new IntersectionObserver(function (es) { heroOn = es[0].isIntersecting; if (fx) fx.classList.toggle("off-hero", !heroOn); }, { threshold: .12 });
        io.observe(hero);
      }
      addEventListener("resize", onResize, { passive: true });
      doc.addEventListener("visibilitychange", onVis);
    } catch (e) { stop(); }
  }
  function stop() {
    running = false;
    timers.forEach(clearTimeout); timers = [];
    if (io) { io.disconnect(); io = null; }
    if (mo) { mo.disconnect(); mo = null; }
    Music.stop();
    corners.forEach(rm); corners = [];
    rm(fx); rm(btn); rm(css); rm(lights); rm(greet); fx = btn = css = lights = greet = null;
    removeEventListener("resize", onResize);
    doc.removeEventListener("visibilitychange", onVis);
  }

  window.prkFestive = { start: start, stop: stop, _Engine: Engine, _music: Music };
  if (!window.prkFestiveOn || window.prkFestiveOn()) start();
})();
