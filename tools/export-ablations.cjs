const {chromium, browserOptions}=require('../tests/browser-env.cjs');
const {spawn}=require('node:child_process');
const {once}=require('node:events');
const path=require('node:path');
const fs=require('node:fs/promises');

(async()=>{
 const browser=await chromium.launch(browserOptions);
 try{
  const page=await browser.newPage({viewport:{width:1200,height:900}});
  const cdp=await page.context().newCDPSession(page);
  await page.goto('file://'+path.join(__dirname,'..','index.html'));
  await page.getByRole('button',{name:'Ablations',exact:true}).click();
  await page.addStyleTag({content:`.site-header,.home-hero,.stats,.home-nav,footer{display:none!important}#main{width:1200px;padding:0;max-width:none}.home-content{display:block}.ablation-scene{width:1200px;height:675px;padding:30px 42px;background:white}.ablation-scene-heading{margin-top:0;margin-bottom:20px}.ablation-scene-heading h3{font-size:28px}.ablation-scene-heading>span{font-size:15px}.ablation-controls{padding-bottom:17px}.ablation-legend{font-size:14px}.ablation-comparison{padding-top:23px;padding-bottom:20px}.ablation-comparison figcaption{font-size:22px}.ablation-comparison figcaption>span{font-size:14px}.ablation-finding{font-size:17px;max-width:none;margin-bottom:0}.ablation-comparisons{margin-bottom:20px}`});
  for(const [kind,label] of [['feedback','Replay feedback'],['opponents','Opponents'],['batch','Batch size']]){
   await page.getByRole('button',{name:label,exact:true}).click();
   await page.evaluate(()=>{
    const title=document.querySelector('.ablation-scene-heading>span');title.textContent='AAArena · GLM-5.3 · '+title.textContent;
    for(const a of document.querySelectorAll('.ablation-comparison figcaption a'))a.textContent=a.textContent.replace(' ↗','');
    window.exportAnimations=document.querySelector('.ablation-scene').getAnimations({subtree:true});
    for(const animation of window.exportAnimations)animation.pause();
   });
   const mp4=path.join(__dirname,'..','assets',`aa-arena-ablation-${kind}.mp4`);
   const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','png','-framerate','24','-i','pipe:0','-an','-vf','scale=1280:720:flags=lanczos','-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart',mp4],{stdio:['pipe','inherit','inherit']});
   const completed=once(ff,'close');
   const box=await page.locator('.ablation-scene').boundingBox();
   for(let frame=0;frame<192;frame++){
    await page.evaluate(t=>{for(const animation of window.exportAnimations)animation.currentTime=t;},frame/24*1000);
    const result=await cdp.send('Page.captureScreenshot',{format:'png',clip:{...box,scale:1},captureBeyondViewport:true});
    const png=Buffer.from(result.data,'base64');
    if(frame===96)await fs.writeFile(path.join(__dirname,'..','assets',`aa-arena-ablation-${kind}-poster.png`),png);
    if(!ff.stdin.write(png))await once(ff.stdin,'drain');
   }
   ff.stdin.end();const [code]=await completed;if(code!==0)throw new Error('MP4 encoding failed');
   const gif=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',mp4,'-filter_complex','fps=12,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',path.join(__dirname,'..','assets',`aa-arena-ablation-${kind}.gif`)],{stdio:'inherit'});
   const [gifCode]=await once(gif,'close');if(gifCode!==0)throw new Error('GIF encoding failed');
   console.log(`${kind}: MP4 1280×720 / 24fps; GIF 800×450 / 12fps; 8 seconds.`);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
