import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,serviceWorkers:'block'});
 page.setDefaultTimeout(40000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.LYSOSAcademicSearch?.indexedLectures?.length===6);
 await page.locator('#searchTypeFilter').selectOption('academic_section');
 await page.locator('#searchBox').fill('hoffmann');
 assert.ok((await page.locator('#searchResults').innerText()).includes('19번'));
 await page.locator('#searchResults .search-result-main').filter({hasText:'19번'}).first().click();
 await page.waitForFunction(()=>document.getElementById('claudeNativePilotHost')?.dataset.lysosSearchTarget?.startsWith('claude:19:s'),
   null,{timeout:60000});
 const focus=await page.locator('#claudeNativePilotHost').evaluate(p=>{
  const rect=p.getBoundingClientRect();
  return {on:p.classList.contains('claude-native-chapter-focus'),w:rect.width,h:rect.height,sw:innerWidth,sh:innerHeight};
 });
 assert.ok(focus.on&&focus.w>=focus.sw-4&&focus.h>=focus.sh-4,JSON.stringify(focus));
 await page.goBack({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.documentElement.dataset.appPage==='home');
 assert.equal(await page.locator('#searchBox').inputValue(),'hoffmann');
 assert.equal(await page.locator('#searchTypeFilter').inputValue(),'academic_section');
 await page.locator('#searchBox').fill('스포츠의학 05권');
 assert.ok((await page.locator('#searchResults').innerText()).includes('세부 위치 이동 미지원'));
 assert.deepEqual(errors,[]);
 console.log('LYSOS GLOBAL ACADEMIC SEARCH E2E PASS | one-tap correct clinical section, wide reader and Back restored');
}finally{await browser.close();}
