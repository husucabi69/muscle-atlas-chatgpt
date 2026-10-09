// Real Service Worker (NOT serviceWorkers:'block') regression for the user's
// Android installed-PWA bug: the screen must show ORIGINAL lecture content,
// never the fail-closed "원본 강의 확인 필요" 503 document.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const origin=process.env.ATLAS_E2E_BASE_URL||'http://127.0.0.1:4173';
const isLive=process.env.CLAUDE_E2E_LIVE==='true';
const manifest=JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json','utf8'));
const byNumber=new Map(manifest.lectures.map(row=>[row.number,row]));
if(byNumber.size!==87)throw Error('Expected 87 distinct original lectures');
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
  PWA_serviceWorkerUsed:false,staleManifestSeeded:false,opened:[],physicalAndroidVerified:false,audioPlaybackVerified:false};
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
 // Reproduce the Android update hazard: an installed PWA can retain an older
 // shell manifest even after the current page loads. The SW must refresh
 // source identity from the network before it judges original HTML.
 await page.evaluate(async()=>{
  const url=new URL('data/claude-library-manifest-v1.json',location.href).href;
  let seeded=0;
  for(const name of await caches.keys()){
   if(!name.startsWith('muscle-atlas-chatgpt-'))continue;
   const cache=await caches.open(name);
   if(await cache.match(url)){
    await cache.put(url,new Response(JSON.stringify({lectures:[]}),{
     status:200,headers:{'Content-Type':'application/json'}
    }));
    seeded++;
   }
  }
  if(!seeded)throw Error('Could not seed stale installed-PWA manifest');
 });
 report.staleManifestSeeded=true;
 await page.locator('.tab[data-page="diseaseTrauma"]').click();
 await page.waitForFunction(()=>document.querySelectorAll('[data-claude-academic-category]').length===10);
 // Check the two user-reported failures (1, 14) and a real original from
 // each remaining category with the SW actively controlling the page.
 for(let category=0;category<10;category++){
  await page.locator('[data-claude-academic-category="'+category+'"]').click();
  await page.waitForFunction(()=>!document.getElementById('diseaseTraumaCategoryView').hidden);
  const listed=await page.locator('#claudeAcademicCourseList [data-claude-academic-lecture]')
   .evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.claudeAcademicLecture)));
  if(!listed.length)throw Error('No original lecture in category '+category);
  const number=category===0?1:category===1?14:listed[0];
  if(!listed.includes(number))throw Error('Expected original '+number+' missing from category '+category);
  const row=byNumber.get(number);
  if(!row)throw Error('Unknown lecture '+number);
  const spec={category,number};
  const viewY=await page.locator('#diseaseTraumaCategoryView').evaluate(el=>el.getBoundingClientRect().top);
  if(viewY>422)throw Error('Category view opened below visible screen: top='+viewY);
  await page.locator('[data-claude-academic-lecture="'+spec.number+'"]').click();
  try{
   await page.waitForFunction(expectedPath=>{
    const frame=document.getElementById('diseaseTraumaOriginalFrame');
    try{
     const doc=frame.contentDocument;
     return decodeURIComponent(frame.contentWindow.location.pathname)===expectedPath&&
       !frame.hidden&&document.getElementById('diseaseTraumaLoadIssue').hidden&&
       doc?.title!=='원본 강의 확인 필요'&&(doc?.body?.innerText||'').trim().length>200;
    }catch{return false;}
   },'/claude-library/'+row.source_path,{timeout:30000});
  }catch(error){
   await page.screenshot({path:path.join(outDir,'failure-lecture-'+spec.number+'.png')});
   const detail=await page.locator('#diseaseTraumaLoadIssue').innerText().catch(()=>'<unavailable>');
   const frameText=await page.locator('#diseaseTraumaOriginalFrame').evaluate(el=>el.contentDocument?.body?.innerText?.slice(0,300)||'').catch(()=>'<cross origin>');
   throw Error('Installed PWA Claude '+spec.number+' refused original HTML: '+detail+'; iframe='+frameText+'; '+error);
  }
  if(category===0){
   const refreshed=await page.evaluate(async()=>{
    const url=new URL('data/claude-library-manifest-v1.json',location.href).href;
    const names=(await caches.keys()).filter(name=>name.includes('-runtime-'));
    for(const name of names){
     const cached=await (await caches.open(name)).match(url);
     if(cached?.ok){
      const body=await cached.json();
      if(body.lectures?.length===87)return true;
     }
    }
    return false;
   });
   if(!refreshed)throw Error('SW did not replace stale manifest with current 87-lecture identity');
  }
  if(!await page.evaluate(()=>!!navigator.serviceWorker?.controller))
   throw Error('PWA lost Service Worker control while opening lecture '+number);
  report.opened.push({category,number,sourcePath:row.source_path});
  await page.screenshot({path:path.join(outDir,'lecture-'+number+'.png')});
  await page.locator('#diseaseTraumaOriginalView .region-back').click();
  await page.waitForFunction(()=>!document.getElementById('diseaseTraumaCategoryView').hidden);
  await page.locator('#diseaseTraumaCategoryView .region-back').click();
  await page.waitForFunction(()=>!document.getElementById('diseaseTraumaRootView').hidden);
 }
 await context.close();
 fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log('PASS | Real Service Worker controlled PWA with stale-cache recovery: '+report.opened.map(x=>x.number).join(',')+' across 10 categories; exact original paths and back navigation verified');
}finally{await browser.close();}
