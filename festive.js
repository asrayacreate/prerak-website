/* Prerak Multipurpose — Dashain–Tihar festive theme (temporary).
   index.html loads this file only while the theme is on (see PRK_FESTIVE / FEST_END there), and only
   after the page has fully loaded and the browser is idle. Everything is decorative: a few small
   elements animated with transform/opacity (no layout work), pointer-events off, nothing in admin
   mode, no motion for "reduce motion" users, and the music never starts without a click. */
(function () {
  "use strict";
  if (window.prkFestive) return;
  var doc = document;
  var cfg = window.PRK_FESTIVE || {};
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var lite = !!(navigator.connection && navigator.connection.saveData);
  var running = false, fx = null, btn = null, css = null, io = null, heroOn = true;
  var timers = [], bursts = 0, MAX_BURSTS = 30;

  function small() { return innerWidth < 768; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function idle() { return running && !doc.hidden && !doc.body.classList.contains("admin-mode"); }
  function rm(el) { if (el && el.parentNode) el.parentNode.removeChild(el); }
  function navBottom() { var n = doc.getElementById("mainNav"); return n ? Math.max(0, n.getBoundingClientRect().bottom) : 100; }

  /* ── artwork ── */
  function marigold() {
    var p = "", i;
    for (i = 0; i < 12; i++) p += '<ellipse rx="3.1" ry="6" transform="rotate(' + i * 30 + ') translate(0 -5.2)" fill="#f97316"/>';
    for (i = 0; i < 9; i++) p += '<ellipse rx="2.3" ry="4.2" transform="rotate(' + (i * 40 + 15) + ') translate(0 -3.4)" fill="#fbbf24"/>';
    return 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -12 24 24">' + p + '<circle r="2.6" fill="#c2410c"/></svg>') + '")';
  }
  var KITE = '<svg class="kite" viewBox="0 0 60 122" width="46" height="94">' +
    '<path d="M30 2 54 34 30 74 6 34Z" fill="#dc2626"/><path d="M30 2 54 34H30Z" fill="#fbbf24"/><path d="M30 34H6l24 40Z" fill="#1d4ed8"/>' +
    '<path d="M30 2v72M6 34h48" stroke="#7c2d12" stroke-width="1.3"/>' +
    '<path d="M30 74c-5 12 6 20 0 32-3 7 2 11 0 16" stroke="#7c2d12" stroke-width="1.1" fill="none"/>' +
    '<path d="M23 84l7 4-7 4zM37 84l-7 4 7 4zM23 99l7 4-7 4zM37 99l-7 4 7 4z" fill="#f97316"/></svg>';
  var NOTE = '<svg class="ic-play" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 17.5V5.8l10-2.3v11.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="17.5" r="2.6" fill="currentColor"/><circle cx="16.5" cy="15.2" r="2.6" fill="currentColor"/></svg>';
  var PAUSE = '<svg class="ic-pause" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>';

  function addCss() {
    if (css) return;
    css = doc.createElement("style");
    css.id = "prkFestiveCss";
    css.textContent =
      "#prkFx{position:fixed;inset:0;pointer-events:none;z-index:9000;overflow:hidden;contain:strict}" +
      "body.admin-mode #prkFx,body.admin-mode #prkMusic{display:none!important}" +
      /* marigolds + petals: one element falls, its child sways */
      "#prkFx .pf{position:absolute;top:0;animation:prkFallY linear both}" +
      "#prkFx .pf>i{display:block;animation:prkSway ease-in-out infinite alternate}" +
      "#prkFx .mg{width:22px;height:22px;background:" + marigold() + " center/contain no-repeat}" +
      "#prkFx .pt{width:8px;height:12px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:linear-gradient(160deg,#fde047,#f97316 70%)}" +
      "@keyframes prkFallY{from{transform:translate3d(0,-40px,0)}to{transform:translate3d(0,110vh,0)}}" +
      "@keyframes prkSway{from{transform:translate3d(-16px,0,0) rotate(-35deg)}to{transform:translate3d(16px,0,0) rotate(35deg)}}" +
      /* kite */
      "#prkFx .kite{position:absolute;right:5vw;top:var(--kt,124px);width:46px;height:auto;transform-origin:50% 8%;animation:prkKite 5.5s ease-in-out infinite alternate;transition:opacity .6s}" +
      "#prkFx.off-hero .kite{opacity:0}" +
      "@keyframes prkKite{0%{transform:translate3d(0,0,0) rotate(-9deg)}50%{transform:translate3d(-14px,8px,0) rotate(4deg)}100%{transform:translate3d(-26px,-6px,0) rotate(10deg)}}" +
      /* firecrackers */
      "#prkFx .bst{position:absolute;width:0;height:0}" +
      "#prkFx .rk{position:absolute;left:-1px;top:0;width:2px;height:18px;border-radius:2px;background:linear-gradient(#fff7cc,rgba(251,146,60,0))}" +
      "#prkFx .fl{position:absolute;left:-14px;top:-14px;width:28px;height:28px;border-radius:50%;background:radial-gradient(circle,#fff 0,rgba(255,240,180,.9) 30%,rgba(255,200,80,0) 70%);opacity:0}" +
      "#prkFx .sp{position:absolute;left:-2.5px;top:-2.5px;width:5px;height:5px;border-radius:50%;opacity:0}" +
      /* music button (a lit diya + note) */
      "#prkMusic{position:fixed;left:16px;bottom:92px;z-index:9050;display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;padding:0;border-radius:50%;" +
      "border:1px solid rgba(146,64,14,.35);background:linear-gradient(135deg,#fde68a,#fbbf24 55%,#f59e0b);color:#1a1208;font-family:inherit;font-weight:800;font-size:.76rem;letter-spacing:.3px;" +
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
      /* YouTube player card (visible while the YouTube tune plays; the player itself is 200 px tall) */
      "#prkYt{position:fixed;left:16px;bottom:150px;z-index:9060;width:min(372px,calc(100vw - 32px));padding:8px;border-radius:16px;" +
      "background:linear-gradient(160deg,#13254a,#1a1208);border:1px solid rgba(251,191,36,.6);box-shadow:0 14px 34px rgba(0,0,0,.38),0 0 0 3px rgba(251,191,36,.14);" +
      "opacity:0;visibility:hidden;transform:translate3d(0,12px,0);transition:opacity .3s,transform .3s,visibility 0s .3s}" +
      "#prkYt.on{opacity:1;visibility:visible;transform:none;transition:opacity .3s,transform .3s}" +
      "body.admin-mode #prkYt{display:none!important}" +
      "#prkYt .yt-h{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 2px 8px 4px;font-weight:800;font-size:.76rem;letter-spacing:.2px}" +
      "#prkYt .yt-t{display:flex;align-items:center;gap:7px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      "#prkYt .yt-t .prk-diya{display:inline-block;position:relative;width:16px;height:16px;flex:none}" +
      "html body #prkYt .yt-h span{color:#fde68a!important;-webkit-text-fill-color:#fde68a!important}" +
      "#prkYt .yt-x{flex:none;width:32px;height:32px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:.85rem;cursor:pointer}" +
      "#prkYt .yt-x:hover{background:rgba(255,255,255,.24)}#prkYt .yt-x:focus-visible{outline:3px solid #fbbf24;outline-offset:2px}" +
      "#prkYt .yt-v{position:relative;width:100%;height:200px;border-radius:10px;overflow:hidden;background:#000}" +
      "#prkYt .yt-v iframe{position:absolute;inset:0;width:100%;height:100%;border:0}" +
      "@media(max-width:768px){#prkFx .kite{width:30px;right:12px}#prkMusic{bottom:150px}}" +
      "@media (prefers-reduced-motion:reduce){#prkFx .kite,#prkMusic[aria-pressed=true]::after{animation:none}}";
    doc.head.appendChild(css);
  }

  /* ── falling marigolds: a shower of ~45 s, again every couple of minutes ── */
  function shower() {
    if (!running) return;
    if (idle()) {
      var n = small() ? 7 : 12;
      for (var i = 0; i < n; i++) {
        var p = doc.createElement("span"), c = doc.createElement("i"), dur = rnd(9, 15);
        p.className = "pf";
        c.className = i % 3 === 2 ? "pt" : "mg";
        p.style.left = rnd(2, 96).toFixed(1) + "%";
        p.style.animationDuration = dur.toFixed(2) + "s";
        p.style.animationDelay = rnd(0, dur).toFixed(2) + "s";
        p.style.animationIterationCount = "3";
        c.style.animationDuration = rnd(2.2, 3.6).toFixed(2) + "s";
        if (c.className === "mg") { var k = rnd(.7, 1.15).toFixed(2); c.style.width = c.style.height = Math.round(22 * k) + "px"; }
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
     2) PRK_FESTIVE.youtube: a YouTube video (Sur Sudha — Dashain Mangal Dhun). YouTube's rules need
        the player to be visible (at least 200×200 px) while it plays and forbid audio-only
        playback, so a small festive card with the player shows while the music plays and hides
        when it is paused. The YouTube IFrame API is loaded only on the first click.
     3) Otherwise (or if YouTube can't play the video here) the built-in festive dhun. */
  var Music = (function () {
    var ctx = null, out = null, eng = null, tick = null, el = null, on = false;
    var yt = { card: null, player: null, ready: false, loading: false, want: false, failed: false, timer: null };
    function set(v) { on = v; if (btn) { btn.setAttribute("aria-pressed", v ? "true" : "false"); btn.setAttribute("aria-label", v ? "Pause festive music" : "Play festive music"); } }

    function synthPlay() {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctx) { ctx = new AC(); out = ctx.createGain(); out.gain.value = 0; out.connect(ctx.destination); eng = Engine(ctx, out); eng.start(ctx.currentTime + .08); }
      var r = ctx.resume && ctx.resume();
      out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(.55, ctx.currentTime, .25);
      clearInterval(tick); eng.schedule(ctx.currentTime + .35);
      tick = setInterval(function () { try { eng.schedule(ctx.currentTime + .35); } catch (e) {} }, 90);
      set(true);
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

    function ytCard() {
      if (yt.card) return;
      var c = yt.card = doc.createElement("div");
      c.id = "prkYt"; c.setAttribute("role", "region"); c.setAttribute("aria-label", "Festive music player");
      c.innerHTML = '<div class="yt-h"><span class="yt-t"><span class="prk-diya" aria-hidden="true"></span>' +
        '<span class="en">Dashain Mangal Dhun</span><span class="ne np">दशैं मंगल धुन</span> · Sur Sudha</span>' +
        '<button type="button" class="yt-x" aria-label="Close music player">✕</button></div>' +
        '<div class="yt-v"><div id="prkYtPlayer"></div></div>';
      doc.body.appendChild(c);
      c.querySelector(".yt-x").addEventListener("click", function () { pause(); if (btn) btn.focus(); });
    }
    function ytShow(v) {
      if (!yt.card) return;
      if (v && btn) { var r = btn.getBoundingClientRect(); yt.card.style.bottom = Math.round(innerHeight - r.top + 10) + "px"; }
      yt.card.classList.toggle("on", v);
    }
    function ytFail() {
      if (yt.failed) return;
      yt.failed = true; clearTimeout(yt.timer);
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
    function ytPlay() {
      yt.want = true; ytCard(); ytShow(true); set(true);
      if (yt.player && yt.ready) { yt.player.playVideo(); return; }
      if (yt.loading) return;
      yt.loading = true;
      yt.timer = setTimeout(function () { if (!yt.ready) ytFail(); }, 15000);
      var id = String(cfg.youtube);
      ytApi(function () {
        if (yt.failed || !yt.card) return;
        try {
          yt.player = new YT.Player("prkYtPlayer", {
            host: "https://www.youtube-nocookie.com", videoId: id, width: "100%", height: "100%",
            playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, loop: 1, playlist: id, playsinline: 1, rel: 0, iv_load_policy: 3 },
            events: {
              onReady: function () { yt.ready = true; clearTimeout(yt.timer); try { yt.player.setVolume(70); } catch (e) {} if (yt.want) yt.player.playVideo(); },
              onStateChange: function (e) {
                if (e.data === 1) { set(true); ytShow(true); }
                else if (e.data === 2 || e.data === 0) { yt.want = false; set(false); ytShow(false); }
              },
              onError: ytFail
            }
          });
        } catch (e) { ytFail(); }
      });
    }
    function ytPause() { yt.want = false; set(false); try { if (yt.player && yt.ready) yt.player.pauseVideo(); } catch (e) {} ytShow(false); }

    function useYt() { return !!cfg.youtube && !cfg.musicUrl && !yt.failed; }
    function play() {
      if (cfg.musicUrl) {
        if (!el) { el = new Audio(cfg.musicUrl); el.loop = true; el.volume = .6; }
        var pr = el.play(); set(true);
        if (pr && pr.catch) pr.catch(function () { set(false); });
        return;
      }
      if (useYt()) ytPlay(); else synthPlay();
    }
    function pause() {
      if (el) { el.pause(); set(false); }
      if (yt.card) ytPause();
      synthPause();
    }
    return {
      toggle: function () { try { on ? pause() : play(); } catch (e) { set(false); } },
      pause: function () { if (on || yt.want) pause(); },
      stop: function () {
        pause();
        if (ctx && ctx.close) { try { ctx.close(); } catch (e) {} } ctx = out = eng = null;
        if (el) { el.removeAttribute("src"); el = null; }
        clearTimeout(yt.timer);
        try { if (yt.player && yt.player.destroy) yt.player.destroy(); } catch (e) {}
        rm(yt.card); yt = { card: null, player: null, ready: false, loading: false, want: false, failed: yt.failed, timer: null };
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
    btn.title = "Festive music · चाडपर्वको धुन";
    btn.innerHTML = '<span class="prk-diya" aria-hidden="true"></span>' + NOTE + PAUSE;
    btn.addEventListener("click", function () { Music.toggle(); });
    doc.body.appendChild(btn);
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", "Play festive music");
    placeBtn();
    later(function () { if (btn) btn.classList.add("in"); }, 60);
  }

  var rz = null;
  function onResize() { clearTimeout(rz); rz = setTimeout(function () { if (fx) fx.style.setProperty("--kt", Math.round(navBottom() + 14) + "px"); placeBtn(); }, 150); }
  function onVis() { if (doc.hidden) Music.pause(); }

  function start() {
    if (running) return;
    running = true;
    try {
      addCss();
      fx = doc.createElement("div"); fx.id = "prkFx"; fx.setAttribute("aria-hidden", "true");
      fx.style.setProperty("--kt", Math.round(navBottom() + 14) + "px");
      doc.body.appendChild(fx);
      if (cfg.kite !== false) fx.insertAdjacentHTML("beforeend", KITE);
      if (!reduce && !lite && cfg.petals !== false) later(shower, 400);
      if (!reduce && !lite && cfg.crackers !== false) later(cracker, 1800);
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
    Music.stop();
    rm(fx); rm(btn); rm(css); fx = btn = css = null;
    removeEventListener("resize", onResize);
    doc.removeEventListener("visibilitychange", onVis);
  }

  window.prkFestive = { start: start, stop: stop, _Engine: Engine, _music: Music };
  if (!window.prkFestiveOn || window.prkFestiveOn()) start();
})();
