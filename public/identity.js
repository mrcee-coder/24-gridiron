(()=>{
  const KEY='g24_member_name';
  const LEGACY='g24_name';
  const $=s=>document.querySelector(s);

  function get(){
    try{return localStorage.getItem(KEY)||localStorage.getItem(LEGACY)||''}catch{return''}
  }
  function set(name){
    const v=String(name||'').trim();
    if(!v)return;
    try{
      localStorage.setItem(KEY,v);
      localStorage.setItem(LEGACY,v);
    }catch{}
    window.dispatchEvent(new CustomEvent('g24:identity',{detail:{name:v}}));
  }
  function clear(){
    try{localStorage.removeItem(KEY);localStorage.removeItem(LEGACY)}catch{}
    window.dispatchEvent(new CustomEvent('g24:identity',{detail:{name:''}}));
  }

  const existing=get();
  if(existing)set(existing);
  window.G24Identity={get,set,clear,key:KEY};

  addEventListener('DOMContentLoaded',()=>{
    const nameInput=$('#playerName');
    const enter=$('#enterGame');
    const code=$('#playerCode');
    if(nameInput&&existing&&!nameInput.value)nameInput.value=existing;
    if(code&&!code.value)code.value='OPEN';
    if(enter&&nameInput){
      enter.addEventListener('click',()=>{
        const name=nameInput.value.trim();
        if(name.length>=2)set(name);
      });
    }
  });
})();
