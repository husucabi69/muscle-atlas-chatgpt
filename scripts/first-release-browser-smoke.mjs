#!/usr/bin/env node
/** Chromium smoke: real mobile+desktop screens, original data, search and safety filter. */
import {strict as assert} from 'node:assert';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chromium} from 'playwright';

const base=process.env.LYSOS_LOCAL_URL || 'http://127.0.0.1:8781';
mkdirSync('artifacts/lysos-first-edition',{recursive:true});
const browser=await chromium.launch({headless:true});
const summary=[];
try{
 for(const device of [{name:'galaxy-width',width:390,height:844},{name:'desktop',width:1365,height:900}]){
  const context=await browser.newContext({viewport:{width:device.width,height:device.height},serviceWorkers:'allow'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'/first-release.html',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#muscles')?.textContent==='205',{timeout:30000});
  assert.equal(await page.locator('#basic').innerText(),'205');
  assert.equal(await page.locator('#mmt').innerText(),'38');
  assert.match(await page.locator('#status').innerText(),/205개 근육/);
  await page.screenshot({path:'artifacts/lysos-first-edition/'+device.name+'-first-release.png',fullPage:true});

  await page.goto(base+'/anatomy-coverage.html',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#all')?.textContent==='205',{timeout:30000});
  assert.equal(await page.locator('#full').innerText(),'205');
  assert.equal(await page.locator('#pending').innerText(),'0');
  assert.equal(await page.locator('#held').innerText(),'38');
  await page.locator('#query').fill('m009');
  await page.locator('.muscle-link').first().click();
  assert.match(await page.locator('#detail-title').innerText(),/m009/);
  await page.locator('#query').fill('');
  await page.locator('#filter').selectOption('held');
  assert.match(await page.locator('#count').innerText(),/^38개/);
  await page.screenshot({path:'artifacts/lysos-first-edition/'+device.name+'-coverage.png',fullPage:true});

  await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(await page.locator('.tabs .tab').count(),10);
  assert.equal(await page.locator('a[href="./first-release.html"]').count(),1);
  assert(await page.locator('#home').isVisible());
  if(device.name==='galaxy-width'){
   const nav=await page.locator('.tabs').evaluate(e=>({scroll:e.scrollWidth,client:e.clientWidth,
      rows:new Set([...e.querySelectorAll('.tab')].map(x=>Math.round(x.getBoundingClientRect().top))).size}));
   assert.equal(nav.rows,1,'Galaxy navigation wrapped');
   await page.screenshot({path:'artifacts/lysos-first-edition/galaxy-width-app-home.png',fullPage:false});
  }
  assert.equal(errors.length,0,'page JavaScript exceptions: '+errors.join('; '));
  summary.push({device:device.name,source:'real browser',muscles:205,held:38,search:'PASS',filter:'PASS',nav:10,exceptions:0});
  await context.close();
 }
 writeFileSync('artifacts/lysos-first-edition/browser-results.json',JSON.stringify(summary,null,2)+'\n');
 console.log(JSON.stringify({status:'PASS_BROWSER',tests:summary}));
}finally{await browser.close()}
