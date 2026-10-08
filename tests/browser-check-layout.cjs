const {chromium,browserOptions,defaultTarget}=require('./browser-env.cjs');
const assert=require('node:assert/strict');
const target=process.env.ARENA_TEST_URL||defaultTarget;
(async()=>{
 const browser=await chromium.launch(browserOptions);
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(target);
  for(const lang of ['en','zh']){
   await page.locator(`[data-language="${lang}"]`).click();
   for(const width of [1440,1024,768,390,320]){
    await page.setViewportSize({width,height:1000});
    await page.locator('[data-page="home"]').click();await page.locator('[data-home="abstract"]').click();
    const rankChecks=await page.locator('.rank-tile').evaluateAll(tiles=>tiles.map(tile=>{
     const box=tile.getBoundingClientRect(), rank=tile.querySelector('strong').getBoundingClientRect();
     const children=[...tile.children].map(e=>e.getBoundingClientRect());
     return {center:Math.abs(rank.left+rank.width/2-box.left-box.width/2),contained:children.every(c=>c.left>=box.left-1&&c.right<=box.right+1&&c.top>=box.top-1&&c.bottom<=box.bottom+1)};
    }));
    assert.ok(rankChecks.every(r=>r.center<2&&r.contained),`${lang} rank alignment at ${width}: ${JSON.stringify(rankChecks)}`);
    assert.ok(await page.locator('.header-inner').evaluate(e=>e.getBoundingClientRect().height<115),`oversized header at ${width}`);
    const budget=await page.locator('.feedback-path>strong').evaluateAll(nodes=>nodes.map(e=>({width:e.getBoundingClientRect().width,size:getComputedStyle(e).fontSize})));
    assert.equal(budget[0].size,budget[1].size);assert.ok(Math.abs(budget[0].width-budget[1].width)<1);
    await page.locator('[data-home="ablations"]').click();
    const charts=await page.locator('.ablation-comparison svg').evaluateAll(nodes=>nodes.map(e=>({width:e.getBoundingClientRect().width,axis:e.querySelector('.condition-axis').getBoundingClientRect().y})));
    assert.ok(Math.max(...charts.map(c=>c.width))-Math.min(...charts.map(c=>c.width))<1,`equal ablation chart widths ${lang} ${width}: ${JSON.stringify(charts)}`);
    if(width>1050)assert.ok(Math.max(...charts.map(c=>c.axis))-Math.min(...charts.map(c=>c.axis))<1,'aligned ablation axes');
    for(const route of ['leaderboard','games','contact']){
     await page.locator(`[data-page="${route}"]`).click();
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} ${lang} ${width}`);
     if(route==='games'){
      assert.ok(await page.locator('.game-card').evaluateAll(cards=>cards.every(card=>{
       const box=card.getBoundingClientRect();return [...card.querySelectorAll('h2,p,.game-symbol')].every(e=>{const r=e.getBoundingClientRect();return r.left>=box.left&&r.right<=box.right;});
      })),'game identities remain inside cards');
     }
    }
   }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: EN/ZH at 1440, 1024, 768, 390, 320; centered ranks, bounded cards, matching budget widths, aligned chart axes, compact header, no page overflow');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
