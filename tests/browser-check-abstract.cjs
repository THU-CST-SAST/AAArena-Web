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
  console.log('PASS: visual abstract ranks, expand/collapse, mouse and keyboard game links, back navigation, desktop/tablet/mobile overflow, no page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
