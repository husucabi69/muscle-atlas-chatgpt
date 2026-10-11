// Real mobile Chromium for the user's two formerly tiny interactive
// Muscle Compendium sources. Browser voice is mocked: physical Android audio
// and original MP4 playback are NOT verified by this test.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true});
 await context.addInitScript(()=>{
  window.__compendiumMockSpoken=[];
  window.SpeechSynthesisUtterance=class{
    constructor(text){this.text=text;this.lang='';this.rate=1;}
  };
  const synth={
    getVoices(){return[{name:'Korean Test',lang:'ko-KR',voiceURI:'Korean Test',localService:true}]},
    speak(u){window.__compendiumMockSpoken.push({text:u.text,lang:u.lang,rate:u.rate});u.onstart?.();},
    cancel(){},pause(){},resume(){},speaking:false,paused:false,pending:false
  };
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synth});
 });
 const page=await context.newPage();page.setDefaultTimeout(30000);
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.locator('.tab[data-page="diseaseTrauma"]').click();
 await page.locator('[data-claude-academic-category="0"]').click();
 for(const n of [1,2]){
   await page.locator('[data-claude-academic-lecture="'+n+'"]').click();
   await page.waitForFunction(number=>{
     const host=document.getElementById('claudeCompendiumReaderHost');
     const frame=document.getElementById('diseaseTraumaOriginalFrame');
     return !host?.hidden&&host?.dataset.compendiumLecture===String(number)&&
       !frame?.hidden&&frame.classList.contains('claude-compendium-large')&&
       +host.dataset.compendiumVoiceSegments>8&&
       !!host.querySelector('[data-native-audio="play"]');
   },n,{timeout:45000});
   const state=await page.locator('#claudeCompendiumReaderHost').evaluate((host)=>{
     const f=document.getElementById('diseaseTraumaOriginalFrame');
     const d=f.contentDocument;
     return {
       status:document.getElementById('diseaseTraumaOriginalStatus').textContent,
       frameHeight:f.clientHeight,frameWidth:f.clientWidth,mainWidth:document.documentElement.clientWidth,
       speechNodes:d.querySelectorAll('[data-compendium-voice]').length,
       sourceDomLength:d.body.textContent.length,
       originalScripts:d.querySelectorAll('script').length,
       appliedResponsive:!!d.getElementById('lys-compendium-native-layout-v1'),
       hasSpeaker:!!host.querySelector('[data-native-audio="play"]')
     };
   });
   assert.ok(state.frameHeight>=875&&state.frameWidth<=state.mainWidth+4,'expanded interactive lecture viewport '+n+': '+JSON.stringify(state));
   assert.ok(state.sourceDomLength>2000&&state.originalScripts>0,'original running JS and full content intact '+n);
   assert.ok(state.speechNodes>8&&state.appliedResponsive&&state.hasSpeaker,'large native reader speech controls '+n);
   await page.locator('#claudeCompendiumReaderHost [data-native-audio="play"]').click();
   await page.waitForFunction(()=>window.__compendiumMockSpoken?.length>0);
   const utterance=await page.evaluate(()=>window.__compendiumMockSpoken.at(-1));
   assert.ok(utterance.text&&utterance.text.length<=160&&utterance.lang==='ko-KR',
       'real Korean device speech API invoked for '+n+': '+JSON.stringify(utterance));
   await page.locator('#claudeCompendiumReaderHost [data-native-audio="stop"]').click();
   await page.locator('#claudeCompendiumReaderHost .claude-compendium-actions button').first().click();
   assert.ok(await page.locator('#claudeCompendiumReaderHost [data-native-audio="play"]').count()===1,
       'manual new-muscle voice recapture '+n);
   console.log('PASS | Compendium #'+n+' mobile interactive original viewport and free Korean voice: '+JSON.stringify(state));
   await page.locator('#diseaseTraumaOriginalView .region-back').click();
   assert.ok(await page.locator('#diseaseTraumaCategoryView').isVisible(),'returns to muscle category after '+n);
 }
 await context.close();
 console.log('CLAUDE COMPENDIUM ADAPTIVE READER E2E | 2/2 original full interactive HTML + responsive large view + browser Korean TTS PASS; physical Android pending');
}finally{await browser.close()}
