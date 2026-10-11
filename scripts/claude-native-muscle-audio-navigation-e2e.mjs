// Browser regression: finished native speech must not reopen the next lecture
// after the learner presses Stop or leaves the current lesson.
// Chromium + a simulated Korean speech engine; NOT physical Android/audio QA.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=(process.env.ATLAS_E2E_BASE_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({
    viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:1,
    serviceWorkers:'block'
  });
  await page.addInitScript(()=>{
    let epoch=0;
    const speech={
      getVoices:()=>[{name:'QA Korean Voice',lang:'ko-KR',localService:true,default:true}],
      addEventListener:()=>{},cancel:()=>{epoch++;},pause:()=>{},resume:()=>{},
      speak:u=>{const run=++epoch;setTimeout(()=>{if(run===epoch)u.onend?.({});},25);}
    };
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:speech});
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,
      value:class{constructor(text){this.text=text;this.lang='';this.rate=1;}}});
  });
  page.setDefaultTimeout(25000);
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.locator('.tab[data-page="diseaseTrauma"]').click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-claude-academic-category]').length===10);
  // Open the real 1st-volume app route, not a disconnected unit-test page.
  let reached=false;
  for(let category=0;category<10;category++){
    await page.locator('[data-claude-academic-category="'+category+'"]').click();
    if(await page.locator('[data-claude-academic-lecture="3"]').count()){
      await page.locator('[data-claude-academic-lecture="3"]').click();
      reached=true;break;
    }
    await page.locator('#diseaseTraumaCategoryView .region-back').click();
  }
  assert.equal(reached,true,'Muscle lecture #3 must be listed');
  await page.waitForFunction(()=>{
    const host=document.getElementById('claudeNativePilotHost');
    return !host?.hidden&&!!host.querySelector('[data-native-audio="play"]')&&
      !!host.querySelector('.claude-native-lesson')?.shadowRoot;
  });
  await page.evaluate(()=>{
    window.__lysAudioRace={canceled:0,unwantedAdvance:0,acceptedAdvance:0};
    const host=document.createElement('div');host.id='lys-audio-race-fixture';
    document.body.append(host);
    const shadow=host.attachShadow({mode:'open'});
    shadow.innerHTML='<section id="race-test"><p data-i="0">짧은 테스트 문단입니다.</p></section>';
    window.__lysAudioRace.shadow=shadow;
    const player=window.LYSNativeAudio.mount(shadow,{
      lectureNumber:99,title:'자동전환 경쟁상태 검사',expectedCount:1,
      onComplete:()=>{window.__lysAudioRace.unwantedAdvance++;}
    });
    host.append(player);
    const status=player.querySelector('[data-native-audio="status"]');
    const watcher=new MutationObserver(()=>{
      if(!status.textContent.includes('읽기가 끝났습니다.'))return;
      watcher.disconnect();
      window.__lysAudioRace.canceled++;
      // A learner can press Stop after the last spoken word but before
      // the 120 ms automatic next-lecture navigation timer executes.
      window.LYSNativeAudio.stop();
    });
    watcher.observe(status,{subtree:true,characterData:true,childList:true});
    player.querySelector('[data-native-audio="play"]').click();
  });
  await page.waitForFunction(()=>window.__lysAudioRace?.canceled===1);
  await page.waitForTimeout(280);
  const canceled=await page.evaluate(()=>window.__lysAudioRace.unwantedAdvance);
  assert.equal(canceled,0,'A canceled lesson must NOT auto-advance after Stop');

  await page.evaluate(()=>{
    const state=window.__lysAudioRace;
    const old=document.querySelector('#lys-audio-race-fixture [data-native-audio="player"]');
    old?.remove();
    const player=window.LYSNativeAudio.mount(state.shadow,{
      lectureNumber:99,title:'자동전환 정상 검사',expectedCount:1,
      onComplete:()=>{state.acceptedAdvance++;}
    });
    document.querySelector('#lys-audio-race-fixture').append(player);
    player.querySelector('[data-native-audio="play"]').click();
  });
  await page.waitForFunction(()=>window.__lysAudioRace?.acceptedAdvance===1);
  const accepted=await page.evaluate(()=>({
    accepted:window.__lysAudioRace.acceptedAdvance,
    unwanted:window.__lysAudioRace.unwantedAdvance,
    lastStatus:document.querySelector('#lys-audio-race-fixture [data-native-audio="status"]').textContent
  }));
  assert.equal(accepted.accepted,1,'Uninterrupted lecture must still auto-advance exactly once');
  assert.equal(accepted.unwanted,0,'A stale canceled callback must never run');
  await page.evaluate(()=>{
    window.LYSNativeAudio.stop();
    document.getElementById('lys-audio-race-fixture')?.remove();
    delete window.__lysAudioRace;
  });
  // Final muscle volume must not offer a nonexistent auto-next destination.
  await page.locator('#diseaseTraumaOriginalView .region-back').click();
  await page.waitForFunction(()=>!document.getElementById('diseaseTraumaCategoryView').hidden);
  await page.locator('[data-claude-academic-lecture="13"]').click();
  await page.waitForFunction(()=>{
    const host=document.getElementById('claudeNativePilotHost');
    return Number(host?.dataset.claudeNativeLecture)===13&&
      !!host.querySelector('[data-native-audio="auto-next"]');
  });
  const lastCourse=await page.locator('#claudeNativePilotHost').evaluate(host=>({
    hidden:host.querySelector('.claude-native-auto-next')?.hidden,
    disabled:host.querySelector('[data-native-audio="auto-next"]')?.disabled
  }));
  assert.equal(lastCourse.hidden,true,'Final muscle lecture should hide the unusable next-volume UI');
  assert.equal(lastCourse.disabled,true,'Final muscle lecture auto-next must be disabled');
  console.log('PASS | native Korean speech: canceled 0 auto-next; uninterrupted 1 auto-next; last-volume continuation disabled; simulated mobile browser only');
}finally{
  await browser.close();
}
