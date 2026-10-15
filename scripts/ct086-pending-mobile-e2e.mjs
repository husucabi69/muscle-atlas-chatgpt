import fs from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.goto(process.env.MUSCLE_ATLAS_BASE_URL||'http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>typeof openClinicalItem==='function'&&
  physicalExamRealisticAssetsData?.profiles?.some(x=>x.clinical_test_id==='ct086'),{timeout:15000});
 const actual=await page.evaluate(async()=>{
  await openClinicalModule('cervical',false);
  await openClinicalTopic('exam',false);
  await openClinicalItem('ct086',false);
  const host=document.getElementById('clinicalDetailContent');
  return{
   note:!!host?.querySelector('[data-exam-realistic-provider-blocked="ct086"]'),
   unverified:!!host?.querySelector('[data-exam-realistic-candidate]'),
   schematic:!!host?.querySelector('[data-exam-illustration="custom"]'),
   clinicalText:(host?.textContent||'').includes('경추 회전'),
   honestProviderState:(host?.textContent||'').includes('제작 경로 변경 중'),
   overflow:(host?.scrollWidth||0)-(host?.clientWidth||0)
  };
 });
 if(!actual.note||actual.unverified||!actual.schematic||!actual.clinicalText||!actual.honestProviderState||actual.overflow>2)
  throw Error('CT086 MOBILE SAFETY FAIL '+JSON.stringify(actual));
 fs.mkdirSync('qa-artifacts/ct086-mobile',{recursive:true});
 await page.screenshot({path:'qa-artifacts/ct086-mobile/pending-390px.png',fullPage:true});
 console.log('CT086 MOBILE 390px PASS | existing schematic; image provider prohibition clearly displayed; no banned candidate');
}finally{await browser.close();}
