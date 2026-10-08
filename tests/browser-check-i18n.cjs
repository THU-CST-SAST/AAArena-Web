const {chromium,browserOptions,defaultTarget}=require('./browser-env.cjs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch(browserOptions);
 try{
  const context=await browser.newContext({locale:'zh-CN',viewport:{width:1440,height:1000}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.ARENA_TEST_URL||defaultTarget);
  const language=code=>page.locator(`[data-language="${code}"]`);
  const nav=page.getByRole('navigation',{name:/Main navigation|主导航/});
  assert.equal(await page.locator('html').getAttribute('lang'),'en','first visit stays English even for a Chinese browser');
  assert.match(await page.locator('.replay-method').innerText(),/programs play autonomously; model weights stay fixed/);
  assert.match(await page.locator('.overview-limits').innerText(),/planning long-term improvement/);
  await language('zh').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
  await page.getByText('AI 能为真实对抗游戏编写策略吗？',{exact:true}).waitFor();
  await page.getByRole('heading',{name:'摘要',exact:true}).waitFor();
  assert.match(await page.locator('.replay-method').innerText(),/程序自主对战。模型权重始终不变/);
  assert.match(await page.locator('.overview-limits').innerText(),/规划后续改进/);
  await page.getByRole('button',{name:'主要结果',exact:true}).click();
  assert.equal(await page.locator('.matrix tbody tr').count(),12);
  const numbers=await page.locator('.matrix tbody td:not(:first-child)').allTextContents();
  await language('en').click();
  await page.getByRole('heading',{name:'Main results',exact:true}).waitFor();
  assert.deepEqual(await page.locator('.matrix tbody td:not(:first-child)').allTextContents(),numbers);
  await language('zh').click();
  await page.getByRole('button',{name:'消融实验',exact:true}).click();
  await page.getByRole('button',{name:'对手',exact:true}).click();
  await page.getByRole('heading',{name:'对手选择',exact:true}).waitFor();
  assert.match(await page.locator('.replay-learning-note').innerText(),/在 Miracle 中效果更好，在 AntWar 中则不如自己对战/);
  assert.match(await page.locator('.replay-learning-note a').getAttribute('href'),/#page=15$/);
  await page.locator('.replay-learning-note').screenshot({path:'/tmp/aa-paper-note-zh.png'});
  await language('en').click();
  assert.match(await page.locator('.replay-learning-note').innerText(),/while still receiving full-pool evaluation feedback/);
  assert.match(await page.locator('.replay-learning-note').innerText(),/better in Miracle but worse in AntWar/);
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Replay learning note at '+width);
   await page.locator('.replay-learning-note').screenshot({path:`/tmp/aa-paper-note-${width}.png`});
  }
  await page.setViewportSize({width:1440,height:1000});
  await language('zh').click();
  assert.equal(await page.locator('.condition-label').filter({hasText:'天梯选择'}).count(),3);
  await nav.getByRole('link',{name:'榜单',exact:true}).click();
  await page.getByLabel('游戏',{exact:true}).selectOption('pacman');
  await language('en').click();
  assert.equal(await page.locator('#board-game').inputValue(),'pacman');
  await language('zh').click();
  await nav.getByRole('link',{name:'游戏',exact:true}).click();
  assert.equal(await page.locator('[data-filter],.filter-chips,.category').count(),0);
  assert.equal(await page.locator('.game-card').count(),12);
  await page.screenshot({path:'/tmp/aa-games-no-categories.png'});
  await page.getByRole('searchbox',{name:'搜索游戏'}).fill('迷宫');
  assert.equal(await page.locator('.game-card').count(),2);
  await page.getByRole('searchbox',{name:'搜索游戏'}).fill('');
  const names=await page.locator('.game-card h2').allTextContents();
  for(const name of names){
   await nav.getByRole('link',{name:'游戏',exact:true}).click();
   await page.getByRole('link',{name:name+' 详情',exact:true}).click();
   await page.getByRole('navigation',{name:'游戏详情'}).getByRole('link',{name:'游戏说明',exact:true}).click();
   await page.getByRole('heading',{name:'游戏规则',exact:true}).waitFor();
   assert.equal(await page.locator('.category').count(),0);
   assert.equal(await page.locator('.rules-section').count(),5);
   for(const title of await page.locator('.rules-section h3').allTextContents())assert.match(title,/[\u4e00-\u9fff]/);
   for(const paragraph of await page.locator('.rules-section p').allTextContents())assert.match(paragraph,/[\u4e00-\u9fff]/);
   await page.getByRole('navigation',{name:'规则章节'}).getByRole('button').last().click();
   const route=await page.evaluate(()=>location.hash);
   await page.getByText('来源与适用范围',{exact:true}).click();
   await language('en').click();
   assert.equal(await page.evaluate(()=>location.hash),route);
   assert.equal(await page.locator('.rules-sources').getAttribute('open'),'');
   await language('zh').click();
   await page.setViewportSize({width:320,height:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' Chinese mobile overflow');
   if(name==='Pacman'){
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:'/tmp/aa-zh-pacman-mobile.png'});
   }
   await page.setViewportSize({width:1440,height:1000});
   await page.getByRole('navigation',{name:'游戏详情'}).getByRole('link',{name:'实验记录',exact:true}).click();
   await page.getByRole('heading',{name:'主实验记录',exact:true}).waitFor();
  }
  await nav.getByRole('link',{name:'联系我们',exact:true}).click();
  await page.getByRole('heading',{name:'项目负责人',exact:true}).waitFor();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN','explicit choice persists');
  await nav.getByRole('link',{name:'首页',exact:true}).click();
  await page.screenshot({path:'/tmp/aa-zh-home-desktop.png'});
  for(const width of [390,320]){
   await page.setViewportSize({width,height:1000});
   for(const label of ['首页','榜单','游戏','联系我们']){
    await nav.getByRole('link',{name:label,exact:true}).click();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' at '+width);
   }
  }
  await language('en').click();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  assert.deepEqual(errors,[]);
  console.log('PASS: English default, Chinese UI and 12 guides, unchanged scores, retained routes/filters, persisted language, mobile layouts.');
  await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
