const {chromium,browserOptions,defaultTarget}=require('./browser-env.cjs');
const assert=require('node:assert/strict');
const paper=require('./fixtures/paper-tables.json');
(async()=>{
 const browser=await chromium.launch(browserOptions);
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.ARENA_TEST_URL||defaultTarget);
  for(const lang of ['en','zh']){
   await page.locator(`[data-language="${lang}"]`).click();
   for(const name of paper.rowOrder){
    await page.locator('[data-page="games"]').click();
    await page.locator(`.game-card[href="#/games/${name.toLowerCase()}"]`).click();
    await page.locator('.detail-tabs a[href$="/records"]').click();
    await page.locator('.record-main .record-outcome').waitFor();
    const results=paper.results[name],best=Math.max(...results.map(r=>r[0]));
    const main=page.locator('.record-main');
    assert.deepEqual(await main.locator('.record-outcome strong').allTextContents(),['#'+Math.min(...results.map(r=>r[1])),best.toFixed(1)]);
    assert.deepEqual(await main.locator('.record-plot-row').evaluateAll(rows=>rows.map(r=>[+r.dataset.value,+r.dataset.rank])),results);
    assert.equal(await main.locator('.record-best').count(),results.filter(r=>r[0]===best).length);
    assert.equal(await main.locator('.record-gold').count(),results.filter(r=>r[1]===1).length);
    assert.equal(await main.locator('.record-label small,.record-info,.record-caption').count(),0);
    assert.equal(await main.locator('.source-details').evaluate(el=>el.open),false);
    await main.locator('.record-details summary').click();assert.equal(await main.locator('.record-details').getAttribute('open'),'');
    assert.equal(await main.locator('tbody tr:visible').count(),7);
    await main.locator('.record-details summary').press('Enter');assert.equal(await main.locator('.record-details').getAttribute('open'),null);
    const cost=page.locator('[data-unit="M tokens"]');
    assert.deepEqual(await cost.locator('.record-plot-row').evaluateAll(rows=>rows.map(r=>+r.dataset.value)),paper.tokens[name]);
    assert.equal(await cost.locator('.record-best').count(),0);
    assert.equal(await cost.locator('.record-axis span').first().textContent(),'0');
    for(const block of await page.locator('.record-block').all()){
     if(await block.locator('.record-plot').count()){
      const plotValues=await block.locator('.record-plot-row').evaluateAll(rows=>rows.map(r=>+r.dataset.value));
      const tableValues=await block.locator('tbody tr').evaluateAll(rows=>rows.map(r=>+r.cells[1].textContent));
      assert.deepEqual(plotValues,tableValues,'visuals and exact values agree');
     }
    }
    for(const width of [1440,768,390,320]){
     await page.setViewportSize({width,height:1000});
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} ${lang} ${width} overflow`);
     assert.ok(await page.locator('.record-track').evaluateAll(nodes=>nodes.every(e=>e.getBoundingClientRect().width>40)),`${name} ${width} readable tracks`);
     assert.ok(await page.locator('.record-value').evaluateAll(nodes=>nodes.every(e=>e.scrollWidth<=e.clientWidth+1)),`${name} ${width} unclipped values`);
    }
    await page.setViewportSize({width:1440,height:1000});
    if(name==='Pacman'){
     const replay=page.locator('.record-block').filter({has:page.locator('.record-rank')}).nth(1);
     assert.equal(await replay.locator('.record-plot-row').count(),2);
     assert.equal(await replay.locator('.record-best').count(),0,'terminal Elo is not proof of better learning');
    }
    if(name==='Generals')assert.equal(await page.locator('.record-gain').count(),0);
    if(name==='Miracle')assert.equal(await page.locator('.record-gain>strong').textContent(),'+50.0 Elo');
    if(name==='Dorado'){
     assert.equal(await page.locator('.record-point').count(),9);
     assert.match(await page.locator('.record-trajectory-endpoints>strong').textContent(),/^#2/);
     assert.equal(await page.locator('.record-table tbody tr').count(),9);
    }
   }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: 12 Records pages, EN/ZH, exact main/token values, ties, #1 badges, expandable tables, gains and milestones; no overflow at 1440/768/390/320');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
