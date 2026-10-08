const {chromium,browserOptions,defaultTarget}=require('./browser-env.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const paper=require('./fixtures/paper-tables.json');
const target=process.env.ARENA_TEST_URL||defaultTarget;
(async()=>{
 const browser=await chromium.launch(browserOptions);
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(target);
  const nav=p.getByRole('navigation',{name:'Main navigation'});
  await nav.getByRole('link',{name:'Leaderboard',exact:true}).click();
  await p.getByRole('heading',{name:'Leaderboard',exact:true}).waitFor();
  const rows=p.locator('.leaderboard-matrix tbody tr');
  for(let row=0;row<paper.rowOrder.length;row++){
   const name=paper.rowOrder[row];
   assert.equal(await rows.nth(row).getByRole('link').innerText(),name);
   const cells=rows.nth(row).locator('td');
   for(let model=0;model<paper.models.length;model++){
    const [elo,rank]=paper.results[name][model];
    assert.equal(await cells.nth(model).locator('.pool-result-rank').innerText(),'#'+rank);
    assert.equal(await cells.nth(model).locator('.pool-result-elo').innerText(),elo.toFixed(1)+' Elo');
   }
  }
  assert.equal(await p.locator('.foot-row .note').count(),0);
  assert.equal(await p.locator('.source-details').evaluate(el=>el.open),false);
  await p.getByText('Scoring & data source',{exact:true}).click();
  assert.match(await p.locator('.source-details').innerText(),/median of three runs/);
  await nav.getByRole('link',{name:'Home',exact:true}).click();
  assert.deepEqual(await p.locator('[data-home]').allTextContents(),['Abstract','Main results','Ablations']);
  for(const width of [1440,390,320]){
   await p.setViewportSize({width,height:1000});
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Home layout at '+width);
  }
  await p.setViewportSize({width:1440,height:1000});
  await p.getByRole('button',{name:'Ablations',exact:true}).click();
  for(const name of ['Replay feedback','Opponents','Batch size']){
   await p.getByRole('button',{name,exact:true}).click();
   assert.equal(await p.locator('#home-pane > .note').count(),0);
   assert.equal(await p.locator('.ablation-raw').evaluate(el=>el.open),false);
   assert.match(await p.locator('.ablation-raw').textContent(),/Separate ablation settings/);
   for(const format of ['GIF','MP4']){
    const [download]=await Promise.all([p.waitForEvent('download'),p.locator('.ablation-motion-controls').getByRole('link',{name:format+' ↓',exact:true}).click()]);
    assert.equal(await download.failure(),null);
    assert.ok((await fs.stat(await download.path())).size>1000);
   }
  }
  await nav.getByRole('link',{name:'Games',exact:true}).click();
  assert.equal(await p.locator('#main > .note').count(),0);
  await p.getByText('About these metrics',{exact:true}).click();
  assert.match(await p.locator('.source-details').innerText(),/not unique players/);
  await p.getByRole('link',{name:'AntWar2 details',exact:true}).click();
  await p.getByRole('navigation',{name:'Game details'}).getByRole('link',{name:'Overview',exact:true}).click();
  await p.getByText('Sources & scope',{exact:true}).click();
  assert.match(await p.getByRole('link',{name:'Paper summary in Appendix A'}).getAttribute('href'),/#page=22$/);
  await nav.getByRole('link',{name:'Contact',exact:true}).click();
  await p.getByRole('heading',{name:'Project leads',exact:true}).waitFor();
  await p.getByRole('link',{name:'yks23@mails.tsinghua.edu.cn',exact:true}).waitFor();
  await p.getByRole('link',{name:'lql24@mails.tsinghua.edu.cn',exact:true}).waitFor();
  assert.deepEqual(errors,[]);
  console.log('PASS: online-visible 84 paper cells, three Home sections, mobile layouts, six ablation downloads, PDF page links and project contacts.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
