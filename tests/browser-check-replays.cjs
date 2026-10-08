const {chromium,browserOptions,defaultTarget}=require('./browser-env.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const crypto=require('node:crypto');
const target=process.env.ARENA_TEST_URL||defaultTarget;
(async()=>{
 const browser=await chromium.launch(browserOptions);
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(target);
  assert.equal(await p.locator('.replay-card').count(),4);
  assert.equal(await p.locator('.replay-intro p,.replay-disclosure,.replay-card-goal').count(),0,'no explanatory microcopy in replay gallery');
  assert.equal(await p.locator('.replay-card-score,.replay-card-foot').count(),0);
  assert.deepEqual(await p.locator('.replay-card .replay-hud-title').allTextContents(),['Territory points','Points','Base HP','Base HP']);
  assert.equal(await p.locator('.replay-card [role="meter"]').count(),4);
  assert.equal(await p.locator('#hero-motion,[data-motion-kind]').count(),0);
  const pixels=()=>p.locator('.replay-card canvas').first().evaluate(c=>c.toDataURL());
  const start=await pixels();await p.waitForTimeout(450);assert.notEqual(await pixels(),start);
  await p.getByRole('button',{name:'Pause previews',exact:true}).click();
  const paused=await pixels();await p.waitForTimeout(350);assert.equal(await pixels(),paused);
  await p.screenshot({path:'/tmp/aa-replay-desktop.png'});
  assert.equal(await p.locator('[data-replay="monecraft"]').count(),0);
  for(const game of ['snakego','pacman','antwar','dorado']){
   await p.locator(`[data-replay="${game}"]`).click();
   await p.getByRole('dialog').waitFor();
   for(const seat of [0,1]){
    if(seat)await p.getByRole('button',{name:'Match 2 · AI P1',exact:true}).click();
    await p.getByRole('button',{name:'Pause',exact:true}).click();
    await p.getByLabel('Playback speed').selectOption('4');
    const seek=p.getByRole('slider',{name:'Replay progress'});await seek.focus();await p.keyboard.press('End');
    const expected=await p.evaluate(({game,seat})=>{const r=ARENA_REPLAYS[game].variants[seat];return {ai:r.finalScores[seat],human:r.finalScores[1-seat],winner:r.winner===null?'Draw':r.winner===seat?'AI wins':'Human wins',raw:r.rawReplay};},{game,seat});
    assert.equal(await p.locator('[data-ai-score]').textContent(),String(expected.ai));
    assert.equal(await p.locator('[data-human-score]').textContent(),String(expected.human));
    assert.equal(await p.locator('.replay-live-label').textContent(),'Final score');
    assert.equal(await p.locator('.replay-dialog .replay-outcome').innerText(),expected.winner);
    assert.ok(await p.locator('.replay-dialog .replay-outcome').isVisible());
    if(['antwar','dorado'].includes(game)){
     assert.deepEqual(await p.locator('.replay-modal-hud [role="meter"]').evaluateAll(nodes=>nodes.map(n=>Number(n.getAttribute('aria-valuenow')))),[expected.ai,expected.human]);
    }
    await p.getByText('Result & match details',{exact:true}).click();
    assert.ok((await p.locator('.replay-match-details').textContent()).includes(expected.winner));
    await p.screenshot({path:`/tmp/aa-replay-${game}-seat${seat}.png`});
    const [dl]=await Promise.all([p.waitForEvent('download'),p.getByRole('link',{name:'Download original replay ↓'}).click()]);
    assert.equal(await dl.failure(),null);
    const [proofDl]=await Promise.all([p.waitForEvent('download'),p.getByRole('link',{name:'Match provenance ↓'}).click()]);
    const proof=JSON.parse(await fs.readFile(await proofDl.path(),'utf8'));
    assert.equal(proof.human.rank,1,'must be the actual frozen-pool leader');
    const bytes=await fs.readFile(await dl.path());
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),proof.matches[seat].raw_sha256);
    assert.equal(proof.matches[seat].terminal_verified,true);
    await seek.focus();await p.keyboard.press('Home');
    assert.equal(await p.locator('.replay-dialog .replay-outcome').isVisible(),false,'seeking back clears result');
   }
   await p.keyboard.press('Escape');assert.equal(await p.locator('dialog[open]').count(),0);
   assert.equal(await p.evaluate(()=>document.activeElement.dataset.replay),game);
  }
  await p.locator('[data-replay="pacman"]').click();
  await p.getByRole('link',{name:'Game rules →',exact:true}).click();await p.getByRole('heading',{name:'How it plays'}).waitFor();
  assert.equal(await p.locator('.replay-card').count(),0);
  await p.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Home',exact:true}).click();
  await p.getByRole('button',{name:'中文',exact:true}).click();
  await p.getByRole('button',{name:'观看 Pacman 回放'}).click();
  await p.getByRole('button',{name:'对局 2 · AI P1'}).click();
  await p.getByRole('button',{name:'暂停',exact:true}).click();await p.screenshot({path:'/tmp/aa-replay-chinese.png'});
  await p.getByRole('button',{name:'关闭回放'}).click();
  for(const width of [390,320]){
   await p.setViewportSize({width,height:844});await p.screenshot({path:`/tmp/aa-replay-mobile-${width}.png`});
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await p.getByRole('button',{name:'观看 Dorado 回放'}).click();
   await p.getByRole('button',{name:'暂停',exact:true}).click();
   await p.getByRole('slider',{name:'回放进度'}).focus();await p.keyboard.press('End');
   assert.equal(await p.locator('[data-ai-score]').textContent(),'0');
   await p.screenshot({path:`/tmp/aa-replay-dialog-mobile-${width}.png`});
   assert.ok(await p.locator('dialog').evaluate(d=>d.scrollWidth<=d.clientWidth+1));
   await p.getByRole('button',{name:'关闭回放'}).click();
  }
  const quiet=await browser.newPage({reducedMotion:'reduce',viewport:{width:390,height:844}});await quiet.goto(target);
  await quiet.getByRole('button',{name:'Play previews',exact:true}).waitFor();
  const quietPixels=()=>quiet.locator('.replay-card canvas').first().evaluate(c=>c.toDataURL());
  const still=await quietPixels();await quiet.waitForTimeout(350);assert.equal(await quietPixels(),still);
  const doradoPixels=()=>quiet.locator('[data-replay="dorado"] canvas').evaluate(c=>c.toDataURL());
  const doradoMobile=await doradoPixels();
  await quiet.setViewportSize({width:1440,height:1000});
  await quiet.waitForFunction(previous=>document.querySelector('[data-replay="dorado"] canvas').toDataURL()!==previous,doradoMobile);
  assert.equal(await quietPixels(),still,'resizing a paused gallery must not erase its canvases');
  await quiet.setViewportSize({width:390,height:844});
  await quiet.waitForFunction(previous=>document.querySelector('[data-replay="dorado"] canvas').toDataURL()===previous,doradoMobile);
  assert.equal(await quietPixels(),still);
  await quiet.getByRole('button',{name:'Watch SnakeGo replay'}).click();await quiet.getByRole('button',{name:'Play',exact:true}).click();
  await quiet.getByRole('button',{name:'Pause',exact:true}).waitFor();await quiet.close();
  // Accelerated preview clock fixture: retain all real frames and referee winners.
  const fast=await browser.newPage({viewport:{width:1440,height:1000}});await fast.goto(target);
  await fast.evaluate(()=>{for(const r of Object.values(ARENA_REPLAYS))r.fps=100000;});
  await fast.waitForFunction(()=>[...document.querySelectorAll('.replay-card .replay-outcome')].every(n=>!n.hidden));
  const winners=await fast.evaluate(()=>['snakego','pacman','antwar','dorado'].map(g=>{const r=ARENA_REPLAYS[g];return r.winner===null?'Draw':r.winner===r.aiSeat?'AI wins':'Human wins';}));
  assert.deepEqual(await fast.locator('.replay-card .replay-outcome').allTextContents(),winners);
  await fast.waitForTimeout(1100);
  assert.equal(await fast.locator('.replay-card .replay-outcome:visible').count(),4,'terminal result is held, not flashed');
  await fast.getByRole('button',{name:'Pause previews',exact:true}).click();
  await fast.screenshot({path:'/tmp/aa-replay-preview-results.png'});
  await fast.close();
  assert.deepEqual(errors,[]);console.log('PASS: real replay overview, 8 matches, seeking, seat switch, verified downloads, English/Chinese, focus, mobile, reduced motion');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
