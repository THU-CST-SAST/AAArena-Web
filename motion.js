/* Deterministic canvas animations. Shared by the site and social-media exports. */
(() => {
  'use strict';
  const BLUE = '#245cff', WHITE = '#ffffff', INK = '#101010', GREY = '#888888';
  const DURATION = 12;
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => { n=clamp(n); return n*n*(3-2*n); };
  function draw(canvas, kind, seconds) {
    const c=canvas.getContext('2d');
    c.save(); c.scale(canvas.width/1200,canvas.height/675);
    c.fillStyle=INK; c.fillRect(0,0,1200,675);
    const t=((seconds%DURATION)+DURATION)%DURATION;
    const text=(s,x,y,size=24,color=WHITE,weight=400,align='left')=>{
      c.fillStyle=color;c.font=`${weight} ${size}px Arial, sans-serif`;c.textAlign=align;c.fillText(window.ArenaI18n?window.ArenaI18n.t(s):s,x,y);
    };
    const line=(x1,y1,x2,y2,color='#363636',width=2)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();};
    const box=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    text('AAArena',52,65,28,WHITE,600);
    text(kind==='dorado'?'Dorado / GLM-5.3':'Policy iteration',1148,65,23,GREY,400,'right');
    line(52,94,1148,94);
    if(kind==='loop') {
      const phase=Math.floor(t/4), local=(t%4)/4;
      const active=['Policy','Matches','Replays'];
      const xs=[62,463,864];
      for(let k=0;k<3;k++) {
        const x=xs[k], selected=k===phase;
        text(active[k],x,163,30,selected?WHITE:GREY,500);
        if(selected)box(x,181,40+220*local,3,BLUE);
      }
      // Source-code blocks: intentionally schematic, not an executable snippet.
      c.strokeStyle=phase===0?BLUE:'#393939';c.lineWidth=2;c.strokeRect(62,215,274,257);
      text('{',86,262,33,WHITE,400);text('}',86,446,33,WHITE,400);
      const widths=[118,171,140,89,157,112];
      widths.forEach((w,i)=>{
        const visible=phase===0?ease(local*2-i*.14):1;
        const y=281+i*23;
        box(112,y,w,6,'#303030');box(112,y,w*visible,6,i===phase+1?BLUE:'#dadada');
      });
      // Abstract arena diagram. No invented scores, moves or game replay claims.
      const cell=29,gap=6,gx=463,gy=215;
      for(let row=0;row<8;row++)for(let col=0;col<8;col++){
        const obstacle=(row===2&&col>0&&col<5)||(col===5&&row>2&&row<7)||(row===6&&col<3);
        box(gx+col*(cell+gap),gy+row*(cell+gap),cell,cell,obstacle?'#dadada':'#252525');
      }
      const path=[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7],[6,7],[5,7],[4,7],[3,7]];
      const progress=phase===1?local*(path.length-1):phase===0?0:path.length-1;
      const pi=Math.min(path.length-2,Math.floor(progress)),pf=ease(progress-pi);
      const px=path[pi][0]+(path[pi+1][0]-path[pi][0])*pf,py=path[pi][1]+(path[pi+1][1]-path[pi][1])*pf;
      for(let i=0;i<=Math.floor(progress);i++){const [x,y]=path[i];box(gx+x*35+11,gy+y*35+11,7,7,'#627cce');}
      box(gx+px*35,gy+py*35,cell,cell,BLUE);
      // Replay frames: pulses progressively fill three strips.
      for(let r=0;r<3;r++){
        c.strokeStyle='#3b3b3b';c.strokeRect(864,215+r*87,274,67);
        for(let col=0;col<9;col++){
          const lit=phase===2&&local*30>r*9+col;
          box(880+col*27,231+r*87,17,35,lit?(col===r+3?BLUE:'#dedede'):'#303030');
        }
      }
      const arrow=(x,y)=>{line(x,y,x+66,y,'#626262');line(x+57,y-7,x+66,y,'#626262');line(x+57,y+7,x+66,y,'#626262');};
      arrow(365,343);arrow(772,343);
      if(phase<2){const x=(phase===0?365:772)+66*ease(local);box(x-5,338,10,10,BLUE);}
      line(1001,504,1001,550);line(1001,550,199,550);line(199,550,199,495);
      if(phase===2){const x=1001-802*ease(local);box(x-6,544,12,12,BLUE);}
      text('Workflow illustration',52,626,19,GREY);
      text('Write  →  Evaluate  →  Revise',1148,626,23,WHITE,400,'right');
    } else {
      const data=window.ARENA.milestones;
      // Display only measured milestones; no interpolated Elo or invented ranks.
      const progress=clamp((t-.6)/8.8)*(data.length-1);
      const index=Math.min(data.length-1,Math.floor(progress));
      const m=data[index], points=data.map(d=>({x:470+(d[0]-1)/15*642,y:472-(d[1]-1700)/550*276}));
      text('Pool rank',54,199,25,GREY);
      text('#'+m[2],48,331,137,WHITE,600);
      text(m[1].toFixed(1),54,406,44,BLUE,500);text('Elo',231,405,25,GREY);
      text('Evaluation '+m[0],54,465,22,WHITE);
      [1800,2000,2200].forEach(v=>{const y=472-(v-1700)/550*276;line(470,y,1112,y);text(String(v),449,y+6,17,GREY,400,'right');});
      points.forEach((p,i)=>{box(p.x-3,p.y-3,6,6,'#515151');text(String(data[i][0]),p.x,515,16,GREY,400,'center');});
      c.beginPath();c.moveTo(points[0].x,points[0].y);
      for(let i=1;i<=index;i++)c.lineTo(points[i].x,points[i].y);
      if(index<points.length-1){const k=ease(progress-index),a=points[index],b=points[index+1];c.lineTo(a.x+(b.x-a.x)*k,a.y+(b.y-a.y)*k);}
      c.strokeStyle=BLUE;c.lineWidth=4;c.stroke();
      points.slice(0,index+1).forEach((p,i)=>box(p.x-(i===index?6:4),p.y-(i===index?6:4),i===index?12:8,i===index?12:8,i===index?WHITE:BLUE));
      text('Full-pool evaluation',1112,556,19,GREY,400,'right');
      line(52,584,1148,584);
      text('Selected champion milestones · Paper Table 3',52,626,19,GREY);
      text('#41 → #2',1148,626,28,WHITE,500,'right');
    }
    c.restore();
  }
  let dispose=null;
  function mount(root) {
    if(dispose)dispose();
    const canvas=root.querySelector('canvas');if(!canvas)return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    let kind='loop',playing=!reduced.matches,id=0,start=performance.now(),elapsed=0,visible=true;
    const toggle=root.querySelector('[data-motion-toggle]');
    const paint=()=>draw(canvas,kind,elapsed);
    const sync=()=>{toggle.textContent=playing?'Pause':'Play';toggle.setAttribute('aria-label',playing?'Pause animation':'Play animation');root.querySelectorAll('[data-motion-kind]').forEach(b=>{b.classList.toggle('active',b.dataset.motionKind===kind);b.setAttribute('aria-pressed',String(b.dataset.motionKind===kind));});root.querySelectorAll('[data-motion-download]').forEach(a=>{a.href=`assets/aa-arena-${kind}.${a.dataset.motionDownload}`;});canvas.setAttribute('aria-label',kind==='loop'?'Schematic policy, match and replay iteration. Not actual gameplay.':'Dorado GLM-5.3, measured champion progress from pool rank 41 to 2.');window.ArenaI18n?.apply(root);};
    const frame=now=>{if(playing&&visible&&!document.hidden){elapsed=(now-start)/1000;paint();}id=requestAnimationFrame(frame);};
    toggle.onclick=()=>{playing=!playing;start=performance.now()-elapsed*1000;sync();};
    root.querySelectorAll('[data-motion-kind]').forEach(b=>b.onclick=()=>{kind=b.dataset.motionKind;elapsed=reduced.matches&&kind==='dorado'?10:0;start=performance.now()-elapsed*1000;paint();sync();});
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;start=performance.now()-elapsed*1000;});observer.observe(canvas);
    const visibility=()=>{start=performance.now()-elapsed*1000;};document.addEventListener('visibilitychange',visibility);
    const preference=()=>{if(reduced.matches)playing=false;sync();};reduced.addEventListener('change',preference);
    sync();paint();id=requestAnimationFrame(frame);
    dispose=()=>{cancelAnimationFrame(id);observer.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',preference);dispose=null;};
  }
  window.ArenaMotion={draw,mount,stop:()=>dispose?.(),duration:DURATION};
})();
