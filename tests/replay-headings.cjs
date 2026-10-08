const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{ArenaI18n:{language:'en'}}};vm.createContext(ctx);
for(const file of ['assets/replays/replay-data.js','assets/replays/antwar-data.js','replays.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const {headingAt}=ctx.window.ArenaReplay;
let checked=0;
for(const game of ['pacman','snakego','antwar','dorado']){
 for(const v of ctx.window.ARENA_REPLAYS[game].variants){
  const r={game,...v};
  for(let i=1;i<r.frames.length;i++)for(const u of r.frames[i].units){
   const old=r.frames[i-1].units.find(p=>p.kind===u.kind&&p.owner===u.owner&&p.id===u.id);
   if(!old||u.body)continue;
   const dx=u.x-old.x+(game==='antwar'?((u.y%2===0?.5:0)-(old.y%2===0?.5:0)):0),dy=(u.y-old.y)*(game==='antwar'?.866:1),d=Math.hypot(dx,dy);
   if(d>0&&(game!=='pacman'||d<=1.01)){assert.ok(Math.abs(headingAt(r,i,u)-Math.atan2(dy,dx))<1e-10);checked++;}
  }
 }
}
const unit=(x,y)=>({id:0,owner:0,kind:'player',x,y});
const r={game:'pacman',frames:[{units:[unit(0,0)]},{units:[unit(0,1)]},{units:[unit(0,1)]},{units:[unit(9,9)]}]};
assert.equal(headingAt(r,2,r.frames[2].units[0]),Math.PI/2,'stationary keeps last heading');
assert.equal(headingAt(r,0,r.frames[0].units[0]),null,'no invented initial direction or future-frame leakage');
assert.equal(headingAt(r,3,r.frames[3].units[0]),null,'respawn is not movement');
assert.equal(headingAt(r,1,r.frames[1].units[0]),Math.PI/2,'backward seek is deterministic');
console.log(`PASS: ${checked} real movement headings, initial unknown direction, stationary/respawn and backward seek`);
