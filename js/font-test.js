/* Teste de fonte no site atual: alterna os títulos entre a fonte atual e a Guaviari BT.
   ?fonte=guaviari liga, ?fonte=atual desliga; a escolha fica salva neste navegador. */
(()=>{
 const KEY='mestiza.fonte',root=document.documentElement;
 let value=null;try{value=localStorage.getItem(KEY)}catch{}
 const q=new URLSearchParams(location.search).get('fonte');if(q)value=q==='guaviari'?'guaviari':'atual';
 function apply(v,save){value=v;if(v==='guaviari')root.dataset.font='guaviari';else delete root.dataset.font;if(save)try{localStorage.setItem(KEY,v)}catch{}const b=document.querySelector('.font-toggle');if(b){b.innerHTML='<b>Aa</b>'+(v==='guaviari'?'Guaviari · voltar à atual':'Ver com Guaviari');b.setAttribute('aria-pressed',String(v==='guaviari'))}}
 apply(value||'atual',!!q);
 function button(){if(document.querySelector('.font-toggle'))return;const b=document.createElement('button');b.type='button';b.className='font-toggle';b.addEventListener('click',()=>apply(value==='guaviari'?'atual':'guaviari',true));document.body.appendChild(b);apply(value||'atual',false)}
 if(document.body)button();else document.addEventListener('DOMContentLoaded',button);
})();
