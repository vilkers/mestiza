/* Mestiza · grão de página animado
   Técnica analisada na referência: canvas 2D fixo sobre a página, um buffer de ruído
   (largura+128 × altura+128) gerado uma vez e redesenhado com deslocamento aleatório
   a cada N frames. Sem WebGL, sem SVG. Aqui o ruído é tingido com a cor de --lj-grain-tint
   (paleta terra) e a opacidade sai de --lj-grain-opacity.
   prefers-reduced-motion: desenha um quadro fixo e não anima. */
(function () {
  'use strict';
  var PAD = 128;
  var REDRAW_EVERY = 3;          // frames (ref: 3)
  var FLOOR = 0;                 // piso de luminância 0–255 (ref: 0)

  function parseColor(str) {
    var s = (str || '').trim();
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
    if (m) {
      var h = m[1].length === 3 ? m[1].split('').map(function (c) { return c + c; }).join('') : m[1];
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    var n = s.match(/\d+(\.\d+)?/g);
    return n && n.length >= 3 ? [+n[0], +n[1], +n[2]] : [255, 255, 255];
  }

  function init() {
    if (document.querySelector('canvas.lj-grain')) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'lj-grain';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    var buf = document.createElement('canvas');
    var w = 0, h = 0, raf = 0, frame = 0, resizeT = 0;

    function build() {
      var cw = Math.max(1, Math.ceil(canvas.clientWidth));
      var ch = Math.max(1, Math.ceil(canvas.clientHeight));
      if (cw === w && ch === h) return false;
      w = canvas.width = cw; h = canvas.height = ch;
      buf.width = cw + PAD; buf.height = ch + PAD;
      var bctx = buf.getContext('2d');
      var rgb = parseColor(getComputedStyle(document.documentElement).getPropertyValue('--lj-grain-tint'));
      var img = bctx.createImageData(buf.width, buf.height), d = img.data, span = 255 - FLOOR;
      for (var i = 0; i < d.length; i += 4) {
        var v = (FLOOR + Math.random() * span) / 255;
        d[i] = v * rgb[0]; d[i + 1] = v * rgb[1]; d[i + 2] = v * rgb[2]; d[i + 3] = 255;
      }
      bctx.putImageData(img, 0, 0);
      return true;
    }
    function draw() {
      var still = mq.matches;
      var dx = still ? 64 : (Math.random() * PAD) | 0;
      var dy = still ? 64 : (Math.random() * PAD) | 0;
      ctx.drawImage(buf, -dx, -dy);
    }
    function loop() {
      raf = requestAnimationFrame(loop);
      if (++frame % REDRAW_EVERY === 0) draw();
    }
    function start() {
      cancelAnimationFrame(raf); raf = 0;
      build(); draw();
      if (!mq.matches && !document.hidden) raf = requestAnimationFrame(loop);
    }
    window.addEventListener('resize', function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () { if (build()) draw(); }, 150);
    }, { passive: true });
    document.addEventListener('visibilitychange', start);
    if (mq.addEventListener) mq.addEventListener('change', start);
    start();
    requestAnimationFrame(function () { canvas.classList.add('is-on'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
