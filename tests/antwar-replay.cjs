const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'../assets/replays');
const sandbox={window:{ARENA_REPLAYS:{}}};
vm.runInNewContext(fs.readFileSync(path.join(root,'antwar-data.js'),'utf8'),sandbox);
const replay=JSON.parse(JSON.stringify(sandbox.window.ARENA_REPLAYS.antwar));
const proof=JSON.parse(fs.readFileSync(path.join(root,'antwar-provenance.json')));
assert.equal(proof.human.rank,1);
assert.equal(proof.seed,20240117);
assert.equal(proof.requested_seed,42);
for(const seat of [0,1]){
 const raw=fs.readFileSync(path.join(root,proof.matches[seat].raw_file));
 assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),proof.matches[seat].raw_sha256);
 const records=JSON.parse(raw),variant=replay.variants[seat],towers=new Map();
 assert.equal(records.length,variant.frames.length);
 assert.equal(records[0].seed,replay.seed);
 records.forEach((record,i)=>{
  const s=record.round_state,f=variant.frames[i],shots=[];
  assert.equal(s.error||'','');
  for(const t of s.towers){
   if(t.type===-1){towers.delete(t.id);continue;}
   towers.set(t.id,t);
   for(const id of t.attack||[]){const a=s.ants.find(a=>a.id===id);assert.ok(a);shots.push({owner:t.player,start:t.pos,end:a.pos});}
  }
  assert.deepEqual(f.scores,s.camps);
  assert.deepEqual(f.attacks,shots);
  assert.equal(f.units.filter(u=>u.kind==='tower').length,towers.size);
  for(const u of f.units.filter(u=>u.kind==='tower')){
   const t=towers.get(u.id);
   assert.deepEqual([u.owner,u.x,u.y,u.type],[t.player,t.pos.x,t.pos.y,t.type]);
   assert.equal(replay.board[u.y][u.x],String(u.owner));
  }
  const ants=s.ants.filter(a=>[0,4].includes(a.status));
  assert.deepEqual(f.units.filter(u=>u.kind==='ant').map(u=>[u.id,u.owner,u.x,u.y,u.hp,u.status]),ants.map(a=>[a.id,a.player,a.pos.x,a.pos.y,a.hp,a.status]));
 });
 assert.equal(variant.winner,records.at(-1).round_state.winner);
 assert.equal(proof.matches[seat].winner,'P'+variant.winner);
 assert.deepEqual(JSON.parse(records.at(-1).round_state.message),['OK','OK']);
}
console.log('PASS: 1,024 AntWar frames match raw ants, accumulated towers, demolitions, recorded shots, scores and terminal results; actual rank-1 opponent and backend seed verified.');
