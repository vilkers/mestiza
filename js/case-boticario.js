(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const loop = document.querySelector('.opening-motion');
  const toggle = document.querySelector('.motion-toggle');
  let userPaused = false;
  if (loop.dataset.loopSrc.endsWith('/header-pessoas.mp4')) {
    const framePeople = () => {
      const time = loop.currentTime;
      const focus = time < 2.12 ? 32
        : time < 2.52 ? 32 + (time - 2.12) / .4 * 33
        : time < 4 ? 65
        : time < 4.4 ? 65 + (time - 4) / .4 * 27 : 92;
      loop.style.objectPosition = `${focus}% center`;
    };
    framePeople();
    loop.addEventListener('timeupdate', framePeople);
    loop.addEventListener('seeked', framePeople);
  }
  const stopLoop = () => { loop.pause(); loop.classList.remove('is-playing'); toggle.hidden = true; };
  const startLoop = async () => {
    if (reducedMotion.matches || navigator.connection?.saveData || userPaused) return;
    if (!loop.src) loop.src = loop.dataset.loopSrc;
    try { await loop.play(); loop.classList.add('is-playing'); toggle.hidden = false; } catch { stopLoop(); }
  };
  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    if (userPaused) loop.pause(); else startLoop();
    toggle.textContent = userPaused ? '▶' : 'Ⅱ';
    toggle.setAttribute('aria-label', userPaused ? 'Reproduzir vídeo de abertura' : 'Pausar vídeo de abertura');
  });
  reducedMotion.addEventListener('change', () => reducedMotion.matches ? stopLoop() : startLoop());
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) startLoop(); else loop.pause();
      }
    }, {threshold: .1}).observe(document.querySelector('.opening'));
  }
  document.querySelectorAll('video[controls]').forEach(video => {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        entries.forEach(entry => { if (!entry.isIntersecting) video.pause(); });
      }, {threshold: .05}).observe(video);
    }
    video.addEventListener('play', () => {
      document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
    });
    video.addEventListener('error', () => {
      const hint = document.createElement('p');
      hint.className = 'video-error';
      hint.textContent = 'Não foi possível carregar o filme. ';
      const link = document.createElement('a');
      link.href = video.querySelector('source').src;
      link.textContent = 'Abrir o vídeo';
      hint.append(link);
      video.after(hint);
    }, {once:true});
  });
  const dialog = document.querySelector('.lightbox');
  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  const allLinks = [...document.querySelectorAll('[data-lightbox]')];
  let group = [], current = 0, trigger;
  function show(index) {
    current = (index + group.length) % group.length;
    const link = group[current];
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    caption.textContent = link.dataset.caption;
  }
  allLinks.forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    trigger = link;
    const collection = link.closest('.all-angles, .shooting-strip') || document.querySelector('main');
    group = collection.matches('main') ? allLinks.filter(a => a.closest('.kv')) : [...collection.querySelectorAll('[data-lightbox]')];
    show(group.indexOf(link));
    dialog.showModal();
    document.body.classList.add('modal-open');
  }));
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
  dialog.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    image.removeAttribute('src');
    trigger?.focus({preventScroll:true});
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) document.querySelectorAll('video').forEach(v => v.pause()); });
})();
