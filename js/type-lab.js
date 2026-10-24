(()=>{
 const names={signal:'Signal A / misto',grotesk:'Signal A / grotesca',plex:'Plex / sistema',instrument:'Instrument / contraste'};
 const indices={signal:'01',grotesk:'02',plex:'03',instrument:'04'};
 const root=document.documentElement,radios=[...document.querySelectorAll('[name="type-set"]')];
 const status=document.querySelector('[data-save-status]'),size=document.querySelector('#type-size'),tracking=document.querySelector('#type-tracking');
 function sync(){const set=window.MestizaType.get();radios.forEach(r=>r.checked=r.value===set);document.querySelector('[data-set-name]').textContent=`${indices[set]} — ${names[set]}`;document.querySelector('[data-dock-name]').textContent=names[set];fontStatus()}
 async function fontStatus(){const el=document.querySelector('[data-font-status]');el.textContent='Carregando fontes…';try{await document.fonts.ready;const set=window.MestizaType.get();const family={signal:'SA Editorial',grotesk:'SA Grotesk',plex:'IBM Plex Sans',instrument:'Instrument Serif'}[set];const faces=await document.fonts.load(`40px "${family}"`);el.textContent=faces.length?`${names[set]} / fontes carregadas`:'Fonte indisponível / exibindo alternativa do sistema'}catch{el.textContent='Fonte indisponível / exibindo alternativa do sistema'}}
 radios.forEach(r=>r.addEventListener('change',()=>{if(r.checked){window.MestizaType.set(r.value);status.textContent='Prévia atualizada. Use este set para salvar a escolha.'}}));
 document.addEventListener('mestiza:typechange',sync);
 function persist(){const set=window.MestizaType.get();const saved=window.MestizaType.set(set,true);if(!saved){status.textContent='Prévia aplicada. O navegador não permitiu salvar a escolha.';return}status.textContent=`${names[set]} salvo. Sobre e case usarão este set neste navegador.`;document.querySelector('[data-save]').firstChild.textContent='Set salvo '}
 document.querySelector('[data-save]').addEventListener('click',persist);
 document.querySelectorAll('[data-open-about],[data-open-case]').forEach(link=>link.addEventListener('click',persist));
 function adjust(){root.style.setProperty('--lab-scale',Number(size.value)/100);root.style.setProperty('--lab-tracking',tracking.value);document.querySelector('#size-value').textContent=`${size.value}%`;document.querySelector('#tracking-value').textContent=tracking.value.replace('-','−')}
 size.addEventListener('input',adjust);tracking.addEventListener('input',adjust);
 document.querySelector('[data-reset]').addEventListener('click',()=>{size.value=100;tracking.value=-5;document.querySelector('[contenteditable]').innerHTML='Ideias<br><strong>mudam.</strong><br>O olhar fica.';adjust()});
 document.querySelector('[contenteditable]').addEventListener('paste',e=>{e.preventDefault();const text=e.clipboardData.getData('text/plain');const selection=window.getSelection();if(!selection.rangeCount)return;const range=selection.getRangeAt(0);range.deleteContents();const node=document.createTextNode(text);range.insertNode(node);range.setStartAfter(node);range.collapse(true);selection.removeAllRanges();selection.addRange(range)});
 sync();adjust();
})();
