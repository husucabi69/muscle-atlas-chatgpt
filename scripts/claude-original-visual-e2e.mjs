import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base=process.env.ATLAS_E2E_BASE_URL||'http://127.0.0.1:4173';
const manifest=JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json','utf8'));
const lectures=manifest.lectures.filter(x=>x.series==='질환·외상'&&x.hosting_status.startsWith('SELF_HOSTED_'));
if(lectures.length<6)throw new Error('Expected six self-hosted Claude disease/trauma HTML originals');
const browser=await chromium.launch({headless:true});
const outDir='qa-artifacts/claude-original-classroom';
const evidence=[];
try{
  for(const cfg of [
    {name:'mobile390',width:390,height:844,isMobile:true,deviceScaleFactor:1},
    {name:'desktop1280',width:1280,height:800,isMobile:false,deviceScaleFactor:1}
  ]){
    const context=await browser.newContext({viewport:{width:cfg.width,height:cfg.height},isMobile:cfg.isMobile,deviceScaleFactor:cfg.deviceScaleFactor});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(String(error)));
    await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    await page.locator('.tab[data-page="diseaseTrauma"]').click();
    await page.waitForFunction(()=>document.querySelectorAll('#diseaseTraumaVolumeChooser [data-claude-lecture]').length>=24,{timeout:30000});
    for(const lecture of lectures){
      const item=page.locator('[data-claude-lecture="'+lecture.number+'"]');
      if(!(await item.textContent()).includes('우리 서버 원본'))throw new Error('Not self-hosted '+lecture.number);
      await item.click();
      const frame=page.frameLocator('#diseaseTraumaOriginalFrame');
      await frame.locator('body').waitFor({state:'visible',timeout:20000});
      const expectedMedia=lecture.r2_object_key;
      const state=await frame.locator('body').evaluate(()=>{
        return {
          title:document.title,
          bodyChars:document.body?.textContent?.length||0,
          audioPaths:window.__AUD__?.urls||[],
          startButtons:document.querySelectorAll('#startAll').length,
          playerButtons:document.querySelectorAll('#play').length,
          speedControls:document.querySelectorAll('#rate').length,
          viewportWidth:window.innerWidth,
          documentWidth:document.documentElement.scrollWidth
        };
      });
      if(state.bodyChars<1000)throw new Error('Lecture HTML did not load '+lecture.number+' bodyChars='+state.bodyChars);
      if(!state.audioPaths.some(p=>p==='../../'+expectedMedia))throw new Error('Original media relative path missing '+lecture.number);
      if(!state.startButtons||!state.playerButtons||!state.speedControls)throw new Error('Original audio UI missing '+lecture.number);
      const msg=(await page.locator('#diseaseTraumaOriginalStatus').textContent()||'');
      if(!msg.includes('음성 연결 대기'))throw new Error('Audio-pending status missing '+lecture.number);
      const name=cfg.name+'/lecture-'+String(lecture.number).padStart(2,'0')+'.png';
      const target=path.join(outDir,name);
      fs.mkdirSync(path.dirname(target),{recursive:true});
      await page.screenshot({path:target,fullPage:false});
      evidence.push({lecture:lecture.number,title:lecture.title,viewport:cfg.name,screenshot:name,source_sha256:lecture.source_sha256,...state});
      await page.locator('#diseaseTraumaOriginalView .region-back').click();
      await page.waitForFunction(()=>!document.querySelector('#diseaseTraumaRootView')?.hidden,{timeout:10000});
    }
    if(errors.length)throw new Error('Uncaught browser errors: '+errors.join(' | '));
    await context.close();
  }
  fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify({
    source_commit:process.env.GITHUB_SHA||null,lectures_tested:lectures.length,
    screenshot_count:evidence.length,media_ready_claimed:false,
    evidence
  },null,2)+'\n');
  console.log('PASS | Claude Original classroom visual smoke: '+lectures.length+' lectures × 2 viewports = '+evidence.length+' screenshots');
}finally{
  await browser.close();
}
