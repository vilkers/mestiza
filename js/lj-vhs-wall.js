/* Mestiza · parede de blocos com estática VHS
   Reprodução com código próprio do comportamento analisado na referência:
   1. "dark"  – blocos pretos (0–400 ms)
   2. "tape"  – fita ligando: fundo escuro + salpicos (densidade .09, amplitude 110,
                rastro gaussiano por linha ×3), linha de tracking e faixa de head-switch.
                O quadro é um só para a parede inteira e cada bloco recorta sua fatia,
                como na referência (OSD "PLAY ▶ / SP 00:00:0X" atravessando os blocos).
   3. letras  – entram em ordem aleatória, fade de 520 ms espalhado em 1100 ms.
   4. zap     – troca de canal por bloco: estática clara 140 ms ±60, chance .72,
                8% de segurar 400 ms; crop da estática re-sorteado a cada 60–220 ms.
   5. ciclo   – composição fica 2200 ms e troca por zap. Estática a 24 fps.
   A estática é gerada em canvas 2D, sem vídeo. Tom: LUT do escuro (--lj-bg)
   ao claro (--lj-fg), equivalente ao tom "warm" da referência na paleta terra.
   prefers-reduced-motion: mostra a composição de letras parada, sem estática animada. */
(function () {
  'use strict';

  var CFG = {
    darkMs: 400,
    letterStartMs: 1150,
    letterFadeMs: 520,
    letterSpreadMs: 1100,
    openingHoldMs: 3500,
    compositionHoldMs: 2200,
    fps: 24,
    tapeScale: 0.5,          // resolução da fita em px CSS (0.5 = pixel de 2px, mais VHS)
    staticScale: 0.5,
    speckle: { density: 0.09, amplitude: 110, streak: 3 },
    zapMs: 140, zapJitterMs: 60, zapProbability: 0.72,
    zapLongChance: 0.08, zapLongMs: 400,
    rerollMinMs: 60, rerollMaxMs: 220,
    fadeMs: 180
  };

  var LAYOUTS = {
    wide:   { cols: 7, rows: 3, letters: ['MESTIZA', '       ', ' STUDIO'] },
    narrow: { cols: 2, rows: 4, letters: ['ME', 'ST', 'IZ', 'A '] }
  };

  function rgbOf(str, fallback) {
    var s = (str || '').trim();
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
    if (!m) return fallback;
    var h = m[1].length === 3 ? m[1].replace(/(.)/g, '$1$1') : m[1];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function gauss() {
    var u = 1 - Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
  }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function Wall(root) {
    this.root = root;
    this.grid = root.querySelector('.lj-wall__grid');
    this.osd = root.querySelector('.lj-wall__osd');
    this.images = (root.dataset.images || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.cells = [];
    this.phase = 'dark';
    this.visible = true;
    this.t0 = performance.now();
    this.lastPaint = 0;
    this.raf = 0;
    this.timers = [];
    this.imgMeta = {};
    var cs = getComputedStyle(document.documentElement);
    this.dark = rgbOf(cs.getPropertyValue('--lj-bg'), [22, 16, 11]);
    this.light = rgbOf(cs.getPropertyValue('--lj-fg'), [239, 229, 214]);
    this.buildLut();
    this.buildStaticTiles();
    this.tape = document.createElement('canvas');
    this.tctx = this.tape.getContext('2d');
    this.layout();
    this.preload();
    this.bind();
    this.start();
  }

  Wall.prototype.buildLut = function () {
    var lut = new Uint8ClampedArray(768), d = this.dark, l = this.light;
    for (var i = 0; i < 256; i++) {
      var s = i / 255;
      lut[3 * i] = d[0] + (l[0] - d[0]) * s;
      lut[3 * i + 1] = d[1] + (l[1] - d[1]) * s;
      lut[3 * i + 2] = d[2] + (l[2] - d[2]) * s;
    }
    this.lut = lut;
  };

  /* Estática clara (troca de canal): 4 tiles 256² com luminância 60–235 pela LUT */
  Wall.prototype.buildStaticTiles = function () {
    this.tiles = [];
    for (var k = 0; k < 4; k++) {
      var c = document.createElement('canvas'); c.width = c.height = 256;
      var x = c.getContext('2d'), img = x.createImageData(256, 256), d = img.data, lut = this.lut;
      for (var row = 0; row < 256; row++) {
        var band = Math.random() < 0.04 ? rand(-40, 40) : 0;   // faixas horizontais de sinal
        for (var col = 0; col < 256; col++) {
          var i = (row * 256 + col) * 4;
          var v = Math.max(0, Math.min(255, (60 + 175 * Math.random() + band) | 0)) * 3;
          d[i] = lut[v]; d[i + 1] = lut[v + 1]; d[i + 2] = lut[v + 2]; d[i + 3] = 255;
        }
      }
      x.putImageData(img, 0, 0);
      this.tiles.push(c);
    }
  };

  function layoutFrom(attr, base) {
    if (!attr) return base;
    var rows = attr.split('|');
    var cols = rows.reduce(function (m, r) { return Math.max(m, r.length); }, 0) || base.cols;
    return { cols: cols, rows: rows.length, letters: rows, key: attr };
  }

  Wall.prototype.layout = function () {
    var narrow = window.matchMedia('(max-width: 720px)').matches;
    if (!this.layouts) this.layouts = {
      wide: layoutFrom(this.root.dataset.letters, LAYOUTS.wide),
      narrow: layoutFrom(this.root.dataset.lettersNarrow, LAYOUTS.narrow)
    };
    var L = narrow ? this.layouts.narrow : this.layouts.wide;
    if (this.L === L) return this.measure();
    this.L = L;
    this.grid.style.setProperty('--lj-cols', L.cols);
    this.grid.style.setProperty('--lj-rows', L.rows);
    this.grid.innerHTML = '';
    this.cells = [];
    for (var r = 0; r < L.rows; r++) {
      for (var c = 0; c < L.cols; c++) {
        var ch = (L.letters[r] || '').charAt(c);
        var el = document.createElement('div');
        el.className = 'lj-cell';
        var media = document.createElement('div'); media.className = 'lj-cell__media';
        var cv = document.createElement('canvas'); cv.className = 'lj-cell__noise'; cv.setAttribute('aria-hidden', 'true');
        el.appendChild(media); el.appendChild(cv);
        var letter = null;
        if (ch && ch !== ' ') {
          letter = document.createElement('span'); letter.className = 'lj-cell__letter';
          letter.textContent = ch; letter.setAttribute('aria-hidden', 'true');
          el.appendChild(letter);
        }
        this.grid.appendChild(el);
        this.cells.push({ el: el, media: media, canvas: cv, ctx: cv.getContext('2d'), letter: letter,
          mode: 'dark', zapUntil: 0, crop: null, rerollAt: 0, r: r, c: c });
      }
    }
    this.root.setAttribute('aria-label', 'Mestiza Studio');
    this.measure();
  };

  Wall.prototype.measure = function () {
    var wr = this.grid.getBoundingClientRect();
    this.wall = { w: wr.width, h: wr.height };
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.tape.width = Math.max(8, Math.round(wr.width * CFG.tapeScale));
    this.tape.height = Math.max(8, Math.round(wr.height * CFG.tapeScale));
    for (var i = 0; i < this.cells.length; i++) {
      var cell = this.cells[i], r = cell.el.getBoundingClientRect();
      cell.rect = { x: r.left - wr.left, y: r.top - wr.top, w: r.width, h: r.height };
      cell.canvas.width = Math.max(1, Math.round(r.width * dpr * CFG.staticScale));
      cell.canvas.height = Math.max(1, Math.round(r.height * dpr * CFG.staticScale));
      cell.ctx.imageSmoothingEnabled = false;
      if (cell.letter) cell.letter.style.fontSize = Math.round(Math.min(r.height * 0.86, r.width)) + 'px';
    }
    this.applyMedia(this.currentImage);
  };

  Wall.prototype.preload = function () {
    var self = this;
    this.images.forEach(function (src) {
      var im = new Image();
      im.decoding = 'async';
      im.onload = function () { self.imgMeta[src] = { w: im.naturalWidth, h: im.naturalHeight }; if (self.currentImage === src) self.applyMedia(src); };
      im.src = src;
    });
  };

  /* Uma imagem cobre a parede inteira; cada bloco mostra sua fatia (background cover manual) */
  Wall.prototype.applyMedia = function (src) {
    if (!src || !this.wall) return;
    var meta = this.imgMeta[src] || { w: 16, h: 9 };
    var s = Math.max(this.wall.w / meta.w, this.wall.h / meta.h);
    var bw = meta.w * s, bh = meta.h * s, ox = (this.wall.w - bw) / 2, oy = (this.wall.h - bh) / 2;
    for (var i = 0; i < this.cells.length; i++) {
      var c = this.cells[i];
      c.media.style.backgroundImage = 'url("' + src + '")';
      c.media.style.backgroundSize = bw + 'px ' + bh + 'px';
      c.media.style.backgroundPosition = (ox - c.rect.x) + 'px ' + (oy - c.rect.y) + 'px';
    }
  };

  /* Quadro da fita: base escura + salpicos com rastro por linha (mesma função da referência) */
  Wall.prototype.paintTape = function (now) {
    var t = this.tape, x = this.tctx, W = t.width, H = t.height;
    var img = x.createImageData(W, H), d = img.data, lut = this.lut, sp = CFG.speckle;
    var elapsed = now - this.t0;
    var warm = Math.min(1, Math.max(0, (elapsed - CFG.darkMs) / 900));   // fita "esquenta"
    var headBand = H - Math.max(2, Math.round(H * 0.025));
    for (var y = 0; y < H; y++) {
      var streak = Math.max(0, gauss() * sp.streak);
      var shift = y >= headBand ? (Math.random() * 30) | 0 : 0;
      var i = y * W * 4;
      for (var xx = 0; xx < W; xx++) {
        var v = (Math.random() < sp.density * warm ? Math.random() * sp.amplitude : 0) + streak + 10;
        if (shift && ((xx + shift) % 37) < 9) v += 90;
        v = v > 255 ? 255 : v | 0;
        var k = v * 3;
        d[i] = lut[k]; d[i + 1] = lut[k + 1]; d[i + 2] = lut[k + 2]; d[i + 3] = 255;
        i += 4;
      }
    }
    // linha de tracking (aparece em ~15% dos quadros)
    if (Math.random() < 0.15) {
      var ly = (Math.random() * headBand) | 0, x0 = (Math.random() * W * 0.3) | 0, x1 = W - ((Math.random() * W * 0.2) | 0);
      for (var lx = x0; lx < x1; lx++) {
        if (Math.random() < 0.15) continue;
        var j = (ly * W + lx) * 4, kk = (190 + Math.random() * 65 | 0) * 3;
        d[j] = lut[kk]; d[j + 1] = lut[kk + 1]; d[j + 2] = lut[kk + 2];
      }
    }
    x.putImageData(img, 0, 0);
  };

  Wall.prototype.drawTapeSlice = function (cell) {
    var sx = this.tape.width / this.wall.w, sy = this.tape.height / this.wall.h, r = cell.rect;
    cell.ctx.drawImage(this.tape, r.x * sx, r.y * sy, r.w * sx, r.h * sy, 0, 0, cell.canvas.width, cell.canvas.height);
  };

  Wall.prototype.drawStatic = function (cell, now) {
    if (!cell.crop || now >= cell.rerollAt) {
      var cw = Math.min(256, Math.max(8, cell.canvas.width)), ch = Math.min(256, Math.max(8, cell.canvas.height));
      cell.crop = { tile: this.tiles[(Math.random() * this.tiles.length) | 0],
        x: Math.random() * (256 - cw), y: Math.random() * (256 - ch), w: cw, h: ch };
      cell.rerollAt = now + rand(CFG.rerollMinMs, CFG.rerollMaxMs);
    }
    // a cada quadro o tile muda, então a estática ferve mesmo entre re-sorteios do crop
    var c = cell.crop;
    cell.ctx.drawImage(this.tiles[(Math.random() * this.tiles.length) | 0], c.x, c.y, c.w, c.h, 0, 0, cell.canvas.width, cell.canvas.height);
  };

  Wall.prototype.paint = function (now) {
    var needTape = false, i, c;
    for (i = 0; i < this.cells.length; i++) if (this.cells[i].mode === 'tape') { needTape = true; break; }
    if (needTape) this.paintTape(now);
    for (i = 0; i < this.cells.length; i++) {
      c = this.cells[i];
      if (c.mode === 'zap') {
        if (now >= c.zapUntil) this.settle(c); else this.drawStatic(c, now);
      } else if (c.mode === 'tape') this.drawTapeSlice(c);
    }
    if (this.osd) {
      var secs = Math.max(1, Math.floor((now - this.t0) / 1000));
      this.osdTime.textContent = '00:00:' + (secs % 60 < 10 ? '0' : '') + (secs % 60);
    }
  };

  Wall.prototype.loop = function (now) {
    var self = this;
    this.raf = 0;
    if (!this.visible || document.hidden || this.reduced) return;
    this.raf = requestAnimationFrame(function (t) { self.loop(t); });
    if (now - this.lastPaint < 1000 / CFG.fps) return;
    this.lastPaint = now;
    this.paint(now);
  };
  Wall.prototype.kick = function () {
    var self = this;
    if (!this.raf && this.visible && !document.hidden && !this.reduced) this.raf = requestAnimationFrame(function (t) { self.loop(t); });
  };

  Wall.prototype.setMode = function (cell, mode) {
    cell.mode = mode;
    cell.el.dataset.mode = mode;
  };

  /* fim do zap: o bloco "sintoniza" no conteúdo da composição */
  Wall.prototype.settle = function (cell) {
    this.setMode(cell, cell.target);
  };

  Wall.prototype.later = function (ms, fn) { this.timers.push(setTimeout(fn, ms)); };

  Wall.prototype.revealLetters = function () {
    var letters = this.cells.filter(function (c) { return c.letter; });
    var span = Math.max(0, CFG.letterSpreadMs - CFG.letterFadeMs);
    var delays = letters.map(function (_, i) { return letters.length === 1 ? 0 : Math.round(i / (letters.length - 1) * span); });
    shuffle(delays);
    letters.forEach(function (c, i) {
      c.letter.style.setProperty('--lj-letter-delay', delays[i] + 'ms');
      c.letter.style.setProperty('--lj-letter-fade', CFG.letterFadeMs + 'ms');
    });
    this.root.dataset.letters = 'on';
  };

  /* troca de composição célula a célula, com estática de troca de canal */
  Wall.prototype.zapTo = function (target) {
    var now = performance.now(), self = this;
    if (target === 'media') {
      this.currentImage = this.images[this.imgIndex++ % this.images.length];
      this.applyMedia(this.currentImage);
    }
    this.root.dataset.composition = target;
    this.cells.forEach(function (c) {
      c.target = target;
      var stagger = Math.random() * 160;
      self.later(stagger, function () {
        if (Math.random() < CFG.zapProbability) {
          var dur = Math.random() < CFG.zapLongChance ? CFG.zapLongMs : CFG.zapMs + rand(-CFG.zapJitterMs, CFG.zapJitterMs);
          c.zapUntil = performance.now() + dur;
          c.crop = null;
          self.setMode(c, 'zap');
          self.kick();
        } else {
          self.setMode(c, target);
        }
      });
    });
    void now;
  };

  Wall.prototype.start = function () {
    var self = this;
    this.root.dataset.phase = 'dark';
    this.cells.forEach(function (c) { self.setMode(c, 'dark'); });
    if (this.osd) {
      this.osd.innerHTML = '<span class="lj-osd__play">PLAY ▶</span><span class="lj-osd__sp">SP <b>00:00:01</b></span>';
      this.osdTime = this.osd.querySelector('b');
    }

    this.overlay = this.root.dataset.handover === 'clear';
    if (this.overlay) {
      // abertura sobre o conteúdo (ex.: vídeo da home): termina abrindo janelas e some
      if (this.reduced) { this.finish(true); return; }
      var skip = function () { self.handover(); };
      ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, skip, { once: true, passive: true }); });
      this.later(CFG.darkMs, function () {
        if (self.handedOver) return;
        self.root.dataset.phase = 'tape';
        self.cells.forEach(function (c) { self.setMode(c, 'tape'); });
        self.kick();
      });
      this.later(CFG.letterStartMs, function () { if (!self.handedOver) self.revealLetters(); });
      this.later(CFG.openingHoldMs + CFG.darkMs, function () { self.handover(); });
      return;
    }

    if (this.reduced) {
      // composição parada: letras sobre um único quadro de fita
      this.root.dataset.phase = 'still';
      this.paintTape(this.t0 + 2000);
      this.cells.forEach(function (c) { self.setMode(c, 'tape'); self.drawTapeSlice(c); });
      this.root.dataset.letters = 'on';
      return;
    }

    this.imgIndex = 0;
    this.later(CFG.darkMs, function () {
      self.root.dataset.phase = 'tape';
      self.cells.forEach(function (c) { self.setMode(c, 'tape'); });
      self.kick();
    });
    this.later(CFG.letterStartMs, function () { self.revealLetters(); });
    this.later(CFG.openingHoldMs + CFG.darkMs, function () {
      self.root.dataset.phase = 'cycle';
      self.cycle(0);
    });
  };

  /* passagem: cada bloco troca de canal e vira janela transparente; depois a parede some */
  Wall.prototype.handover = function () {
    if (this.handedOver) return;
    this.handedOver = true;
    var self = this;
    this.root.dataset.phase = 'handover';
    var under = this.root.parentElement && this.root.parentElement.querySelector('video');
    if (under) { try { under.currentTime = 0; var pr = under.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {} }
    this.zapTo('clear');
    this.later(160 + CFG.zapLongMs + 120, function () { self.finish(false); });
  };
  Wall.prototype.finish = function (instant) {
    var self = this;
    this.root.dataset.phase = 'done';
    this.root.setAttribute('aria-hidden', 'true');
    this.later(instant ? 0 : 700, function () {
      self.root.hidden = true;
      cancelAnimationFrame(self.raf); self.raf = 0; self.visible = false;
    });
  };

  /* sequência: imagem, imagem, letras sobre estática... (ref: composição cheia a cada 2 batidas) */
  Wall.prototype.cycle = function (beat) {
    var self = this;
    var target = beat % 3 === 2 ? 'tape' : 'media';
    this.zapTo(target);
    this.later(CFG.compositionHoldMs + 420, function () { self.cycle(beat + 1); });
  };

  Wall.prototype.bind = function () {
    var self = this, t = 0;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var prev = self.L; self.layout();
        if (prev !== self.L) {
          // novo layout: recoloca cada célula no estado atual da parede
          var mode = self.root.dataset.phase === 'cycle' ? (self.root.dataset.composition || 'tape') : (self.reduced ? 'tape' : 'tape');
          if (self.root.dataset.phase === 'dark') mode = 'dark';
          self.cells.forEach(function (c) { self.setMode(c, mode); c.target = mode; });
          if (self.root.dataset.letters === 'on') self.revealLetters();
          if (self.reduced) { self.paintTape(self.t0 + 2000); self.cells.forEach(function (c) { self.drawTapeSlice(c); }); }
          self.kick();
        }
      }, 150);
    }, { passive: true });
    document.addEventListener('visibilitychange', function () { self.kick(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        self.visible = entries[0].isIntersecting;
        self.kick();
      }).observe(this.root);
    }
  };

  function init() {
    document.querySelectorAll('[data-lj-wall]').forEach(function (el) {
      var go = function () { if (!el._ljWall) el._ljWall = new Wall(el); };
      // espera a fonte de título para medir as letras certo (máx. 1,2 s)
      if (document.fonts && document.fonts.ready) {
        Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1200); })]).then(go);
      } else go();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
