(()=>{
 const allowed=['signal','grotesk','plex','instrument'];let chosen='signal';
 try{const saved=localStorage.getItem('mestiza.typeSet');if(allowed.includes(saved))chosen=saved}catch{}
 document.documentElement.dataset.typeSet=chosen;
 window.MestizaType={
  get:()=>document.documentElement.dataset.typeSet,
  set:(value,persist=false)=>{
   if(!allowed.includes(value))return false;
   document.documentElement.dataset.typeSet=value;
   let saved=true;if(persist)try{localStorage.setItem('mestiza.typeSet',value)}catch{saved=false}
   document.dispatchEvent(new CustomEvent('mestiza:typechange',{detail:{value,persist,saved}}));
   return saved;
  }
 };
})();
