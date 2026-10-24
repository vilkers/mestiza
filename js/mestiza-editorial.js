(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const icon=(path)=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
 const arrow=icon('<path d="M5 19 19 5M5 5h14v14"/>');
 document.querySelectorAll('.image-open,.header-side span,.footer-talk>span').forEach(el=>el.innerHTML=arrow);
 const play=icon('<path d="m9 5 10 7-10 7Z"/>');
 document.querySelectorAll('.play-icon').forEach(el=>el.innerHTML=play);
 const scroll=document.querySelector('.scroll-link');if(scroll)scroll.innerHTML=icon('<path d="M12 3v18m-7-7 7 7 7-7"/>');
 const visible=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');visible.unobserve(e.target)}}),{threshold:.08});
 document.querySelectorAll('.mixed-gallery .kv,.product-grid figure,.process-heading').forEach(el=>{el.classList.add('reveal');visible.observe(el)});
 const reels=[...document.querySelectorAll('[data-silent-loop]')];
 reels.forEach(v=>{v.muted=true;v.defaultMuted=true;v.controls=false});
 const reelObserver=new IntersectionObserver(entries=>entries.forEach(e=>{const v=e.target;if(e.isIntersecting&&!document.hidden&&!reduce.matches){v.play().catch(()=>{})}else v.pause()}),{threshold:.15});reels.forEach(v=>reelObserver.observe(v));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reels.forEach(v=>v.pause());else reels.forEach(v=>{const r=v.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight&&!reduce.matches)v.play().catch(()=>{})})});
})();
