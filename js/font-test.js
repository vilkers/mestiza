/* Fonte nova em teste: alterna os títulos entre a fonte atual e a Guaviari BT, ao vivo.
   O botão fica no fim do rodapé das páginas com senha. A escolha vale para todas as páginas
   neste navegador (localStorage). ?fonte=guaviari liga e ?fonte=atual desliga. */
(()=>{
 const KEY='mestiza.fonte',root=document.documentElement;
 let value='atual';try{value=localStorage.getItem(KEY)||'atual'}catch{}
 const q=new URLSearchParams(location.search).get('fonte');if(q)value=q==='guaviari'?'guaviari':'atual';
 const label=()=>value==='guaviari'?'Voltar para a fonte atual':'Ver o site com a fonte nova (Guaviari)';
 function apply(v,save){value=v;if(v==='guaviari')root.dataset.font='guaviari';else delete root.dataset.font;if(save)try{localStorage.setItem(KEY,v)}catch{}document.querySelectorAll('[data-font-toggle]').forEach(b=>{b.textContent=label();b.setAttribute('aria-pressed',String(v==='guaviari'))})}
 apply(value,!!q);
 function bind(){document.querySelectorAll('[data-font-toggle]').forEach(b=>{b.addEventListener('click',()=>apply(value==='guaviari'?'atual':'guaviari',true))});apply(value,false)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
