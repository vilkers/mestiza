(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const icon=(path)=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
 const arrow=icon('<path d="M5 19 19 5M5 5h14v14"/>');
 document.querySelectorAll('.image-open,.header-side span,.footer-talk>span').forEach(el=>el.innerHTML=arrow);
 const play=icon('<path d="m9 5 10 7-10 7Z"/>');
 document.querySelectorAll('.play-icon').forEach(el=>el.innerHTML=play);
 const scroll=document.querySelector('.scroll-link');if(scroll)scroll.innerHTML=icon('<path d="M12 3v18m-7-7 7 7 7-7"/>');
 const smile=icon('<circle cx="12" cy="12" r="9"/><path d="M8 14q4 5 8 0M8 9h.01M16 9h.01"/>');
 document.querySelectorAll('.original-people,.films,.product-details').forEach((section,i)=>{
 const note=document.createElement('div');note.className='marginalia';note.innerHTML=`<span>${['Olhar de perto.','Gente que faz acontecer.','O detalhe também conta.'][i]}</span>${smile}<span>Mestiza<br>Direção / Craft / Imagem</span>`;section.after(note);
 });
 const visible=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');visible.unobserve(e.target)}}),{threshold:.08});
 document.querySelectorAll('.mixed-gallery .kv,.product-grid figure,.process-heading').forEach(el=>{el.classList.add('reveal');visible.observe(el)});
 const reels=[...document.querySelectorAll('[data-silent-loop]')];
 reels.forEach(v=>{v.muted=true;v.defaultMuted=true;v.controls=false});
 const reelObserver=new IntersectionObserver(entries=>entries.forEach(e=>{const v=e.target;if(e.isIntersecting&&!document.hidden&&!reduce.matches){v.play().catch(()=>{})}else v.pause()}),{threshold:.15});reels.forEach(v=>reelObserver.observe(v));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reels.forEach(v=>v.pause());else reels.forEach(v=>{const r=v.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight&&!reduce.matches)v.play().catch(()=>{})})});
 const modal=document.querySelector('.case-study');if(!modal)return;
 const stage=modal.querySelector('.study-stage'),bar=modal.querySelector('.study-progress i'),pause=modal.querySelector('[data-case-pause]');
 const kv='../assets/cases/boticario/kv/',vid='../assets/cases/boticario/video/';
 const chapters=[
 {style:'ivory',title:'Vire<br>a <em>chave.</em>',copy:'Grupo Boticário × Mestiza',duration:5500},
 {image:'16_anna_yumi.webp',title:'Começa<br>com <em>gente.</em>',copy:'Pessoas, expressões e histórias que guiam cada cena.',duration:6500},
 {image:'01_marinete.webp',title:'O cotidiano.<br><em>Outro olhar.</em>',copy:'Fotografia, IA e direção de arte no mesmo processo.',duration:6500},
 {image:'17_anna_yumi.webp',title:'Da ideia<br>à <em>imagem.</em>',copy:'Luz, ambiente e produto construídos em conjunto.',duration:6500},
 {video:'yumi.mp4',title:'A história<br><em>se move.</em>',copy:'Filmes verticais para levar a campanha a outros formatos.',duration:9000},
 {style:'gold',title:'24 imagens.<br>Uma <em>direção.</em>',copy:'Identidade e acabamento entre pessoas e cenários.',duration:5500},
 {style:'ivory',title:'Haz lo que<br><em>quieras hacer.</em>',copy:'Direção e produção: Mestiza. Criação da campanha: Creative House.',duration:7000}
 ];
 let current=0,elapsed=0,last=0,raf=0,paused=reduce.matches,trigger;
 function render(){const c=chapters[current];modal.dataset.theme=c.style||'dark';stage.innerHTML=`<article class="study-slide ${c.style||''}">${c.image?`<img src="${kv+c.image}" alt="Imagem final da campanha Vire a chave">`:''}${c.video?`<video src="${vid+c.video}" autoplay muted loop playsinline aria-label="Filme Anna Yumi"></video>`:''}<span class="chapter">${String(current+1).padStart(2,'0')} / Vire a chave</span><h2>${c.title}</h2><p>${c.copy}</p><svg class="kinetic-mark" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45"/><path d="M25 72V28l25 34 25-34v44"/></svg></article>`;const v=stage.querySelector('video');if(v){v.muted=true;if(paused)v.pause();else v.play().catch(()=>{})}modal.querySelector('[data-case-counter]').textContent=`${String(current+1).padStart(2,'0')} / 07`;bar.style.width='0%';elapsed=0;last=performance.now();}
 function setPaused(value){paused=value;pause.textContent=paused?'Reproduzir':'Pausar';const v=stage.querySelector('video');if(v){if(paused)v.pause();else v.play().catch(()=>{})}}
 function tick(now){if(!modal.open)return;if(!paused){elapsed+=Math.min(now-last,100);bar.style.width=`${Math.min(100,elapsed/chapters[current].duration*100)}%`;if(elapsed>=chapters[current].duration){if(current<chapters.length-1){current++;render()}else setPaused(true)}}last=now;raf=requestAnimationFrame(tick)}
 function open(e){e.preventDefault();trigger=e.currentTarget;current=0;setPaused(reduce.matches);render();modal.showModal();document.body.classList.add('modal-open');raf=requestAnimationFrame(tick)}
 document.querySelectorAll('[data-open-case]').forEach(b=>b.addEventListener('click',open));
 modal.querySelector('[data-case-close]').addEventListener('click',()=>modal.close());
 function step(delta){current=Math.max(0,Math.min(chapters.length-1,current+delta));render()}
 modal.querySelector('[data-case-next]').addEventListener('click',()=>step(1));modal.querySelector('[data-case-prev]').addEventListener('click',()=>step(-1));pause.addEventListener('click',()=>setPaused(!paused));
 modal.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();step(1)}if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}if(e.code==='Space'&&e.target.tagName!=='BUTTON'){e.preventDefault();setPaused(!paused)}});
 let touchX=0;stage.addEventListener('touchstart',e=>touchX=e.touches[0].clientX,{passive:true});stage.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-touchX;if(Math.abs(d)>55)step(d<0?1:-1)},{passive:true});
 modal.addEventListener('close',()=>{cancelAnimationFrame(raf);stage.querySelectorAll('video').forEach(v=>v.pause());stage.innerHTML='';document.body.classList.remove('modal-open');trigger?.focus({preventScroll:true})});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&modal.open)setPaused(true)});
})();
