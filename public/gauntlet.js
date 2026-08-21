(()=>{
  const SB_URL='https://rcaeofytdbuzejdkybcq.supabase.co';
  const SB_KEY='sb_publishable_AwEpAG3KIfBUCVJtwgrevg_ON-W5y_w';
  const canvas=document.querySelector('#game');
  const ctx=canvas.getContext('2d');
  const W=420,H=720;
  const $=s=>document.querySelector(s);
  const ui={yards:$('#runYards'),best:$('#personalBest'),pace:$('#paceLabel'),identity:$('#identityOverlay'),ready:$('#readyOverlay'),tackle:$('#tackleOverlay'),name:$('#playerName'),code:$('#playerCode'),remember:$('#rememberDevice'),identityStatus:$('#identityStatus'),startStatus:$('#startStatus'),welcome:$('#welcomeLine'),final:$('#finalYards'),result:$('#resultLine'),leaders:$('#gauntletLeaders')};
  let identity={name:'',code:''},runId=null,running=false,last=0,startPerf=0,yards=0,worldOffset=0,spawnClock=0,shake=0,particles=[];
  const player={x:W/2,y:H*.78,targetX:W/2,targetY:H*.78,r:17,lean:0};
  let defenders=[];
  const keys={left:false,right:false,up:false,down:false};

  async function rpc(name,body={}){
    const r=await fetch(`${SB_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY},body:JSON.stringify(body)});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.message||d.error||'Request failed.');
    return d;
  }
  const norm=v=>v.trim().toUpperCase().replace(/\s+/g,'');
  const esc=v=>String(v||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function loadRemembered(){
    const name=localStorage.getItem('g24_name')||sessionStorage.getItem('g24_name')||'';
    const code=localStorage.getItem('g24_code')||sessionStorage.getItem('g24_code')||'';
    if(name)ui.name.value=name;if(code)ui.code.value=code;
  }
  function storeIdentity(){
    const store=ui.remember.checked?localStorage:sessionStorage;
    const other=ui.remember.checked?sessionStorage:localStorage;
    store.setItem('g24_name',identity.name);store.setItem('g24_code',identity.code);
    other.removeItem('g24_name');other.removeItem('g24_code');
  }
  function changeIdentity(){
    localStorage.removeItem('g24_name');localStorage.removeItem('g24_code');sessionStorage.removeItem('g24_name');sessionStorage.removeItem('g24_code');
    identity={name:'',code:''};ui.ready.classList.add('hidden');ui.tackle.classList.add('hidden');ui.identity.classList.remove('hidden');ui.name.focus();
  }

  async function enter(){
    identity={name:ui.name.value.trim(),code:norm(ui.code.value)};
    if(identity.name.length<2){ui.identityStatus.textContent='Enter your name.';return}
    if(identity.code.length<4){ui.identityStatus.textContent='Enter your ticket code.';return}
    storeIdentity();
    const rememberedBest=findBestFor(identity.name);
    ui.best.textContent=rememberedBest!==null?`${rememberedBest} YD`:'--';
    ui.welcome.textContent=rememberedBest!==null?`${identity.name} • best ${rememberedBest} yards`:identity.name;
    ui.identity.classList.add('hidden');ui.ready.classList.remove('hidden');ui.identityStatus.textContent='';
  }
  function friendly(msg){
    if(/Complete the founding ballot/i.test(msg))return 'Complete the founding ballot first. Your ticket becomes your league identity after that.';
    if(/ticket|match|access|invalid/i.test(msg))return 'That name and ticket code do not match a completed league entry.';
    return msg||'Could not connect right now.';
  }

  async function startRun(){
    ui.startStatus.textContent='Opening the field...';
    try{
      const d=await rpc('gridiron_gauntlet_start',{p_manager_name:identity.name,p_access_code:identity.code});
      runId=d.run_id;ui.best.textContent=`${d.best_yards||0} YD`;resetGame();ui.ready.classList.add('hidden');ui.tackle.classList.add('hidden');running=true;startPerf=performance.now();last=startPerf;ui.startStatus.textContent='';requestAnimationFrame(loop);
    }catch(e){ui.startStatus.textContent=friendly(e.message)}
  }
  function resetGame(){
    yards=0;worldOffset=0;spawnClock=.35;defenders=[];particles=[];shake=0;player.x=W/2;player.y=H*.78;player.targetX=player.x;player.targetY=player.y;player.lean=0;ui.yards.textContent='0 YD';ui.pace.textContent='ROOKIE';
  }
  function speed(){return Math.min(345,155+yards*.72)}
  function pace(){if(yards<50)return 'ROOKIE';if(yards<125)return 'STARTER';if(yards<250)return 'ALL-PRO';if(yards<450)return 'ELITE';return 'ABSURD'}

  function spawnRow(){
    const difficulty=Math.min(1,yards/450);
    const count=Math.random()<.22+difficulty*.38?3:2;
    const margin=42,usable=W-margin*2;
    let centers=[];
    if(count===2){
      const base=margin+Math.random()*usable*.28;
      centers=[base,base+usable*(.54+Math.random()*.15)];
    }else{
      const gap=usable/3;
      const jitter=18;
      centers=[margin+gap*.22+rand(-jitter,jitter),margin+gap*1.45+rand(-jitter,jitter),margin+gap*2.65+rand(-jitter,jitter)];
      const remove=Math.floor(Math.random()*3);centers.splice(remove,1);
      if(Math.random()<difficulty*.55)centers.push(margin+gap*(remove+.55)+rand(-12,12));
    }
    centers.forEach(x=>defenders.push({x:clamp(x,31,W-31),y:-60-rand(0,80),r:20,vx:(Math.random()<.3+difficulty*.25?rand(-30,30):0),phase:Math.random()*Math.PI*2,kind:Math.random()<.18+difficulty*.18?'pursuit':'lane'}));
  }
  function rand(a,b){return a+Math.random()*(b-a)}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

  function update(dt){
    const s=speed();worldOffset=(worldOffset+s*dt)%72;yards+=s*dt/18.5;ui.yards.textContent=`${Math.floor(yards)} YD`;ui.pace.textContent=pace();
    const steer=345;
    if(keys.left)player.targetX-=steer*dt;if(keys.right)player.targetX+=steer*dt;if(keys.up)player.targetY-=steer*.5*dt;if(keys.down)player.targetY+=steer*.5*dt;
    player.targetX=clamp(player.targetX,31,W-31);player.targetY=clamp(player.targetY,H*.61,H*.88);
    const dx=player.targetX-player.x,dy=player.targetY-player.y;player.x+=dx*Math.min(1,dt*9);player.y+=dy*Math.min(1,dt*8);player.lean=dx*.018;
    spawnClock-=dt;if(spawnClock<=0){spawnRow();spawnClock=clamp(.93-yards*.00125,.42,.93)*rand(.82,1.18)}
    defenders.forEach(d=>{d.y+=s*dt;d.phase+=dt*2.2;if(d.kind==='pursuit'){const seek=clamp((player.x-d.x)*.62,-45,45);d.vx+=(seek-d.vx)*Math.min(1,dt*1.6)}d.x+=d.vx*dt+(d.kind==='lane'?Math.sin(d.phase)*7*dt:0);d.x=clamp(d.x,27,W-27)});
    defenders=defenders.filter(d=>d.y<H+80);
    for(const d of defenders){const dx=d.x-player.x,dy=d.y-player.y;if(dx*dx+dy*dy<34*34){tackle();break}}
    particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;p.life-=dt});particles=particles.filter(p=>p.life>0);shake=Math.max(0,shake-dt*18);
  }

  function tackle(){
    if(!running)return;running=false;shake=12;for(let i=0;i<20;i++)particles.push({x:player.x,y:player.y,vx:rand(-130,130),vy:rand(-160,30),life:rand(.35,.75)});
    draw();setTimeout(()=>finishRun(),280);
  }
  async function finishRun(reason){
    const score=Math.max(0,Math.floor(yards));const elapsed=Math.max(700,Math.round(performance.now()-startPerf));ui.final.textContent=score;ui.result.textContent=reason||'Checking the official board...';ui.tackle.classList.remove('hidden');
    if(!runId){ui.result.textContent='Run ended, but there was no active score ticket.';return}
    const rid=runId;runId=null;
    try{
      const d=await rpc('gridiron_gauntlet_finish',{p_run_id:rid,p_score_yards:score,p_client_elapsed_ms:elapsed});
      ui.best.textContent=`${d.best_yards||score} YD`;ui.result.textContent=score>=(d.best_yards||0)?'New personal best. Official score recorded.':'Official score recorded.';loadBoard();
    }catch(e){ui.result.textContent='Run ended. The server could not verify this score, so it was not added to the board.'}
  }

  function loop(t){if(!running)return;const dt=Math.min(.032,(t-last)/1000||.016);last=t;update(dt);draw();if(running)requestAnimationFrame(loop)}
  function draw(){
    ctx.save();ctx.clearRect(0,0,W,H);const sx=shake?rand(-shake,shake):0,sy=shake?rand(-shake,shake):0;ctx.translate(sx,sy);drawField();defenders.forEach(drawDefender);drawPlayer();particles.forEach(drawParticle);ctx.restore();
  }
  function drawField(){
    const g=ctx.createLinearGradient(0,0,W,0);g.addColorStop(0,'#0b2a18');g.addColorStop(.08,'#174c2c');g.addColorStop(.5,'#1d5b35');g.addColorStop(.92,'#174c2c');g.addColorStop(1,'#0b2a18');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    for(let y=-72+worldOffset;y<H+72;y+=72){ctx.fillStyle='rgba(239,228,204,.14)';ctx.fillRect(22,y,W-44,2);ctx.fillStyle='rgba(239,228,204,.55)';for(let x=118;x<=302;x+=92)ctx.fillRect(x-1,y-8,2,16)}
    ctx.fillStyle='rgba(239,228,204,.48)';ctx.fillRect(17,0,3,H);ctx.fillRect(W-20,0,3,H);
    const shade=ctx.createLinearGradient(0,0,0,H);shade.addColorStop(0,'rgba(0,0,0,.18)');shade.addColorStop(.5,'rgba(0,0,0,0)');shade.addColorStop(1,'rgba(0,0,0,.22)');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
  }
  function drawPlayer(){
    ctx.save();ctx.translate(player.x,player.y);ctx.rotate(clamp(player.lean,-.17,.17));
    ctx.fillStyle='rgba(0,0,0,.28)';ellipse(0,19,23,13);ctx.fillStyle='#06110d';roundRect(-20,-17,40,43,13);ctx.fill();ctx.strokeStyle='#c8a35d';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#d8b266';ctx.beginPath();ctx.arc(0,-18,14,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f1d392';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#050706';roundRect(-12,-22,24,8,3);ctx.fill();ctx.fillStyle='#efe4cc';ctx.font='bold 14px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('24',0,4);
    ctx.fillStyle='#8f441f';ctx.beginPath();ctx.ellipse(15,8,7,11,.4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d5a978';ctx.lineWidth=1.3;ctx.stroke();ctx.restore();
  }
  function drawDefender(d){
    ctx.save();ctx.translate(d.x,d.y);const ang=d.kind==='pursuit'?clamp((player.x-d.x)*.002,-.16,.16):0;ctx.rotate(ang);ctx.fillStyle='rgba(0,0,0,.25)';ellipse(0,18,23,12);const grad=ctx.createLinearGradient(-20,-15,20,30);grad.addColorStop(0,'#ef7b3f');grad.addColorStop(.48,'#ad4b24');grad.addColorStop(1,'#4d1a0d');ctx.fillStyle=grad;roundRect(-21,-16,42,43,13);ctx.fill();ctx.strokeStyle='#f0c38e';ctx.lineWidth=1.4;ctx.stroke();ctx.fillStyle='#d6c7aa';ctx.beginPath();ctx.arc(0,-18,14,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#5b2111';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-11,-20);ctx.lineTo(11,-20);ctx.stroke();ctx.fillStyle='#1b0c08';ctx.font='bold 12px Georgia';ctx.textAlign='center';ctx.fillText(d.kind==='pursuit'?'X':'D',0,7);ctx.restore();
  }
  function drawParticle(p){ctx.globalAlpha=clamp(p.life*1.8,0,1);ctx.fillStyle=Math.random()<.5?'#c8a35d':'#efe4cc';ctx.fillRect(p.x,p.y,4,4);ctx.globalAlpha=1}
  function ellipse(x,y,rx,ry){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
  function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}

  function pointerMove(e){if(!running)return;const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*W;const y=(e.clientY-r.top)/r.height*H;player.targetX=clamp(x,31,W-31);if(e.pointerType!=='mouse')player.targetY=clamp(y,H*.61,H*.88)}
  canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture?.(e.pointerId);pointerMove(e)});canvas.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType!=='mouse')pointerMove(e)});
  addEventListener('keydown',e=>{if(['ArrowLeft','a','A'].includes(e.key)){keys.left=true;e.preventDefault()}if(['ArrowRight','d','D'].includes(e.key)){keys.right=true;e.preventDefault()}if(['ArrowUp','w','W'].includes(e.key)){keys.up=true;e.preventDefault()}if(['ArrowDown','s','S'].includes(e.key)){keys.down=true;e.preventDefault()}});
  addEventListener('keyup',e=>{if(['ArrowLeft','a','A'].includes(e.key))keys.left=false;if(['ArrowRight','d','D'].includes(e.key))keys.right=false;if(['ArrowUp','w','W'].includes(e.key))keys.up=false;if(['ArrowDown','s','S'].includes(e.key))keys.down=false});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){running=false;finishRun('Run ended when the game left the screen.')}});

  let boardRows=[];
  function findBestFor(name){const hit=boardRows.find(x=>String(x.member||x.manager||'').toLowerCase()===String(name||'').toLowerCase());return hit?Number(hit.best_yards||0):null}
  async function loadBoard(){
    try{const rows=await rpc('gridiron_gauntlet_leaderboard');boardRows=Array.isArray(rows)?rows:[];ui.leaders.innerHTML=boardRows.length?boardRows.slice(0,12).map((x,i)=>`<div class="leader-run"><span>${i+1}</span><div><strong>${esc(x.member||x.manager)}</strong><small>${x.runs||0} official run${x.runs===1?'':'s'}</small></div><b>${x.best_yards||0}<em>YD</em></b></div>`).join(''):'<div class="board-empty">No official runs yet. Somebody has to set the first number.</div>';if(identity.name){const best=findBestFor(identity.name);if(best!==null)ui.best.textContent=`${best} YD`}}catch(_){ui.leaders.innerHTML='<div class="board-empty">Leaderboard is temporarily unavailable.</div>'}
  }

  $('#enterGame').addEventListener('click',enter);$('#startRun').addEventListener('click',startRun);$('#runAgain').addEventListener('click',()=>{ui.tackle.classList.add('hidden');ui.ready.classList.remove('hidden')});$('#changeIdentity').addEventListener('click',changeIdentity);$('#refreshBoard').addEventListener('click',loadBoard);
  loadRemembered();loadBoard();draw();
})();