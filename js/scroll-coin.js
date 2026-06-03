/* =========================================================
   Mestiza — coin on scroll
   ---------------------------------------------------------
   Two modes, auto-detected:

   1) FRAME SEQUENCE  — if assets/coin/coin_000.png ... exist,
      the coin image swaps frames based on scroll position
      (the "Apple-style" image sequence). Set FRAME_COUNT to
      the number of frames you export.

   2) FALLBACK        — if frames are missing, the placeholder
      coin simply rotates in 3D as you scroll. Works today,
      no assets required.
   ========================================================= */

(function () {
  "use strict";

  // ---- Config (adjust when real frames are added) ----
  const FRAME_COUNT = 60;                 // how many frames you export
  const FRAME_PATH  = "assets/coin/";     // folder
  const FRAME_NAME  = (i) =>              // coin_000.png … coin_059.png
    `coin_${String(i).padStart(3, "0")}.png`;

  const section = document.querySelector("[data-coin-section]");
  const coinEl  = document.querySelector("[data-coin]");
  const imgEl   = document.querySelector("[data-coin-img]");
  if (!section || !coinEl) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ---- Detect whether the first frame exists ----
  let useFrames = false;
  const frames = [];

  function preloadFrames() {
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH + FRAME_NAME(i);
      frames.push(img);
    }
  }

  // Scroll progress through the hero (0 → 1)
  function progress() {
    const rect = section.getBoundingClientRect();
    const total = rect.height + window.innerHeight;
    const passed = window.innerHeight - rect.top;
    return Math.min(1, Math.max(0, passed / total));
  }

  let ticking = false;
  function onScroll() {
    if (ticking || reduceMotion) return;
    ticking = true;
    requestAnimationFrame(() => {
      const p = progress();
      if (useFrames) {
        const idx = Math.min(
          FRAME_COUNT - 1,
          Math.floor(p * (FRAME_COUNT - 1))
        );
        const frame = frames[idx];
        if (frame && frame.complete && imgEl) imgEl.src = frame.src;
      } else {
        // Fallback: spin the placeholder ~1.5 turns across the hero
        const deg = p * 540;
        coinEl.style.transform = `rotateY(${deg}deg)`;
      }
      ticking = false;
    });
  }

  // Probe the first frame; decide mode once we know
  const probe = new Image();
  probe.onload = function () {
    useFrames = true;
    preloadFrames();
    onScroll();
  };
  probe.onerror = function () {
    useFrames = false;                 // keep fallback rotation
    if (imgEl) imgEl.style.display = "none";
    coinEl.classList.add("coin--placeholder");
    onScroll();
  };
  probe.src = FRAME_PATH + FRAME_NAME(0);

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
})();
