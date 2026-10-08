const {chromium,browserOptions,defaultTarget}=require('./browser-env.cjs');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch(browserOptions);
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.ARENA_TEST_URL||defaultTarget);
  const nav=page.getByRole('navigation',{name:'Main navigation'});
  await nav.getByRole('link',{name:'Games',exact:true}).click();
  const names=await page.locator('.game-card h2').allTextContents();
  assert.equal(names.length,12);
  for(const name of names){
   await nav.getByRole('link',{name:'Games',exact:true}).click();
   await page.getByRole('link',{name:name+' details',exact:true}).click();
   await page.getByRole('navigation',{name:'Game details'}).getByRole('link',{name:'Overview',exact:true}).click();
   await page.getByRole('heading',{name:'How it plays',exact:true}).waitFor();
   assert.equal(await page.locator('.rules-section').count(),5,name+' chapters');
   assert.equal(await page.locator('.rules-facts>div').count(),4,name+' facts');
   assert.ok((await page.locator('.rulebook').innerText()).length>1600,name+' substantial explanation');
   const chapters=page.getByRole('navigation',{name:'Rule chapters'}).getByRole('button');
   await chapters.last().click();
   assert.equal(await page.evaluate(()=>document.activeElement.id),await page.locator('.rules-section h3').last().getAttribute('id'));
   assert.ok(await page.locator('.rules-section h3').last().evaluate(el=>el.getBoundingClientRect().top>=80));
   await page.getByText('Sources & scope',{exact:true}).click();
   assert.ok(await page.locator('.rules-sources li').count()>0);
   assert.ok(await page.getByRole('button',{name:'Paper summary in Appendix A',exact:true}).isDisabled());
   if(name==='Pacman'){
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:'/tmp/aa-rules-pacman-desktop.png'});
   }
   await page.setViewportSize({width:320,height:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' mobile overflow');
   if(name==='Pacman'){
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:'/tmp/aa-rules-pacman-mobile.png'});
    await chapters.nth(2).click();
    await page.screenshot({path:'/tmp/aa-rules-pacman-table-mobile.png'});
   }
   await page.setViewportSize({width:1440,height:1000});
   await page.getByRole('navigation',{name:'Game details'}).getByRole('link',{name:'Leaderboard',exact:true}).click();
   await page.getByRole('heading',{name:'Model leaderboard',exact:true}).waitFor();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: all 12 game guides, 60 chapters, contents navigation, source disclosure, leaderboard return and 320px layouts.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
