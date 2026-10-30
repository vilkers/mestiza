(async()=>{
 await window.MestizaReady;
 const base=window.MestizaSettings.base,config=window.MestizaSettings.get();
 const projects=(config.projects||[]).filter(p=>p.selected);
 const src=path=>new URL(path,base).href;
 const create=(tag,cls,value)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(value)el.textContent=value;return el};
 function image(item){const img=new Image();img.src=src(item.src);img.alt=item.alt;img.loading='lazy';img.decoding='async';img.style.objectPosition=`${item.x??50}% ${item.y??50}%`;return img}
 document.querySelectorAll('[data-project-grid]').forEach(grid=>{
  grid.replaceChildren();projects.slice(0,Number(grid.dataset.limit)||projects.length).forEach((project,index)=>{
   const active=project.media.filter(m=>m.selected),cover=active.find(m=>m.id===project.cover)||active.find(m=>m.type==='image');if(!cover)return;
   const card=create(project.status==='wip'?'article':'a','portfolio-card');if(project.status!=='wip')card.href=src(`projetos/${project.id}/`);
   const visual=create('div','portfolio-visual');visual.append(image(cover));
   const meta=create('div','portfolio-meta');meta.append(create('h3','',project.name),create('span','',project.status==='wip'?'WIP':'↗'));
   card.append(visual,meta,create('p','portfolio-discipline',project.discipline));grid.append(card);
  });
 });

 const banners=document.querySelector('[data-work-banners]');
 if(banners){
  for(const project of projects){
   const media=project.media.filter(m=>m.selected),cover=media.find(m=>m.id===project.cover)||media.find(m=>m.type==='image');
   const wip=project.status==='wip';
   const section=create('article','project-banner'+(wip?' project-banner--wip':'')+' project-banner--'+project.id);section.setAttribute('aria-label','Projeto '+project.name+(wip?' — WIP':''));
   if(cover){const still=image(cover);still.className='project-still';section.append(still)}
   section.append(create('div','project-shade'));
   const content=create(wip?'div':'a','project-banner-link');if(!wip)content.href=src(`projetos/${project.id}/`);
   const meta=create('div','project-banner-meta');meta.append(create('span','',project.name),create('span',wip?'wip-tag':'',wip?'WIP':project.discipline));
   const title=create('h2','',project.name);content.append(meta,title);
   if(!wip)content.append(create('span','project-banner-cta','Explorar projeto ↗'));
   section.append(content);banners.append(section);
  }
 }
 // A video becomes visible only after playback has produced a frame.
 document.querySelectorAll('.project-motion').forEach(video=>{const show=()=>video.classList.add('has-frame');video.addEventListener('playing',show);if(video.readyState>=3&&!video.paused)show();video.addEventListener('error',()=>video.classList.remove('has-frame'))});
 const page=document.querySelector('[data-project-id]');if(page){
  const project=(config.projects||[]).find(p=>p.id===page.dataset.projectId);
  if(project?.selected && project.id==='boticario'){page.querySelector('h1').textContent=project.title;page.querySelector('[data-case-description]').textContent=project.description;
   const grid=page.querySelector('[data-case-media]');
   project.media.filter(m=>m.selected).forEach((item,i)=>{
    const figure=create('figure',item.type==='video'?'case-media case-media--video':'case-media');
    if(item.type==='video'){
     const video=create('video');video.src=src(item.src);if(item.poster)video.poster=src(item.poster);video.controls=true;video.playsInline=true;video.preload='none';video.setAttribute('aria-label',item.alt);figure.append(video);
    }else{const img=image(item);if(i===0){img.loading='eager';img.fetchPriority='high';figure.classList.add('case-media--hero')}figure.append(img)}
    grid.append(figure);
   });
  }
 }
 // Compact width follows scroll without shrinking text or touch targets.
 const header=document.querySelector('.global-header');if(header){let queued=false;const update=()=>{queued=false;const p=Math.min(1,scrollY/360),mobile=innerWidth<=700;header.style.setProperty('--header-width',(mobile?Math.max(300,innerWidth-20)-p*24:Math.max(460,innerWidth-40)-p*Math.max(0,innerWidth-740))+'px');header.classList.toggle('is-compact',p>.8)};addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);update()}
 document.querySelectorAll('.footer-overline>span:last-child').forEach(el=>el.textContent='São Paulo / Espírito Santo');
 document.querySelectorAll('.footer-invite>span').forEach(el=>{el.replaceChildren(create('span','','¿Qué quieres'),create('span','','hacer?'))});
})();
