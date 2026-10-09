// Real Service Worker (NOT serviceWorkers:'block') regression for the user's
// Android installed-PWA bug: the screen must show ORIGINAL lecture content,
// never the fail-closed "원본 강의 확인 필요" 503 document.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const origin=process.env.ATLAS_E2E_BASE_URL||'http://127.0.0.1:4173';
const isLive=process.env.CLAUDE_E2E_LIVE==='true';
let base=origin;
if(isLive){
 const evidence=JSON.parse(fs.readFileSync(process.env.DEPLOY_GATE_EVIDENCE||'/tmp/deploy-safety-evidence.json','utf8'));
 if(evidence.result!=='PASS'||evidence.sha!==process.env.GITHUB_SHA||
    !/^https:\/\/[0-9a-f]{8}\.muscle-atlas-chatgpt\.pages\.dev\/?$/.test(evidence.cloudflare?.exact_preview_url||'')){
   throw Error('Exact-SHA Cloudflare Preview safety evidence required');
 }
 base=evidence.cloudflare.exact_preview_url;
}
const outDir=isLive?'qa-artifacts/claude-pwa-live':'qa-artifacts/claude-pwa-local';
fs.mkdirSync(outDir,{recursive:true});
const browser=await chromium.launch({headless:true});
const report={mode:isLive?'exact-sha-preview':'localhost',sourceCommit:process.env.GITHUB_SHA||null,
  PWA_serviceWorkerUsed:false,opened:[],physicalAndroidVerified:false,audioPlaybackVerified:false};
try{
 const context=await browser.newContext({
  viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:1,
  serviceWorkers:'allow'
 });
 const page=await context.newPage();
 page.setDefaultTimeout(20000);
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await page.evaluate(async()=>{
  if(!('serviceWorker' in navigator))throw Error('No Service Worker API available');
  await navigator.serviceWorker.register('./sw.js');
  await Promise.race([
    navigator.serviceWorker.ready,
    new Promise((_,reject)=>setTimeout(()=>reject(Error('SW did not activate in 45 seconds')),45000))
  ]);
 });
 // The first page load can be uncontrolled. Require SW ownership before testing.
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!navigator.serviceWorker?.controller,{timeout:25000});
 report.PWA_serviceWorkerUsed=true;
 await page.locator('.tab[data-page="diseaseTrauma"]').click();
 await page.waitForFunction(()=>document.querySelectorAll('[data-claude-academic-category]').length===10);
 for(const spec of [{category:0,number:1},{category:1,number:14}]){
  await page.locator('[data-claude-academic-category="'+spec.category+'"]').click();
  await page.waitForFunction(()=>!document.getElementById('diseaseTraumaCategoryView').hidden);
  const viewY=await page.locator('#diseaseTraumaCategoryView').evaluate(el=>el.getBoundingClientRect().top);
  if(viewY>window.innerHeight/2)throw Error('Category view opened below visible screen: top='+viewY);
  await page.locator('[data-claude-academic-lecture="'+spec.number+'"]').click();
  try{
   await page.waitForFunction(()=>{
    const frame=document.getElementById('diseaseTraumaOriginalFrame');
    try{
     const doc=frame.contentDocument;
     return !frame.hidden&&!document.getElementById('diseaseTraumaLoadIssue').hidden===false&&
       doc?.title!=='원본 강의 확인 필요'&&(doc?.body?.innerText||'').trim().length>200;
    }catch{return false;}
   },{timeout:30000});
  }catch(error){
   await page.screenshot({path:path.join(outDir,'failure-lecture-'+spec.number+'.png')});
   const detail=await page.locator('#diseaseTraumaLoadIssue').innerText().catch(()=>'<unavailable>');
   const frameText=await page.locator('#diseaseTraumaOriginalFrame').evaluate(el=>el.contentDocument?.body?.innerText?.slice(0,300)||'').catch(()=>'<cross origin>');
   throw Error('Installed PWA Claude '+spec.number+' refused original HTML: '+detail+'; iframe='+frameText+'; '+error);
  }
  report.opened.push(spec.number);
  await page.screenshot({path:path.join(outDir,'lecture-'+spec.number+'.png')});
  await page.locator('#diseaseTraumaOriginalView .region-back').click();
  await page.waitForFunction(()=>!document.getElementById('diseaseTraumaCategoryView').hidden);
  await page.locator('#diseaseTraumaCategoryView .region-back').click();
  await page.waitForFunction(()=>!document.getElementById('diseaseTraumaRootView').hidden);
 }
 await context.close();
 fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log('PASS | Real Service Worker controlled PWA: '+report.opened.join(',')+' original HTML visible and category screens reversible');
}finally{await browser.close();}
