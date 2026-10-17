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
  const draft=host?.querySelector('[data-clinical-visual-draft="ct086"]');
  const url=draft?.getAttribute('href');
  const loaded=url?await fetch(url,{cache:'no-store'}).then(async r=>
    r.ok&&(r.headers.get('content-type')||'').includes('svg')&&
    (await r.text()).includes('<svg')).catch(()=>false):false;
  return{
   draftLinked:!!draft&&url.endsWith('ct086-original-pose-layout-review-20261015.svg'),
   draftServed:loaded,
   draftLabeledAsUnreviewed:(host?.textContent||'').includes('실사형 승인본이 아닙니다'),
   photographicReviewLink:host?.querySelector('[data-clinical-photo-draft="ct086"]')?.getAttribute('href'),
   originalProofLink:host?.querySelector('[data-clinical-photo-original="ct086"]')?.getAttribute('href'),
   photographicDraftUnapproved:(host?.textContent||'').includes('실사형 승인본이나 환자교육 정본이 아닙니다'),
   note:!!host?.querySelector('[data-exam-realistic-provider-blocked="ct086"]'),
   unverified:!!host?.querySelector('[data-exam-realistic-candidate]'),
   schematic:!!host?.querySelector('[data-exam-illustration="custom"]'),
   clinicalText:(host?.textContent||'').includes('경추 회전'),
   honestProviderState:(host?.textContent||'').includes('제작 경로 변경 중'),
   overflow:(host?.scrollWidth||0)-(host?.clientWidth||0)
  };
 });
 const validateReviewPNG=async url=>{
  if(!url||!url.startsWith('./assets/physical-exam-realistic/drafts/'))return false;
  const response=await page.request.get(new URL(url,page.url()).toString());
  const bytes=await response.body();
  return response.status()===200&&bytes.length>100_000&&
   bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'));
 };
 const photoReviewOK=await validateReviewPNG(actual.photographicReviewLink);
 const originalReviewOK=await validateReviewPNG(actual.originalProofLink);
 if(!actual.note||actual.unverified||!actual.schematic||!actual.clinicalText||!actual.honestProviderState||!actual.draftLinked||!actual.draftServed||!actual.draftLabeledAsUnreviewed||!actual.photographicDraftUnapproved||!photoReviewOK||!originalReviewOK||actual.overflow>2)
  throw Error('CT086 MOBILE SAFETY FAIL '+JSON.stringify(actual));
 fs.mkdirSync('qa-artifacts/ct086-mobile',{recursive:true});
 await page.screenshot({path:'qa-artifacts/ct086-mobile/pending-390px.png',fullPage:true});
 console.log('CT086 MOBILE 390px PASS | existing schematic + working photographic/schematic review links; source PNG bytes confirmed; no banned candidate');
}finally{await browser.close();}
