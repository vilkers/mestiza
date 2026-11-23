/* Mestiza · direção papel (nov/2026)
   Moeda no lugar do asterisco da referência:
   - [data-wordmark]  logo oficial recortado por letra (tools/split-logo.py) + moeda.
     Opções A (no lugar do I), B (entre MESTI e ZA), C (depois do logo), D (no lugar do S).
     Entrada: a letra se dissolve em grão, as letras abrem espaço e a moeda se forma em grão.
   - [data-coin]      moeda pequena (cabeçalho, botões) que gira com a rolagem.
   - [data-emboss]    moeda em relevo no papel que vira sólida com a rolagem.
   Canvas 2D, sem bibliotecas. prefers-reduced-motion: estado final, sem animação. */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var root = document.currentScript ? new URL('..', document.currentScript.src).href : '../';
  var FRAMES = 30;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function img(src) { var i = new Image(); i.decoding = 'async'; i.src = root + src; return i; }
  function ready(i) { return i.complete && i.naturalWidth > 0; }

  /* ---------- quadros da moeda (compartilhados) ---------- */
  var frames = [];
  function frame(n) {
    n = ((n % FRAMES) + FRAMES) % FRAMES;
    if (!frames[n]) frames[n] = img('assets/coin/scroll-alpha/' + String(n).padStart(2, '0') + '.webp');
    return frames[n];
  }
  function preloadFrames() { for (var i = 0; i < FRAMES; i++) frame(i); }
  function spinFrame(offset) { return reduced.matches ? 0 : Math.floor((scrollY / 22) + (offset || 0)) % FRAMES; }

  /* ---------- ruído de dissolução: manchas de baixa frequência + grão ---------- */
  var NS = 512, noise = null;
  function buildNoise() {
    noise = new Float32Array(NS * NS);
    function grid(cell, seed) {
      var n = Math.ceil(NS / cell) + 1, g = new Float32Array(n * n), s = seed;
      for (var i = 0; i < g.length; i++) { s = (s * 16807) % 2147483647; g[i] = s / 2147483647; }
      return { cell: cell, n: n, g: g };
    }
    var o = [grid(64, 7), grid(22, 13), grid(7, 29)], w = [.5, .3, .2];
    for (var y = 0; y < NS; y++) for (var x = 0; x < NS; x++) {
      var v = 0;
      for (var k = 0; k < 3; k++) {
        var c = o[k].cell, gx = x / c, gy = y / c, x0 = gx | 0, y0 = gy | 0, fx = gx - x0, fy = gy - y0, n = o[k].n, g = o[k].g;
        fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
        var a = g[y0 * n + x0], b = g[y0 * n + x0 + 1], cc = g[(y0 + 1) * n + x0], d = g[(y0 + 1) * n + x0 + 1];
        v += w[k] * (a + (b - a) * fx + (cc - a) * fy + (a - b - cc + d) * fx * fy);
      }
      noise[y * NS + x] = v;
    }
    // equaliza (distribuição uniforme) para o progresso da dissolução ser linear; depois mistura grão fino
    var idx = new Uint32Array(NS * NS); for (var j = 0; j < idx.length; j++) idx[j] = j;
    var vals = noise.slice(); idx.sort(function (p, q) { return vals[p] - vals[q]; });
    for (var r = 0; r < idx.length; r++) noise[idx[r]] = (r / idx.length) * .84 + Math.random() * .16;
  }
  /* desenha `source` em ctx com dissolução p (0 = some, 1 = inteiro). */
  var scratch = document.createElement('canvas'), sctx = scratch.getContext('2d', { willReadFrequently: true });
  function drawDissolved(ctx, source, sx, sy, sw, sh, dx, dy, dw, dh, p) {
    if (p >= 1) { ctx.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh); return; }
    if (p <= 0) return;
    if (!noise) buildNoise();
    var w = Math.max(1, Math.ceil(dw)), h = Math.max(1, Math.ceil(dh));
    if (scratch.width < w) scratch.width = w; if (scratch.height < h) scratch.height = h;
    sctx.clearRect(0, 0, w, h); sctx.drawImage(source, sx, sy, sw, sh, 0, 0, dw, dh);
    var data = sctx.getImageData(0, 0, w, h), px = data.data, band = .14, t = p * (1 + band) - band * .5;
    var ox = Math.round(dx) & (NS - 1), oy = Math.round(dy) & (NS - 1);
    for (var y = 0; y < h; y++) {
      var row = ((y + oy) & (NS - 1)) * NS;
      for (var x = 0; x < w; x++) {
        var i = (y * w + x) * 4 + 3; if (!px[i]) continue;
        var m = (t - noise[row + ((x + ox) & (NS - 1))]) / band;
        if (m <= 0) px[i] = 0; else if (m < 1) px[i] = px[i] * (Math.random() < m ? 1 : 0);
      }
    }
    sctx.putImageData(data, 0, 0);
    ctx.drawImage(scratch, 0, 0, w, h, dx, dy, w, h);
  }

  /* ---------- wordmark: logo oficial + moeda ---------- */
  /* Cada camada é composta no tamanho original do logo (1616×454) antes de escalar:
     letras que andam juntas viram uma imagem só, sem emendas de reamostragem.
     out = letra que se dissolve; nas opções A e D o T usa t-solo (braço direito fechado)
     e o pedaço do T original que encosta no I/S se dissolve junto com a letra. */
  var LW = 1616, LH = 454, D = 330, CY = 226;
  var LAYOUT = {
    a: { coin: 1057 + D / 2, groups: [{ k: ['m', 'e', 's', 'tl', 'ts'], dx: 0 }, { k: ['za'], dx: 323 }], out: { k: ['t', 'i'], minus: ['ts'], box: [997, 39, 1116, 364] } },
    b: { coin: 1140 + D / 2, groups: [{ k: ['m', 'e', 's', 't', 'i'], dx: 0 }, { k: ['za'], dx: 406 }] },
    c: { coin: 1591 + D / 2, groups: [{ k: ['m', 'e', 's', 't', 'i', 'za'], dx: 0 }] },
    d: { coin: 655 + D / 2, groups: [{ k: ['m', 'e'], dx: 0 }, { k: ['ts', 'i', 'za'], dx: 259 }], out: { k: ['s', 't'], minus: ['ts'], box: [607, 66, 814, 411] } }
  };
  var KEYS = ['m', 'e', 's', 't', 'ts', 'tl', 'i', 'za'], FILE = { ts: 't-solo' }, parts = {};
  function partsReady() { return KEYS.every(function (k) { return ready(parts[k]); }); }
  function initWordmark(el) {
    KEYS.forEach(function (k) { if (!parts[k]) parts[k] = img('assets/logo/parts/' + (FILE[k] || k) + '.png'); });
    var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
    canvas.setAttribute('aria-hidden', 'true'); el.appendChild(canvas);
    var color = getComputedStyle(el).color, layers = {}, start = 0, option = null, raf = 0, W = 0, H = 0, dpr = 1;
    function layer(id, keys, minus) { // logo é branco; pinta na cor do texto
      if (layers[id]) return layers[id];
      var cv = document.createElement('canvas'), c = cv.getContext('2d'); cv.width = LW; cv.height = LH;
      keys.forEach(function (k) { c.drawImage(parts[k], 0, 0); });
      if (minus) { c.globalCompositeOperation = 'destination-out'; minus.forEach(function (k) { c.drawImage(parts[k], 0, 0); }); }
      c.globalCompositeOperation = 'source-in'; c.fillStyle = color; c.fillRect(0, 0, LW, LH);
      return (layers[id] = cv);
    }
    function extent(L) { var g = L.groups[L.groups.length - 1]; return Math.max(1561 + (g.k.indexOf('za') >= 0 ? g.dx : 0), L.coin + D / 2) - 47; }
    function size() {
      var L = LAYOUT[option], r = el.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width; var full = extent(L); H = W * (CY * 2 - 2) / full * 1.02;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    }
    function draw(now) {
      raf = 0; if (!partsReady()) { raf = requestAnimationFrame(draw); return; }
      var L = LAYOUT[option], full = extent(L), k = canvas.width / full;
      var t = reduced.matches ? 1 : clamp((now - start) / 2800, 0, 1);
      var pOut = 1 - clamp(t / .48, 0, 1), move = ease(clamp((t - .22) / .48, 0, 1)), pIn = clamp((t - .44) / .56, 0, 1);
      var width = 1514 + (full - 1514) * move;
      var ox = (canvas.width - width * k) / 2 - 47 * k, oy = (canvas.height - (CY * 2 - 2) * k) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (t <= 0) ctx.drawImage(layer('full', ['m', 'e', 's', 't', 'i', 'za']), ox, oy, LW * k, LH * k);
      else {
        L.groups.forEach(function (g, n) { ctx.drawImage(layer(option + n, g.k), ox + g.dx * move * k, oy, LW * k, LH * k); });
        if (L.out && pOut > 0) {
          var b = L.out.box, src = layer(option + 'out', L.out.k, L.out.minus);
          drawDissolved(ctx, src, b[0], b[1], b[2] - b[0], b[3] - b[1], ox + b[0] * k, oy + b[1] * k, (b[2] - b[0]) * k, (b[3] - b[1]) * k, pOut);
        }
      }
      var f = frame(spinFrame(0));
      if (ready(f)) {
        var cs = D * k * (480 / 446), cx = ox + L.coin * k - cs / 2, cy = oy + CY * k - cs / 2; // a moeda ocupa ~446 px do quadro de 480
        drawDissolved(ctx, f, 0, 0, 480, 480, cx, cy, cs, cs, pIn);
      }
      if (t < 1) raf = requestAnimationFrame(draw);
    }
    function request() { if (!raf) raf = requestAnimationFrame(draw); }
    el.setOption = function (o) {
      if (!LAYOUT[o]) o = 'a'; option = o; el.dataset.option = o; size(); start = performance.now() + 450; request();
    };
    el.replay = function () { start = performance.now() + 150; request(); };
    el.setOption(el.dataset.wordmark || 'a');
    addEventListener('resize', function () { size(); request(); });
    addEventListener('scroll', request, { passive: true });
    reduced.addEventListener('change', request);
  }

  /* ---------- moedas pequenas ---------- */
  function initCoin(cv) {
    var ctx = cv.getContext('2d'), off = Number(cv.dataset.coin) || 0, last = -1;
    function draw() {
      var n = spinFrame(off), f = frame(n); if (!ready(f)) { f.addEventListener('load', draw, { once: true }); return; }
      if (n === last) return; last = n; ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(f, 0, 0, cv.width, cv.height);
    }
    addEventListener('scroll', function () { requestAnimationFrame(draw); }, { passive: true }); draw();
  }

  /* ---------- moeda em relevo que vira sólida ---------- */
  function embossOf(f, paper) {
    var s = 480, cv = document.createElement('canvas'); cv.width = cv.height = s;
    var c = cv.getContext('2d', { willReadFrequently: true }); c.drawImage(f, 0, 0, s, s);
    var d = c.getImageData(0, 0, s, s), p = d.data, L = new Float32Array(s * s), out = c.createImageData(s, s), o = out.data;
    for (var i = 0; i < s * s; i++) L[i] = (p[i * 4] * .3 + p[i * 4 + 1] * .59 + p[i * 4 + 2] * .11) / 255 * (p[i * 4 + 3] / 255);
    for (var y = 1; y < s - 1; y++) for (var x = 1; x < s - 1; x++) {
      var i2 = y * s + x, a = p[i2 * 4 + 3]; if (!a) continue;
      var gx = L[i2 + 1] - L[i2 - 1], gy = L[i2 + s] - L[i2 - s], sh = clamp((-gx - gy) * 2.6, -1, 1);
      var base = sh >= 0 ? 255 : 0, amt = Math.abs(sh) * .55;
      o[i2 * 4] = paper[0] + (base - paper[0]) * amt; o[i2 * 4 + 1] = paper[1] + (base - paper[1]) * amt; o[i2 * 4 + 2] = paper[2] + (base - paper[2]) * amt;
      o[i2 * 4 + 3] = a;
    }
    c.putImageData(out, 0, 0); return cv;
  }
  function initEmboss(sec) {
    var cv = sec.querySelector('canvas'), ctx = cv.getContext('2d'), relief = null, raf = 0;
    var paper = [242, 237, 228];
    function progress() { var r = sec.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
    function draw() {
      raf = 0; var f0 = frame(0); if (!ready(f0)) { f0.addEventListener('load', draw, { once: true }); return; }
      if (!relief) relief = embossOf(f0, paper);
      var p = reduced.matches ? 1 : progress(), solid = ease(clamp((p - .25) / .45, 0, 1));
      var spin = p > .72 && !reduced.matches ? Math.floor((p - .72) / .28 * FRAMES * 1.5) : 0, f = frame(spin);
      sec.style.setProperty('--p', p.toFixed(3));
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (solid < 1) { ctx.globalAlpha = 1 - solid * .6; ctx.drawImage(relief, 0, 0, cv.width, cv.height); ctx.globalAlpha = 1; }
      drawDissolved(ctx, ready(f) ? f : f0, 0, 0, 480, 480, 0, 0, cv.width, cv.height, solid);
    }
    addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(draw); }, { passive: true });
    addEventListener('resize', draw); draw();
  }

  function boot() {
    document.querySelectorAll('[data-wordmark]').forEach(initWordmark);
    document.querySelectorAll('canvas[data-coin]').forEach(initCoin);
    document.querySelectorAll('[data-emboss]').forEach(initEmboss);
    var lazy = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { preloadFrames(); lazy.disconnect(); } }, { rootMargin: '400px' });
    document.querySelectorAll('[data-emboss],[data-wordmark]').forEach(function (n) { lazy.observe(n); });
    addEventListener('load', preloadFrames);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.MestizaCoin = { layouts: Object.keys(LAYOUT) };
})();
