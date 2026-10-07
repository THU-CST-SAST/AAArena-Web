(() => {
'use strict';
const {games,models,milestones,continuation,ablations}=window.ARENA;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n.toLocaleString('en-US'), slug=g=>g.name.toLowerCase();
let boardGame='all', metric='rank', homeSection='abstract', gameFilter='All', gameOrder='ast', query='', ablation='feedback', milestone=8, extended=false;
const ablationReferences={feedback:1,opponents:0,batch:2};
const paper=(page=1)=>`assets/aa-arena.pdf#page=${page}`;
const external=(url,text,cls='inline-link')=>`<a class="${cls}" href="${url}" target="_blank" rel="noopener">${text} ↗</a>`;
const model=i=>`<span class="model-cell"><span class="model-name">${models[i]}</span></span>`;
function segmented(items,current,attr,label){return `<div class="segmented" role="group" aria-label="${label}">${items.map(([key,name])=>`<button ${attr}="${key}" class="${key===current?'active':''}" aria-pressed="${key===current}">${name}</button>`).join('')}</div>`;}
function heading(title){return `<div class="page-heading"><h1>${title}</h1></div>`;}
function stats(){return `<div class="stats" aria-label="Benchmark summary">${[['12','Competition games'],['1,920','Human-written programs'],['5','Evaluated models'],['128 / 16','Small / full-pool budgets']].map(([n,l])=>`<div class="stat"><strong>${n}</strong><span>${l}</span></div>`).join('')}</div>`;}
function table(headers,rows,cls='',caption=''){return `<div class="table-scroll" tabindex="0" role="region" aria-label="${caption||'Results table'}"><table class="${cls}"><caption class="sr-only">${caption}</caption><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;}
function symbol(g){
 const shapes={
  Pacman:'<path d="M33 10a20 20 0 1 0 0 28L18 24Z" fill="currentColor" stroke="none"/><circle cx="40" cy="24" r="2"/><circle cx="47" cy="24" r="2"/>',
  SnakeGo:'<path d="M8 36h18V24H15V12h23v25" stroke-width="7"/><circle cx="38" cy="39" r="4" fill="currentColor"/>',
  Rollman:'<path d="M9 35V21a15 15 0 0 1 30 0v18l-7-5-7 5-8-5-8 5Z"/><circle cx="19" cy="22" r="2"/><circle cx="30" cy="22" r="2"/>',
  MoneCraft:'<path d="m24 7 17 10v20L24 47 7 37V17ZM7 17l17 10 17-10M24 27v20M24 7v20"/>',
  AntWar:'<path d="M12 42V18H8V8h8v7h7V8h8v7h7V8h6v10h-5v24ZM22 42V30h8v12"/>',
  LostSpace:'<circle cx="24" cy="24" r="14"/><ellipse cx="24" cy="24" rx="24" ry="7" transform="rotate(-30 24 24)"/><circle cx="39" cy="8" r="2"/>',
  AquaWar:'<path d="M8 24c11-16 22-15 30 0-8 15-19 16-30 0ZM38 24l8-9v18ZM8 24l-6-8v16Z"/><circle cx="28" cy="22" r="2"/>',
  Generals:'<path d="M8 39 5 14l12 9 7-16 7 16 12-9-3 25ZM9 44h30"/>',
  Dorado:'<path d="m8 28 10-15 10 15-10 15ZM27 16l9-13 9 13-9 13ZM29 39l7-10 7 10-7 10Z"/>',
  Miracle:'<path d="m24 3 19 11v22L24 47 5 36V14ZM24 13l9 6v11l-9 6-9-6V19ZM5 14l10 5M33 19l10-5M24 36v11"/>',
  LOTA:'<path d="m9 40 28-28 6-9-10 5L7 35ZM7 28l13 13M5 40l4 4M30 39 9 15 5 5l11 5 24 25M27 41l14-14"/>',
  AntWar2:'<path d="M4 41h40M7 41V22h12v19M29 41V14h12v27M5 22v-8h5v4h6v-4h5v8M27 14V6h5v4h6V6h5v8M21 32h6"/>'
 };
 return `<span class="game-symbol"><svg viewBox="0 0 50 52" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[g.name]}</svg></span>`;
}
function sourceDetails(){return `<details class="source-details"><summary>Scoring & data source</summary><p>Results are retained champions from Table 2 of the paper, using 128 small-match units and 16 full-pool evaluations. Each model’s program is evaluated independently against a frozen human ladder; rank is its insertion position in that ladder. Elo is fitted with fixed opponent ratings and a single virtual draw at the pool mean. ${external(paper(24),'Scoring protocol')}</p><p>Rank-1 game counts follow the summary row in Table 2. Elo is comparable within a game; no cross-game score or overall model ranking is computed. Unreported models and continuation runs are excluded.</p></details>`;}
function mainMatrix(combined=false){
 if(combined){
  const cells=games.map(g=>`<tr><th scope="row"><a class="game-name" href="#/games/${slug(g)}">${g.name}</a><span class="subtext">${g.pool} human programs</span></th>${g.results.map(([elo,rank])=>`<td><span class="pool-result-rank ${rank===1?'pool-top':''}">#${rank}</span><span class="pool-result-elo ${elo===Math.max(...g.results.map(r=>r[0]))?'pool-best-elo':''}">${elo.toFixed(1)} Elo</span></td>`).join('')}</tr>`).join('');
  return `<div class="table-scroll leaderboard-scroll" tabindex="0" role="region" aria-label="Per-game model results"><table class="leaderboard-matrix"><caption class="sr-only">Paper Table 2: human-pool rank and Elo for each game and model. Summary counts rank-1 games, not an overall model ranking.</caption><thead><tr><th scope="col">Game</th>${models.map(name=>`<th scope="col">${esc(name)}</th>`).join('')}</tr></thead><tbody>${cells}</tbody><tfoot><tr><th scope="row">Rank-1 games</th>${models.map((name,i)=>`<td>${games.filter(g=>g.results[i][1]===1).length}<span> / 12</span></td>`).join('')}</tr></tfoot></table></div>`;
 }
 return table(['Game',...models],games.map(g=>`<tr><td><a class="game-name" href="#/games/${slug(g)}">${g.name}</a><span class="subtext">${g.pool} programs</span></td>${g.results.map(([elo,rank])=>`<td class="${elo===Math.max(...g.results.map(r=>r[0]))?'best':''}"><span class="${rank===1?'first':''}" title="Elo ${elo.toFixed(1)} · pool rank ${rank}">${metric==='rank'?'#'+rank:elo.toFixed(1)}</span></td>`).join('')}</tr>`).join(''),'matrix','Main experimental results, paper Table 2');
}
function gameLeaderboard(g){
 const rows=g.results.map(([elo,rank],i)=>({elo,rank,i})).sort((a,b)=>b.elo-a.elo||a.i-b.i);
 return table(['Model','Human-pool rank','Elo ↓'],rows.map(r=>`<tr><td>${model(r.i)}</td><td class="numeric"><span class="pool-result-rank ${r.rank===1?'pool-top':''}">#${r.rank}</span></td><td class="numeric"><strong>${r.elo.toFixed(1)}</strong></td></tr>`).join(''),'detail-table pool-leaderboard','Reported model champions in '+g.name+', ordered by Elo; ranks are positions in the human pool');
}
function renderLeaderboard(){
 const g=games.find(g=>slug(g)===boardGame);
 $('#main').innerHTML=heading('Leaderboard')+`<div class="toolbar"><label class="select-wrap">Game <select id="board-game" aria-label="Game"><option value="all">All games</option>${games.map(g=>`<option value="${slug(g)}" ${slug(g)===boardGame?'selected':''}>${g.name}</option>`).join('')}</select></label><button class="btn" data-download="${g?slug(g):'all'}">Export CSV ↓</button></div><div class="panel"><div class="panel-head"><div><h2>${g?g.name:'Results across 12 games'}</h2><p>${g?`${g.pool} human programs · Sorted by Elo`:'Human-pool rank · Elo below'}</p></div>${!g?'<span class="pool-matrix-key"><i aria-hidden="true"></i>Highest Elo in game</span>':''}</div>${g?gameLeaderboard(g):mainMatrix(true)}</div><div class="foot-row"><p class="note">${g?'Ranks are measured against the human pool. Each model is evaluated independently.':'Each cell reports the retained champion from paper Table 2 · 128 / 16 budget.'}</p>${g?`<a class="inline-link" href="#/games/${slug(g)}">Game details →</a>`:''}</div>${sourceDetails()}`;
 $('#board-game').addEventListener('change',e=>{boardGame=e.target.value;renderLeaderboard();$('#board-game').focus();});
 bindDownloads();
}
function renderGames(){
 $('#main').innerHTML=heading('Games','12 competition games. Rules, results and evaluation records.')+`<div class="toolbar"><label class="search"><span class="sr-only">Search games</span><svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="8" cy="8" r="5"/><path d="m12 12 5 5"/></svg><input id="game-search" type="search" placeholder="Search games" value="${esc(query)}"></label><label class="select-wrap">Sort by <select id="game-sort" aria-label="Sort by">${[['ast','Rule complexity ↑'],['pool','Pool size ↓'],['name','Name A–Z']].map(([k,v])=>`<option value="${k}" ${gameOrder===k?'selected':''}>${v}</option>`).join('')}</select></label></div><div class="toolbar"><div class="filter-chips" role="group" aria-label="Game category">${['All','Tactics','Economy','Territory','Defence','Maze','Survival'].map(c=>`<button class="chip ${c===gameFilter?'active':''}" data-filter="${c}" aria-pressed="${c===gameFilter}">${c==='All'?'All games':c}</button>`).join('')}</div><span id="game-count" class="panel-meta" role="status"></span></div><div id="game-grid" class="game-grid"></div><p class="note">Pool sizes count programs, not unique players. AST measures rule-description size, not optimal-play difficulty.</p>`;
 renderCards();$('#game-search').addEventListener('input',e=>{query=e.target.value;renderCards();});$('#game-sort').addEventListener('change',e=>{gameOrder=e.target.value;renderCards();});
 $$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{gameFilter=b.dataset.filter;$$('[data-filter]').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',String(el===b));});renderCards();}));
}
function renderCards(){
 const list=games.filter(g=>(gameFilter==='All'||g.category===gameFilter)&&(g.name+' '+g.description).toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>gameOrder==='ast'?a.ast-b.ast:gameOrder==='pool'?b.pool-a.pool:a.name.localeCompare(b.name));
 $('#game-count').textContent=`${list.length} / 12 games`;
 $('#game-grid').innerHTML=list.map(g=>`<a class="game-card" href="#/games/${slug(g)}" aria-label="${g.name} details"><div class="game-card-top">${symbol(g)}<span class="category">${g.category}</span></div><div class="game-card-body"><h2>${g.name}</h2><p>${g.description}</p></div><div class="game-card-bottom"><span><strong>${g.pool}</strong> programs</span><span><strong>${fmt(g.ast)}</strong> AST</span><span class="card-arrow" aria-hidden="true">↗</span></div></a>`).join('')||'<div class="empty"><h2>No matching games</h2><p>Try another name or clear the filters.</p><button class="btn" id="clear-search">Clear filters</button></div>';
 $('#clear-search')?.addEventListener('click',()=>{query='';gameFilter='All';renderGames();$('#game-search').focus();});
}
function gameSidebar(g){return `<aside class="side-panel"><h2>Game data</h2><dl class="facts">${[['Human programs',fmt(g.pool)],['Rule AST nodes',fmt(g.ast)],['Rule atoms',fmt(g.ra)],['Evaluated models','5'],['Small-match budget','128'],['Full-pool budget','16']].map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>${external(paper(window.GAME_DETAILS[g.name].page),'Game description','btn')}<button class="btn" data-download="${slug(g)}">Export results ↓</button></aside>`;}
function records(g){
 let html=`<div class="record-block"><div class="panel"><div class="panel-head"><div><h2>Main-stage records</h2><p>Best retained submission from each model · Table 2</p></div></div>${table(['Model','Elo','Pool rank','Stage'],g.results.map(([elo,rank],i)=>`<tr><td>${models[i]}</td><td>${elo.toFixed(1)}</td><td>#${rank}</td><td>Main · 128 / 16</td></tr>`).join(''),'','Main-stage records')}<div class="record-info">The snapshot contains champion results, not individual match logs or playable replays.</div></div></div>`;
 const c=continuation.find(r=>r[0]===g.name);
 if(c)html+=`<div class="record-block"><div class="panel"><div class="panel-head"><div><h2>Continuation · GLM-5.3</h2><p>Same run, additional budget · Table 4</p></div></div>${table(['Stage','Small / full budget','Elo','Pool rank'],`<tr><td>Main</td><td>128 / 16</td><td>${c[1].toFixed(1)}</td><td>#${c[2]}</td></tr><tr><td>Extended</td><td>384 / 48</td><td>${c[3].toFixed(1)}</td><td>#${c[4]}</td></tr>`,'','Continuation results')}</div></div>`;
 if(g.name==='Dorado')html+=`<div class="record-block"><div class="panel"><div class="panel-head"><div><h2>Champion history · GLM-5.3</h2><p>Selected improvements, not every submission · Table 3</p></div></div>${table(['Evaluation','Elo','Pool rank','Policy change'],milestones.map(m=>`<tr><td>#${m[0]}</td><td>${m[1].toFixed(1)}</td><td>#${m[2]}</td><td>${m[4]}</td></tr>`).join(''),'record-table','Dorado champion milestones')}</div></div>`;
 for(const key of ['feedback','opponents','batch']){const a=ablations[key],row=a.rows.find(r=>r[0]===g.name);if(row)html+=`<div class="record-block"><div class="panel"><div class="panel-head"><div><h2>${{feedback:'Replay feedback',opponents:'Opponent selection',batch:'Batch size'}[key]}</h2><p>Separate GLM-5.3 ablation runs · ${key==='feedback'?'Table 7':key==='opponents'?'Table 6':'Table 8'}</p></div></div>${table(['Condition','Elo'],row[1].map((v,i)=>`<tr><td>${a.labels[i]}</td><td>${v.toFixed(1)}</td></tr>`).join(''),'','Ablation records')}</div></div>`;}
 return html;
}
function renderDetail(g,tab){
 const d=window.GAME_DETAILS[g.name];
 const body=tab==='overview'?`<article class="article"><h2>How it plays</h2><p>${d.intro}</p><h3>Key decisions</h3><ul>${d.decisions.map(s=>`<li>${s}</li>`).join('')}</ul><h3>Strategic focus</h3><p>${d.focus}</p><h3>Evaluation</h3><p>Each generated program is evaluated against this game’s frozen pool of ${g.pool} human-written programs. The reported result is the strongest retained, officially evaluated submission under the 128 / 16 feedback budget.</p>${external(paper(d.page),'Read the full game description')}</article>`:tab==='records'?records(g):`<div class="panel"><div class="panel-head"><div><h2>Model leaderboard</h2></div></div>${gameLeaderboard(g)}</div><p class="note">Ranks are insertion positions among ${g.pool} human programs. Each model is evaluated independently.</p>${sourceDetails()}`;
 $('#main').innerHTML=`<div class="breadcrumb"><a href="#/games">Games</a><span>/</span><span>${g.name}</span></div><div class="game-heading">${symbol(g)}<div><h1>${g.name}</h1><p>${g.description}</p></div><span class="category">${g.category}</span></div><nav class="detail-tabs" aria-label="Game details">${[['leaderboard','Leaderboard'],['overview','Overview'],['records','Records']].map(([k,l])=>`<a href="#/games/${slug(g)}/${k}" ${k===tab?'aria-current="page"':''}>${l}</a>`).join('')}</nav><div class="detail-layout"><div>${body}</div>${gameSidebar(g)}</div>`;bindDownloads();
}
function abstract(){
 const icons={
  model:'<path d="M24 17h48v46H24zM16 28h8m-8 12h8m-8 12h8m48-24h8m-8 12h8m-8 12h8M36 9v8m12-8v8m12-8v8M36 63v8m12-8v8m12-8v8"/><path d="m36 40 8 8 16-17" class="diagram-blue"/>',
  code:'<rect x="15" y="10" width="66" height="60" rx="2"/><path d="M15 24h66M23 17h3m5 0h3"/><path d="m35 36-9 9 9 9m26-18 9 9-9 9m-17 5 8-28" class="diagram-blue"/>',
  pool:'<rect x="7" y="13" width="22" height="22"/><rect x="37" y="13" width="22" height="22"/><rect x="67" y="13" width="22" height="22"/><rect x="7" y="45" width="22" height="22"/><rect x="37" y="45" width="22" height="22"/><rect x="67" y="45" width="22" height="22"/><path d="m12 24 4 4 8-9m18 37 4 4 8-9" class="diagram-blue"/>'
 };
 const icon=k=>`<svg viewBox="0 0 96 80" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${icons[k]}</svg>`;
 return `<article class="abstract visual-abstract">
  <header class="overview-heading"><h2>Abstract</h2><span>Adversarial Heuristic Learning</span></header>
  <h3 class="overview-thesis">Fixed model.<br><span>Evolving code.</span></h3>
  <figure class="learning-diagram" aria-label="A coding agent revises an executable policy, which plays frozen human opponents. Match replays and full-pool rankings feed back into the next revision.">
   <div class="learning-flow">
    <div class="learning-node">${icon('model')}<h4>Coding agent</h4><span>Model weights stay fixed</span></div>
    <div class="flow-connector" aria-hidden="true"><span>edits</span><svg viewBox="0 0 72 16"><path d="M0 8h69m-7-6 7 6-7 6"/></svg></div>
    <div class="learning-node policy-node">${icon('code')}<h4>Game agent</h4><span>Executable code changes</span></div>
    <div class="flow-connector" aria-hidden="true"><span>plays</span><svg viewBox="0 0 72 16"><path d="M0 8h69m-7-6 7 6-7 6"/></svg></div>
    <div class="learning-node">${icon('pool')}<h4>Human opponents</h4><span>Frozen program pool</span></div>
   </div>
   <div class="feedback-return"><span>Feedback → next revision</span></div>
   <div class="feedback-paths">
    <div class="feedback-path"><strong>128<span>match units</span></strong><div><h4>Test chosen opponents</h4><span>Detailed replays</span></div><svg viewBox="0 0 70 32" aria-hidden="true"><path d="M1 16h66"/><path class="diagram-blue" d="m10 22 10-15 10 20 10-14 10 7 10-16"/></svg></div>
    <div class="feedback-path"><strong>16<span>full-pool calls</span></strong><div><h4>Evaluate the whole pool</h4><span>Elo & pool rank</span></div><svg viewBox="0 0 70 32" aria-hidden="true"><path d="M8 28h54"/><path class="diagram-blue" d="M16 27V17h10v10m4 0V4h10v23m4 0V12h10v15"/></svg></div>
   </div>
   <figcaption>Keep the strongest evaluated program.</figcaption>
  </figure>
  <section class="overview-results" aria-labelledby="overview-results-title">
   <div class="overview-results-heading"><h3 id="overview-results-title">How far do the agents get?</h3><a href="#/leaderboard">Leaderboard ↗</a></div>
   <p class="overview-result-key">Best human-pool rank across the five models · Table 2</p>
   <div class="rank-map">${games.map(g=>{const rank=Math.min(...g.results.map(r=>r[1]));return `<a class="rank-tile ${rank===1?'rank-winner':''}" href="#/games/${slug(g)}" aria-label="${g.name}: best pool rank ${rank}. View results">${symbol(g)}<strong><span>#</span>${rank}</strong><span class="rank-game">${g.name}</span></a>`;}).join('')}</div>
   <p class="overview-takeaway">Rank 1 in ${games.filter(g=>g.results.some(r=>r[1]===1)).length} games. No model tops every ladder.</p>
  </section>
  <details class="full-abstract"><summary>Read the full abstract</summary><p>AI for adversarial games has progressed from heuristic search, exemplified by Deep Blue and Monte Carlo tree search, to reinforcement learning and self-play. Yet adapting efficiently to diverse, changing opponents remains challenging. Building on heuristic learning (HL), we formalize Adversarial Heuristic Learning (AHL), where a coding agent interprets game feedback and revises executable policies while its model weights remain fixed. We introduce AA-Arena (Agents for Agents Arena), comprising 12 real-world competition games and archived human opponents, and evaluate 5 coding models by their best Elo and rank under separate match and full-pool evaluation budgets. Generated policies top some human ladders, but additional interaction does not eliminate improvement bottlenecks in complex games. Ablations highlight the roles of opponent selection, dense replays, and interaction batch size. AHL learns from both on-policy feedback and off-policy replays, demonstrating its potential to improve strategies through both direct interaction and other players’ experience.</p></details>
 </article>`;
}
function ablationComparison(key){
 const a=ablations[key],baseline=ablationReferences[key];
 const max=Math.ceil(Math.max(...a.rows.flatMap(r=>r[1]))/500)*500;
 const delta=n=>`${n>0?'+':n<0?'−':''}${Math.abs(n).toFixed(1)}`;
 return `<div class="ablation-controls"><span class="ablation-reference-label"><span class="reference-mark" aria-hidden="true"></span>Reference: ${esc(a.labels[baseline])}</span><span class="ablation-legend"><i aria-hidden="true"></i>Best condition</span></div>
 <div class="ablation-comparisons">${a.rows.map(([name,values])=>{
  const best=Math.max(...values),base=values[baseline],height=values.length*73+42;
  const x=v=>16+v/max*288;
  const description=values.map((value,i)=>`${a.labels[i]}: Elo ${value.toFixed(1)}, ${i===baseline?'reference':`change ${delta(value-base)} from ${a.labels[baseline]}`}`).join('; ');
  return `<figure class="ablation-comparison"><figcaption><a href="#/games/${name.toLowerCase()}/records">${name} ↗</a><span>Elo</span></figcaption><svg viewBox="0 0 320 ${height}" role="img" aria-labelledby="ablation-${key}-${name}-title"><title id="ablation-${key}-${name}-title">${esc(name+': '+description)}</title>${values.map((value,i)=>{
   const y=23+i*73,diff=value-base;
   return `<g class="ablation-condition ${value===best?'condition-best':''}" data-condition="${esc(a.labels[i])}" data-elo="${value.toFixed(1)}" data-delta="${diff.toFixed(1)}"><text class="condition-label" x="16" y="${y}">${esc(a.labels[i])}</text><text class="condition-elo" x="304" y="${y}" text-anchor="end">${value.toFixed(1)}</text><rect class="condition-track" x="16" y="${y+13}" width="288" height="7"/><rect class="condition-bar ${i===baseline?'condition-reference':''}" style="--reveal-delay:${i===baseline?0:(i<baseline?i+1:i)*.2}s" x="16" y="${y+13}" width="${(value/max*288).toFixed(3)}" height="7"/><circle class="condition-reference-dot" cx="${x(base)}" cy="${y+16.5}" r="4"/><text class="condition-delta ${diff>0?'delta-positive':''}" x="304" y="${y+42}" text-anchor="end">${i===baseline?'Reference':`Δ ${delta(diff)}`}</text></g>`;
  }).join('')}<line class="condition-axis" x1="16" x2="304" y1="${height-26}" y2="${height-26}"/>${[0,max/2,max].map(v=>`<text class="condition-tick" x="${x(v)}" y="${height-8}" text-anchor="${v===0?'start':v===max?'end':'middle'}">${fmt(v)}</text>`).join('')}</svg></figure>`;
 }).join('')}</div>`;
}
function renderHome(){
 $('#main').innerHTML=`<section class="home-hero"><div class="home-title"><h1>AA-Arena<span>.</span></h1><p class="paper-title">Can coding agents build game agents for real-world adversarial games?</p><div class="home-actions">${external(paper(),'Paper','btn primary')}<a class="btn" href="#/leaderboard">Leaderboard →</a></div></div><div class="motion" id="hero-motion"><canvas width="1200" height="675" role="img" aria-label="Policy iteration illustration"></canvas><div class="motion-controls"><div role="group" aria-label="Animation">${[['loop','Iteration'],['dorado','Dorado']].map(([k,l])=>`<button data-motion-kind="${k}" aria-pressed="${k==='loop'}" class="${k==='loop'?'active':''}">${l}</button>`).join('')}</div><button data-motion-toggle aria-label="Pause animation">Pause</button><div class="motion-downloads"><a data-motion-download="mp4" href="assets/aa-arena-loop.mp4" download>MP4 ↓</a><a data-motion-download="gif" href="assets/aa-arena-loop.gif" download>GIF ↓</a></div></div></div></section>${stats()}<div class="home-content"><nav class="home-nav" aria-label="Research sections">${[['abstract','Abstract'],['results','Main results'],['ablations','Ablations'],['trajectory','Case study'],['continuation','More budget']].map(([k,l])=>`<button data-home="${k}" class="${k===homeSection?'active':''}" aria-pressed="${k===homeSection}">${l}</button>`).join('')}</nav><div class="home-pane" id="home-pane"></div></div>`;
 window.ArenaMotion.mount($('#hero-motion'));renderHomePane();$$('[data-home]').forEach(b=>b.addEventListener('click',()=>{homeSection=b.dataset.home;$$('[data-home]').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',String(el===b));});renderHomePane();}));
}
function renderHomePane(){
 const el=$('#home-pane');
 if(homeSection==='abstract')el.innerHTML=abstract();
 if(homeSection==='results'){el.innerHTML=`<div class="toolbar"><div class="section-intro"><h2>Main results</h2><p>Retained champions · 128 / 16 budget · Table 2</p></div>${segmented([['rank','Rank'],['elo','Elo']],metric,'data-metric','Result metric')}</div><div class="panel">${mainMatrix()}</div><p class="note">Rank in each frozen human ladder. Elo is comparable within a game, not across games.</p>`;bindMetrics(renderHomePane);}
 if(homeSection==='ablations'){
 const a=ablations[ablation],copy={feedback:['Replay feedback','Dense replays improve Elo in all three reported games.'],opponents:['Opponent selection','Model-selected and ladder opponents outperform top-four-only selection in these runs.'],batch:['Batch size','The best batch sizes are 4 for Pacman and Miracle, and 2 for AntWar.']}[ablation];
 el.innerHTML=`<div class="section-intro"><h2>Ablation studies</h2><p>GLM-5.3 · 128 / 16 budget</p></div><div class="toolbar">${segmented([['feedback','Replay feedback'],['opponents','Opponents'],['batch','Batch size']],ablation,'data-ablation','Ablation experiment')}</div><div class="ablation-scene ${window.matchMedia('(prefers-reduced-motion: reduce)').matches?'ablation-still':'ablation-running'} ${document.hidden?'ablation-suspended':''}"><div class="ablation-scene-heading"><h3>${copy[0]}</h3><span>${a.source.split(' · ')[0]}</span></div>${ablationComparison(ablation)}<p class="ablation-finding">${copy[1]}</p></div><div class="ablation-motion-controls"><a href="assets/aa-arena-ablation-${ablation}.gif" download>GIF ↓</a><a href="assets/aa-arena-ablation-${ablation}.mp4" download>MP4 ↓</a></div><details class="ablation-raw"><summary>Exact values</summary><div class="panel">${table(['Game',...a.labels],a.rows.map(([name,values])=>`<tr><td><a class="game-name" href="#/games/${name.toLowerCase()}/records">${name}</a></td>${values.map(v=>`<td class="${v===Math.max(...values)?'best':''}">${v.toFixed(1)}</td>`).join('')}</tr>`).join(''),'ablation-table',copy[0])}</div></details><p class="note">Δ = Elo change from the reference within each game. Elo is not comparable across games. Individual runs, not multi-seed averages. ${a.source.split(' · ')[0]}.</p>`;
 $$('[data-ablation]').forEach(b=>b.addEventListener('click',()=>{ablation=b.dataset.ablation;renderHomePane();$(`[data-ablation="${ablation}"]`).focus();}));
 }
 if(homeSection==='trajectory')renderTrajectory();
 if(homeSection==='continuation'){
 el.innerHTML=`<div class="section-intro"><h2>Additional evaluation budget</h2><p>Four GLM-5.3 runs continued on the same ledger · Table 4</p></div><div class="toolbar">${segmented([['base','128 / 16'],['extended','384 / 48']],extended?'extended':'base','data-budget','Evaluation budget')}</div><div class="panel">${table(['Game','Champion Elo','Pool rank','Rank improvement'],continuation.map(([n,e1,r1,e2,r2])=>`<tr><td><a class="game-name" href="#/games/${n.toLowerCase()}/records">${n}</a></td><td>${(extended?e2:e1).toFixed(1)}</td><td>#${extended?r2:r1}</td><td>${extended?r1-r2:'—'}</td></tr>`).join(''),'','Budget continuation results')}</div><p class="note">Miracle and AntWar2 improve with more budget; Generals and LOTA retain the same champion.</p>`;
 $$('[data-budget]').forEach(b=>b.addEventListener('click',()=>{extended=b.dataset.budget==='extended';renderHomePane();$(`[data-budget="${extended?'extended':'base'}"]`).focus();}));
 }
}
function renderTrajectory(){
 const m=milestones[milestone],pts=milestones.map(v=>({x:45+(v[0]-1)*28,y:210-(v[1]-1700)/550*175}));
 $('#home-pane').innerHTML=`<div class="section-intro"><h2>Dorado · GLM-5.3</h2><p>Selected champion improvements · Figure 2 & Table 3</p></div><div class="panel"><div class="chart-wrap"><svg class="trajectory" viewBox="0 0 505 245" role="group" aria-label="Dorado evaluation milestones">${[1800,2000,2200].map(v=>{const y=210-(v-1700)/550*175;return `<line class="gridline" x1="40" x2="480" y1="${y}" y2="${y}"/><text x="0" y="${y+4}">${v}</text>`;}).join('')}<polyline class="line" points="${pts.map(p=>p.x+','+p.y).join(' ')}"/>${pts.map((p,i)=>`<g role="button" tabindex="0" data-milestone="${i}" class="${i===milestone?'selected':''}" aria-pressed="${i===milestone}" aria-label="Evaluation ${milestones[i][0]}"><rect x="${p.x-11}" y="0" width="22" height="243" fill="transparent"/><circle class="dot" cx="${p.x}" cy="${p.y}" r="5"/><text x="${p.x}" y="238" text-anchor="middle">${milestones[i][0]}</text></g>`).join('')}</svg></div><div class="chart-control"><button class="btn" id="prev-milestone" aria-label="Previous milestone" ${milestone===0?'disabled':''}>←</button><span>Full-pool evaluation ${m[0]} · ${milestone+1} / ${milestones.length} milestones</span><button class="btn" id="next-milestone" aria-label="Next milestone" ${milestone===milestones.length-1?'disabled':''}>→</button></div><div class="analysis-copy"><h3 class="milestone-title">${m[3]}</h3><p>${m[4]}</p><div class="analysis-stat"><strong>${m[1].toFixed(1)}</strong><span>Elo</span><strong>#${m[2]}</strong><span>Pool rank</span></div></div></div><p class="note">Only retained improvements are shown; this is not the full submission history. <a href="#/games/dorado/records">View records →</a></p>`;
 function select(i,focus){milestone=i;renderTrajectory();$(focus)?.focus({preventScroll:true});}
 $('#prev-milestone').onclick=()=>select(milestone-1,'#prev-milestone');$('#next-milestone').onclick=()=>select(milestone+1,'#next-milestone');
 $$('[data-milestone]').forEach(b=>{b.onclick=()=>select(Number(b.dataset.milestone),`[data-milestone="${b.dataset.milestone}"]`);b.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();b.click();}};});
}
function renderContact(){
 $('#main').innerHTML=heading('Contact','Research enquiries and the team behind the arena.')+`<div class="contact-grid"><section class="panel contact-card"><h2>Student Association for Science and Technology</h2><p>Department of Computer Science and Technology<br>Tsinghua University</p><div class="person"><h3>清华大学计算机系学生科协</h3><p>The association’s Agent Department organizes the Tsinghua Agent Competition. The games and archived programs underpinning AA-Arena come from this competition community.</p>${external('https://net9.org/home/','Visit SAST','btn')}</div></section><section class="panel contact-card"><h2>Corresponding authors</h2><p>Department of Computer Science and Technology, Tsinghua University</p><div class="person"><h3>Xiaohui Xie · 谢晓晖</h3><a class="inline-link" href="mailto:xiexiaohui@tsinghua.edu.cn">xiexiaohui@tsinghua.edu.cn</a><br>${external('https://www.cs.tsinghua.edu.cn/info/1128/5716.htm','Faculty profile')}</div><div class="person"><h3>Wentao Han · 韩文弢</h3><a class="inline-link" href="mailto:hanwentao@tsinghua.edu.cn">hanwentao@tsinghua.edu.cn</a><br>${external('https://www.cs.tsinghua.edu.cn/info/1159/5101.htm','Faculty profile')}</div></section><section class="panel contact-card"><h2>Project leads</h2><div class="person"><h3>Kaisen Yang</h3><a class="inline-link" href="mailto:yks23@mails.tsinghua.edu.cn">yks23@mails.tsinghua.edu.cn</a></div><div class="person"><h3>Qingle Liu</h3><a class="inline-link" href="mailto:lql24@mails.tsinghua.edu.cn">lql24@mails.tsinghua.edu.cn</a></div></section><section class="panel contact-card"><h2>Authors</h2><div class="author-list"><p>Kaisen Yang, Qingle Liu, Kejin Wang, Yicheng Zhao, Jieming Li, Shenghan Zheng, Ruize Yang, Bojun Yang, Heng Gong, Xiang Gao, Lanyue Zhang, Kaiyu Zhong, Zhuo Liu, Shaoxuan Li, Chengxi Li, Yong Yan, Weixuan Zhang, Situ Wang, Youjie Zheng, Sihan Zhao, Shengyuan Wang, Huan-ang Gao, Jiazheng Xu, Xiaohui Xie, Wentao Han.</p></div>${external(paper(),'Paper & affiliations','btn')}</section></div>`;
}
function bindMetrics(render){$$('[data-metric]').forEach(b=>b.onclick=()=>{metric=b.dataset.metric;render();$(`[data-metric="${metric}"]`)?.focus();});}
function bindDownloads(){
 $$('[data-download]').forEach(b=>b.onclick=()=>{
  const list=b.dataset.download==='all'?games:games.filter(g=>slug(g)===b.dataset.download);
  const rows=[['game','model','elo','pool_rank','pool_programs','ast_nodes','rule_atoms','stage','source']];
  list.forEach(g=>g.results.forEach(([elo,rank],i)=>rows.push([g.name,models[i],elo,rank,g.pool,g.ast,g.ra,'main_128_16','Paper Tables 1 and 2'])));
  const csv=rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`aa-arena-${b.dataset.download}-results.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  $('#toast').textContent=`Exported ${list.length*5} results`;$('#toast').classList.add('visible');setTimeout(()=>$('#toast').classList.remove('visible'),2500);
 });
}
function route(){
 window.ArenaMotion.stop();
 const parts=location.hash.replace(/^#\/?/,'').split('/');let page=parts[0]||'home';
 if(page==='results')page='leaderboard';
 if(!['home','leaderboard','games','contact'].includes(page))page='home';
 $$('[data-page]').forEach(a=>{if(a.dataset.page===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 if(page==='home')renderHome();if(page==='leaderboard')renderLeaderboard();if(page==='contact')renderContact();
 if(page==='games'){
  if(parts[1]){const g=games.find(g=>slug(g)===parts[1]);if(g){renderDetail(g,['overview','records','leaderboard'].includes(parts[2])?parts[2]:'leaderboard');document.title=`${g.name} · AA-Arena`;}else $('#main').innerHTML=`<div class="page-heading"><h1>Game not found</h1></div><a class="btn" href="#/games">Browse all games →</a>`;}
  else renderGames();
 }
 if(!(page==='games'&&parts[1]))document.title=page[0].toUpperCase()+page.slice(1)+' · AA-Arena';
 window.scrollTo(0,0);
}
document.addEventListener('visibilitychange',()=>$('.ablation-scene')?.classList.toggle('ablation-suspended',document.hidden));
window.addEventListener('hashchange',()=>{route();$('#main').focus({preventScroll:true});});route();
})();
