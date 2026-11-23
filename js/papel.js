/* Mestiza · direção papel: interações da página (menu, vídeo, scroll, carrossel, prévia). */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function prog(el, startAt, span) { var r = el.getBoundingClientRect(); return clamp((innerHeight * startAt - r.top) / (span || r.height), 0, 1); }

  /* menu (celular) */
  var btn = document.querySelector('.menu-btn'), sheet = document.querySelector('.sheet');
  if (btn && sheet) {
    function set(open) { sheet.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? 'Fechar' : 'Menu'; sheet.inert = !open; document.documentElement.style.overflow = open ? 'hidden' : ''; }
    set(false);
    btn.addEventListener('click', function () { set(!sheet.classList.contains('open')); });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  /* vídeo de destaque: fonte por formato, pausa fora da tela e em reduced-motion */
  document.querySelectorAll('video[data-desktop]').forEach(function (v) {
    var toggle = v.parentElement.querySelector('[data-toggle]'), paused = false, visible = false;
    function src() { var m = matchMedia('(max-width: 760px)').matches, s = m ? v.dataset.mobile : v.dataset.desktop, p = m ? v.dataset.posterMobile : v.dataset.posterDesktop; if (p && v.getAttribute('poster') !== p) v.setAttribute('poster', p); if (v.getAttribute('src') !== s) v.setAttribute('src', s); }
    function play() { src(); if (paused || !visible || document.hidden || reduced.matches) v.pause(); else { v.muted = true; var p = v.play(); if (p) p.catch(function () {}); } if (toggle) { toggle.textContent = (paused || reduced.matches) ? 'Reproduzir' : 'Pausar'; toggle.setAttribute('aria-pressed', String(paused)); } }
    if (toggle) toggle.addEventListener('click', function () { paused = !paused; if (!paused && reduced.matches) { visible = true; v.play(); toggle.textContent = 'Pausar'; return; } play(); });
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; play(); }, { threshold: .1 }).observe(v);
    addEventListener('resize', play); document.addEventListener('visibilitychange', play); reduced.addEventListener('change', play); src();
  });

  /* manifesto: palavras se escrevem com o scroll */
  var man = document.querySelector('[data-write]'), words = [];
  if (man) {
    var mute = Number(man.dataset.mute || 1), parts = man.textContent.trim().split(/\s+/);
    man.setAttribute('aria-label', man.textContent.trim()); man.textContent = '';
    parts.forEach(function (w, i) { var s = document.createElement('span'); s.className = 'w' + (i >= parts.length - mute ? ' mute' : ''); s.setAttribute('aria-hidden', 'true'); s.textContent = w; man.appendChild(s); if (i < parts.length - 1) man.appendChild(document.createTextNode(' ')); words.push(s); });
  }

  /* serviços: item ativo com o scroll */
  var svc = document.querySelector('.services'), items = svc ? svc.querySelectorAll('.services-list li') : [], views = svc ? svc.querySelectorAll('.services-view img') : [], count = svc ? svc.querySelector('.services-count') : null, activeSvc = -1;
  if (svc) svc.style.setProperty('--n', items.length);
  function setSvc(i) { if (i === activeSvc) return; activeSvc = i; items.forEach(function (li, k) { li.classList.toggle('on', k === i); }); views.forEach(function (im, k) { im.classList.toggle('on', k === i); }); if (count) count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0'); }

  var card = document.querySelector('.feature-card');
  function onScroll() {
    if (card) card.style.setProperty('--grow', reduced.matches ? 1 : prog(card, 1.05, innerHeight * .8).toFixed(3));
    if (words.length) { var p = reduced.matches ? 1 : prog(man, .85, man.offsetHeight + innerHeight * .35); var n = Math.round(p * words.length); words.forEach(function (w, i) { w.classList.toggle('on', i < n); }); }
    if (svc) { if (reduced.matches) setSvc(0); else { var r = svc.getBoundingClientRect(), sp = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, .999); setSvc(Math.floor(sp * items.length)); } }
  }
  var tick = false;
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; onScroll(); }); } }, { passive: true });
  addEventListener('resize', onScroll); reduced.addEventListener('change', onScroll); onScroll();

  /* carrossel de princípios */
  document.querySelectorAll('[data-quotes]').forEach(function (box) {
    var qs = box.querySelectorAll('.quote'), out = box.querySelector('[data-count]'), i = 0;
    function show(n) { i = (n + qs.length) % qs.length; qs.forEach(function (q, k) { q.classList.toggle('on', k === i); q.hidden = k !== i; }); if (out) out.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(qs.length).padStart(2, '0'); }
    box.querySelector('[data-prev]').addEventListener('click', function () { show(i - 1); });
    box.querySelector('[data-next]').addEventListener('click', function () { show(i + 1); });
    show(0);
  });

  /* entrada suave dos blocos */
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach(function (n) { io.observe(n); });

  /* voltar ao topo */
  document.querySelectorAll('[data-top]').forEach(function (b) { b.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' }); }); });

  /* prévia: alternar as 4 opções do wordmark (A I · B entre · C depois · D S) */
  var ctl = document.querySelector('.preview-ctl'), wm = document.querySelector('[data-wordmark]');
  if (ctl && wm) {
    var key = 'mestiza.papel.wordmark', q = new URLSearchParams(location.search).get('logo'), saved = null;
    try { saved = localStorage.getItem(key); } catch (e) {}
    var first = (q || saved || 'a').toLowerCase();
    function pick(o) { ctl.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.opt === o)); }); try { localStorage.setItem(key, o); } catch (e) {} if (wm.setOption) wm.setOption(o); else wm.dataset.wordmark = o; }
    ctl.addEventListener('click', function (e) { var b = e.target.closest('button[data-opt]'); if (b) { if (b.getAttribute('aria-pressed') === 'true' && wm.replay) wm.replay(); else pick(b.dataset.opt); } });
    if (wm.setOption) pick(first); else { wm.dataset.wordmark = first; addEventListener('load', function () { pick(first); }); }
  }
})();
