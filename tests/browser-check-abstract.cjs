const {chromium, browserOptions, defaultTarget}=require('./browser-env.cjs');
const assert=require('node:assert/strict');
const target=process.env.ARENA_TEST_URL||defaultTarget;
(async()=>{
 const browser=await chromium.launch(browserOptions);
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(target);
  await page.getByRole('heading',{name:'Abstract',exact:true}).waitFor();
  await page.locator('.visual-abstract').scrollIntoViewIfNeeded();
  await page.locator('.visual-abstract').screenshot({path:'/tmp/aa-abstract-desktop.png'});
  assert.equal(await page.locator('.learning-cycle li').count(),4);
  assert.equal(await page.locator('.code-writing').evaluate(e=>getComputedStyle(e).animationName),'none','reduced motion keeps a complete static diagram');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('.learning-diagram').scrollIntoViewIfNeeded();
  for(let phase=0;phase<4;phase++){
   await page.waitForFunction(i=>{
    const a=document.querySelector('.learning-cycle li').getAnimations()[0];
    const time=(a?.currentTime||0)%12000;
    return time>=i*3000+600&&time<i*3000+2200;
   },phase,{timeout:16000});
   assert.equal(await page.locator('.learning-cycle li').nth(phase).evaluate(e=>getComputedStyle(e).color),'rgb(36, 92, 255)');
   await page.locator('.learning-diagram').screenshot({path:`/tmp/aa-flow-phase-${phase}.png`});
  }
  await page.keyboard.press('Control+Home');
  await page.waitForFunction(()=>!document.querySelector('.learning-motion').classList.contains('motion-visible'));
  assert.equal(await page.locator('.code-writing').evaluate(e=>getComputedStyle(e).animationPlayState),'paused','offscreen loop does not run');
  await page.locator('.learning-diagram').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.learning-motion').classList.contains('motion-visible'));
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.rank-tile').count(),12);
  assert.equal(await page.locator('.rank-winner').count(),6);
  assert.deepEqual(await page.locator('.rank-tile>strong').allTextContents(),['#1','#1','#1','#1','#5','#1','#1','#10','#2','#6','#15','#5']);
  assert.equal(await page.locator('.full-abstract').getAttribute('open'),null);
  await page.getByText('Read the full abstract',{exact:true}).click();
  await page.locator('.full-abstract p').waitFor({state:'visible'});
  await page.locator('.full-abstract').screenshot({path:'/tmp/aa-abstract-expanded.png'});
  const fullWidth=async()=>assert.ok(await page.locator('.full-abstract').evaluate(el=>Math.abs(el.clientWidth-el.querySelector('p').getBoundingClientRect().width)<2),'abstract should use the full content width');
  await fullWidth();
  await page.getByRole('button',{name:'中文',exact:true}).click();
  assert.equal(await page.locator('.overview-thesis').innerText(),'让 AI 写策略，\n在实战中反复打磨。');
  await page.locator('.full-abstract p').waitFor({state:'visible'});
  await fullWidth();
  await page.locator('.full-abstract').screenshot({path:'/tmp/aa-abstract-expanded-zh.png'});
  await page.getByRole('button',{name:'EN',exact:true}).click();
  await page.getByText('Read the full abstract',{exact:true}).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.full-abstract').getAttribute('open'),null);
  await page.getByRole('link',{name:'Dorado: best pool rank 2. View results',exact:true}).click();
  await page.getByRole('heading',{name:'Dorado',exact:true}).waitFor();
  assert.equal(await page.locator('.detail-table tbody tr').count(),7);
  await page.goBack();
  await page.getByRole('heading',{name:'Abstract',exact:true}).waitFor();
  for(const width of [1024,768,390,320]){
   await page.setViewportSize({width,height:900});
   await page.locator('.visual-abstract').scrollIntoViewIfNeeded();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`);
   assert.ok(await page.locator('.learning-cycle li').evaluateAll(nodes=>nodes.every(e=>e.scrollWidth<=e.clientWidth+1)),`readable cycle steps at ${width}`);
   assert.equal(await page.locator('.mobile-feedback').isVisible(),width<=700);
   await page.locator('.visual-abstract').screenshot({path:`/tmp/aa-abstract-${width}.png`});
   await page.locator('.full-abstract summary').click();
   await fullWidth();
   await page.locator('.full-abstract').screenshot({path:`/tmp/aa-abstract-expanded-${width}.png`});
   await page.locator('.full-abstract summary').click();
  }
  await page.getByRole('link',{name:'Pacman: best pool rank 1. View results',exact:true}).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('heading',{name:'Pacman',exact:true}).waitFor();
  assert.deepEqual(errors,[]);
  console.log('PASS: four live animation phases, offscreen pause, reduced motion, natural Chinese headline, mobile feedback loop; abstract ranks, expand/collapse, navigation, no overflow or page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
