(()=>{
 const video=document.querySelector('.backdrop video'),query=matchMedia('(max-aspect-ratio:1/1)');
 function source(){const url=new URL(query.matches?video.dataset.mobile:video.dataset.desktop,location.href).href;if(video.src!==url){video.classList.remove('is-playing');video.src=url}video.muted=true;video.play().catch(()=>{})}
 video.addEventListener('playing',()=>video.classList.add('is-playing'));video.addEventListener('error',()=>video.classList.remove('is-playing'));query.addEventListener('change',source);document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else video.play().catch(()=>{})});source();
 const dialog=document.querySelector('dialog'),open=document.querySelector('[data-open-access]'),close=document.querySelector('[data-close-access]'),form=document.querySelector('[data-access-form]'),input=form.elements.password,error=document.querySelector('#access-error');
 open.addEventListener('click',()=>{if(window.MestizaAccess.hasAccess()){location.assign(window.MestizaAccess.destination());return}form.reset();error.textContent='';input.removeAttribute('aria-invalid');dialog.showModal();input.focus()});
 close.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});dialog.addEventListener('close',()=>{form.reset();open.focus()});
 input.addEventListener('input',()=>{input.removeAttribute('aria-invalid');error.textContent=''});
 form.addEventListener('submit',e=>{e.preventDefault();try{if(window.MestizaAccess.unlock(input.value)){input.value='';location.assign(window.MestizaAccess.destination());return}input.setAttribute('aria-invalid','true');error.textContent='Senha incorreta. Tente novamente.';input.select()}catch{error.textContent='Permita o armazenamento desta sessão para acessar a prévia.'}});
})();
