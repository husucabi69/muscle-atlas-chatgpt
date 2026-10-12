// The 2–12 disease/trauma native chapters must fill the mobile viewport and
// keep their exact source nodes. This is browser QA, not physical phone testing.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const expected={29:[10,88,2,8,9],30:[12,126,3,8,6],31:[11,90,1,6,6],32:[11,86,2,8,6],33:[11,77,1,6,6],34:[10,80,2,8,7],35:[12,71,1,10,8],
  36:[11,104,2,9,6],37:[11,94,4,8,6],38:[9,69,1,8,4],39:[10,62,2,8,4]};
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:1,serviceWorkers:'block'});
  page.setDefaultTimeout(30000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.locator('.tab[data-page="diseaseTrauma"]').click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-claude-academic-category]').length===10);
  let found=false;
  for(let category=0;category<10;category++){
    await page.locator('[data-claude-academic-category="'+category+'"]').click();
    if(await page.locator('[data-claude-academic-lecture="29"]').count()){found=true;break;}
    await page.locator('#diseaseTraumaCategoryView .region-back').click();
  }
  assert.equal(found,true);
  fs.mkdirSync('qa-artifacts/claude-original-classroom',{recursive:true});
  for(const [id,counts] of Object.entries(expected)){
    await page.locator('[data-claude-academic-lecture="'+id+'"]').click();
    await page.waitForFunction(id=>{
      const p=document.getElementById('claudeNativePilotHost');
      return !p?.hidden&&p.dataset.claudeNativeLecture===id&&
        p.dataset.claudeNativeLayout==='IMMERSIVE_CHAPTER_PILOT'&&
        !!p.querySelector('.claude-native-lesson')?.shadowRoot;
    },id,{timeout:40000});
    const status=()=>page.locator('#claudeNativePilotHost').evaluate(p=>{
      const sh=p.querySelector('.claude-native-lesson').shadowRoot;
      const section=sh.getElementById('s2'),r=p.getBoundingClientRect();
      return {counts:[sh.querySelectorAll('section').length,sh.querySelectorAll('[data-i]').length,
        sh.querySelectorAll('table').length,sh.querySelectorAll('figure').length,
        sh.querySelectorAll('img').length],
        focus:p.classList.contains('claude-native-chapter-focus'),
        top:section?.getBoundingClientRect().top,
        width:r.width,height:r.height,screenW:innerWidth,screenH:innerHeight,
        voice:!!p.querySelector('[data-native-audio="play"]'),
        title:p.querySelector('.claude-native-chapter-focusbar strong')?.textContent,
        voiceOpen:p.classList.contains('claude-native-chapter-voice-open')};
    });
    const source=await status();assert.deepEqual(source.counts,counts,'source counts #'+id);
    assert.equal(source.focus,false,'no cover overlay before selection #'+id);
    await page.locator('#claudeNativePilotHost .claude-native-navbar select').selectOption('s2');
    const focused=await status();
    assert.ok(focused.focus&&focused.voice,'one-tap focused native chapter #'+id);
    assert.ok(focused.width>=focused.screenW-4&&focused.height>=focused.screenH-4,'real full-viewport reader #'+id);
    assert.ok(focused.top>=90&&focused.top<=300,'selected chapter immediately visible #'+id+': '+JSON.stringify(focused));
    assert.ok(focused.title.length>6,'chapter title visible #'+id);
    if(id==='29'||id==='34'||id==='36')await page.screenshot({path:'qa-artifacts/claude-original-classroom/disease-trauma-'+id+'-immersive.png'});
    await page.locator('#claudeNativePilotHost .claude-native-chapter-focusbar button').nth(1).click();
    assert.equal((await status()).voiceOpen,true,'speech stays accessible in focus #'+id);
    await page.locator('#claudeNativePilotHost .claude-native-chapter-focusbar button').first().click();
    assert.equal((await status()).focus,false,'return from reading overlay #'+id);
    await page.locator('#diseaseTraumaOriginalView .region-back').click();
    await page.waitForFunction(()=>!document.getElementById('diseaseTraumaCategoryView').hidden);
    console.log('PASS | Disease Trauma #'+id+' complete source + one-tap full screen + speech/back');
  }
  assert.deepEqual(errors,[],'no browser errors');
}finally{await browser.close()}
