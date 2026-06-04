/* =========================================================
   Mestiza — site behaviour
   ---------------------------------------------------------
   1) Header: solid background after a little scroll.
   2) Feed: auto-loads assets/work/01.jpg … (jpg/png/webp).
            Replaces the placeholders when real images exist.
   3) Coin: pinned at viewport center the whole stage.
            • FRAME SEQUENCE if assets/coin/coin_001.png … exist
              (Apple-style image sequence driven by scroll).
            • FALLBACK to the flat logo, spinning in 3D, if no
              frames are present yet.
   No dependencies, no build step.
   ========================================================= */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     1) Header background on scroll
     --------------------------------------------------------- */
  const header = document.querySelector("[data-header]");
  function onHeaderScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }

  /* ---------------------------------------------------------
     2) Feed loader — probe assets/work/01.(jpg|png|webp) …
     --------------------------------------------------------- */
  const feed = document.querySelector("[data-feed]");
  const FEED_MAX = 20;
  const EXTS = ["jpg", "jpeg", "png", "webp"];

  function tryImage(base, extIndex) {
    return new Promise((resolve) => {
      if (extIndex >= EXTS.length) return resolve(null);
      const url = `${base}.${EXTS[extIndex]}`;
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(tryImage(base, extIndex + 1));
      img.src = url;
    });
  }

  async function loadFeed() {
    if (!feed) return;
    const found = [];
    for (let i = 1; i <= FEED_MAX; i++) {
      const n = String(i).padStart(2, "0");
      const url = await tryImage(`assets/work/${n}`, 0);
      if (!url) break;            // stop at first gap
      found.push(url);
    }
    if (!found.length) return;    // keep placeholders until images land

    feed.innerHTML = found
      .map(
        (url) =>
          `<figure class="feed-item"><img src="${url}" alt="" loading="lazy" /></figure>`
      )
      .join("");
  }

  /* ---------------------------------------------------------
     3) Coin — frame sequence or fallback spin
     --------------------------------------------------------- */
  const stage  = document.querySelector("[data-stage]");
  const coinEl = document.querySelector("[data-coin]");
  const imgEl  = document.querySelector("[data-coin-img]");

  const FRAME_PATH = "assets/coin/";
  const FRAME_MAX  = 240;                 // safety cap while auto-counting
  let   useFrames  = false;
  let   frames     = [];

  // coin_001.png  (1-indexed, 3-digit). Change here if you export differently.
  const frameName = (i) => `coin_${String(i).padStart(3, "0")}.png`;

  // progress of the stage through the viewport: 0 → 1
  function stageProgress() {
    if (!stage) return 0;
    const rect = stage.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, -rect.top / total));
  }

  let ticking = false;
  function render() {
    const p = stageProgress();

    if (coinEl) {
      // fade the coin out as the closing statement takes over
      const fade = p > 0.82 ? Math.max(0, 1 - (p - 0.82) / 0.18) : 1;
      coinEl.style.opacity = fade.toFixed(3);
    }

    if (useFrames && imgEl && frames.length) {
      const idx = Math.min(frames.length - 1, Math.floor(p * (frames.length - 1)));
      const f = frames[idx];
      if (f && f.complete) imgEl.src = f.src;
    } else if (coinEl) {
      coinEl.querySelector(".coin-fallback").style.transform =
        `rotateY(${(p * 720).toFixed(1)}deg)`;
    }
  }

  function onScroll() {
    onHeaderScroll();
    if (ticking || reduceMotion) return;
    ticking = true;
    requestAnimationFrame(() => {
      render();
      ticking = false;
    });
  }

  // Auto-count frames: load coin_001, coin_002 … until one 404s.
  function countFrames(i) {
    if (i > FRAME_MAX) return finishFrames();
    const img = new Image();
    img.onload = () => {
      frames.push(img);
      countFrames(i + 1);
    };
    img.onerror = () => finishFrames();
    img.src = FRAME_PATH + frameName(i);
  }

  function finishFrames() {
    if (frames.length > 1) {
      useFrames = true;
    } else {
      // no usable sequence → fallback spin
      useFrames = false;
      frames = [];
      if (imgEl) imgEl.style.display = "none";
      if (coinEl) coinEl.classList.add("coin--placeholder");
    }
    render();
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  onHeaderScroll();
  loadFeed();
  if (coinEl) countFrames(1);

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
})();
