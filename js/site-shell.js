(async()=>{
 await window.MestizaReady;
 const settings=window.MestizaSettings?.get()||{};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // Keep original logo silhouette. A translucent mask and light edge create relief without a flat fill.
 document.querySelectorAll('img[src*="logo-horizontal"],img[src*="logo-site-flat"]').forEach(img=>{const mark=document.createElement('span');mark.className='glass-wordmark';mark.setAttribute('role','img');mark.setAttribute('aria-label',img.alt||'Mestiza');if(!img.closest('.global-header,.brand,.header-logo,.study-top'))mark.classList.add('glass-wordmark--footer');img.replaceWith(mark)});
 const path=location.pathname;
 document.querySelectorAll('.global-menu a').forEach(a=>{const target=new URL(a.href).pathname;if(target===path||(path==='/'&&target==='/index.html')||(target.endsWith('trabalhos/')&&path.includes('/vireachave/')))a.setAttribute('aria-current','page')});
 // Scroll scrubbing advances the original coin frames. The object never rotates in the layout.
 const caches=new Map();
 document.querySelectorAll('[data-coin-sequence]').forEach(canvas=>{
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const base=new URL(canvas.dataset.frameBase,location.href).href;
  let frames=caches.get(base);if(!frames){frames=Array.from({length:30},(_,i)=>{const image=new Image();image.decoding='async';image.dataset.src=base+String(i).padStart(2,'0')+'.webp';return image});caches.set(base,frames)}
  let active=0,pending=false,loaded=false;
  function draw(){pending=false;const parent=canvas.closest('[data-coin-scene],.coin-interlude,.about-coin')||canvas.parentElement;if(parent.hasAttribute('data-coin-scene')){const words=parent.querySelector('.footer-invite>span');if(words){const width=canvas.getBoundingClientRect().width;canvas.style.left=Math.max(0,Math.min(parent.clientWidth-width,words.getBoundingClientRect().width-width*.28))+'px'}}const r=parent.getBoundingClientRect();const progress=Math.max(0,Math.min(1,(innerHeight*.8-r.top)/(r.height+innerHeight*.6)));const frame=reduced.matches?0:(Math.round(progress*29)+(Number(canvas.dataset.frameOffset)||0))%30;active=frame;const image=frames[frame];if(image.complete&&image.naturalWidth){canvas.dataset.frame=String(frame);ctx.fillStyle='#000';ctx.fillRect(0,0,480,480);ctx.drawImage(image,0,0,480,480)}}
  function preload(){if(loaded)return;loaded=true;frames.forEach((image,i)=>{image.onload=()=>{if(i===active||i===0)draw()};image.src=image.dataset.src})}
  frames[0].onload=()=>{ctx.fillStyle='#000';ctx.fillRect(0,0,480,480);ctx.drawImage(frames[0],0,0,480,480)};frames[0].src=frames[0].dataset.src;
  new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))preload()},{rootMargin:'600px'}).observe(canvas);
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(draw)}},{passive:true});addEventListener('resize',draw);reduced.addEventListener('change',draw);if(document.fonts)document.fonts.ready.then(draw);draw();
 });
 document.querySelectorAll('[data-project-video]').forEach(video=>{
  const banner=video.closest('.project-banner'),toggle=banner.querySelector('[data-toggle-video]');let visible=true,paused=false;
  function source(){const mobile=matchMedia('(max-aspect-ratio:1/1)').matches;const selected=mobile?settings.banner?.mobile:settings.banner?.desktop;const src=selected&&/^[a-z0-9-]+\.mp4$/.test(selected)?new URL('assets/cases/boticario/video/'+selected,window.MestizaSettings.base).href:(mobile?video.dataset.mobile:video.dataset.desktop);if(!src)return;const url=new URL(src,location.href).href;if(video.src!==url)video.src=url}
  function play(){if(paused||!visible||document.hidden||reduced.matches){video.pause();return}source();video.muted=true;video.play().catch(()=>{})}
  video.style.objectPosition=`${Number(settings.banner?.x)||50}% ${Number(settings.banner?.y)||50}%`;video.addEventListener('loadedmetadata',()=>{const start=Math.max(0,Number(settings.banner?.start)||0);if(start<video.duration)video.currentTime=start});video.addEventListener('timeupdate',()=>{const start=Math.max(0,Number(settings.banner?.start)||0),end=Number(settings.banner?.end)||video.duration-.12;if(end>start&&video.currentTime>=end)video.currentTime=start});
  if(toggle)toggle.addEventListener('click',()=>{paused=!paused;toggle.textContent=paused?'Reproduzir vídeo':'Pausar vídeo';toggle.setAttribute('aria-pressed',String(paused));play()});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;play()},{threshold:.05}).observe(banner);
  addEventListener('resize',play);document.addEventListener('visibilitychange',play);reduced.addEventListener('change',play);
 });
})();
