import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,serviceWorkers:'block'});
 page.setDefaultTimeout(40000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.LYSOSAcademicSearch?.indexedLectures?.length===78);
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.appPage),'home',
  'initially visible home route must exist before any tab navigation');
 await page.locator('#searchTypeFilter').selectOption('academic_section');
 await page.locator('#searchBox').fill('hoffmann');
 assert.ok((await page.locator('#searchResults').innerText()).includes('19번'));
 await page.locator('#searchResults .search-result-main').filter({hasText:'19번'}).first().click();
 await page.waitForFunction(()=>document.getElementById('claudeNativePilotHost')?.dataset.lysosSearchTarget?.startsWith('claude:19:s'),
   null,{timeout:60000});
 const focus=await page.locator('#claudeNativePilotHost').evaluate(p=>{
  const rect=p.getBoundingClientRect();
  const sh=p.querySelector('.claude-native-lesson')?.shadowRoot;
  const marked=sh?.querySelector('.lysos-search-match');
  const hit=marked?.getBoundingClientRect();
  return {on:p.classList.contains('claude-native-chapter-focus'),w:rect.width,h:rect.height,sw:innerWidth,sh:innerHeight,
    marked:Boolean(marked),visible:Boolean(hit&&hit.bottom>0&&hit.top<innerHeight),text:marked?.textContent?.trim().slice(0,160),
    back:p.querySelector('.claude-native-chapter-focusbar button')?.textContent};
 });
 assert.ok(focus.on&&focus.w>=focus.sw-4&&focus.h>=focus.sh-4,JSON.stringify(focus));
 assert.ok(focus.marked&&focus.visible&&focus.text.toLowerCase().includes('hoffmann'),JSON.stringify(focus));
 assert.equal(focus.back,'← 검색 결과');
 await page.goBack({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.documentElement.dataset.appPage==='home');
 const restored=await page.evaluate(()=>({state:history.state,query:document.getElementById('searchBox').value,
  filter:document.getElementById('searchTypeFilter').value,appPage:document.documentElement.dataset.appPage}));
 console.log('LYSOS BACK DIAGNOSTIC | '+JSON.stringify(restored));
 assert.equal(restored.query,'hoffmann');
 assert.equal(await page.locator('#searchTypeFilter').inputValue(),'academic_section');
 // #3 uses a separate first-volume renderer: it must also open the EXACT
 // muscle passage in the same full-width reader and return to Search.
 await page.locator('#searchBox').fill('극상근');
 await page.locator('#searchResults .search-result-main').filter({hasText:'강의 3번 ·'}).first().click();
 await page.waitForFunction(()=>document.getElementById('claudeNativePilotHost')?.dataset.lysosSearchTarget?.startsWith('claude:3:'),null,{timeout:60000});
 const firstVolume=await page.locator('#claudeNativePilotHost').evaluate(p=>{
  const m=p.querySelector('.claude-native-lesson')?.shadowRoot?.querySelector('.lysos-search-match');
  return {full:p.classList.contains('claude-native-chapter-focus'),width:p.getBoundingClientRect().width,
    windowWidth:innerWidth,hit:!!m,text:m?.textContent?.trim().slice(0,160)};
 });
 assert.ok(firstVolume.full&&firstVolume.width>=firstVolume.windowWidth-4&&firstVolume.hit,JSON.stringify(firstVolume));
 // Free Korean device-voice controls must remain accessible inside the #3 search focus view.
 await page.locator('#lysosSearchVolumeOneToolbar button').last().click();
 assert.equal(await page.locator('#claudeNativePilotHost').evaluate(x=>x.classList.contains('claude-native-chapter-voice-open')),true);
 await page.locator('#lysosSearchVolumeOneToolbar button').last().click();
 await page.locator('#lysosSearchVolumeOneToolbar button').first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.appPage==='home');
 assert.equal(await page.locator('#searchBox').inputValue(),'극상근');
 await page.locator('#searchBox').fill('Neer 4-part');
 await page.waitForFunction(()=>window.LYSOSAcademicSearch?.indexedQuestions===120);
 await page.locator('#searchResults .search-result-main').filter({hasText:'문제은행 1권 · 1번'}).first().click();
 await page.waitForFunction(()=>document.getElementById('diseaseTraumaOriginalFrame')?.dataset.lysosSearchTarget==='claude:59:q0',{timeout:60000});
 const quizFrame=page.frameLocator('#diseaseTraumaOriginalFrame');
 assert.ok((await quizFrame.locator('.lysos-search-qfocus .stem').innerText()).includes('Neer 4-part'));
 await quizFrame.locator('.lysos-search-qfocus button.opt').first().click();
 const graded=await quizFrame.locator('.q').filter({hasText:'Neer 4-part'}).first().locator('.exp').innerText();
 assert.ok(graded.includes('정답')||graded.includes('오답'));
 await page.waitForFunction(()=>{
  const doc=document.getElementById('diseaseTraumaOriginalFrame')?.contentDocument;
  return [...(doc?.querySelectorAll('#list .q')||[])].some(x=>
   x.querySelector('.qn')?.textContent?.trim()==='1번'&&
   x.classList.contains('lysos-search-qfocus')&&
   x.querySelector('.exp.show'));
 });
 assert.equal(await quizFrame.locator('.lysos-search-qfocus .qn').innerText(),'1번');
 await page.locator('#lysosSearchFocusbar button').click();
 await page.waitForFunction(()=>document.documentElement.dataset.appPage==='home');
 assert.equal(await page.locator('#searchBox').inputValue(),'Neer 4-part');
 await page.locator('#searchBox').fill('밤에 깨는 어깨 통증');
 await page.waitForFunction(()=>window.LYSOSAcademicSearch?.indexedCases===30);
 await page.locator('#searchResults .search-result-main').filter({hasText:'증례 구술시험 · 밤에 깨는 어깨 통증'}).first().click();
 await page.waitForFunction(()=>document.getElementById('diseaseTraumaOriginalFrame')?.dataset.lysosSearchTarget==='claude:74:case-v1-n1',null,{timeout:60000});
 assert.equal(await page.frameLocator('#diseaseTraumaOriginalFrame').locator('#ttl').innerText(),'밤에 깨는 어깨 통증, 55세 여성');
 assert.ok((await page.frameLocator('#diseaseTraumaOriginalFrame').locator('#story').innerText()).includes('55세 여성'));
 await page.locator('#lysosSearchFocusbar button').click();
 await page.waitForFunction(()=>document.documentElement.dataset.appPage==='home');
 assert.equal(await page.locator('#searchBox').inputValue(),'밤에 깨는 어깨 통증');
 await page.locator('#searchBox').fill('근육학 02권 상박부');
 await page.waitForFunction(()=>window.LYSOSAcademicSearch?.indexedAudioList===75);
 await page.locator('#searchResults .search-result-main').filter({hasText:'음성 모음 · 근육학 02권 상박부'}).first().click();
 await page.waitForFunction(()=>document.getElementById('diseaseTraumaOriginalFrame')?.dataset.lysosSearchTarget?.startsWith('claude:68:audio-'),null,{timeout:60000});
 assert.equal(await page.frameLocator('#diseaseTraumaOriginalFrame').locator('.lysos-search-audiofocus .n').innerText(),'근육학 02권 상박부');
 await page.locator('#lysosSearchFocusbar button').click();
 await page.waitForFunction(()=>document.documentElement.dataset.appPage==='home');
 assert.equal(await page.locator('#searchBox').inputValue(),'근육학 02권 상박부');
 await page.locator('#searchBox').fill('Neer 4-part');
 await page.waitForFunction(()=>window.LYSOSAcademicSearch?.indexedMockQuestions===160);
 await page.locator('#searchResults .search-result-main').filter({hasText:'모의고사 05권 · 1권 1번'}).first().click();
 await page.waitForFunction(()=>document.getElementById('diseaseTraumaOriginalFrame')?.dataset.lysosSearchTarget==='claude:63:mock-v1-q0',null,{timeout:60000});
 const mock=page.frameLocator('#diseaseTraumaOriginalFrame');
 assert.equal(await mock.locator('#qs .q').count(),1,'one source-locked practice question');
 assert.ok((await mock.locator('#qs .q .stem').innerText()).includes('Neer 4-part'));
 await mock.locator('#qs .q button.opt').first().click();
 await mock.locator('#submit').click();
 assert.ok((await mock.locator('#result').innerText()).includes('문항별 해설'));
 assert.ok((await mock.locator('#rev .q .exp').innerText()).includes('정답'));
 await page.locator('#lysosSearchFocusbar button').click();
 await page.waitForFunction(()=>document.documentElement.dataset.appPage==='home');
 assert.equal(await page.locator('#searchBox').inputValue(),'Neer 4-part');
 await page.locator('#searchBox').fill('극상근');
 await page.waitForFunction(()=>window.LYSOSAcademicSearch?.indexedCompendiumMuscles===372);
 for(const number of [1,2]){
  await page.locator('#searchResults .search-result-main')
   .filter({hasText:'근육총람 '+number+'번 ·'}).first().click();
  await page.waitForFunction(n=>document.getElementById('diseaseTraumaOriginalFrame')?.dataset.lysosSearchTarget===
   'claude:'+n+':muscle-70',number,{timeout:60000});
  const check=await page.evaluate(n=>{
   const f=document.getElementById('diseaseTraumaOriginalFrame'),doc=f.contentDocument;
   return {focus:f.classList.contains('claude-compendium-focus-frame'),
    name:n===1?doc.querySelector('#main h2')?.textContent:doc.querySelector('#dname')?.textContent,
    toolbar:document.querySelector('#claudeCompendiumFocusToolbar [data-focus-back]')?.textContent};
  },number);
  assert.equal(check.name,'극상근');
  assert.ok(check.focus&&check.toolbar==='← 검색 결과',JSON.stringify(check));
  await page.locator('#claudeCompendiumFocusToolbar [data-focus-back]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.appPage==='home');
  assert.equal(await page.locator('#searchBox').inputValue(),'극상근');
 }
 await page.locator('#searchBox').fill('스포츠의학 05권');
 assert.ok((await page.locator('#searchResults').innerText()).includes('세부 위치 이동 미지원'));
 assert.deepEqual(errors,[]);
 console.log('LYSOS GLOBAL ACADEMIC SEARCH E2E PASS | one-tap correct clinical section, wide reader and Back restored');
}finally{await browser.close();}
