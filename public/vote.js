(()=>{
  const SUPABASE_URL='https://rcaeofytdbuzejdkybcq.supabase.co';
  const SUPABASE_KEY='sb_publishable_AwEpAG3KIfBUCVJtwgrevg_ON-W5y_w';
  const stages=[...document.querySelectorAll('.vote-stage')];
  const questionStages=stages.filter(s=>s.dataset.key);
  const nav=document.querySelector('#voteNav');
  const next=document.querySelector('#nextQuestion');
  const prev=document.querySelector('#prevQuestion');
  const begin=document.querySelector('#beginVote');
  const submit=document.querySelector('#submitVote');
  const nameInput=document.querySelector('#managerName');
  const codeInput=document.querySelector('#accessCode');
  const status=document.querySelector('#submitStatus');
  const progressBar=document.querySelector('#progressBar');
  const progressLabel=document.querySelector('#progressLabel');
  const progressCount=document.querySelector('#progressCount');
  const review=document.querySelector('#reviewList');
  const confirm=document.querySelector('#confirmVote');
  const receipt=document.querySelector('#receipt');
  const receiptText=document.querySelector('#receiptText');
  const answers={};
  let step=-1;
  const labels={buyin:'Buy-in',trade:'Trade fee',slot:'Draft-position swap',future:'Future picks',side:'Side-game rewards',keeper:'Keeper acknowledgment'};
  const pretty={
    buyin:{'0':'$0','25':'$25','50':'$50','75':'$75','100':'$100'},
    trade:{none:'No trade fee','1':'$1 per trade','5':'$5 per trade'},
    slot:{yes:'Allow one full-slot swap',no:'No draft-position swaps'},
    future:{none:'No future picks',limited:'Limited: one trade / next season',open:'Open future-pick market'},
    side:{brag:'Bragging rights',fixed:'Fixed prizes',share:'League-pot share'},
    keeper:{understood:'Understood',flag:'Flag an edge case'}
  };
  function show(target){stages.forEach(s=>s.classList.toggle('active',s===target));window.scrollTo({top:0,behavior:'smooth'});}
  function updateProgress(){
    if(step<0){progressLabel.textContent='Identity';progressCount.textContent='0 / 6';progressBar.style.width='0%';nav.classList.remove('show');return;}
    if(step<questionStages.length){progressLabel.textContent=`Question ${step+1}`;progressCount.textContent=`${step+1} / 6`;progressBar.style.width=`${((step+1)/6)*100}%`;nav.classList.add('show');next.textContent=step===questionStages.length-1?'Review ballot →':'Next question →';prev.style.visibility='visible';return;}
    progressLabel.textContent='Review';progressCount.textContent='6 / 6';progressBar.style.width='100%';nav.classList.remove('show');
  }
  function selectStage(i){step=i;show(questionStages[i]);updateProgress();}
  function normalizeCode(v){return v.trim().toUpperCase().replace(/\s+/g,'');}
  begin.addEventListener('click',()=>{
    const n=nameInput.value.trim(); const c=normalizeCode(codeInput.value);
    if(n.length<2){nameInput.focus();return;}
    if(c.length<4){codeInput.focus();return;}
    codeInput.value=c; selectStage(0);
  });
  questionStages.forEach(stage=>{
    stage.querySelectorAll('.vote-options button').forEach(btn=>btn.addEventListener('click',()=>{
      stage.querySelectorAll('.vote-options button').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');answers[stage.dataset.key]=btn.dataset.v;
      if(stage.dataset.key==='buyin'){
        const n=Number(btn.dataset.v),pot=n*12;
        document.querySelector('#moneySummary').textContent=n?`Illustrative 12-team pot: $${pot} • 1st $${pot*.6} • 2nd $${pot*.3} • 3rd $${pot*.1}`:'No cash pot — bragging rights only.';
      }
    }));
  });
  next.addEventListener('click',()=>{
    const key=questionStages[step].dataset.key;
    if(!answers[key]){questionStages[step].querySelector('.vote-options button')?.focus();return;}
    if(step<questionStages.length-1){selectStage(step+1);}else{renderReview();show(document.querySelector('[data-stage="review"]'));step=questionStages.length;updateProgress();}
  });
  prev.addEventListener('click',()=>{if(step>0)selectStage(step-1);else{step=-1;show(document.querySelector('[data-stage="identity"]'));updateProgress();}});
  function renderReview(){
    review.innerHTML=questionStages.map(s=>`<div class="review-row"><span>${labels[s.dataset.key]}</span><b>${pretty[s.dataset.key][answers[s.dataset.key]]||answers[s.dataset.key]}</b></div>`).join('');
  }
  async function submitVote(){
    status.className='submit-status';status.textContent='';
    if(!confirm.checked){status.classList.add('error');status.textContent='Confirm that this is your official ballot before submitting.';return;}
    submit.disabled=true;submit.textContent='Recording vote…';
    try{
      const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/gridiron_submit_vote`,{
        method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY},
        body:JSON.stringify({p_manager_name:nameInput.value.trim(),p_access_code:normalizeCode(codeInput.value),p_answers:answers})
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(payload.message||payload.error||'Vote could not be recorded.');
      const when=payload.submitted_at?new Date(payload.submitted_at):new Date();
      receiptText.textContent=`Thanks, ${payload.manager||nameInput.value.trim()}. Your official founding ballot has been recorded.`;
      receipt.innerHTML=`<b>24 Gridiron founding ballot</b><br>Recorded: ${when.toLocaleString()}<br>Ticket code: ${normalizeCode(codeInput.value).replace(/.(?=.{3})/g,'•')}`;
      show(document.querySelector('[data-stage="success"]'));progressLabel.textContent='Recorded';progressCount.textContent='Complete';progressBar.style.width='100%';nav.classList.remove('show');
    }catch(err){status.classList.add('error');status.textContent=String(err.message||err).replace('Invalid manager name or access code','That name/code combination is not valid. Check the ticket and try again.');submit.disabled=false;submit.textContent='Submit official vote →';}
  }
  submit.addEventListener('click',submitVote);
  updateProgress();
})();
