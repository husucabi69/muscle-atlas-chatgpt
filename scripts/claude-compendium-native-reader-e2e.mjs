// Real mobile Chromium for the user's two formerly tiny interactive
// Muscle Compendium sources. Browser voice is mocked: physical Android audio
// and original MP4 playback are NOT verified by this test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
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
 const originalHeader=await page.locator('.header').evaluate(el=>el.getBoundingClientRect().height);
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
   const compact=await page.evaluate(()=>({
     tabs:getComputedStyle(document.querySelector('.header .tabs')).display,
     header:document.querySelector('.header').getBoundingClientRect().height
   }));
   assert.equal(compact.tabs,'none','course reading should hide redundant app tab row');
   assert.ok(compact.header<originalHeader&&compact.header<75,
     'course mobile header should shrink: '+JSON.stringify({originalHeader,compact}));
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
       frameTop:frame.getBoundingClientRect().top,
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
   assert.ok(enlargedAgain.frameTop>=enlargedAgain.stickyHeaderHeight-8&&
     enlargedAgain.frameTop<=enlargedAgain.stickyHeaderHeight+80,
     'enlarge must immediately reveal source text beneath fixed header: '+JSON.stringify(enlargedAgain));
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
   // The user reported nested scrolling and offscreen muscle details. Verify
   // that clicking a REAL original muscle button instantly switches into an
   // app-owned 1-viewport focus, with the source's own data unchanged.
   const tapSourceMuscle=async(number)=>{
     return page.locator('#diseaseTraumaOriginalFrame').evaluate((frame,number)=>{
       const doc=frame.contentDocument;
       if(number!==9&&number!==10)throw Error('invalid regression muscle');
       // E2E's n isn't in the page; identify the source DOM structure.
       const source=doc.getElementById('nav')?'#nav a[data-n="'+number+'"]':'#regions .mbtn[data-n="'+number+'"]';
       const choice=doc.querySelector(source);
       if(!choice)return false;
       choice.closest('details')?.setAttribute('open','');
       choice.click();return true;
     },number);
   };
   assert.ok(await tapSourceMuscle(9),'real source muscle 9 selector exists '+n);
   await page.waitForFunction(()=>{
     const frame=document.getElementById('diseaseTraumaOriginalFrame');
     return frame.classList.contains('claude-compendium-focus-frame')&&
       !document.getElementById('claudeCompendiumFocusToolbar').hidden;
   },null,{timeout:12000});
   const focus=()=>page.evaluate(()=>{
     const f=document.getElementById('diseaseTraumaOriginalFrame'),d=f.contentDocument;
     const rect=f.getBoundingClientRect();
     return {
       top:rect.top,width:rect.width,height:rect.height,
       viewportWidth:innerWidth,viewportHeight:innerHeight,
       toolbarVisible:!document.getElementById('claudeCompendiumFocusToolbar').hidden,
       sourceName:d.querySelector(d.getElementById('nav')?'#main h2':'#dname')?.textContent.trim(),
       sourceContent:d.getElementById('nav')?d.getElementById('main')?.textContent.length:d.getElementById('dbody')?.textContent.length,
       sourceNavHidden:!!d.getElementById('nav')&&getComputedStyle(d.getElementById('nav')).display==='none',
       detailDisplay:d.getElementById('detail')?.style.display||null,
       originalScroll:d.defaultView.scrollY
     };
   });
   const immediate=await focus();
   fs.mkdirSync('qa-artifacts/claude-original-classroom',{recursive:true});
   await page.screenshot({path:'qa-artifacts/claude-original-classroom/compendium-fullscreen-'+n+'.png'});
   assert.ok(immediate.height>=immediate.viewportHeight-90&&
     immediate.width>=immediate.viewportWidth-4&&
     immediate.top>=50&&immediate.top<=90,'muscle focus must fill phone: '+JSON.stringify(immediate));
   assert.ok(immediate.sourceName.includes('갑상설골근')&&immediate.sourceContent>100,
     'source selection must display requested muscle instantly: '+JSON.stringify(immediate));
   if(n===1)assert.equal(immediate.sourceNavHidden,true,'huge original navigation is hidden during reading');
   else assert.equal(immediate.detailDisplay,'block','original source detail is truly opened');
   await page.locator('#claudeCompendiumFocusToolbar [data-focus-list]').click();
   const returned=await page.locator('#diseaseTraumaOriginalFrame').evaluate(frame=>{
     const d=frame.contentDocument;
     return d.getElementById('nav')
       ?{showNav:getComputedStyle(d.getElementById('nav')).display!=='none',mainHidden:getComputedStyle(d.getElementById('main')).display==='none'}
       :{showNav:!d.getElementById('index').classList.contains('hide'),mainHidden:d.getElementById('detail').style.display==='none'};
   });
   assert.ok(returned.showNav&&returned.mainHidden,'muscle list must be accessible from focus: '+JSON.stringify(returned));
   assert.ok(await tapSourceMuscle(10));
   await page.waitForFunction(()=>{
     const d=document.getElementById('diseaseTraumaOriginalFrame').contentDocument;
     return (d.getElementById('nav')?d.querySelector('#main h2'):d.querySelector('#dname'))?.textContent.includes('견갑설골근');
   });
   const next=await focus();
   assert.ok(next.sourceName.includes('견갑설골근')&&next.height>=next.viewportHeight-90,
     'selecting another muscle must focus it immediately '+JSON.stringify(next));
   console.log('PASS | Compendium #'+n+' original muscle→full-viewport detail→list→next muscle: '+JSON.stringify({immediate,next}));
   console.log('PASS | Compendium #'+n+' mobile interactive original viewport and free Korean voice: '+JSON.stringify(state));
   await page.locator('#claudeCompendiumFocusToolbar [data-focus-back]').click();
   assert.ok(await page.locator('#diseaseTraumaCategoryView').isVisible(),'returns to muscle category after '+n);
   assert.equal(await page.locator('.header .tabs').evaluate(el=>getComputedStyle(el).display==='none'),false,
     'app navigation must return when leaving focused lecture');
 }
 await context.close();
 console.log('CLAUDE COMPENDIUM ADAPTIVE READER E2E | 2/2 original full interactive HTML + responsive large view + browser Korean TTS PASS; physical Android pending');
}finally{await browser.close()}
