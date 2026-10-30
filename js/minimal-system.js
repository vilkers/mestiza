(async()=>{
 await window.MestizaReady;
 const paths={
  'arrow-up-right':'M5 19 19 5M5 5h14v14',
  'arrow-down':'M12 4v16M5 13l7 7 7-7',
  'arrow-up':'M12 20V4M5 11l7-7 7 7',
  'arrow-left':'M20 12H4M11 5l-7 7 7 7',
  'arrow-right':'M4 12h16M13 5l7 7-7 7',
  'check':'m5 12 4 4L19 6'
 };
 function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS(svg.namespaceURI,'path');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add('outline-icon');path.setAttribute('d',paths[name]);svg.append(path);return svg}
 document.querySelectorAll('[data-icon]').forEach(el=>{if(paths[el.dataset.icon])el.replaceWith(icon(el.dataset.icon))});
 const map={'↗':'arrow-up-right','↓':'arrow-down','↑':'arrow-up','←':'arrow-left','→':'arrow-right','✓':'check'};
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),nodes=[];let node;
 while(node=walker.nextNode()){if(!node.parentElement?.closest('script,style,textarea,input,select,svg,pre,code')&&/[↗↓↑←→✓]/.test(node.nodeValue))nodes.push(node)}
 for(const text of nodes){const fragment=document.createDocumentFragment();for(const piece of text.nodeValue.split(/([↗↓↑←→✓])/)){if(map[piece]){const svg=icon(map[piece]);svg.classList.add('ui-icon');fragment.append(svg)}else if(piece)fragment.append(document.createTextNode(piece))}text.replaceWith(fragment)}
 // Keep the social section visible while official profile URLs are being configured.
 document.querySelectorAll('.social-links').forEach(el=>{el.parentElement.hidden=false});
})();
