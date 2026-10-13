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
 await page.locator('#lysosSearchVolumeOneToolbar button').click();
 await page.waitForFunction(()=>document.documentElement.dataset.appPage==='home');
 assert.equal(await page.locator('#searchBox').inputValue(),'극상근');
 await page.locator('#searchBox').fill('스포츠의학 05권');
 assert.ok((await page.locator('#searchResults').innerText()).includes('세부 위치 이동 미지원'));
 assert.deepEqual(errors,[]);
 console.log('LYSOS GLOBAL ACADEMIC SEARCH E2E PASS | one-tap correct clinical section, wide reader and Back restored');
}finally{await browser.close();}
