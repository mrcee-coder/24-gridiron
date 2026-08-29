(()=>{
const URL='https://rcaeofytdbuzejdkybcq.supabase.co',KEY='sb_publishable_AwEpAG3KIfBUCVJtwgrevg_ON-W5y_w',SLEEPER='https://sleeper.com/i/m7mPK0jWYwZOK';
const $=s=>document.querySelector(s);
async function rpc(n,b={}){const r=await fetch(`${URL}/rest/v1/rpc/${n}`,{method:'POST',headers:{'Content-Type':'application/json','apikey':KEY},body:JSON.stringify(b)});if(!r.ok)throw Error('Request failed');return r.json()}
async function init(){let cfg={draft_display:'Friday, September 4 · 3:00 PM',draft_location:'25 Carrots Conference Room'};try{cfg=await rpc('gridiron_public_config')}catch(e){}
const hero=$('.draft-hero');if(hero){hero.querySelector('.tiny').textContent='Official 2026 league draft';hero.querySelector('h1').textContent='DRAFT NIGHT IS LOCKED';hero.querySelector('p').textContent='The availability vote is closed. The league has a date, a room and a remote option.'}
const plan=$('.draft-plan');if(plan){plan.innerHTML=`<div class="draft-plan-kicker">Official draft</div><div class="draft-plan-copy"><h2>${cfg.draft_display||'Friday, September 4 · 3:00 PM'}</h2><p><strong>${cfg.draft_location||'25 Carrots Conference Room'}.</strong> Draft in person with the league on your own phone or laptop while the board is up in the room.</p></div><div class="draft-plan-grid"><div><b>IN PERSON</b><span>25 Carrots Conference Room · Friday, September 4 · 3:00 PM.</span></div><div><b>REMOTE IS FINE</b><span>Can't make it in? Draft from the comfort of home through Sleeper. Same draft, same clock.</span></div><div><b>BE IN SLEEPER</b><span>The website is league HQ. Sleeper is where the actual draft happens.</span></div></div><div style="margin-top:18px"><a class="cta" href="${SLEEPER}" target="_blank" rel="noopener">Join / Open Sleeper ↗</a> <a class="cta ghost" href="./#locker-room">Locker Room updates →</a></div>`}
['#loginCard','#poll','#commissioner','#draftLogout'].forEach(s=>{const el=$(s);if(el)el.hidden=true});
}
init();
})();