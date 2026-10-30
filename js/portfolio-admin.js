(async()=>{
 await window.MestizaReady;
 // The existing admin and this editor share the same draft for export/save.
 const config=window.MestizaAdminConfig;
 if(!config)return;
 const root=document.querySelector('[data-project-editor]'),status=document.querySelector('[data-admin-status]');
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e};
 const dirty=()=>status.textContent='Curadoria alterada. Salve a prévia ou exporte para publicar.';
 function field(label,value,change,tag='input'){const wrap=el('label','',label),input=el(tag);if(tag==='input')input.type='text';input.value=value;input.oninput=()=>{change(input.value);dirty()};wrap.append(input);return wrap}
 function render(){root.replaceChildren();(config.projects||[]).forEach((project,pi)=>{
  const section=el('section','project-editor'),head=el('div','project-editor-head'),title=el('h3','',project.name),tools=el('div','project-editor-order'),active=el('input');active.type='checkbox';active.checked=project.selected;active.onchange=()=>{project.selected=active.checked;dirty()};const label=el('label','','Mostrar projeto');label.prepend(active);tools.append(label);
  for(const [text,delta] of [['↑',-1],['↓',1]]){const b=el('button','',text);b.setAttribute('aria-label',`Mover ${project.name} ${delta<0?'para cima':'para baixo'}`);b.disabled=pi+delta<0||pi+delta>=config.projects.length;b.onclick=()=>{[config.projects[pi],config.projects[pi+delta]]=[config.projects[pi+delta],config.projects[pi]];render();dirty()};tools.append(b)}
  head.append(title,tools);const copy=el('div','project-editor-copy');copy.append(field('Título',project.title,v=>project.title=v),field('Descrição',project.description,v=>project.description=v,'textarea'));const grid=el('div','project-editor-grid');
  project.media.forEach((m,i)=>{
   const card=el('div','project-media-option'+(m.selected?' is-selected':''));let preview;
   if(m.type==='video'){preview=el('video','project-media-preview');preview.src=new URL(m.src,window.MestizaSettings.base);preview.controls=true;preview.playsInline=true;preview.preload='none';if(m.poster)preview.poster=new URL(m.poster,window.MestizaSettings.base)}else{preview=el('img','project-media-preview');preview.src=new URL(m.src,window.MestizaSettings.base);preview.alt=m.alt;preview.loading='lazy'}
   preview.style.objectPosition=`${m.x}% ${m.y}%`;const actions=el('div','project-media-actions'),check=el('input'),label=el('label','','Na página');check.type='checkbox';check.checked=m.selected;check.onchange=()=>{m.selected=check.checked;card.classList.toggle('is-selected',m.selected);dirty()};label.prepend(check);actions.append(label);
   if(m.type==='image'){const cover=el('button','',project.cover===m.id?'Capa ✓':'Usar como capa');cover.setAttribute('aria-pressed',String(project.cover===m.id));cover.onclick=()=>{project.cover=m.id;m.selected=true;render();dirty()};actions.append(cover)}
   for(const [text,delta] of [['←',-1],['→',1]]){const b=el('button','',text);b.setAttribute('aria-label',`Mover peça ${i+1} ${delta<0?'antes':'depois'}`);b.disabled=i+delta<0||i+delta>=project.media.length;b.onclick=()=>{[project.media[i],project.media[i+delta]]=[project.media[i+delta],project.media[i]];render();dirty()};actions.append(b)}
   card.append(preview,actions);if(m.type==='image'){const crop=el('div','project-crop');for(const key of ['x','y']){const l=el('label','',key==='x'?'Corte horizontal':'Corte vertical'),range=el('input');range.type='range';range.min=0;range.max=100;range.value=m[key];range.oninput=()=>{m[key]=Number(range.value);preview.style.objectPosition=`${m.x}% ${m.y}%`;preview.style.objectFit='cover';dirty()};l.append(range);crop.append(l)}card.append(crop)}grid.append(card);
  });section.append(head,copy,grid);root.append(section);
 })}
 render();
})();
