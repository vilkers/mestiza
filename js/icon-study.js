(()=>{
 const icons=[
 ['Enquadramento','Fotografia / recorte','M4 13V4h9M28 19v9h-9M4 23v5h5M28 9V4h-5M10 10h12v12H10Z'],
 ['Incidência','Luz / direção','M16 4v5M4 16h5M23 16h5M16 23v5M7.5 7.5l3 3M21.5 21.5l3 3M24.5 7.5l-3 3M10.5 21.5l-3 3'],
 ['Plano','Composição / profundidade','M5 8h16v16H5ZM11 4h16v16M8 12h10M8 16h7'],
 ['Mistura','Encontro / colaboração','M19 7a9 9 0 1 0 0 18M13 7a9 9 0 1 1 0 18M13 7v18M19 7v18'],
 ['Eixo','Direção de arte / ajuste','M16 3v26M3 16h26M9 9l14 14M23 9 9 23'],
 ['Sequência','Filme / narrativa','M3 9h8v14H3ZM13 6h8v20h-8ZM23 9h6v14h-6'],
 ['Movimento','Animação / continuidade','M7 11a10 10 0 0 1 18 4M25 21a10 10 0 0 1-18-4M22 11l4 4 3-5M10 21l-4-4-3 5'],
 ['Acabamento','Pós-produção / detalhe','M5 27 24 8M20 4l8 8M7 19l6 6M9 5v6M6 8h6M23 21v8M19 25h8'],
 ['Imagem','Olhar / foco','M3 16s5-9 13-9 13 9 13 9-5 9-13 9S3 16 3 16ZM12 16a4 4 0 1 0 8 0 4 4 0 1 0-8 0'],
 ['Montagem','Camadas / integração','M3 13 16 5l13 8-13 8ZM3 20l13 8 13-8M3 17l13 8 13-8'],
 ['Ponto de vista','Perspectiva / câmera','M6 6h20v20H6ZM6 6l20 20M6 26 26 6M16 6v20M6 16h20'],
 ['Conexão','Processo / passagem','M3 16h26M20 7l9 9-9 9M8 10v12']
 ];
 const grid=document.querySelector('.icon-grid'),width=document.querySelector('[data-stroke]');
 const svg=path=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="${Number(width.value)}" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;
 function render(){grid.replaceChildren();icons.forEach(([name,context,path],i)=>{const card=document.createElement('article');card.className='icon-card';const sample=document.createElement('div');sample.className='icon-sample';sample.innerHTML=svg(path);const index=document.createElement('span');index.className='icon-index';index.textContent=String(i+1).padStart(2,'0');const title=document.createElement('h2');title.textContent=name;const copy=document.createElement('p');copy.textContent=context;const button=document.createElement('button');button.textContent='Baixar SVG ↗';button.onclick=()=>{const uri=URL.createObjectURL(new Blob([svg(path)],{type:'image/svg+xml'})),a=document.createElement('a');a.href=uri;a.download='mestiza-'+name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replaceAll(' ','-')+'.svg';a.click();setTimeout(()=>URL.revokeObjectURL(uri),1000)};card.append(index,sample,title,copy,button);grid.append(card)})}width.oninput=render;document.querySelector('[data-paper]').onclick=()=>document.body.classList.toggle('paper');render();
})();
