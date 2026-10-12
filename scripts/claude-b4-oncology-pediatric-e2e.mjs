// B4 browser gate: actual clicks #52–58 on 390px Chromium, not a physical Samsung device.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
const expected={52:[8,80,2,12,7],53:[8,82,4,7,3],54:[7,59,1,7,1],
  55:[8,75,4,7,2],56:[9,63,2,8,3],57:[8,67,3,5,0],58:[8,54,2,4,0]};
const browser=await chromium.launch({headless:true});
fs.mkdirSync('qa-artifacts/claude-b4',{recursive:true});
try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,
    deviceScaleFactor:1,serviceWorkers:'block'});
  page.setDefaultTimeout(40000);
  await page.addInitScript(()=>{
    window.__b4Spoken=[];
    const speech={getVoices:()=>[{name:'QA Korean',lang:'ko-KR',localService:true,default:true}],
      addEventListener:()=>{},cancel:()=>{},pause:()=>{},resume:()=>{},
      speak:utterance=>{window.__b4Spoken.push({text:utterance.text,lang:utterance.lang});}};
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:speech});
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,
      value:class{constructor(text){this.text=text;this.lang='';this.rate=1;}}});
  });
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.ATLAS_E2E_BASE_URL||'http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.locator('.tab[data-page="diseaseTrauma"]').click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-claude-academic-category]').length===10);
  let found=false;
  for(let c=0;c<10;c++){
    await page.locator('[data-claude-academic-category="'+c+'"]').click();
    if(await page.locator('[data-claude-academic-lecture="52"]').count()){found=true;break;}
    await page.locator('#diseaseTraumaCategoryView .region-back').click();
  }
  assert.equal(found,true,'B4 academic category present');
  const sequence=await page.evaluate(()=>({
    after53:window.LYSClaudeSequence?.nextInSeries(53)?.number||null,
    after54:window.LYSClaudeSequence?.nextInSeries(54)?.number||null,
    after55:window.LYSClaudeSequence?.nextInSeries(55)?.number||null}));
  assert.deepEqual(sequence,{after53:54,after54:null,after55:56},
    'audio advance must not cross the tumour/paediatric specialty boundary');
  for(const [raw,counts] of Object.entries(expected)){
    const number=Number(raw);
    // Tumours (#52–54) and paediatrics (#55–58) belong to different
    // first-level academic categories. Do not silently skip the latter.
    if(number===55){
      await page.locator('#diseaseTraumaCategoryView .region-back').click();
      await page.waitForFunction(()=>!document.getElementById('diseaseTraumaRootView').hidden);
      await page.locator('[data-claude-academic-category="4"]').click();
      await page.waitForFunction(()=>!document.getElementById('diseaseTraumaCategoryView').hidden);
    }
    assert.equal(await page.locator('[data-claude-academic-lecture="'+number+'"]').count(),1,
      'B4 original present in correct academic category #'+number);
    await page.locator('[data-claude-academic-lecture="'+number+'"]').click();
    await page.waitForFunction(id=>{
      const host=document.getElementById('claudeNativePilotHost');
      return !host?.hidden&&+host.dataset.claudeNativeLecture===id&&
        host.dataset.claudeNativeLayout==='IMMERSIVE_CHAPTER_PILOT'&&
        !!host.querySelector('.claude-native-lesson')?.shadowRoot;
    },number,{timeout:60000});
    const details=()=>page.locator('#claudeNativePilotHost').evaluate(host=>{
      const sh=host.querySelector('.claude-native-lesson').shadowRoot;
      const rect=host.getBoundingClientRect();
      return {counts:[sh.querySelectorAll('section').length,sh.querySelectorAll('[data-i]').length,
        sh.querySelectorAll('table').length,sh.querySelectorAll('figure').length,
        sh.querySelectorAll('img').length],
        focus:host.classList.contains('claude-native-chapter-focus'),
        chapterTop:sh.getElementById('s2')?.getBoundingClientRect().top,
        width:rect.width,height:rect.height,windowWidth:innerWidth,windowHeight:innerHeight,
        player:!!host.querySelector('[data-native-audio="play"]'),
        selectedText:sh.getElementById('s2')?.textContent?.trim().length||0,
        iframeHidden:document.getElementById('diseaseTraumaOriginalFrame').hidden};
    });
    const initial=await details();
    assert.deepEqual(initial.counts,counts,'originals in Shadow DOM #'+number);
    assert.ok(initial.player&&initial.iframeHidden,'native content instead of original iframe #'+number);
    await page.locator('#claudeNativePilotHost .claude-native-navbar select').selectOption('s2');
    const focus=await details();
    assert.ok(focus.focus&&focus.selectedText>200,'selected chapter populated #'+number);
    assert.ok(focus.width>=focus.windowWidth-4&&focus.height>=focus.windowHeight-4,
      'full mobile viewport #'+number+': '+JSON.stringify(focus));
    assert.ok(focus.chapterTop>=90&&focus.chapterTop<=300,
      'one-tap chapter is immediately visible #'+number+': '+JSON.stringify(focus));
    if(number===52||number===55)await page.screenshot({path:'qa-artifacts/claude-b4/mobile-'+number+'.png'});
    if(number===52){
      // The focus reader intentionally collapses its voice dock until requested.
      await page.locator('#claudeNativePilotHost .claude-native-chapter-focusbar button').nth(1).click();
      await page.locator('#claudeNativePilotHost [data-native-audio="play"]').click();
      await page.waitForFunction(()=>window.__b4Spoken?.length>0);
      const spoken=await page.evaluate(()=>window.__b4Spoken[0]);
      assert.ok(spoken.text.length>0&&spoken.text.length<=160&&spoken.lang.startsWith('ko'),
        'source segment reached device Korean TTS adapter');
      await page.locator('#claudeNativePilotHost [data-native-audio="dock-stop"]').click();
    }
    await page.locator('#claudeNativePilotHost .claude-native-chapter-focusbar button').first().click();
    assert.equal((await details()).focus,false,'return from focus #'+number);
    await page.locator('#diseaseTraumaOriginalView .region-back').click();
    await page.waitForFunction(()=>!document.getElementById('diseaseTraumaCategoryView').hidden);
    console.log('PASS | B4 #'+number+' one-tap immersive original chapters, device-voice controls, and Back');
  }
  assert.deepEqual(errors,[],'no mobile browser script exceptions');
}finally{await browser.close();}
