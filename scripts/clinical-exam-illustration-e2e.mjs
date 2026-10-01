import {chromium} from 'playwright';

const base=process.env.MUSCLE_ATLAS_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const fail=(name,detail='')=>{throw new Error('FAIL | '+name+(detail?' | '+detail:''));};
const pass=(name,detail='')=>console.log('PASS | '+name+(detail?' | '+detail:''));

try{
  await page.goto(base,{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>
    clinicalExamIllustrationRegistryData?.coverage?.customized===21 &&
    shoulderExamModule?.clinical_tests?.length===11 &&
    elbowExamModule?.clinical_tests?.length===10,
    {timeout:12000}
  );

  const batches=await page.evaluate(()=>[
    {moduleKey:'shoulder',ids:shoulderExamModule.clinical_tests.map(x=>x.clinical_test_id)},
    {moduleKey:'elbow',ids:elbowExamModule.clinical_tests.map(x=>x.clinical_test_id)}
  ]);
  if(batches[0].ids.length!==11)fail('shoulder exam ids',String(batches[0].ids.length));
  if(batches[1].ids.length!==10)fail('elbow exam ids',String(batches[1].ids.length));

  for(const batch of batches){
    for(const id of batch.ids){
    const result=await page.evaluate(async ({testId,moduleKey})=>{
      await openClinicalModule(moduleKey,false);
      await openClinicalTopic('exam',false);
      await openClinicalItem(testId,false);
      const host=document.getElementById('clinicalDetailContent');
      const visual=host?.querySelector('[data-exam-illustration="custom"]');
      const svg=visual?.querySelector('svg');
      const text=host?.textContent||'';
      return{
        custom:Boolean(visual),
        stable:visual?.getAttribute('data-clinical-test-id')||'',
        svg:Boolean(svg),
        aria:svg?.getAttribute('aria-label')||'',
        stepCount:visual?.querySelectorAll('.clinical-exam-step').length||0,
        text,
        overflow:(host?.scrollWidth||0)-(host?.clientWidth||0)
      };
    },{testId:id,moduleKey:batch.moduleKey});

    if(!result.custom)fail(id+' custom illustration visible');
    if(result.stable!==id)fail(id+' stable-id binding',result.stable);
    if(!result.svg||!result.aria.includes('검사별 시행 도해'))fail(id+' accessible custom svg',result.aria);
    if(result.stepCount!==3)fail(id+' start/action/positive teaching steps',String(result.stepCount));
    for(const label of ['검사자 위치 · 손 위치','힘의 방향:','시행 오류:','양성 기준','임상 해석','연결 감별진단']){
      if(!result.text.includes(label))fail(id+' detail label '+label);
    }
    if(result.overflow>2)fail(id+' mobile horizontal overflow',String(result.overflow));
    pass((batch.moduleKey==='shoulder'?'Shoulder':'Elbow')+' custom clinical exam illustration',id);
    }
  }
  console.log('\n--- CLINICAL EXAM ILLUSTRATION E2E ---');
  pass('21/21 shoulder + elbow tests use Stable-ID custom teaching schematics');
}finally{
  await browser.close();
}
