const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),context);
const data=JSON.parse(JSON.stringify(context.window.ARENA));
const paper=require('./fixtures/paper-tables.json');
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'assets','aa-arena.pdf'))).digest('hex'),data.paper.sha256,'published PDF must match the data snapshot');
assert.deepEqual(data.models,paper.models);
assert.deepEqual(data.mainOrder,paper.rowOrder);
assert.equal(data.games.length,12);
assert.equal(data.games.reduce((sum,g)=>sum+g.pool,0),1920);
assert.equal(data.paper.authors.length,27);
assert.equal(data.paper.authors.at(-1),'Hongning Wang');
for(const g of data.games){
 assert.deepEqual([g.pool,g.ast,g.ra],paper.pools[g.name],g.name+' Table 1');
 assert.deepEqual(g.results,paper.results[g.name],g.name+' Table 2');
 assert.deepEqual(data.tokens[g.name],paper.tokens[g.name],g.name+' Table 9');
}
const gold=data.models.map((_,i)=>data.games.filter(g=>g.results[i][1]===1).length);
assert.deepEqual(gold,paper.goldMedals);
assert.equal(data.games.filter(g=>g.results.some(r=>r[1]===1)).length,6);
assert.deepEqual(data.tokenTotals,paper.tokenTotals);
for(let i=0;i<data.models.length;i++){
 const sum=data.games.reduce((acc,g)=>acc+data.tokens[g.name][i],0);
 assert.ok(Math.abs(sum-data.tokenTotals[i])<0.06,'token totals allow source rounding');
}
assert.deepEqual(data.replayLearning,[['Pacman',[2281.6,1],[2404.4,1],30,14],['AntWar',[1464.2,5],[930.7,19],69,16],['Miracle',[1436.8,26],[1528.2,15],128,16]]);
assert.deepEqual(data.harnesses,['Claude Code','Codex','Codex','Codex','Codex','Codex','Codex']);
console.log('PASS: all 84 results, 84 token entries, pools, gold medals, replay learning and model/harness metadata match the new manuscript.');
