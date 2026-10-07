const {chromium, browserOptions, defaultTarget}=require('./browser-env.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const target=process.env.ARENA_TEST_URL||defaultTarget;
(async()=>{
 const browser=await chromium.launch(browserOptions);
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});const errors=[];
  p.on('pageerror',e=>errors.push(e.message));await p.goto(target);
  const pixels=()=>p.locator('#hero-motion canvas').evaluate(c=>c.toDataURL());
  const first=await pixels();await p.waitForTimeout(600);assert.notEqual(await pixels(),first,'animation advances');
  await p.getByRole('button',{name:'Pause animation',exact:true}).click();
  const paused=await pixels();await p.waitForTimeout(400);assert.equal(await pixels(),paused,'pause freezes the canvas');
  await p.screenshot({path:'/tmp/aa-v3-paused.png'});
  await p.getByRole('button',{name:'Dorado',exact:true}).click();
  assert.match(await p.locator('canvas').getAttribute('aria-label'),/measured champion/);
  assert.ok((await p.getByRole('link',{name:'MP4 ↓',exact:true}).getAttribute('href')).endsWith('dorado.mp4'));
  await p.getByRole('button',{name:'Play animation',exact:true}).click();await p.waitForTimeout(900);
  await p.screenshot({path:'/tmp/aa-v3-dorado.png'});
  for(const kind of ['Iteration','Dorado']){
   await p.getByRole('button',{name:kind,exact:true}).click();
   for(const format of ['MP4','GIF']){
    const [download]=await Promise.all([p.waitForEvent('download'),p.getByRole('link',{name:format+' ↓',exact:true}).click()]);
    assert.equal(await download.failure(),null);const file=await fs.stat(await download.path());assert.ok(file.size>1000);
   }
  }
  for(const width of [390,320]){
   await p.setViewportSize({width,height:844});await p.screenshot({path:`/tmp/aa-v3-mobile-${width}.png`});
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await p.getByRole('button',{name:'Iteration',exact:true}).click();
   assert.ok(await p.getByRole('link',{name:'GIF ↓',exact:true}).isVisible());
  }
  const quiet=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await quiet.goto(target);await quiet.getByRole('button',{name:'Play animation',exact:true}).waitFor();
  const still=await quiet.locator('canvas').evaluate(c=>c.toDataURL());await quiet.waitForTimeout(500);assert.equal(await quiet.locator('canvas').evaluate(c=>c.toDataURL()),still);
  await quiet.getByRole('button',{name:'Dorado',exact:true}).click();await quiet.screenshot({path:'/tmp/aa-v3-reduced-motion.png'});
  await quiet.getByRole('button',{name:'Play animation',exact:true}).click();await quiet.getByRole('button',{name:'Pause animation',exact:true}).waitFor();
  await p.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Games',exact:true}).click();await p.getByRole('heading',{name:'Games',exact:true}).waitFor();assert.equal(await p.locator('canvas').count(),0);
  await p.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Home',exact:true}).click();await p.locator('canvas').waitFor();
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({result:'PASS',target,checks:['animation advances','pause/play','switch scenes','four media downloads','mobile controls','reduced motion','navigation cleanup'],errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
