// Kit Mestiza: chiado do topo, cópia/download do .md e índice de skills.
(()=>{
  const cv=document.querySelector('.static');
  if(cv){
    const cx=cv.getContext('2d'),still=matchMedia('(prefers-reduced-motion:reduce)');let img,last=0,on=true;
    const draw=()=>{const d=img.data;for(let i=0;i<d.length;i+=4){const v=Math.random()*255|0;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255}cx.putImageData(img,0,0)};
    const size=()=>{cv.width=Math.ceil(innerWidth/3);cv.height=Math.ceil(cv.parentNode.offsetHeight/3)||1;img=cx.createImageData(cv.width,cv.height);draw()};
    const loop=t=>{if(on&&!still.matches&&t-last>50){draw();last=t}requestAnimationFrame(loop)};
    new IntersectionObserver(([e])=>on=e.isIntersecting).observe(cv);addEventListener('resize',size);size();requestAnimationFrame(loop);
  }
  const toast=document.querySelector('.toast');let timer;
  const say=msg=>{if(!toast)return;toast.textContent=msg;toast.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),2200)};
  const copy=async text=>{try{await navigator.clipboard.writeText(text);say('Copiado')}catch{const a=document.createElement('textarea');a.value=text;document.body.append(a);a.select();try{document.execCommand('copy');say('Copiado')}catch{say('Não foi possível copiar')}a.remove()}};
  const save=(text,name)=>{const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);say('Download iniciado')};
  const readMd=el=>el.textContent.replace(/^\n/,'');
  const icon={copy:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',down:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v13M6 11l6 6 6-6M5 20h14"/></svg>',open:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>'};

  // Página de uma skill: o .md vive num <script type="text/plain" data-skill-md>.
  const src=document.querySelector('script[data-skill-md]');
  if(src){
    const md=readMd(src),name=src.dataset.filename||'skill.md';
    document.querySelectorAll('[data-download]').forEach(b=>b.addEventListener('click',()=>save(md,name)));
    document.querySelectorAll('[data-copy-md]').forEach(b=>b.addEventListener('click',()=>copy(md)));
    // Prompts vêm das seções "### título + bloco de código" do próprio .md.
    const box=document.querySelector('[data-prompts]');
    if(box){const re=/^### (.+)\n+```\n([\s\S]*?)```/gm;let m;while((m=re.exec(md))){const text=m[2].trim(),art=document.createElement('article');art.className='prompt';art.innerHTML='<header><b></b><button class="copy" type="button">Copiar '+icon.copy+'</button></header><pre></pre>';art.querySelector('b').textContent=m[1];art.querySelector('pre').textContent=text;art.querySelector('button').addEventListener('click',()=>copy(text));box.append(art)}}
  }

  // Índice: lê /kit/skills.json e monta uma ficha por skill.
  const list=document.querySelector('[data-fichas]');
  if(list){
    const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n};
    const fetchMd=async s=>{const html=await (await fetch(s.pagina,{cache:'no-cache'})).text();const node=new DOMParser().parseFromString(html,'text/html').querySelector('script[data-skill-md]');if(!node)throw Error('sem .md');return readMd(node)};
    fetch('/kit/skills.json',{cache:'no-cache'}).then(r=>r.json()).then(({skills})=>{
      document.querySelectorAll('[data-count]').forEach(n=>n.textContent=String(skills.length).padStart(2,'0')+(skills.length===1?' skill':' skills'));
      skills.forEach((s,i)=>{
        const li=el('li','ficha');
        li.append(el('span','num mono',String(i+1).padStart(2,'0')));
        const main=el('div');const h=el('h2');const a=el('a',null,s.nome);a.href=s.pagina;h.append(a);main.append(h,el('p',null,s.resumo));
        if(s.tags?.length){const t=el('div','tags');s.tags.forEach(x=>t.append(el('span','mono',x)));main.append(t)}
        const dl=el('dl');[['Para',s.para],['Usa',s.ferramentas],['Arquivo',s.arquivo],['Versão',s.versao],['Atualizada',s.atualizada]].forEach(([k,v])=>{if(!v)return;dl.append(el('dt','mono',k),el('dd',null,v))});
        const act=el('div','actions');
        const open=el('a','pill solid');open.href=s.pagina;open.innerHTML='Abrir ficha '+icon.open;
        const dlb=el('button','pill');dlb.type='button';dlb.innerHTML='Baixar .md '+icon.down;
        dlb.addEventListener('click',async()=>{dlb.disabled=true;try{save(await fetchMd(s),s.arquivo)}catch{say('Abra a ficha para baixar')}dlb.disabled=false});
        act.append(open,dlb);li.append(main,dl,act);list.append(li);
      });
    }).catch(()=>{list.append(el('li','empty mono','Não foi possível carregar a lista de skills.'))});
  }
})();
