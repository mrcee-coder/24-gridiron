import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const pub=path.join(root,'public');
let checks=0;
const failures=[];

function ok(condition,label){checks++;if(!condition)failures.push(label)}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p]})}
function text(file){return fs.readFileSync(file,'utf8')}
function rel(file){return path.relative(root,file).replaceAll('\\','/')}
function targetExists(from,raw){
  let v=raw.split('#')[0].split('?')[0];
  if(!v||v.startsWith('#')||/^(https?:|mailto:|tel:|javascript:|data:)/i.test(v))return true;
  if(v.startsWith('/'))return true;
  const p=path.resolve(path.dirname(from),v);
  if(fs.existsSync(p))return true;
  if(!path.extname(p)&&fs.existsSync(`${p}.html`))return true;
  return false;
}

const files=walk(pub);
const html=files.filter(f=>f.endsWith('.html'));
const js=files.filter(f=>f.endsWith('.js'));
const css=files.filter(f=>f.endsWith('.css'));

ok(fs.existsSync(pub),'public directory exists');
ok(html.length>=10,`at least 10 HTML pages exist (found ${html.length})`);
ok(js.length>=8,`at least 8 JS files exist (found ${js.length})`);
ok(css.length>=8,`at least 8 CSS files exist (found ${css.length})`);

for(const file of files){ok(fs.statSync(file).size>0||path.basename(file)==='.nojekyll',`${rel(file)} is not unexpectedly empty`)}

for(const file of html){
  const s=text(file);
  ok(/<!doctype html>/i.test(s),`${rel(file)} has doctype`);
  ok(/<meta[^>]+name=["']viewport["']/i.test(s)||path.basename(file)==='index.html',`${rel(file)} has viewport metadata`);
  ok(/<title>[^<]+<\/title>/i.test(s),`${rel(file)} has title`);
  const ids=[...s.matchAll(/\bid=["']([^"']+)["']/gi)].map(m=>m[1]);
  ok(new Set(ids).size===ids.length,`${rel(file)} has no duplicate ids`);
  for(const m of s.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi))ok(targetExists(file,m[1]),`${rel(file)} target exists: ${m[1]}`);
}

for(const file of js){
  try{execFileSync(process.execPath,['--check',file],{stdio:'pipe'});ok(true,`${rel(file)} parses as JavaScript`)}catch{ok(false,`${rel(file)} parses as JavaScript`)}
}
for(const file of css){
  const s=text(file);
  ok((s.match(/{/g)||[]).length===(s.match(/}/g)||[]).length,`${rel(file)} has balanced CSS braces`);
}

const index=text(path.join(pub,'index.html'));
const draft=text(path.join(pub,'draft-table.html'));
const draftJs=text(path.join(pub,'draft-table.js'));
const home=text(path.join(pub,'home.html'));
const homeJs=text(path.join(pub,'locker-room.js'));
const leaders=text(path.join(pub,'leaderboards.html'));
const polls=text(path.join(pub,'polls.js'));
const gauntlet=text(path.join(pub,'gauntlet.html'));

ok(index.includes('draft-table.html'),'root enters Bold Predictions');
ok(draft.includes('id="teamCheck"'),'Draft Table has first-run team-name check');
ok(draft.includes('id="teamSleeper"'),'Draft Table captures Sleeper username in pop-up');
ok(draft.includes('id="teamName"'),'Draft Table captures Sleeper team name');
ok(draft.includes('id="foodFootball"'),'Draft Table requires Food + Football confirmation');
ok(draft.includes('id="dtRealName"'),'Draft Table captures real name');
ok(draft.includes('id="dtSleeperName"'),'Draft Table captures Sleeper username for records');
ok(draft.includes('sleeper.com/mockdraft'),'Draft Table links directly to Sleeper mock drafts');
ok(draftJs.includes('api.sleeper.app/v1/league'),'Draft intake verifies against Sleeper API');
ok(draftJs.includes("location.href='./home.html'"),'Prediction completion routes to locker room');
ok(draftJs.includes("q.input_type==='select'"),'Draft questions support controlled-choice inputs');
ok(draftJs.includes("q.key==='late_steal'?'Non-QB player'"),'Late-round steal communicates non-QB restriction');
ok(draftJs.includes('g24_member_name'),'Draft Table uses shared site identity key');
ok(home.includes('THE<br/><em>LOCKER ROOM</em>'),'Locker Room has over-produced hero');
ok((home.match(/class="locker/g)||[]).length>=8,'Locker Room exposes at least eight lockers');
ok(home.includes('leaderboards.html'),'Locker Room has dedicated leaderboard locker');
ok(home.includes('games.html'),'Locker Room has games locker');
ok(home.includes('draft-order.html'),'Locker Room has draft-order locker');
ok(home.includes('history.html'),'Locker Room has history locker');
ok(home.includes('polls.html'),'Locker Room has ballot-box locker');
ok(homeJs.includes('AudioContext'),'Locker Room contains synthesized interaction sound');
ok(leaders.includes('Gridiron Gauntlet'),'Leaderboard page includes Gauntlet board');
ok(leaders.includes('Read the Room'),'Leaderboard page includes side-game board');
ok(leaders.includes('Bold Predictions'),'Leaderboard page includes prediction scoring section');
ok(polls.includes('g24_member_name'),'Polls reuse shared 24 Gridiron identity');
ok(gauntlet.includes('identity.js'),'Gauntlet loads shared identity helper');
ok(!draft.includes('Ticket code'),'Draft Predictions no longer asks for ticket code');
ok(!draft.includes('accessCode'),'Draft Predictions no longer depends on access-code input');
ok(!home.includes('Ticket code'),'Locker Room has no ticket-code gate');
ok(checks>=100,`release gate executes at least 100 checks (ran ${checks} before threshold assertion)`);

if(failures.length){
  console.error(`\nQA FAILED: ${failures.length} of ${checks} checks failed\n`);
  failures.forEach((f,i)=>console.error(`${i+1}. ${f}`));
  process.exit(1);
}
console.log(`QA PASSED: ${checks} checks`);
