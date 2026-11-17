/* Mestiza · letras em grão (banner "Haz lo que quieras hacer")
   Técnica: na referência o card METAMORPHOSE é um vídeo MP4 pré-renderizado
   (traço a nanquim que nasce de manchas borradas, fecha no contorno, e depois uma letra
   "espirra" em spray granulado e volta). Aqui o mesmo comportamento é gerado ao vivo:
     1. as letras (fonte de título, caixa alta) são rasterizadas e viram um campo de
        distância assinado (SDF, transformada de distância exata de Felzenszwalb);
     2. cada pixel perto do texto é tinta se  sdf + erosão + manchas·ruído_baixa_freq
        < dither aleatório · granulação. O dither aleatório é o que deixa a borda
        granulada; o ruído de baixa frequência é o que quebra a letra em manchas;
     3. cada letra tem seu próprio estado (manchas, erosão, granulação) animado em
        ciclo: nasce de manchas → fecha → uma letra espirra em grão e volta →
        todas se desfazem em grão → recomeça.
   Sem WebGL; canvas 2D + ImageData, processa só a faixa de pixels perto das letras.
   prefers-reduced-motion: desenha a frase formada, parada, com a borda granulada. */
(function () {
  'use strict';

  var LOOP_MS = 10500;
  var FPS = 30;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeOut(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t) { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function bump(t) { t = clamp(t, 0, 1); return Math.sin(Math.PI * t); }
  function rgbOf(str, fb) {
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((str || '').trim());
    if (!m) {
      var n = (str || '').match(/\d+(\.\d+)?/g);
      return n && n.length >= 3 ? [+n[0], +n[1], +n[2]] : fb;
    }
    var h = m[1].length === 3 ? m[1].replace(/(.)/g, '$1$1') : m[1];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  /* --- transformada de distância euclidiana exata (Felzenszwalb & Huttenlocher) --- */
  var INF = 1e20;
  function edt1d(f, n, d, v, z) {
    var k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (var q = 1; q < n; q++) {
      var s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    k = 0;
    for (var q2 = 0; q2 < n; q2++) {
      while (z[k + 1] < q2) k++;
      var dq = q2 - v[k]; d[q2] = dq * dq + f[v[k]];
    }
  }
  function edt(grid, w, h) {
    var n = Math.max(w, h), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
    var x, y;
    for (x = 0; x < w; x++) {
      for (y = 0; y < h; y++) f[y] = grid[y * w + x];
      edt1d(f, h, d, v, z);
      for (y = 0; y < h; y++) grid[y * w + x] = d[y];
    }
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) f[x] = grid[y * w + x];
      edt1d(f, w, d, v, z);
      for (x = 0; x < w; x++) grid[y * w + x] = Math.sqrt(d[x]);
    }
    return grid;
  }

  /* --- ruído de valor 2D, suave, em [-1, 1] --- */
  function makeNoise(seed) {
    var P = new Float32Array(256 * 256), s = seed || 1;
    for (var i = 0; i < P.length; i++) { s = (s * 16807) % 2147483647; P[i] = (s / 2147483647) * 2 - 1; }
    return function (x, y) {
      var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      var a = P[((yi & 255) << 8) | (xi & 255)], b = P[((yi & 255) << 8) | ((xi + 1) & 255)];
      var c = P[(((yi + 1) & 255) << 8) | (xi & 255)], d = P[(((yi + 1) & 255) << 8) | ((xi + 1) & 255)];
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
  }

  function GrainType(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.lines = (canvas.dataset.lines || 'HAZ LO QUE|QUIERAS|HACER').split('|');
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.noise = makeNoise(7);
    this.visible = true;
    this.raf = 0;
    this.last = 0;
    this.t0 = performance.now();
    this.build();
    this.bind();
    this.kick();
  }

  GrainType.prototype.build = function () {
    var cv = this.canvas, cs = getComputedStyle(cv);
    var cssW = cv.clientWidth, cssH = cv.clientHeight;
    if (!cssW || !cssH) return;
    // ~1 grão por px CSS; em telas retina sobe um pouco, com teto para manter 30 fps
    var scale = Math.min(window.devicePixelRatio || 1, 1.5);
    scale = Math.min(scale, 1400 / cssW);
    var W = Math.max(64, Math.round(cssW * scale)), H = Math.max(32, Math.round(cssH * scale));
    cv.width = W; cv.height = H;
    this.W = W; this.H = H; this.px = scale;

    this.ink = rgbOf(cs.color, [22, 16, 11]);
    this.paper = rgbOf(cs.getPropertyValue('--lj-card-bg') || cs.backgroundColor, [239, 229, 214]);
    var family = cs.fontFamily, weight = cs.fontWeight || '400';
    var lh = parseFloat(cs.getPropertyValue('--lj-type-lh')) || 0.92;
    var track = parseFloat(cs.getPropertyValue('--lj-type-track')) || 0;

    // mede para caber: largura 86% e altura 78% do card
    var m = document.createElement('canvas').getContext('2d');
    var probe = 100;
    m.font = weight + ' ' + probe + 'px ' + family;
    var widest = 0;
    this.lines.forEach(function (l) { widest = Math.max(widest, m.measureText(l).width + track * probe * (l.length - 1)); });
    var size = Math.min((W * 0.86) / (widest / probe), (H * 0.78) / (this.lines.length * lh));
    size = Math.floor(size);
    this.size = size;

    // rasteriza a máscara e guarda o centro de cada letra
    var mc = document.createElement('canvas'); mc.width = W; mc.height = H;
    var x = mc.getContext('2d');
    x.font = weight + ' ' + size + 'px ' + family;
    x.textBaseline = 'alphabetic';
    x.fillStyle = '#fff';
    var metrics = x.measureText('H');
    var capH = metrics.actualBoundingBoxAscent || size * 0.7;
    var blockH = capH + (this.lines.length - 1) * size * lh;
    var top = (H - blockH) / 2 + capH;
    var letters = [], lineBands = [];
    for (var li = 0; li < this.lines.length; li++) {
      var line = this.lines[li], lw = x.measureText(line).width + track * size * (line.length - 1);
      var cx = (W - lw) / 2, base = top + li * size * lh, centers = [];
      for (var ci = 0; ci < line.length; ci++) {
        var chW = x.measureText(line[ci]).width;
        if (line[ci] !== ' ') {
          x.fillText(line[ci], cx, base);
          centers.push({ x: cx + chW / 2, id: letters.length });
          letters.push({ line: li });
        }
        cx += chW + track * size;
      }
      lineBands.push({ base: base, centers: centers });
    }
    this.letters = letters.map(function () { return { blob: 1, erode: 1, grain: 1 }; });

    var alpha = x.getImageData(0, 0, W, H).data, N = W * H;
    var outside = new Float64Array(N), inside = new Float64Array(N), i;
    for (i = 0; i < N; i++) {
      var on = alpha[i * 4 + 3] > 127;
      outside[i] = on ? 0 : INF; inside[i] = on ? INF : 0;
    }
    edt(outside, W, H); edt(inside, W, H);

    // só processa pixels a até "reach" da letra
    var reach = size * 0.3;
    var idx = [], sdf = [], lid = [], lid2 = [], lw = [];
    var fade = size * 0.22;
    var all = [];
    lineBands.forEach(function (lb) { lb.centers.forEach(function (c) { all.push({ x: c.x, y: lb.base - capH / 2, id: c.id }); }); });
    for (var yy = 0; yy < H; yy++) {
      for (var xx = 0; xx < W; xx++) {
        var p = yy * W + xx, s = outside[p] - inside[p];
        if (s > reach) continue;
        // as duas letras mais próximas (distância 2D, eixo vertical comprimido) e o peso
        // entre elas: o estado se mistura perto da fronteira, sem corte reto no spray
        var near = 0, nd = INF, near2 = 0, nd2 = INF;
        for (var k = 0; k < all.length; k++) {
          var ddx = xx - all[k].x, ddy = (yy - all[k].y) * 0.6, dd = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dd < nd) { nd2 = nd; near2 = near; nd = dd; near = all[k].id; }
          else if (dd < nd2) { nd2 = dd; near2 = all[k].id; }
        }
        if (nd2 === INF) near2 = near;
        idx.push(p); sdf.push(s); lid.push(near); lid2.push(near2);
        lw.push(clamp(0.5 + (nd2 - nd) / (2 * fade), 0.5, 1));
      }
    }
    this.idx = Int32Array.from(idx);
    this.sdf = Float32Array.from(sdf);
    this.lid = Uint16Array.from(lid);
    this.lid2 = Uint16Array.from(lid2);
    this.lw = Float32Array.from(lw);

    // papel: cor do card com fibra levíssima (fixa)
    this.img = this.ctx.createImageData(W, H);
    this.base = new Uint8ClampedArray(N * 4);
    var pr = this.paper;
    for (i = 0; i < N; i++) {
      var g = (Math.random() - 0.5) * 7;
      this.base[i * 4] = pr[0] + g; this.base[i * 4 + 1] = pr[1] + g; this.base[i * 4 + 2] = pr[2] + g; this.base[i * 4 + 3] = 255;
    }
    this.schedule();
    this.render(this.reduced ? -1 : performance.now() - this.t0);
  };

  /* sorteia a coreografia de um ciclo: ordem de entrada, letras que espirram e saída */
  GrainType.prototype.schedule = function () {
    var n = this.letters.length, order = [];
    for (var i = 0; i < n; i++) order.push(i);
    for (i = n - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = order[i]; order[i] = order[j]; order[j] = t; }
    this.plan = order.map(function (id, k) {
      return { id: id, inAt: 150 + k * (1500 / Math.max(1, n - 1)) + Math.random() * 220, outAt: 8400 + Math.random() * 900 };
    }).sort(function (a, b) { return a.id - b.id; });
    var sprays = [];
    var count = 1 + (Math.random() < 0.6 ? 1 : 0);
    for (i = 0; i < count; i++) sprays.push({ id: (Math.random() * n) | 0, at: 4300 + i * 1500 + Math.random() * 500 });
    this.sprays = sprays;
  };

  GrainType.prototype.state = function (t) {
    var L = this.letters, i;
    for (i = 0; i < L.length; i++) {
      var p = this.plan[i];
      if (t < 0) { L[i].blob = 0; L[i].erode = 0; L[i].grain = 0; continue; }
      var form = easeOut((t - p.inAt) / 1700);           // nasce das manchas
      var gone = easeInOut((t - p.outAt) / 1100);         // desfaz em grão
      L[i].blob = (1 - form) + gone * 0.35;
      L[i].erode = (1 - form) * 1 + gone * 1.4;
      L[i].grain = (1 - form) * 0.35 + gone * 1.1;
    }
    if (t >= 0) {
      for (i = 0; i < this.sprays.length; i++) {
        var s = this.sprays[i], k = bump((t - s.at) / 1900);
        if (k > 0) { L[s.id].grain = Math.max(L[s.id].grain, k); L[s.id].blob += k * 0.12; }
      }
    }
  };

  GrainType.prototype.render = function (t) {
    if (!this.idx) return;
    this.state(t);
    var d = this.img.data, idx = this.idx, sdf = this.sdf, lid = this.lid, lid2 = this.lid2, lw = this.lw, L = this.letters;
    var W = this.W, size = this.size, ink = this.ink, noise = this.noise;
    var tt = (t < 0 ? 0 : t) / 1000;
    var nf = 1 / Math.max(6, size * 0.11);       // frequência das manchas
    var blobAmp = size * 0.2, erodeAmp = size * 0.13;
    var baseGrain = Math.max(1.6, size * 0.016) * this.px;   // a borda sempre levemente granulada
    var sprayAmp = size * 0.17;
    d.set(this.base);
    for (var k = 0; k < idx.length; k++) {
      var a = L[lid[k]], b = L[lid2[k]], w = lw[k], p = idx[k];
      var blob = a.blob * w + b.blob * (1 - w), erode = a.erode * w + b.erode * (1 - w), grain = a.grain * w + b.grain * (1 - w);
      var f = sdf[k] + erode * erodeAmp;
      if (blob > 0.001) {
        var x = (p % W) * nf, y = ((p / W) | 0) * nf;
        f += blob * blobAmp * (noise(x + tt * 0.35, y - tt * 0.2) + 0.5 * noise(x * 2.3 + 17, y * 2.3 - tt * 0.5));
      }
      var g = baseGrain + grain * sprayAmp;
      // dither triangular: perto da borda o pixel vira tinta com probabilidade que afina
      // suavemente até zero → borda granulada, sem contorno duro
      if (f < (Math.random() + Math.random() - 1) * 1.6 * g) {
        var o = p * 4;
        d[o] = ink[0]; d[o + 1] = ink[1]; d[o + 2] = ink[2];
      }
    }
    this.ctx.putImageData(this.img, 0, 0);
  };

  GrainType.prototype.loop = function (now) {
    var self = this;
    this.raf = 0;
    if (!this.visible || document.hidden || this.reduced) return;
    this.raf = requestAnimationFrame(function (n) { self.loop(n); });
    if (now - this.last < 1000 / FPS) return;
    this.last = now;
    var t = now - this.t0;
    if (t > LOOP_MS) { this.t0 = now; t = 0; this.schedule(); }
    this.render(t);
  };
  GrainType.prototype.kick = function () {
    var self = this;
    if (this.reduced) return;
    if (!this.raf && this.visible && !document.hidden) this.raf = requestAnimationFrame(function (n) { self.loop(n); });
  };

  GrainType.prototype.bind = function () {
    var self = this, t = 0, lastW = this.canvas.clientWidth;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        if (self.canvas.clientWidth === lastW) return;   // ignora a barra do Safari iOS
        lastW = self.canvas.clientWidth; self.build();
      }, 160);
    }, { passive: true });
    document.addEventListener('visibilitychange', function () { self.kick(); });
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    var onMq = function () { self.reduced = mq.matches; if (self.reduced) self.render(-1); else { self.t0 = performance.now(); self.kick(); } };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        var was = self.visible;
        self.visible = e[0].isIntersecting;
        if (self.visible && !was) { self.t0 = performance.now(); self.schedule(); }   // recomeça ao entrar na tela
        self.kick();
      }, { threshold: 0.15 }).observe(this.canvas);
    }
  };

  function init() {
    var els = document.querySelectorAll('canvas[data-grain-type]');
    if (!els.length) return;
    var go = function () { els.forEach(function (el) { if (!el._gt) el._gt = new GrainType(el); }); };
    var fam = getComputedStyle(els[0]).fontFamily;
    var wait = document.fonts && document.fonts.load ? document.fonts.load('400 100px ' + fam, 'HAZQUIERS') : Promise.resolve();
    Promise.race([wait, new Promise(function (r) { setTimeout(r, 1500); })]).then(go, go);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
