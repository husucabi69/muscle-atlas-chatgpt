import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.MUSCLE_ATLAS_BASE_URL||'http://127.0.0.1:4173/';
const url=new URL('ct086-review.html',base).toString();
const browser=await chromium.launch({headless:true});
try{
  for(const width of [390,1280]){
    const page=await browser.newPage({viewport:{width,height:850},isMobile:width===390,hasTouch:width===390});
    const r=await page.goto(url,{waitUntil:'domcontentloaded'});
    if(r.status()!==200)throw Error('REVIEW_PAGE_HTTP_'+r.status());
    const out=await page.evaluate(()=>{
      const cards=[...document.querySelectorAll('[data-ct086-review-panel]')];
      const imgs=cards.map(c=>getComputedStyle(c.querySelector('.view')).backgroundImage);
      const clip=cards.map(c=>getComputedStyle(c.querySelector('.view')).backgroundPosition);
      return{
        title:document.title,
        cards:cards.map(c=>c.getAttribute('data-ct086-review-panel')),
        hasNoApprovalBadge:!!document.querySelector('[data-review-not-approved="ct086"]'),
        hasMedicalCaution:document.body.innerText.includes('교육 정본으로 사용 금지'),
        hasOriginalLink:!!document.querySelector('[data-review-raw-generation="ct086"]'),
        hasSourceImage:imgs.every(x=>x.includes('ct086-imagegen-triptych-review-20261017.png')),
        cropPositions:clip,
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        hasClinicianDetails:!!document.querySelector('[data-review-checklist="ct086"]')
      };
    });
    assert.deepEqual(out.cards,['neutral','rotation','compensation']);
    assert.ok(out.title.includes('ct086'));
    assert.ok(out.hasNoApprovalBadge&&out.hasMedicalCaution&&out.hasOriginalLink&&out.hasSourceImage&&out.hasClinicianDetails);
    assert.ok(out.cropPositions[0].includes('top')||out.cropPositions[0].includes('0%'));
    assert.ok(out.cropPositions[2].includes('bottom')||out.cropPositions[2].includes('100%'));
    assert.ok(out.overflow<=2,'horizontal overflow '+out.overflow);
    const path=new URL('./assets/physical-exam-realistic/drafts/ct086-imagegen-triptych-review-20261017.png',page.url()).toString();
    const img=await page.request.get(path);
    assert.equal(img.status(),200);
    const bytes=await img.body();
    assert.ok(bytes.length>100000);
    assert.ok(bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')));
    fs.mkdirSync('qa-artifacts/ct086-review',{recursive:true});
    await page.screenshot({path:'qa-artifacts/ct086-review/review-'+width+'px.png',fullPage:true});
    await page.close();
    console.log('PASS | ct086 independent review room '+width+'px | three full-size regions, no clinical approval, working PNG, no overflow');
  }
}finally{await browser.close();}
