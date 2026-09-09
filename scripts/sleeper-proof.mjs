const league='1395507776981069824';
const api='https://api.sleeper.app/v1';
async function get(path){const r=await fetch(api+path,{headers:{'user-agent':'24-gridiron-proof'}});if(!r.ok)throw new Error(`${path} ${r.status}`);return r.json();}
const [users,drafts,rosters,players]=await Promise.all([get(`/league/${league}/users`),get(`/league/${league}/drafts`),get(`/league/${league}/rosters`),get('/players/nfl')]);
const draft=(drafts||[]).find(d=>String(d.season)==='2026'&&d.status==='complete')||(drafts||[]).find(d=>String(d.season)==='2026'&&d.draft_order)||null;
if(!draft)throw new Error('No 2026 draft found');
const picks=await get(`/draft/${draft.draft_id}/picks`);
const names=Object.fromEntries((users||[]).map(u=>[u.user_id,{display_name:u.display_name,username:u.username,team_name:u.metadata?.team_name||u.display_name||u.username}]));
const order=Object.entries(draft.draft_order||{}).map(([user_id,slot])=>({slot:Number(slot),user_id,...(names[user_id]||{})})).sort((a,b)=>a.slot-b.slot);
const picksByRoster={};
for(const p of picks||[]){(picksByRoster[p.roster_id]??=[]).push({pick_no:p.pick_no,round:p.round,draft_slot:p.draft_slot,player_id:p.player_id,first_name:p.metadata?.first_name,last_name:p.metadata?.last_name,position:p.metadata?.position,team:p.metadata?.team});}
const rosterMap=(rosters||[]).map(r=>({roster_id:r.roster_id,owner_id:r.owner_id,manager:names[r.owner_id]||null,players:(r.players||[]).map(id=>({player_id:id,full_name:players[id]?.full_name||players[id]?.search_full_name||null,first_name:players[id]?.first_name||null,last_name:players[id]?.last_name||null,position:players[id]?.position||null,team:players[id]?.team||null,status:players[id]?.status||null})),drafted:picksByRoster[r.roster_id]||[]}));
console.log('SLEEPER_PROOF_BEGIN');
console.log(JSON.stringify({league,draft:{draft_id:draft.draft_id,status:draft.status,season:draft.season,type:draft.type,settings:draft.settings,order},pick_count:picks.length,picks,rosters:rosterMap},null,2));
console.log('SLEEPER_PROOF_END');
