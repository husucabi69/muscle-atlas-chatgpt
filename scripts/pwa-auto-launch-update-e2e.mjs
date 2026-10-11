// Real installed PWA update test against a simulated Cloudflare stable Preview.
// This server deliberately changes the live release under one stable origin,
// exercising the same app boot, SW update and offline script cache paths.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright';

const ROOT=process.cwd();
const VERSION_OLD='2026.10.11-pwa-e2e-old';
const VERSION_NEW='2026.10.11-pwa-e2e-new';
let deployed='old';
let liveCalls={js:0,sw:0};
const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const sourceVersion=fs.readFileSync('app-version.js','utf8');
const originalSW=fs.readFileSync('sw.js','utf8');
const browser=await chromium.launch({headless:true});
const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const fileName=name==='/'?'index.html':name.replace(/^\//,'');
  const full=path.resolve(ROOT,fileName);
  if(!full.startsWith(ROOT+path.sep)||!fs.existsSync(full)||!fs.statSync(full).isFile()){
    res.writeHead(404,{'Content-Type':'text/plain'}).end('missing');return;
  }
  const headers={'Cache-Control':'no-cache, no-store, must-revalidate','Content-Type':mime[path.extname(fileName)]||'application/octet-stream'};
  if(fileName==='sw.js'){
    liveCalls.sw++;
    res.writeHead(200,headers).end(originalSW.replace('// v12.33 PWA auto-update:',`// v12.33 PWA auto-update deployed ${deployed}:`));
  }else if(fileName==='app-version.js'){
    const label=deployed==='old'?VERSION_OLD:VERSION_NEW;
    res.writeHead(200,headers).end(sourceVersion
      .replace(/buildVersion:'[^']+'/, "buildVersion:'"+label+"'")
      .replace(/cacheKey:'[^']+'/, "cacheKey:'"+deployed+"-pwa-e2e'")
      .replace(/displayVersion:'[^']+'/, "displayVersion:'vE2E "+deployed+"'"));
  }else if(fileName==='scripts/claude-native-muscle-audio-v1.js'){
    liveCalls.js++;
    res.writeHead(200,headers).end(fs.readFileSync(full,'utf8')+"\nwindow.__pwaE2EAssetBuild='"+deployed+"';\n");
  }else{
    res.writeHead(200,headers).end(fs.readFileSync(full));
  }
});
await new Promise(ok=>server.listen(4175,'127.0.0.1',ok));
try{
  const context=await browser.newContext({viewport:{width:393,height:852}});
  const page=await context.newPage();
  let reloads=0;
  page.on('framenavigated',frame=>{if(frame===page.mainFrame())reloads++;});
  await page.goto('http://127.0.0.1:4175/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!navigator.serviceWorker?.controller,{timeout:25000});
  // The old installed version really controls this origin before deployment.
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(version=>window.LYS_APP_RELEASE?.buildVersion===version,VERSION_OLD);
  assert.equal(await page.evaluate(()=>window.__pwaE2EAssetBuild),'old','old script loaded');
  await page.evaluate(()=>localStorage.setItem('lys-pwa-e2e-learning-record','must-survive-auto-upgrade'));
  const navigationsBefore=reloads;
  deployed='new';
  // This is the same check as app launch, and MUST refresh WITHOUT a button.
  await page.evaluate(()=>{void requestAppUpdateCheck('launch',true)});
  await page.waitForFunction(version=>window.LYS_APP_RELEASE?.buildVersion===version,VERSION_NEW,{timeout:45000});
  await page.waitForFunction(()=>window.__pwaE2EAssetBuild==='new');
  assert.ok(reloads>navigationsBefore,'auto-updated PWA must reload itself without manual click');
  assert.ok(reloads-navigationsBefore<=2,'new version update must not reload loop');
  const active=await page.evaluate(async()=>{
    const c=navigator.serviceWorker.controller;
    if(!c)return 'no controller';
    return await new Promise(resolve=>{
      const channel=new MessageChannel(),timer=setTimeout(()=>resolve('timeout'),3000);
      channel.port1.onmessage=e=>{clearTimeout(timer);resolve(e.data?.buildVersion)};
      c.postMessage({type:'GET_VERSION'},[channel.port2]);
    });
  });
  assert.equal(active,VERSION_NEW,'new worker controls the updated app');
  assert.equal(await page.evaluate(()=>localStorage.getItem('lys-pwa-e2e-learning-record')),
    'must-survive-auto-upgrade','existing learning data must survive automatic update');
  console.log('PASS | Installed PWA automatically adopts latest deploy at launch; updated JS fetched network-first; no reload loop',JSON.stringify({navigationCount:reloads,scriptFetchCount:liveCalls.js,workerFetchCount:liveCalls.sw,controller:active}));
  // After an online automatic upgrade, the verified new app shell and JS must
  // keep working without the network. This is a real SW-controlled cold reload.
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(version=>window.LYS_APP_RELEASE?.buildVersion===version,VERSION_NEW);
  assert.equal(await page.evaluate(()=>window.__pwaE2EAssetBuild),'new',
    'offline app reload must retain the NEW cached JS rather than old code');
  assert.equal(await page.evaluate(()=>localStorage.getItem('lys-pwa-e2e-learning-record')),
    'must-survive-auto-upgrade','offline cold reload must not clear learning data');
  assert.ok((await page.locator('#appUpdateState').innerText()).includes('오프라인'),
    'offline app opening reports cached mode explicitly');
  console.log('PASS | Updated installed PWA opens offline using new verified shell and JS, no forced update or lost learning storage');
  await context.setOffline(false);
  await context.close();

  deployed='old';
  const ctx2=await browser.newContext({viewport:{width:393,height:852}});
  const p2=await ctx2.newPage();let studyNavigations=0;
  p2.on('framenavigated',frame=>{if(frame===p2.mainFrame())studyNavigations++});
  await p2.goto('http://127.0.0.1:4175/',{waitUntil:'domcontentloaded'});
  await p2.waitForFunction(()=>!!navigator.serviceWorker?.controller,{timeout:25000});
  await p2.reload({waitUntil:'domcontentloaded'});
  await p2.locator('.tab[data-page="diseaseTrauma"]').click();
  assert.equal(await p2.locator('#diseaseTrauma').getAttribute('class'),'page active');
  const studyBase=studyNavigations;
  deployed='new';
  await p2.evaluate(()=>{void requestAppUpdateCheck('resume',true)});
  await p2.waitForFunction(()=>document.getElementById('appUpdateState')?.textContent?.includes('새 버전이 준비'));
  assert.equal(studyNavigations,studyBase,'studying screen must not reload mid-session');
  await p2.locator('.tab[data-page="home"]').click();
  // User merely returns home; a staged update applies without any button.
  await p2.waitForFunction(version=>window.LYS_APP_RELEASE?.buildVersion===version,VERSION_NEW,{timeout:45000});
  assert.ok(studyNavigations>studyBase,'deferred update applies automatically when returning home');
  console.log('PASS | Open study lesson remains uninterrupted; returning home automatically applies deferred update');
  await ctx2.close();
}finally{
 await browser.close();
 await new Promise(ok=>server.close(ok));
}
