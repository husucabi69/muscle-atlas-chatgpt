import {chromium} from 'playwright';

const base=process.env.MUSCLE_ATLAS_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const fail=(name,detail='')=>{throw new Error('FAIL | '+name+(detail?' | '+detail:''));};
const pass=(name,detail='')=>console.log('PASS | '+name+(detail?' | '+detail:''));

try{
  await page.goto(base,{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>
    clinicalExamIllustrationRegistryData?.coverage?.customized===148 &&
    shoulderExamModule?.clinical_tests?.length===11 &&
    elbowExamModule?.clinical_tests?.length===10 &&
    wristHandExamModule?.clinical_tests?.length===14 &&
    hipPelvisExamModule?.clinical_tests?.length===14 &&
    kneeThighExamModule?.clinical_tests?.length===15 &&
    legAnkleFootExamModule?.clinical_tests?.length===17 &&
    cervicalExamModule?.clinical_tests?.length===17 &&
    thoracicExamModule?.clinical_tests?.length===16 &&
    lumbarSacralExamModule?.clinical_tests?.length===18 &&
    abdominalCoreExamModule?.clinical_tests?.length===16,
    {timeout:12000}
  );

  const batches=await page.evaluate(()=>[
    {moduleKey:'shoulder',ids:shoulderExamModule.clinical_tests.map(x=>x.clinical_test_id)},
    {moduleKey:'elbow',ids:elbowExamModule.clinical_tests.map(x=>x.clinical_test_id)},
    {moduleKey:'wristHand',ids:wristHandExamModule.clinical_tests.map(x=>x.clinical_test_id)},
    {moduleKey:'hipPelvis',ids:hipPelvisExamModule.clinical_tests.map(x=>x.clinical_test_id)},
    {moduleKey:'kneeThigh',ids:kneeThighExamModule.clinical_tests.map(x=>x.clinical_test_id)},
    {moduleKey:'legAnkleFoot',ids:legAnkleFootExamModule.clinical_tests.map(x=>x.clinical_test_id)},
    {moduleKey:'cervical',ids:cervicalExamModule.clinical_tests.map(x=>x.clinical_test_id)},
    {moduleKey:'thoracic',ids:thoracicExamModule.clinical_tests.map(x=>x.clinical_test_id)},
    {moduleKey:'lumbarSacral',ids:lumbarSacralExamModule.clinical_tests.map(x=>x.clinical_test_id)},
    {moduleKey:'abdominalCore',ids:abdominalCoreExamModule.clinical_tests.map(x=>x.clinical_test_id)}
  ]);
  if(batches[0].ids.length!==11)fail('shoulder exam ids',String(batches[0].ids.length));
  if(batches[1].ids.length!==10)fail('elbow exam ids',String(batches[1].ids.length));
  if(batches[2].ids.length!==14)fail('wrist-hand exam ids',String(batches[2].ids.length));
  if(batches[3].ids.length!==14)fail('hip-pelvis exam ids',String(batches[3].ids.length));
  if(batches[4].ids.length!==15)fail('knee-thigh exam ids',String(batches[4].ids.length));
  if(batches[5].ids.length!==17)fail('leg-ankle-foot exam ids',String(batches[5].ids.length));
  if(batches[6].ids.length!==17)fail('cervical exam ids',String(batches[6].ids.length));
  if(batches[7].ids.length!==16)fail('thoracic exam ids',String(batches[7].ids.length));
  if(batches[8].ids.length!==18)fail('lumbar-sacral exam ids',String(batches[8].ids.length));
  if(batches[9].ids.length!==16)fail('abdominal-core exam ids',String(batches[9].ids.length));

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
    const label=batch.moduleKey==='shoulder'?'Shoulder':batch.moduleKey==='elbow'?'Elbow':batch.moduleKey==='wristHand'?'Wrist-hand':batch.moduleKey==='hipPelvis'?'Hip-pelvis':batch.moduleKey==='kneeThigh'?'Knee-thigh':batch.moduleKey==='legAnkleFoot'?'Leg-ankle-foot':batch.moduleKey==='cervical'?'Cervical':batch.moduleKey==='thoracic'?'Thoracic':batch.moduleKey==='lumbarSacral'?'Lumbar-sacral':'Abdominal-core';
    pass(label+' custom clinical exam illustration',id);
    }
  }
  const pendingRealistic=await page.evaluate(()=>physicalExamRealisticAssetsData?.profiles
    ?.filter(p=>p.status==='CANDIDATE_GENERATED_USER_PREVIEW_PENDING'&&p.review?.user_preview==='PENDING'&&p.preview_candidate?.preview_asset_path)
    .map(p=>({id:p.clinical_test_id,url:p.preview_candidate.preview_asset_path}))||[]);
  for(const item of pendingRealistic){
    const result=await page.evaluate(async ({testId})=>{
      await openClinicalModule('cervical',false);
      await openClinicalTopic('exam',false);
      await openClinicalItem(testId,false);
      const host=document.getElementById('clinicalDetailContent');
      const preview=host?.querySelector('[data-exam-realistic-candidate="preview"]');
      const img=preview?.querySelector('img');
      const text=host?.textContent||'';
      if(img&&!img.complete) await new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});});
      return{
        preview:Boolean(preview),
        stable:preview?.getAttribute('data-clinical-test-id')||'',
        src:img?.getAttribute('src')||'',
        naturalWidth:img?.naturalWidth||0,
        hasPendingLabel:text.includes('사용자 승인 대기')||text.includes('승인 전'),
        hasClinicalTeaching:text.includes('임상 해석 · 이 검사를 어떻게 읽을 것인가'),
        overflow:(host?.scrollWidth||0)-(host?.clientWidth||0)
      };
    },{testId:item.id});
    if(!result.preview)fail(item.id+' review candidate visible');
    if(result.stable!==item.id)fail(item.id+' review candidate Stable-ID binding',result.stable);
    if(result.src!==item.url)fail(item.id+' review candidate asset path',result.src);
    if(result.naturalWidth<1)fail(item.id+' review candidate image loads',String(result.naturalWidth));
    if(!result.hasPendingLabel)fail(item.id+' review candidate remains visibly non-canonical');
    if(!result.hasClinicalTeaching)fail(item.id+' review candidate teaching block visible');
    if(result.overflow>2)fail(item.id+' review candidate mobile horizontal overflow',String(result.overflow));
    pass('Pending realistic physical-exam candidate visible for user review',item.id);
  }

  const ct084Teaching=await page.evaluate(async ()=>{
    await openClinicalModule('cervical',false);
    await openClinicalTopic('exam',false);
    await openClinicalItem('ct084',false);
    const host=document.getElementById('clinicalDetailContent');
    const text=host?.textContent||'';
    return{
      text,
      overflow:(host?.scrollWidth||0)-(host?.clientWidth||0)
    };
  });
  for(const label of ['쉽게 이해하기','표준 시행 순서','잘못된 보상 / 기능 저하 패턴','이 검사 하나로 배제할 수 없는 것','다음에 이어서 확인할 검사·판단','진단적 무게']){
    if(!ct084Teaching.text.includes(label))fail('ct084 teaching label '+label);
  }
  if(!ct084Teaching.text.includes('상지 신경가동화검사 1'))fail('ct084 Korean full test name');
  if(!ct084Teaching.text.includes('Upper Limb Neurodynamic Test 1'))fail('ct084 English full test name');
  if(!ct084Teaching.text.includes('0.70')||!ct084Teaching.text.includes('0.71'))fail('ct084 2026 diagnostic accuracy evidence');
  if(ct084Teaching.overflow>2)fail('ct084 teaching mobile horizontal overflow',String(ct084Teaching.overflow));
  pass('ct084 detailed teaching content visible');

  const ct091Teaching=await page.evaluate(async ()=>{
    await openClinicalModule('cervical',false);
    await openClinicalTopic('exam',false);
    await openClinicalItem('ct091',false);
    const host=document.getElementById('clinicalDetailContent');
    return{
      text:host?.textContent||'',
      overflow:(host?.scrollWidth||0)-(host?.clientWidth||0)
    };
  });
  for(const label of ['쉽게 이해하기','표준 시행 순서','잘못된 보상 / 기능 저하 패턴','이 검사 하나로 배제할 수 없는 것','다음에 이어서 확인할 검사·판단','진단적 무게']){
    if(!ct091Teaching.text.includes(label))fail('ct091 teaching label '+label);
  }
  if(!ct091Teaching.text.includes('10초 손 쥐기-펴기 검사'))fail('ct091 Korean test name');
  if(!ct091Teaching.text.includes('10-second grip-and-release test'))fail('ct091 English full test name');
  if(!ct091Teaching.text.includes('완전히 쥐고 완전히 펴'))fail('ct091 full grip-release teaching principle');
  if(ct091Teaching.overflow>2)fail('ct091 teaching mobile horizontal overflow',String(ct091Teaching.overflow));
  pass('ct091 detailed teaching content visible');

  const approvedRealistic=await page.evaluate(()=>physicalExamRealisticAssetsData?.profiles
    ?.filter(p=>p.status==='APPROVED'&&p.review?.user_preview==='PASS'&&p.composite_url)
    .map(p=>({id:p.clinical_test_id,url:p.composite_url}))||[]);
  for(const item of approvedRealistic){
    const result=await page.evaluate(async ({testId})=>{
      await openClinicalModule('cervical',false);
      await openClinicalTopic('exam',false);
      await openClinicalItem(testId,false);
      const host=document.getElementById('clinicalDetailContent');
      const approved=host?.querySelector('[data-exam-realistic-candidate="approved"]');
      const img=approved?.querySelector('img');
      const fallback=host?.querySelector('[data-exam-illustration="custom"]');
      if(img&&!img.complete) await new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});});
      return{
        approved:Boolean(approved),
        stable:approved?.getAttribute('data-clinical-test-id')||'',
        src:img?.getAttribute('src')||'',
        naturalWidth:img?.naturalWidth||0,
        fallback:Boolean(fallback)
      };
    },{testId:item.id});
    if(!result.approved)fail(item.id+' approved realistic asset visible');
    if(result.stable!==item.id)fail(item.id+' approved realistic Stable-ID binding',result.stable);
    if(result.src!==item.url)fail(item.id+' approved realistic asset path',result.src);
    if(result.naturalWidth<1)fail(item.id+' approved realistic image loads',String(result.naturalWidth));
    if(!result.fallback)fail(item.id+' Stable-ID schematic fallback remains available');
    pass('Approved realistic physical-exam asset visible',item.id);
  }
  console.log('\n--- CLINICAL EXAM ILLUSTRATION E2E ---');
  pass('148/148 canonical clinical tests use Stable-ID custom teaching schematics');
}finally{
  await browser.close();
}
