(()=>{
 const key='mestiza.siteSettings.v1',base=new URL('../',document.currentScript.src).href;
 const merge=(a,b)=>{if(!b||typeof b!=='object'||Array.isArray(b))return a;const out={...a};for(const [k,v] of Object.entries(b)){if(['__proto__','constructor','prototype'].includes(k))continue;out[k]=v&&typeof v==='object'&&!Array.isArray(v)?merge(a?.[k]||{},v):v}return out};
 let current={version:1,backgrounds:[],closes:[],texts:{},clients:[],socials:{},banner:{},brief:{}};
 let pending=null;
 window.MestizaReady=fetch(new URL('data/site.json',base),{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Configuração indisponível');return r.json()}).then(defaults=>{let local={};try{local=JSON.parse(localStorage.getItem(key)||'{}')}catch{}current=merge(defaults,local);window.MestizaDefaults=defaults;return current}).catch(()=>current);
 window.MestizaSettings={base,get:()=>structuredClone(current),save(value){const next=merge(current,value);try{localStorage.setItem(key,JSON.stringify(next));current=next;document.dispatchEvent(new CustomEvent('mestiza:settings',{detail:current}));return true}catch{return false}},reset(){try{localStorage.removeItem(key);current=structuredClone(window.MestizaDefaults||current);return true}catch{return false}},export(){return JSON.stringify({...current,typeSet:document.documentElement.dataset.typeSet||'signal'},null,2)}};
})();
