(()=>{
  const $=s=>document.querySelector(s);
  const safeStorage=(key)=>{try{return localStorage.getItem(key)||''}catch{return''}};
  const name=window.G24Identity?.get?.()||safeStorage('g24_member_name')||safeStorage('g24_name');

  if($('#lockerIdentity')) $('#lockerIdentity').textContent=name?`Locker: ${name}`:'Visitor locker';
  if($('#draftStatus')) $('#draftStatus').textContent='Draft: complete';
  if($('#draftCountdown')) $('#draftCountdown').textContent='Week One';
  if($('#practiceCopy')) $('#practiceCopy').textContent='The draft is complete. From here, the site is the permanent home of the inaugural 24 Gridiron season: games, records, leaderboards, history and whatever evidence the commissioner deems admissible.';

  const premiere=$('#postDraftPremiere'),close=$('#closePremiere'),video=$('#premiereVideo');
  let seen=false;try{seen=localStorage.getItem('g24_postdraft_2026_seen')==='1'}catch{}
  const dismiss=()=>{try{localStorage.setItem('g24_postdraft_2026_seen','1')}catch{};premiere?.classList.remove('open');video?.pause()};
  if(premiere&&!seen){premiere.classList.add('open');setTimeout(()=>video?.play().catch(()=>{}),180)}
  close?.addEventListener('click',dismiss);
  video?.addEventListener('ended',dismiss);

  function tone(freq=100,dur=.12,type='triangle',gain=.05){
    try{
      const A=window.AudioContext||window.webkitAudioContext,a=new A(),o=a.createOscillator(),g=a.createGain();
      o.type=type;o.frequency.setValueAtTime(freq,a.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(40,freq*.72),a.currentTime+dur);
      g.gain.setValueAtTime(.0001,a.currentTime);g.gain.exponentialRampToValueAtTime(gain,a.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+dur);
      o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+dur+.02);
    }catch{}
  }

  document.querySelectorAll('.locker').forEach(locker=>{
    locker.addEventListener('mouseenter',()=>tone(72,.08,'square',.025));
    locker.addEventListener('focus',()=>tone(82,.07,'square',.02));
    locker.addEventListener('click',()=>{
      tone(110,.16,'sawtooth',.06);
      const flash=document.createElement('div');flash.className='locker-open-flash';document.body.appendChild(flash);setTimeout(()=>flash.remove(),340);
    });
  });

  fetch('./sleeper-verified.json',{cache:'no-store'})
    .then(r=>r.ok?r.json():Promise.reject())
    .then(s=>{if(String(s.status).toLowerCase()==='complete'&&$('#draftStatus')) $('#draftStatus').textContent=`Draft: complete · ${s.picks||180} picks`;})
    .catch(()=>{});
})();
