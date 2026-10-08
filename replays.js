/* Real referee states only. This renderer never generates moves or outcomes. */
(() => {
 'use strict';
 const BLUE='#3975ff', HUMAN='#f2b85b', INK='#101318';
 const text=(en,zh)=>window.ArenaI18n.language==='zh'?zh:en;
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const entries=()=>['snakego','pacman','antwar','dorado'].map(k=>window.ARENA_REPLAYS?.[k]).filter(Boolean);
 let dispose=()=>{};
 const backgrounds=new WeakMap();
 const painted=new WeakMap();
 function markup(){
  return `<section class="replay-showcase" aria-label="${text('Human versus AI match replays','人类与 AI 实战回放')}"><div class="replay-intro"><h2>${text('Human champions. AI challengers.','人类榜首，AI 来战。')}</h2></div><div class="replay-showcase-bar"><div class="replay-legend"><span><i style="background:${BLUE}"></i>AI</span><span><i style="background:${HUMAN}"></i>${text('Human','人类')}</span></div><button class="replay-overview-toggle" type="button"></button></div><div class="replay-grid">${entries().map(r=>`<button class="replay-card" type="button" data-replay="${r.game}" aria-label="${text('Watch','观看')} ${r.title} ${text('replay','回放')}"><div class="replay-card-head"><h3>${r.title}</h3><span>${r.model}</span></div><canvas width="720" height="480" aria-label="${r.title} ${text('recorded match','真实对局')}"></canvas><div class="replay-card-foot"><span class="replay-card-score"></span><span class="replay-open" aria-hidden="true">↗</span></div></button>`).join('')}</div></section><dialog class="replay-dialog" aria-labelledby="replay-dialog-title"><div class="replay-dialog-top"><div><span class="replay-kicker">${text('MATCH REPLAY','对局回放')}</span><h2 id="replay-dialog-title"></h2></div><button type="button" class="replay-close" aria-label="${text('Close replay','关闭回放')}">✕</button></div><div class="replay-dialog-body"><div class="replay-stage"><canvas width="1000" height="760" role="img"></canvas><div class="replay-transport"><button type="button" class="replay-play"></button><span class="replay-round" aria-live="off"></span><label>${text('Speed','速度')} <select class="replay-speed" aria-label="${text('Playback speed','播放速度')}"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label></div><input class="replay-seek" type="range" min="0" value="0" aria-label="${text('Replay progress','回放进度')}"></div><aside class="replay-match-info"></aside></div></dialog>`;
 }
 function drawAntwar(canvas,r,f){
  const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const unit=Math.min((w-24)/20,(h-24)/17.5),ox=(w-19.5*unit)/2,oy=(h-17*unit)/2;
  const team=p=>p===r.aiSeat?BLUE:HUMAN;
  const pos=(x,y)=>[ox+(x+.5+(y%2===0?.5:0))*unit,oy+(y*.866+.6)*unit];
  const hex=(x,y,radius)=>{c.beginPath();for(let i=0;i<6;i++){const a=(i*60+30)*Math.PI/180;const xx=x+Math.cos(a)*radius,yy=y+Math.sin(a)*radius;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.closePath();};
  c.fillStyle=INK;c.fillRect(0,0,w,h);
  for(let y=0;y<19;y++)for(let x=0;x<19;x++){
   const tile=r.board[y][x];if(tile===' ')continue;const [px,py]=pos(x,y);
   hex(px,py,unit*.55);c.fillStyle=tile==='.'?'#1b2330':tile==='#'?'#384255':tile==='0'?'#243a55':'#493e2c';c.fill();
   if(tile==='0'||tile==='1'){c.globalAlpha=.22;c.fillStyle=team(Number(tile));c.fill();c.globalAlpha=1;}
   c.strokeStyle='#101722';c.lineWidth=.7;c.stroke();
  }
  for(const a of f.attacks){const [x,y]=pos(a.start.x,a.start.y),[xx,yy]=pos(a.end.x,a.end.y);c.strokeStyle=team(a.owner);c.globalAlpha=.7;c.lineWidth=Math.max(1,unit*.08);c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();c.globalAlpha=1;}
  for(const u of f.units){const [x,y]=pos(u.x,u.y),color=team(u.owner),rad=unit*(u.kind==='base'?.6:u.kind==='tower'?.32:.2);c.fillStyle=color;
   if(u.kind==='base'){hex(x,y,rad);c.fill();c.strokeStyle='#fff';c.lineWidth=1.5;c.stroke();c.fillStyle=INK;c.fillRect(x-rad,y-rad-6,2*rad,3);c.fillStyle=color;c.fillRect(x-rad,y-rad-6,2*rad*u.hp/50,3);}
   else if(u.kind==='tower'){c.fillRect(x-rad,y-rad,2*rad,2*rad);c.fillStyle='#e6edf5';c.fillRect(x-rad*.25,y-rad*1.5,rad*.5,rad*1.5);}
   else {c.beginPath();c.ellipse(x,y,rad*.75,rad*1.25,0,0,Math.PI*2);c.fill();c.strokeStyle=color;c.lineWidth=1;for(const dy of [-.6,.6]){c.beginPath();c.moveTo(x-rad*1.4,y+dy*rad);c.lineTo(x+rad*1.4,y-dy*rad);c.stroke();}if(u.status===4){c.strokeStyle='#d9f5ff';c.strokeRect(x-rad*1.4,y-rad*1.4,rad*2.8,rad*2.8);}}
  }
  return f;
 }
 function draw(canvas,r,index){
  const f=r.frames[Math.min(r.frames.length-1,Math.floor(index))],c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const displayWidth=r.game==='dorado'?Math.max(160,canvas.getBoundingClientRect().width):w;
  const previous=painted.get(canvas);if(previous?.r===r&&previous?.f===f&&previous?.w===w&&previous?.h===h&&previous?.displayWidth===displayWidth)return f;
  painted.set(canvas,{r,f,w,h,displayWidth});
  if(r.game==='antwar')return drawAntwar(canvas,r,f);
  c.fillStyle=INK;c.fillRect(0,0,w,h);
  const margin=canvas.closest('.replay-card')?12:26,unit=Math.min((w-margin*2)/r.width,(h-margin*2)/r.height),ox=(w-r.width*unit)/2,oy=(h-r.height*unit)/2;
  const team=p=>p===r.aiSeat?BLUE:HUMAN;
  const pos=(x,y)=>[ox+(x+.5)*unit,oy+(y+.5)*unit];
  c.fillStyle='#191e27';c.fillRect(ox,oy,r.width*unit,r.height*unit);
  const board=f.board||r.board;
  let bg=backgrounds.get(canvas);
  if(!bg||bg.board!==board||bg.aiSeat!==r.aiSeat||bg.layer.width!==w||bg.layer.height!==h){
   const layer=document.createElement('canvas');layer.width=w;layer.height=h;const c=layer.getContext('2d');
   if(board)for(let y=0;y<r.height;y++)for(let x=0;x<r.width;x++){
   const v=board[y]?.[x]||' ',px=ox+x*unit,py=oy+y*unit;
   if(r.game==='snakego'){
    if(v==='0'||v==='1'){c.globalAlpha=.55;c.fillStyle=team(Number(v));c.fillRect(px+.7,py+.7,unit-1.4,unit-1.4);c.globalAlpha=1;}
    else {c.strokeStyle='#252c37';c.lineWidth=.5;c.strokeRect(px,py,unit,unit);}
   } else if(r.game==='pacman'){
    if(v==='#'||v==='X'||v==='x'){c.fillStyle='#3a4659';c.fillRect(px+1,py+1,unit-2,unit-2);}
    else if(v==='.'||v==='$'){c.fillStyle=v==='.'?'#c1c9d7':'#fff';c.beginPath();c.arc(px+unit/2,py+unit/2,unit*(v==='.'?.07:.2),0,Math.PI*2);c.fill();}
   } else if(r.game==='monecraft'){
    if(v==='#'){c.fillStyle='#3a4659';c.fillRect(px+.4,py+.4,unit-.8,unit-.8);}
   } else {const value=v.charCodeAt(0)-65;c.fillStyle=value>=50?'#465269':['#1b252b','#25323a','#34434b','#47565a','#596569','#6a7374'][Math.min(value,5)];c.fillRect(px,py,unit+.2,unit+.2);}
   }
   bg={board,aiSeat:r.aiSeat,layer};backgrounds.set(canvas,bg);
  }
  c.drawImage(bg.layer,0,0);
  if(r.game==='dorado'){
   // Keep recorded positions and the entire map; enlarge symbols in screen pixels.
   // These markers are intentionally not physical unit footprints.
   const scale=w/displayWidth,preview=Boolean(canvas.closest('.replay-card')),labels=[];
   c.fillStyle='rgba(7,12,19,.20)';c.fillRect(ox,oy,r.width*unit,r.height*unit);
   for(const item of f.items||[]){const [x,y]=pos(item.x,item.y),s=2.2*scale;c.save();c.translate(x,y);c.rotate(Math.PI/4);c.fillStyle='#e9deaa';c.strokeStyle=INK;c.lineWidth=scale;c.fillRect(-s,-s,s*2,s*2);c.strokeRect(-s,-s,s*2,s*2);c.restore();}
   for(const u of [...f.units].sort((a,b)=>(a.owner<2)-(b.owner<2))){
    const [x,y]=pos(u.x,u.y),owned=u.owner===0||u.owner===1,color=owned?team(u.owner):'#b7c1cf';
    const radius=(u.kind==='base'?6.5:u.kind==='observer'?2.6:owned?(preview?4.4:5.5):3.2)*scale;
    c.fillStyle=color;c.strokeStyle='#080d15';c.lineWidth=1.4*scale;c.beginPath();
    if(u.kind==='base')c.rect(x-radius,y-radius,2*radius,2*radius);
    else if(u.kind==='observer'){c.arc(x,y,radius,0,Math.PI*2);}
    else {c.moveTo(x,y-radius);c.lineTo(x+radius,y);c.lineTo(x,y+radius);c.lineTo(x-radius,y);c.closePath();}
    c.fill();c.stroke();
    if(u.kind==='base'){c.strokeStyle='#fff';c.lineWidth=scale;c.strokeRect(x-radius*.45,y-radius*.45,radius*.9,radius*.9);}
    if(owned&&u.maxHp>0){const bw=radius*2.5,bh=1.6*scale,yy=y-radius-3.5*scale;c.fillStyle='#080d15';c.fillRect(x-bw/2-scale,yy-scale,bw+2*scale,bh+2*scale);c.fillStyle=color;c.fillRect(x-bw/2,yy,bw*Math.max(0,Math.min(1,u.hp/u.maxHp)),bh);}
    if(!preview&&owned&&u.kind!=='observer')labels.push({u,x,y,radius});
   }
   const occupied=[];
   c.font=`600 ${10*scale}px system-ui`;c.textAlign='center';c.textBaseline='top';
   for(const {u,x,y,radius} of labels){
    const tw=c.measureText(u.name).width,yy=y+radius+3*scale,box={left:x-tw/2-2*scale,right:x+tw/2+2*scale,top:yy-2*scale,bottom:yy+12*scale};
    if(box.left<0||box.right>w||box.bottom>h||occupied.some(b=>box.left<b.right&&box.right>b.left&&box.top<b.bottom&&box.bottom>b.top))continue;
    occupied.push(box);c.lineWidth=3*scale;c.strokeStyle=INK;c.strokeText(u.name,x,yy);c.fillStyle='#fff';c.fillText(u.name,x,yy);
   }
   return f;
  }
  for(const item of f.items||[]){const [x,y]=pos(item.x,item.y);c.fillStyle=item.owner===0||item.owner===1?team(item.owner):item.kind==='trap'?'#ff6b7f':'#e9deaa';c.save();c.translate(x,y);c.rotate(Math.PI/4);const size=Math.max(3,unit*(item.kind==='mine'?.31:.18));c.fillRect(-size,-size,size*2,size*2);c.restore();}
  for(const u of f.units||[]){
   const [x,y]=pos(u.x,u.y),color=u.owner===0||u.owner===1?team(u.owner):'#d6dce5';
   if(u.body){c.strokeStyle=color;c.lineWidth=unit*.7;c.lineJoin='round';c.lineCap='round';c.beginPath();u.body.forEach(([bx,by],i)=>{const [xx,yy]=pos(bx,by);i?c.lineTo(xx,yy):c.moveTo(xx,yy);});c.stroke();}
   c.fillStyle=color;c.beginPath();
   const radius=Math.max(r.game==='dorado'?(u.kind==='base'?8:4):2,unit*(u.kind==='base'?.65:u.kind==='observer'?.15:.36));
   if(u.kind==='base'){c.fillRect(x-radius,y-radius,radius*2,radius*2);}
   else if(r.game==='pacman'&&u.owner>=0){c.moveTo(x,y);c.arc(x,y,radius,.22*Math.PI,1.78*Math.PI);c.closePath();c.fill();}
   else if(u.kind==='ghost'){c.arc(x,y,radius,Math.PI,0);c.lineTo(x+radius,y+radius);c.lineTo(x+radius/2,y+radius*.5);c.lineTo(x,y+radius);c.lineTo(x-radius/2,y+radius*.5);c.lineTo(x-radius,y+radius);c.closePath();c.fill();c.fillStyle=INK;c.fillRect(x-radius*.5,y-radius*.25,radius*.28,radius*.4);c.fillRect(x+radius*.2,y-radius*.25,radius*.28,radius*.4);}
   else {c.arc(x,y,radius,0,Math.PI*2);c.fill();}
   if(u.owner>=0){c.fillStyle='#fff';c.beginPath();c.arc(x+radius*.2,y-radius*.25,Math.max(1.2,radius*.2),0,Math.PI*2);c.fill();}
   if(u.maxHp>0){c.fillStyle='#070a0f';c.fillRect(x-radius,y-radius-5,radius*2,3);c.fillStyle=color;c.fillRect(x-radius,y-radius-5,radius*2*Math.max(0,u.hp/u.maxHp),3);}
  }
  return f;
 }
 function mount(root){
  dispose(); if(!root)return;
  const all=entries(),quiet=matchMedia('(prefers-reduced-motion: reduce)'),dialog=root.querySelector('dialog');
  let id=0,last=performance.now(),playing=!quiet.matches,open=null,position=0,speed=1,modalPlaying=false;
  const cards=all.map((r,i)=>({r,node:root.querySelector(`[data-replay="${r.game}"]`),position:Math.min(r.frames.length-1,Math.floor(r.frames.length*(.12+i*.08)))}));
  const toggle=root.querySelector('.replay-overview-toggle');
  const setToggle=()=>{toggle.textContent=playing?text('Pause previews','暂停预览'):text('Play previews','播放预览');toggle.setAttribute('aria-pressed',String(playing));};
  setToggle();toggle.onclick=()=>{playing=!playing;setToggle();};
  function paintCard(card){const index=Math.floor(card.position);if(card.drawn===index)return;card.drawn=index;const f=draw(card.node.querySelector('canvas'),card.r,index);card.node.querySelector('.replay-card-score').innerHTML=`<span>${text('Round','回合')} ${escape(f.round)}</span><span>AI ${escape(f.scores[card.r.aiSeat])} : ${escape(f.scores[1-card.r.aiSeat])} ${text('Human','人类')}</span>`;}
  function paintModal(){if(!open)return;const f=draw(dialog.querySelector('canvas'),open,position);dialog.querySelector('.replay-round').textContent=`${text('Round','回合')} ${f.round} / ${open.frames.at(-1).round}`;dialog.querySelector('.replay-seek').value=Math.floor(position);dialog.querySelector('.replay-play').textContent=modalPlaying?text('Pause','暂停'):position>=open.frames.length-1?text('Replay','重播'):text('Play','播放');dialog.querySelector('[data-ai-score]').textContent=f.scores[open.aiSeat];dialog.querySelector('[data-human-score]').textContent=f.scores[1-open.aiSeat];dialog.querySelector('.replay-live-label').textContent=position>=open.frames.length-1?text('Final score','最终比分'):text('Score at this moment','当前比分');}
  function show(base,seat=0){
   const r={...base,...base.variants[seat]};
   open=r;position=0;speed=1;modalPlaying=!quiet.matches;
   dialog.querySelector('h2').textContent=r.title;
   dialog.querySelector('canvas').setAttribute('aria-label',`${r.title} ${text('match replay','对局回放')}`);
   dialog.querySelector('.replay-speed').value='1';dialog.querySelector('.replay-seek').max=r.frames.length-1;
   const winner=r.winner===null?text('Draw','平局'):r.winner===r.aiSeat?text('AI wins','AI 获胜'):text('Human wins','人类获胜');
   dialog.querySelector('aside').innerHTML=`<p class="replay-live-label"></p><div class="replay-contestant"><span class="replay-team-name"><i style="background:${BLUE}"></i>${escape(r.model)}</span><strong data-ai-score></strong><small>${text('AI · highest main-table Elo in this game','AI · 该游戏主榜最高 Elo')}</small></div><div class="replay-contestant"><span class="replay-team-name"><i style="background:${HUMAN}"></i>${text('Human pool #1','人类选手池榜首')}</span><strong data-human-score></strong><small>${escape(r.human.id)}</small></div><p class="replay-score-unit">${escape(text(r.scoreLabel.en,r.scoreLabel.zh))}</p><details class="replay-match-details"><summary>${text('Result & match details','赛果与对局信息')}</summary><p>${winner} · ${r.finalScores[r.aiSeat]} : ${r.finalScores[1-r.aiSeat]}</p><p>${text('Seed','种子')} ${r.seed} · AI P${r.aiSeat}</p><p>${text('Fresh exhibition match using the frozen final policy. Not a replay from the paper’s original evaluation.','使用已冻结的最终策略另跑的展示赛，不是论文原始评测对局。')}</p><p>${text('Human champion means #1 in the frozen benchmark pool, not a claim about a historical tournament title.','这里的人类冠军指冻结评测池榜首，不等同于历史比赛冠军。')}</p><a href="${escape(r.rawReplay)}" download>${text('Download original replay','下载原始回放')} ↓</a><a href="${escape(r.provenance)}" download>${text('Match provenance','对局来源记录')} ↓</a></details><a class="inline-link" href="#/games/${r.game}/overview">${text('Game rules','游戏规则')} →</a>`;
   const seats=document.createElement('div');seats.className='replay-seat-picker';seats.setAttribute('role','group');seats.setAttribute('aria-label',text('Match','选择对局'));
   seats.innerHTML=[0,1].map(s=>`<button type="button" aria-pressed="${s===seat}">${text('Match','对局')} ${s+1} · AI P${s}</button>`).join('');
   seats.querySelectorAll('button').forEach((b,s)=>b.onclick=()=>{show(base,s);dialog.querySelectorAll('.replay-seat-picker button')[s].focus();});
   dialog.querySelector('aside').prepend(seats);
   const note=document.createElement('p');note.className='replay-render-note';note.textContent=text('Full-information replay · simplified 2D view','完整视野回放 · 二维简化呈现');dialog.querySelector('.replay-match-details').append(note);
   if(r.game==='dorado')note.textContent+=' · '+text('Enlarged unit markers; positions unchanged','单位标记已放大，位置保持不变');
   if(!dialog.open)dialog.showModal();document.body.classList.add('replay-modal-open');paintModal();
  }
  const sizePreviews=()=>cards.forEach(card=>{const canvas=card.node.querySelector('canvas');canvas.width=600;canvas.height=600;canvas.style.aspectRatio='1';painted.delete(canvas);card.drawn=-1;paintCard(card);});
  cards.forEach(card=>{card.node.onclick=()=>show(card.r);});
  sizePreviews();
  const resize=new ResizeObserver(()=>{
   const card=cards.find(c=>c.r.game==='dorado');
   if(card){card.drawn=-1;paintCard(card);}
   if(open?.game==='dorado')paintModal();
  });
  const doradoCanvas=root.querySelector('[data-replay="dorado"] canvas');
  if(doradoCanvas)resize.observe(doradoCanvas);resize.observe(dialog.querySelector('canvas'));
  const close=()=>dialog.close();dialog.querySelector('.replay-close').onclick=close;
  dialog.addEventListener('close',()=>{open=null;modalPlaying=false;document.body.classList.remove('replay-modal-open');});
  dialog.querySelector('aside').addEventListener('click',e=>{if(e.target.closest('a[href^="#/"]'))close();});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)close();}});
  dialog.querySelector('.replay-play').onclick=()=>{if(position>=open.frames.length-1)position=0;modalPlaying=!modalPlaying;paintModal();};
  dialog.querySelector('.replay-speed').onchange=e=>{speed=Number(e.target.value);};
  dialog.querySelector('.replay-seek').oninput=e=>{position=Number(e.target.value);paintModal();};
  let visible=true;const observer=new IntersectionObserver(v=>{visible=v[0].isIntersecting;});observer.observe(root.querySelector('.replay-showcase'));
  const frame=now=>{const dt=Math.min((now-last)/1000,.1);last=now;if(!document.hidden){if(open&&modalPlaying){position=Math.min(open.frames.length-1,position+dt*open.fps*speed);if(position>=open.frames.length-1)modalPlaying=false;paintModal();}else if(!open&&visible&&playing){cards.forEach(card=>{card.position=(card.position+dt*card.r.fps)%card.r.frames.length;paintCard(card);});}}id=requestAnimationFrame(frame);};
  id=requestAnimationFrame(frame);
  dispose=()=>{cancelAnimationFrame(id);observer.disconnect();resize.disconnect();if(dialog.open)dialog.close();document.body.classList.remove('replay-modal-open');};
 }
 window.ArenaReplay={markup,mount,draw,dispose:()=>dispose()};
})();
