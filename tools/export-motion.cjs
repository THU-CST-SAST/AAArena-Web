const {chromium, browserOptions}=require('../tests/browser-env.cjs');
const {spawn}=require('node:child_process');
const {once}=require('node:events');
const path=require('node:path');
const fs=require('node:fs/promises');

(async()=>{
 const browser=await chromium.launch(browserOptions);
 try {
  const p=await browser.newPage({viewport:{width:1200,height:675}});
  await p.goto('file://'+path.join(__dirname,'motion-export.html'));
  for(const kind of ['loop','dorado']){
   const mp4=path.join(__dirname,'..','assets',`aa-arena-${kind}.mp4`);
   const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','png','-framerate','24','-i','pipe:0','-an','-vf','scale=1280:720:flags=lanczos','-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart',mp4],{stdio:['pipe','inherit','inherit']});
   const completed=once(ff,'close');
   for(let i=0;i<288;i++){
    const base64=await p.evaluate(({kind,t})=>{const c=document.querySelector('canvas');window.ArenaMotion.draw(c,kind,t);return c.toDataURL('image/png').split(',')[1];},{kind,t:i/24});
    const buffer=Buffer.from(base64,'base64');
    if(!ff.stdin.write(buffer))await once(ff.stdin,'drain');
    if(i===168)await fs.writeFile(path.join(__dirname,'..','assets',`aa-arena-${kind}-poster.png`),buffer);
   }
   ff.stdin.end();const [code]=await completed;if(code!==0)throw new Error('MP4 encoding failed');
   const gif=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',mp4,'-filter_complex','fps=12,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',path.join(__dirname,'..','assets',`aa-arena-${kind}.gif`)],{stdio:'inherit'});
   const [gifCode]=await once(gif,'close');if(gifCode!==0)throw new Error('GIF encoding failed');
   console.log(`${kind}: MP4 1280×720 / 24fps; GIF 800×450 / 12fps; 12 seconds.`);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
