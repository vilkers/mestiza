/* Mestiza · microinterações reproduzidas da referência
   - Etiqueta de cursor: segue o ponteiro a +14 px (presa à borda da janela), fundo na cor de
     destaque, texto datilografado a 60 ms por caractere. Só com mouse
     ((hover: hover) and (pointer: fine)); o cursor nativo continua visível.
   - Texto datilografado: caracteres entram a 60 ms, caret em bloco piscando a 1,06 s,
     palavra destacada em negativo. Dispara ao entrar na tela.
   - Pilha de blocos: blocos caem com gravidade e quique curto (restituição .18), escalonados
     em 340 ms, e tombam conforme a rolagem continua. Na referência isso usa Matter.js;
     aqui é uma integração simples própria, sem biblioteca.
   prefers-reduced-motion: texto aparece inteiro, blocos já empilhados, sem tombar. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- etiqueta de cursor ---------- */
  function cursorLabels() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var targets = document.querySelectorAll('[data-cursor-label]');
    if (!targets.length) return;
    var label = document.createElement('span');
    label.className = 'lj-cursor';
    label.setAttribute('aria-hidden', 'true');
    document.body.appendChild(label);
    function move(e) {
      var x = Math.min(e.clientX + 14, window.innerWidth - label.offsetWidth);
      var y = Math.min(e.clientY + 14, window.innerHeight - label.offsetHeight);
      label.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    }
    function type(text) {
      label.innerHTML = '';
      Array.prototype.forEach.call(text, function (ch, i) {
        var s = document.createElement('span'); s.textContent = ch; s.style.setProperty('--i', i); label.appendChild(s);
      });
    }
    targets.forEach(function (el) {
      el.addEventListener('pointerenter', function (e) {
        type(el.getAttribute('data-cursor-label'));
        label.dataset.on = ''; move(e);
      });
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', function () { delete label.dataset.on; });
      el.addEventListener('pointercancel', function () { delete label.dataset.on; });
    });
  }

  /* ---------- texto datilografado ---------- */
  function typed() {
    document.querySelectorAll('[data-typed]').forEach(function (el) {
      var mark = el.getAttribute('data-typed-mark') || '';
      var text = el.textContent.replace(/\s+/g, ' ').trim();
      el.setAttribute('aria-label', text);
      el.textContent = '';
      var run = document.createElement('span'); run.className = 'lj-typed__run'; run.setAttribute('aria-hidden', 'true');
      var markStart = mark ? text.indexOf(mark) : -1, i = 0, holder = run;
      for (var k = 0; k < text.length; k++) {
        if (k === markStart) { holder = document.createElement('mark'); holder.className = 'lj-typed__mark'; run.appendChild(holder); }
        if (markStart >= 0 && k === markStart + mark.length) holder = run;
        var s = document.createElement('span'); s.textContent = text[k]; s.style.setProperty('--i', i++);
        holder.appendChild(s);
      }
      var caret = document.createElement('span'); caret.className = 'lj-typed__caret'; caret.style.setProperty('--i', i);
      run.appendChild(caret);
      el.appendChild(run);
      if (reduced || !('IntersectionObserver' in window)) { el.dataset.typed = 'on'; return; }
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { el.dataset.typed = 'on'; io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }

  /* ---------- pilha de blocos que cai e tomba ---------- */
  function stacks() {
    document.querySelectorAll('[data-lj-stack]').forEach(function (stage) {
      var blocks = Array.prototype.slice.call(stage.querySelectorAll('.lj-stack__block'));
      if (!blocks.length) return;
      var GRAV = 2.2 * 9.8 * 160;      // px/s² (gravity.y 2.2 da ref, ~700 ms de queda)
      var REST = 0.18, STAGGER = 340;
      var state = blocks.map(function (b, i) {
        return { el: b, y: 0, vy: 0, rest: 0, done: false, startAt: 0, spin: (Math.random() - 0.5) * 2,
          tilt: (Math.random() - 0.5) * 5, drift: (Math.random() - 0.5) * 2, order: i };
      });
      var dropH = 0, raf = 0, last = 0, dropping = false, t0 = 0;

      function layout() { dropH = stage.clientHeight * 1.1; }
      function scrollTumble() {
        var r = stage.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (window.innerHeight * 0.45 - r.top) / (r.height || 1)));
        state.forEach(function (s) {
          if (!s.done) return;
          var k = p * p;
          s.el.style.transform = 'translate3d(' + (s.drift * k * 60) + 'px,' + (k * 40 * (1 + s.order * 0.2)) + 'px,0) rotate(' + (s.tilt + s.spin * k * 28) + 'deg)';
        });
      }
      function frame(now) {
        var dt = Math.min(0.033, (now - last) / 1000); last = now;
        var live = false;
        state.forEach(function (s) {
          if (s.done) return;
          if (now - t0 < s.startAt) { live = true; return; }
          s.vy += GRAV * dt; s.y += s.vy * dt;
          if (s.y >= 0) {                     // chegou na posição de repouso
            s.y = 0;
            if (Math.abs(s.vy) < 140) { s.done = true; s.vy = 0; }
            else s.vy = -s.vy * REST;
          }
          live = live || !s.done;
          s.el.style.opacity = 1;
          s.el.style.transform = 'translate3d(0,' + s.y + 'px,0) rotate(' + (s.tilt * (1 - Math.min(1, -s.y / 300))) + 'deg)';
        });
        if (live) raf = requestAnimationFrame(frame); else { raf = 0; scrollTumble(); }
      }
      function drop() {
        if (dropping) return; dropping = true;
        layout();
        // os de baixo caem primeiro (ordem do DOM: base → topo)
        state.forEach(function (s, i) { s.y = -dropH - i * 40; s.vy = 0; s.startAt = i * STAGGER; s.el.style.opacity = 0; });
        t0 = last = performance.now();
        raf = requestAnimationFrame(frame);
      }
      if (reduced || !('IntersectionObserver' in window)) {
        state.forEach(function (s) { s.done = true; s.el.style.opacity = 1; s.el.style.transform = 'rotate(' + s.tilt + 'deg)'; });
        return;
      }
      state.forEach(function (s) { s.el.style.opacity = 0; });
      new IntersectionObserver(function (en) { if (en[0].isIntersecting) drop(); }, { threshold: 0.35 }).observe(stage);
      window.addEventListener('scroll', function () { if (!raf) requestAnimationFrame(scrollTumble); }, { passive: true });
      window.addEventListener('resize', layout, { passive: true });
    });
  }

  function init() { cursorLabels(); typed(); stacks(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
