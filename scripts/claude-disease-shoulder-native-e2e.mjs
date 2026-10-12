// User-requested 87-course migration, first pilot #28 shoulder disease.
// Real Chromium on a 390px Android-size viewport, only local safe fixture.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {chromium} from 'playwright';
const manifest=JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json','utf8'));
const item=manifest.lectures.find(x=>x.number===28);
assert.ok(item&&item.series==='질환·외상');
const source=fs.readFileSync('claude-library/'+item.source_path);
assert.equal(source.byteLength,item.source_bytes,'pilot source bytes unchanged');
assert.equal(crypto.createHash('sha256').update(source).digest('hex'),item.source_sha256,'pilot source SHA unchanged');
const sourceHtml=source.toString('utf8');
for(const [name,re,count] of [
 ['sections',/<section\b/g,10],['speaking paragraphs',/\bdata-i="/g,103],
 ['tables',/<table\b/g,3],['figures',/<figure\b/g,9],['images',/<img\b/g,6]
])assert.equal((sourceHtml.match(re)||[]).length,count,'original '+name+' fidelity');
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:1,serviceWorkers:'block'});
 const page=await context.newPage();page.setDefaultTimeout(35000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.locator('.tab[data-page="diseaseTrauma"]').click();
 await page.waitForFunction(()=>document.querySelectorAll('[data-claude-academic-category]').length===10);
 let found=false;
 for(let i=0;i<10;i++){
   await page.locator('[data-claude-academic-category="'+i+'"]').click();
   const course=page.locator('[data-claude-academic-lecture="28"]');
   if(await course.count()){await course.click();found=true;break;}
   await page.locator('#diseaseTraumaCategoryView .region-back').click();
 }
 assert.equal(found,true,'shoulder disease 01 must be reachable from course listing');
 await page.waitForFunction(()=>{
   const panel=document.getElementById('claudeNativePilotHost');
   return !panel?.hidden&&panel.dataset.claudeNativeLecture==='28'&&
     !!panel.querySelector('.claude-native-lesson')?.shadowRoot&&
     !!panel.querySelector('[data-native-audio="play"]');
 },null,{timeout:40000});
 const getState=()=>page.evaluate(()=>{
   const p=document.getElementById('claudeNativePilotHost'),shadow=p.querySelector('.claude-native-lesson').shadowRoot;
   const chapter=shadow.getElementById('s2'),r=p.getBoundingClientRect();
   return {className:p.className,layout:p.dataset.claudeNativeLayout,
     sections:shadow.querySelectorAll('section').length,table:shadow.querySelectorAll('table').length,
     figures:shadow.querySelectorAll('figure').length,images:shadow.querySelectorAll('img').length,
     markers:shadow.querySelectorAll('[data-i]').length,
     sourceText:shadow.textContent.length,
     chapterText:chapter?.querySelector('.sechead h1')?.textContent||'',
     chapterTop:chapter?.getBoundingClientRect().top,
     panelTop:r.top,panelW:r.width,panelH:r.height,screenW:innerWidth,screenH:innerHeight,
     scrollArea:getComputedStyle(p).overflowY,
     tabHidden:getComputedStyle(document.querySelector('.header .tabs')).display,
     fullView:p.classList.contains('claude-native-chapter-focus'),
     focusBarVisible:!p.querySelector('.claude-native-chapter-focusbar')?.hidden,
     audioVisible:p.querySelector('.claude-native-audio')?.getBoundingClientRect().height>0,
     htmlOverflow:document.documentElement.style.overflow,
     voiceOpen:p.classList.contains('claude-native-chapter-voice-open')};
 });
 const initial=await getState();
 assert.equal(initial.layout,'IMMERSIVE_CHAPTER_PILOT');
 assert.deepEqual([initial.sections,initial.table,initial.figures,initial.images,initial.markers],[10,3,9,6,103]);
 assert.ok(initial.sourceText>10000,'complete source imported, not a synopsis');
 assert.equal(initial.fullView,false,'initial outline is readable before chapter selection');
 const select=page.locator('#claudeNativePilotHost .claude-native-navbar select');
 await select.selectOption('s2');
 await page.waitForFunction(()=>document.getElementById('claudeNativePilotHost')?.classList.contains('claude-native-chapter-focus'));
 const chapter=await getState();
 assert.ok(chapter.fullView&&chapter.focusBarVisible,'one tap opens full reader');
 assert.ok(chapter.panelW>=chapter.screenW-4&&chapter.panelH>=chapter.screenH-4,'reader fills phone: '+JSON.stringify(chapter));
 assert.equal(chapter.scrollArea,'auto','a single viewport reader scroll');
 assert.equal(chapter.htmlOverflow,'hidden','background app no longer scrolls');
 assert.ok(chapter.chapterText.includes('Calcific'),'selected shoulder disease chapter is unchanged');
 assert.ok(chapter.chapterTop>=90&&chapter.chapterTop<=300,'selected section appears directly below reader controls: '+JSON.stringify(chapter));
 fs.mkdirSync('qa-artifacts/claude-original-classroom',{recursive:true});
 await page.screenshot({path:'qa-artifacts/claude-original-classroom/shoulder-disease28-immersive.png'});
 await page.locator('#claudeNativePilotHost .claude-native-chapter-focusbar button').nth(1).click();
 const voice=await getState();
 assert.ok(voice.voiceOpen&&voice.audioVisible,'voice remains reachable without losing focused source');
 await page.locator('#claudeNativePilotHost .claude-native-chapter-focusbar button').first().click();
 const back=await getState();
 assert.ok(!back.fullView&&back.htmlOverflow!=='hidden','leave full view restores app safely');
 await page.locator('#diseaseTraumaOriginalView .region-back').click();
 await page.waitForFunction(()=>document.getElementById('diseaseTraumaCategoryView')&&!document.getElementById('diseaseTraumaCategoryView').hidden);
 assert.deepEqual(errors,[],'no browser script errors');
 console.log('PASS | Shoulder Disease #28: original SHA + 10 sections / 103 segments / 3 tables / 9 figures / 6 images; one-tap phone immersive chapter, voice, back, category');
 await context.close();
}finally{await browser.close()}
