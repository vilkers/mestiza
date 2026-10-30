(()=>{
 const media=matchMedia('(prefers-reduced-motion: reduce)');let paused=media.matches,queued=false;
 const scenes=[...document.querySelectorAll('[data-scroll-scene]')],drawings=new Map();
 for(const scene of scenes){const paths=[...scene.querySelectorAll('[data-outline-illustration] path,[data-outline-illustration] circle')].filter(p=>{const c=getComputedStyle(p);return c.stroke!=='none'&&c.fill==='none'});drawings.set(scene,paths.map((path,i)=>{path.setAttribute('pathLength','1');path.setAttribute('data-outline-path','');path.style.strokeDasharray='1';return {path,delay:(i%5)*.035}}))}
 const active=new Set(scenes),observer=new IntersectionObserver(entries=>{for(const e of entries)e.isIntersecting?active.add(e.target):active.delete(e.target);schedule()},{rootMargin:'180px'});scenes.forEach(s=>observer.observe(s));
 function frame(){queued=false;for(const scene of active){if(document.body.classList.contains('special-view'))continue;const r=scene.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight*.95-r.top)/(r.height+innerHeight*.55)));for(const {path,delay} of drawings.get(scene)||[])path.style.strokeDashoffset=paused?'0':String(1-Math.max(.2,Math.min(1,p*2.4-delay)))}}
 function schedule(){if(!queued){queued=true;requestAnimationFrame(frame)}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);media.addEventListener('change',e=>{paused=e.matches;update();schedule()});
 function update(){document.documentElement.classList.toggle('motion-paused',paused)}
 update();
 schedule();
})();
