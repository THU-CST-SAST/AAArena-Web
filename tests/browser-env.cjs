const {chromium}=require('playwright');
const path=require('node:path');
const {pathToFileURL}=require('node:url');

const browserOptions={
  headless:true,
  args:['--disable-dev-shm-usage','--disable-gpu'],
};
if(process.env.ARENA_BROWSER_PATH)browserOptions.executablePath=process.env.ARENA_BROWSER_PATH;
if(process.env.ARENA_NO_SANDBOX==='1')browserOptions.args.push('--no-sandbox');
const defaultTarget=pathToFileURL(path.join(__dirname,'..','index.html')).href;

module.exports={chromium,browserOptions,defaultTarget};
