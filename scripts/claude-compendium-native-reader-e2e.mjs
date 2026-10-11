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
 const caught=[];page.on('pageerror',e=>caught.push(e.message));
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
       +host.dataset.compendiumVoiceSegments>0&&
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
   assert.ok(state.speechNodes>0&&state.appliedResponsive&&state.hasSpeaker,'large native reader speech controls '+n+': '+JSON.stringify(state));
   // Regression for the real Android screenshot: the former "enlarge again"
   // only changed iframe height, never the font and did not reveal the body.
   const getZoomState=()=>page.locator('#claudeCompendiumReaderHost').evaluate(host=>{
     const frame=document.getElementById('diseaseTraumaOriginalFrame');
     const doc=frame.contentDocument,css=doc.getElementById('lys-compendium-native-layout-v1');
     return {large:frame.classList.contains('claude-compendium-large'),
       cssMedia:css?.media,bodyFont:parseFloat(doc.defaultView.getComputedStyle(doc.body).fontSize),
       height:frame.clientHeight,visible:!frame.hidden,
       expanded:host.dataset.compendiumExpanded,
       note:host.querySelector('[data-compendium-view-mode]')?.textContent,
       scrollMarginTop:parseFloat(frame.style.scrollMarginTop)||0,
       stickyHeaderHeight:document.querySelector('.header')?.getBoundingClientRect().height||0,
       shrinkHidden:host.querySelector('.claude-compendium-actions button:nth-child(2)')?.hidden,
       enlargeHidden:host.querySelector('.claude-compendium-actions button:nth-child(3)')?.hidden};
   });
   const initiallyLarge=await getZoomState();
   assert.equal(initiallyLarge.cssMedia,'all','reader starts in real enlarged-font mode');
   assert.equal(initiallyLarge.expanded,'true');
   await page.locator('#claudeCompendiumReaderHost .claude-compendium-actions button').nth(1).click();
   const originalSize=await getZoomState();
   assert.equal(originalSize.cssMedia,'not all','original-size action must disable enlarged FONT rules');
   assert.equal(originalSize.large,false);
   assert.equal(originalSize.expanded,'false');
   assert.equal(originalSize.enlargeHidden,false);
   await page.locator('#claudeCompendiumReaderHost .claude-compendium-actions button').nth(2).click();
   const enlargedAgain=await getZoomState();
   assert.equal(enlargedAgain.cssMedia,'all','enlarge-again must re-enable enlarged FONT rules');
   assert.equal(enlargedAgain.large,true);
   assert.equal(enlargedAgain.expanded,'true');
   assert.equal(enlargedAgain.shrinkHidden,false);
   assert.equal(enlargedAgain.enlargeHidden,true);
   assert.ok(enlargedAgain.bodyFont>originalSize.bodyFont,
     'real body text size must increase: '+JSON.stringify({originalSize,enlargedAgain}));
   assert.ok(enlargedAgain.note.includes('글자 확대 적용됨'));
   assert.ok(enlargedAgain.scrollMarginTop>=enlargedAgain.stickyHeaderHeight+10,
     'scroll to lecture must keep sticky app header clear: '+JSON.stringify(enlargedAgain));
   console.log('PASS | Compendium #'+n+' real original/large text toggle: '+
     JSON.stringify({originalFont:originalSize.bodyFont,largeFont:enlargedAgain.bodyFont}));
   await page.locator('#claudeCompendiumReaderHost [data-native-audio="play"]').click();
   await page.waitForFunction(()=>window.__compendiumMockSpoken?.length>0);
   const utterance=await page.evaluate(()=>window.__compendiumMockSpoken.at(-1));
   assert.ok(utterance.text&&utterance.text.length<=160&&utterance.lang==='ko-KR',
       'real Korean device speech API invoked for '+n+': '+JSON.stringify(utterance));
   await page.locator('#claudeCompendiumReaderHost [data-native-audio="stop"]').evaluate(button=>button.click());
   if(n===2){
     // On the original cover the 186 muscle selectors are deliberately hidden.
     // Opening the source's own catalog must preserve its button handlers;
     // refresh then narrates the newly visible interactive content.
     const started=await page.locator('#diseaseTraumaOriginalFrame').evaluate(f=>{
       const doc=f.contentDocument;
       const choice=[...doc.querySelectorAll('button')].find(btn=>/시작하기|부위별 근육 보기/.test(btn.innerText||''));
       if(!choice)return false;
       choice.click();return true;
     });
     if(started)await page.waitForTimeout(120);
   }
   await page.locator('#claudeCompendiumReaderHost .claude-compendium-actions button').first().click();
   const refreshedState=await page.locator('#claudeCompendiumReaderHost').evaluate(host=>({
      playerButtons:host.querySelectorAll('[data-native-audio="play"]').length,
      voiceSegments:host.dataset.compendiumVoiceSegments,
      content:host.textContent.slice(0,500),
      frameReady:document.getElementById('diseaseTraumaOriginalFrame')?.contentDocument?.readyState,
      frameHidden:document.getElementById('diseaseTraumaOriginalFrame')?.hidden,
      hostHidden:host.hidden
   }));
   assert.equal(refreshedState.playerButtons,1,
       'manual new-muscle voice recapture '+n+': '+JSON.stringify(refreshedState)+'; errors: '+JSON.stringify(caught));
   const refreshed=await page.locator('#claudeCompendiumReaderHost').getAttribute('data-compendium-voice-segments');
   assert.ok(Number(refreshed)>0,'refreshed interactive source has actual accessible Korean reading segments '+n);
   const speechBeforeTap=await page.evaluate(()=>window.__compendiumMockSpoken.length);
   const tapped=await page.locator('#diseaseTraumaOriginalFrame').evaluate(f=>{
     const doc=f.contentDocument;
     const el=[...doc.querySelectorAll('[data-compendium-voice]')]
       .find(e=>!e.closest('button,a')&&e.getClientRects().length>0);
     if(!el)return false;
     el.click();return true;
   });
   assert.ok(tapped,'selected-muscle passage should remain tappable '+n);
   await page.waitForFunction(prior=>window.__compendiumMockSpoken.length>prior,speechBeforeTap);
   const speechAfterTap=await page.evaluate(()=>window.__compendiumMockSpoken.length);
   assert.equal(speechAfterTap,speechBeforeTap+1,
     'refresh must leave exactly one passage click handler for source '+n);
   await page.locator('#claudeCompendiumReaderHost [data-native-audio="stop"]').evaluate(button=>button.click());
   console.log('PASS | Compendium #'+n+' mobile interactive original viewport and free Korean voice: '+JSON.stringify(state));
   await page.locator('#diseaseTraumaOriginalView .region-back').click();
   assert.ok(await page.locator('#diseaseTraumaCategoryView').isVisible(),'returns to muscle category after '+n);
 }
 await context.close();
 console.log('CLAUDE COMPENDIUM ADAPTIVE READER E2E | 2/2 original full interactive HTML + responsive large view + browser Korean TTS PASS; physical Android pending');
}finally{await browser.close()}
