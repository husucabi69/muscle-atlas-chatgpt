import { chromium } from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({
  viewport:{width:390,height:844},
  locale:'ko-KR'
});
const page=await context.newPage();

const pageErrors=[];
const consoleErrors=[];
page.on('pageerror',e=>pageErrors.push(String(e?.stack||e)));
page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text());});

function fail(message,detail=''){
  console.error('FAIL | '+message+(detail?' | '+detail:''));
  throw new Error(message+(detail?' | '+detail:''));
}
function pass(message,detail=''){
  console.log('PASS | '+message+(detail?' | '+detail:''));
}
async function visible(selector){
  const loc=page.locator(selector);
  if(await loc.count()!==1)return false;
  return await loc.isVisible();
}

try{
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.querySelectorAll('#regionChooser .region-choice').length>0,{timeout:20000});
  pass('App loads and anatomy region chooser is populated',String(await page.locator('#regionChooser .region-choice').count()));

  await page.locator('.tab[data-page="regions"]').click();
  await page.waitForTimeout(100);
  if(!await visible('#regionChooserView'))fail('Anatomy root view visible after tab entry');

  const regions=await page.locator('#regionChooser .region-choice').evaluateAll(btns=>btns.map(b=>({
    label:b.querySelector('b')?.textContent?.trim()||'',
    expected:Number((b.querySelector('small')?.textContent||'').match(/(\d+)/)?.[1]||0)
  })));
  if(regions.length<10)fail('Anatomy region count unexpectedly small',String(regions.length));
  pass('Anatomy region buttons captured',String(regions.length));

  for(const region of regions){
    const choice=page.locator('#regionChooser .region-choice').filter({has:page.locator('b',{hasText:region.label})}).first();
    await choice.click();
    await page.waitForTimeout(60);

    if(!await visible('#regionMusclesView')){
      const diag=await page.evaluate(()=>({
        activePages:[...document.querySelectorAll('.page.active')].map(x=>x.id),
        rootHidden:document.getElementById('regionChooserView')?.hidden,
        rootDisplay:getComputedStyle(document.getElementById('regionChooserView')).display,
        musclesHidden:document.getElementById('regionMusclesView')?.hidden,
        musclesDisplay:getComputedStyle(document.getElementById('regionMusclesView')).display,
        muscleCount:document.querySelectorAll('#selectedRegionList .region-muscle').length,
        title:document.getElementById('selectedRegionTitle')?.textContent||'',
        countText:document.getElementById('selectedRegionCount')?.textContent||'',
        drillGroup:document.documentElement.dataset.activeDrillGroup||'',
        drillView:document.documentElement.dataset.activeDrillView||'',
        page:document.documentElement.dataset.appPage||'',
        targetRect:(()=>{
          const el=document.getElementById('regionMusclesView'),r=el?.getBoundingClientRect();
          return r?{x:r.x,y:r.y,width:r.width,height:r.height}:null;
        })(),
        targetVisibility:getComputedStyle(document.getElementById('regionMusclesView')).visibility,
        targetOpacity:getComputedStyle(document.getElementById('regionMusclesView')).opacity,
        ancestors:(()=>{
          const rows=[];let el=document.getElementById('regionMusclesView');
          while(el&&rows.length<8){
            const cs=getComputedStyle(el),r=el.getBoundingClientRect();
            rows.push({tag:el.tagName,id:el.id||'',class:el.className||'',hidden:!!el.hidden,display:cs.display,visibility:cs.visibility,opacity:cs.opacity,width:r.width,height:r.height});
            el=el.parentElement;
          }
          return rows;
        })()
      }));
      console.error('DIAG | '+JSON.stringify(diag));
      if(pageErrors.length)console.error('PAGEERRORS | '+pageErrors.join(' || '));
      if(consoleErrors.length)console.error('CONSOLEERRORS | '+consoleErrors.join(' || '));
      fail('Region muscle screen is visible',region.label);
    }
    if(await visible('#regionChooserView'))fail('Region chooser must be hidden after selection',region.label);
    const rootInvariant=await page.evaluate(()=>({
      hidden:document.documentElement.hidden,
      drillGroupAttr:document.documentElement.hasAttribute('data-drill-group'),
      drillViewAttr:document.documentElement.hasAttribute('data-drill-view'),
      activeGroup:document.documentElement.dataset.activeDrillGroup||'',
      activeView:document.documentElement.dataset.activeDrillView||''
    }));
    if(rootInvariant.hidden)fail('HTML root must never be hidden by drill navigation',region.label);
    if(rootInvariant.drillGroupAttr||rootInvariant.drillViewAttr)fail('HTML root must not be registered as a drill screen',JSON.stringify(rootInvariant));
    if(rootInvariant.activeGroup!=='anatomy'||rootInvariant.activeView!=='muscles')fail('Runtime drill state matches anatomy muscles',JSON.stringify(rootInvariant));

    const title=(await page.locator('#selectedRegionTitle').textContent()||'').trim();
    const count=await page.locator('#selectedRegionList .region-muscle').count();
    if(title!==region.label)fail('Selected region title matches clicked region',region.label+' -> '+title);
    if(count!==region.expected)fail('Rendered muscle count matches region chooser count',region.label+' expected='+region.expected+' actual='+count);
    if(count===0)fail('Region contains visible muscle cards',region.label);

    const first=page.locator('#selectedRegionList .region-muscle').first();
    const firstName=(await first.locator('b').textContent()||'').trim();
    await first.click();
    await page.waitForTimeout(60);

    if(!await visible('#regionDetailView'))fail('v11.14 muscle detail visible',region.label+' / '+firstName);

    const tabs=page.locator('#regionDetailView .anatomy-detail-tabs .anatomy-detail-tab');
    if(await tabs.count()!==5)fail('v11.14 muscle detail has five horizontal tabs',region.label+' / '+firstName);
    const labels=(await tabs.allTextContents()).map(x=>x.trim());
    const expectedLabels=['기본정보','해부도해','초음파','임상','심화·학습'];
    if(JSON.stringify(labels)!==JSON.stringify(expectedLabels))fail('v11.14 tab labels preserved',region.label+' / '+JSON.stringify(labels));

    const active=page.locator('#regionDetailView .anatomy-detail-tabs .anatomy-detail-tab.active');
    if(await active.count()!==1)fail('Exactly one default anatomy tab active',region.label+' / '+firstName);
    if(await active.getAttribute('data-anatomy-detail-tab')!=='basic')fail('Basic tab active immediately on muscle open',region.label+' / '+firstName);

    const basicText=(await page.locator('#regionMuscleDetailContent').textContent()||'').trim();
    for(const label of ['Origin · 기시','Insertion · 정지','Function · 기능','Nerve · 신경지배','Blood supply · 혈액공급','촉지법','임상 중요점','초음파 핵심']){
      if(!basicText.includes(label))fail('Default basic detail contains '+label,region.label+' / '+firstName);
    }
    if(await page.locator('#regionDetailView .drill-menu-item').count()!==0)fail('No vertical learning-menu cards in anatomy detail',region.label+' / '+firstName);
    if(await page.locator('#regionDeepView').count()!==0)fail('No extra anatomy deep screen',region.label+' / '+firstName);

    const topics=['anatomy','ultrasound','clinical','learning','basic'];
    for(const topic of topics){
      const historyBefore=await page.evaluate(()=>history.length);
      await page.locator('#regionDetailView .anatomy-detail-tabs .anatomy-detail-tab[data-anatomy-detail-tab="'+topic+'"]').click();
      await page.waitForTimeout(60);
      if(!await visible('#regionDetailView'))fail('Tab content stays in same muscle detail screen',region.label+' / '+topic);
      const selected=page.locator('#regionDetailView .anatomy-detail-tabs .anatomy-detail-tab.active');
      if(await selected.count()!==1||await selected.getAttribute('data-anatomy-detail-tab')!==topic)fail('Selected tab active',region.label+' / '+topic);
      const detailText=(await page.locator('#regionMuscleDetailContent').textContent()||'').trim();
      if(!detailText)fail('Selected tab renders content',region.label+' / '+topic);
      const historyAfter=await page.evaluate(()=>history.length);
      if(historyAfter!==historyBefore)fail('Tab switch must not add hierarchy history entry',region.label+' / '+topic);
    }

    await page.goBack();
    await page.waitForFunction(()=>!document.querySelector('#regionMusclesView')?.hidden,{timeout:3000});
    if(!await visible('#regionMusclesView'))fail('Browser back returns to region muscle list',region.label);

    await page.goBack();
    await page.waitForFunction(()=>!document.querySelector('#regionChooserView')?.hidden,{timeout:3000});
    if(!await visible('#regionChooserView'))fail('Browser back returns to anatomy regions',region.label);

    pass('Anatomy drill flow',region.label+' / '+count+' muscles');
  }

  await page.locator('.tab[data-page="clinical"]').click();
  await page.waitForFunction(()=>!document.querySelector('#clinicalRootView')?.hidden,{timeout:3000});
  if(!await visible('#clinicalRootView'))fail('Clinical module root visible after tab entry');

  const clinicalModules=await page.locator('#clinicalModuleChooser .clinical-module-choice').evaluateAll(btns=>btns.map(b=>({
    key:b.dataset.clinicalModule||'',
    label:(b.querySelector('b')?.textContent||'').trim()
  })));
  if(clinicalModules.length!==10)fail('Clinical module chooser count = 10',String(clinicalModules.length));
  pass('Clinical module buttons captured',String(clinicalModules.length));

  for(const mod of clinicalModules){
    await page.locator('#clinicalModuleChooser .clinical-module-choice[data-clinical-module="'+mod.key+'"]').click();
    await page.waitForFunction(()=>!document.querySelector('#clinicalMenuView')?.hidden,{timeout:5000});
    if(!await visible('#clinicalMenuView'))fail('Clinical module menu visible',mod.label);

    const topicButtons=page.locator('#clinicalModuleMenu .drill-menu-item[data-clinical-topic]');
    if(await topicButtons.count()!==3)fail('Clinical module has three topic choices',mod.label);
    const topicKeys=await topicButtons.evaluateAll(btns=>btns.map(b=>b.dataset.clinicalTopic));
    if(JSON.stringify(topicKeys)!==JSON.stringify(['differential','exam','ultrasound']))fail('Clinical topic order preserved',mod.label+' / '+JSON.stringify(topicKeys));

    for(const topic of topicKeys){
      await page.locator('#clinicalModuleMenu [data-clinical-topic="'+topic+'"]').click();
      await page.waitForFunction(()=>!document.querySelector('#clinicalListView')?.hidden,{timeout:5000});
      if(!await visible('#clinicalListView'))fail('Clinical topic list visible',mod.label+' / '+topic);
      await page.waitForFunction(([key,t])=>typeof clinicalTopicItems==='function'&&clinicalTopicItems(key,t).length>0,[mod.key,topic],{timeout:10000});

      const expected=await page.evaluate(([key,t])=>clinicalTopicItems(key,t).length,[mod.key,topic]);
      const items=page.locator('#clinicalItemList .clinical-item');
      const actual=await items.count();
      if(actual!==expected)fail('Clinical list count matches module data',mod.label+' / '+topic+' expected='+expected+' actual='+actual);
      const first=items.first();
      const itemId=await first.getAttribute('data-clinical-item');
      const itemTitle=(await first.locator('b').textContent()||'').trim();
      await first.click();
      await page.waitForFunction(()=>!document.querySelector('#clinicalDetailView')?.hidden,{timeout:5000});
      if(!await visible('#clinicalDetailView'))fail('Clinical single-item detail visible',mod.label+' / '+topic+' / '+itemTitle);
      if(await visible('#clinicalListView'))fail('Clinical list hidden while detail visible',mod.label+' / '+topic);
      const detailText=(await page.locator('#clinicalDetailContent').textContent()||'').trim();
      if(!detailText)fail('Clinical detail content non-empty',mod.label+' / '+topic+' / '+itemId);
      const requiredByTopic={
        differential:['지지 단서','반대·제한 단서','Red flag / 안전 경계'],
        exam:['목적','방법','양성 기준','해석','한계 / 흔한 오류','Stable ID'],
        ultrasound:['환자 자세','Probe 위치·방향','Landmark','정상 확인','Pitfall / 주의','Stable ID']
      };
      for(const required of requiredByTopic[topic]||[]){
        if(!detailText.includes(required))fail('Clinical detail required field: '+required,mod.label+' / '+topic+' / '+itemId);
      }
      if(topic==='exam'){
        if(await page.locator('#clinicalDetailContent .clinical-exam-visual svg').count()!==1){
          fail('Clinical exam detail includes one maneuver illustration',mod.label+' / '+itemId);
        }
        const stepCards=await page.locator('#clinicalDetailContent .clinical-exam-step').count();
        if(stepCards!==3)fail('Clinical exam illustration has start/action/positive steps',mod.label+' / '+itemId+' / '+stepCards);
      }
      if(topic==='differential'){
        const candidates=page.locator('#clinicalDetailContent .diagnosis-candidate');
        if(await candidates.count()<1)fail('Clinical differential exposes clickable candidate details',mod.label+' / '+itemId);
        const firstCandidate=candidates.first();
        await firstCandidate.locator('summary').click();
        if(!await firstCandidate.evaluate(el=>el.open))fail('Clinical differential candidate expands on click',mod.label+' / '+itemId);
        const expandedText=(await firstCandidate.textContent()||'').trim();
        if(!expandedText.includes('지지 단서')||!expandedText.includes('반대·제한 단서'))fail('Expanded differential retains reasoning clues',mod.label+' / '+itemId);
      }

      const drill=await page.evaluate(()=>({
        group:document.documentElement.dataset.activeDrillGroup||'',
        view:document.documentElement.dataset.activeDrillView||'',
        hidden:document.documentElement.hidden
      }));
      if(drill.hidden||drill.group!=='clinical'||drill.view!=='detail')fail('Clinical runtime drill state is detail',JSON.stringify(drill));

      await page.goBack();
      await page.waitForFunction(()=>!document.querySelector('#clinicalListView')?.hidden,{timeout:5000});
      if(!await visible('#clinicalListView'))fail('Browser back returns clinical detail to list',mod.label+' / '+topic);

      await page.goBack();
      await page.waitForFunction(()=>!document.querySelector('#clinicalMenuView')?.hidden,{timeout:5000});
      if(!await visible('#clinicalMenuView'))fail('Browser back returns clinical list to module menu',mod.label+' / '+topic);
    }

    await page.goBack();
    await page.waitForFunction(()=>!document.querySelector('#clinicalRootView')?.hidden,{timeout:5000});
    if(!await visible('#clinicalRootView'))fail('Browser back returns clinical module menu to root',mod.label);
    pass('Clinical drill flow',mod.label);
  }

  await page.locator('.tab[data-page="ultrasound"]').click();
  await page.waitForFunction(()=>!document.querySelector('#ultrasoundAtlasRootView')?.hidden,{timeout:5000});
  if(!await visible('#ultrasoundAtlasRootView'))fail('A6 ultrasound root visible after tab entry');

  const ultrasoundModules=await page.locator('#ultrasoundAtlasRegionChooser .ultrasound-atlas-region').evaluateAll(btns=>btns.map(b=>({
    key:b.dataset.ultrasoundModule||'',
    label:(b.querySelector('b')?.textContent||'').trim()
  })));
  if(ultrasoundModules.length!==10)fail('A6 ultrasound region count = 10',String(ultrasoundModules.length));
  let ultrasoundViewTotal=0;

  for(const mod of ultrasoundModules){
    const expected=await page.evaluate(key=>ultrasoundAtlasViewsForModule(key).length,mod.key);
    if(expected<=0)fail('A6 ultrasound module has canonical views',mod.label);
    ultrasoundViewTotal+=expected;

    await page.locator('#ultrasoundAtlasRegionChooser .ultrasound-atlas-region[data-ultrasound-module="'+mod.key+'"]').click();
    await page.waitForFunction(()=>!document.querySelector('#ultrasoundAtlasListView')?.hidden,{timeout:7000});
    if(!await visible('#ultrasoundAtlasListView'))fail('A6 canonical view list visible',mod.label);
    if(await visible('#ultrasoundAtlasRootView'))fail('A6 root hidden while view list visible',mod.label);

    const views=page.locator('#ultrasoundAtlasViewList .ultrasound-atlas-view');
    const actual=await views.count();
    if(actual!==expected)fail('A6 canonical view list count matches module data',mod.label+' expected='+expected+' actual='+actual);
    const structureText=(await page.locator('#ultrasoundAtlasStructureSummary').textContent()||'').trim();
    if(!structureText.includes('연결 구조'))fail('A6 region exposes structure summary',mod.label);

    const first=views.first();
    const viewId=await first.getAttribute('data-ultrasound-view');
    const viewTitle=(await first.locator('b').textContent()||'').trim();
    await first.click();
    await page.waitForFunction(()=>!document.querySelector('#ultrasoundAtlasDetailView')?.hidden,{timeout:7000});
    if(!await visible('#ultrasoundAtlasDetailView'))fail('A6 single ultrasound view detail visible',mod.label+' / '+viewTitle);
    if(await visible('#ultrasoundAtlasListView'))fail('A6 view list hidden while detail visible',mod.label);

    const detailText=(await page.locator('#ultrasoundAtlasDetailContent').textContent()||'').trim();
    for(const required of ['환자 자세','Probe 위치·방향','Landmark','정상 확인','Pitfall / 주의','Stable ID']){
      if(!detailText.includes(required))fail('A6 ultrasound detail required field: '+required,mod.label+' / '+viewId);
    }
    if(!detailText.includes(viewId||''))fail('A6 ultrasound detail preserves Stable ID',mod.label+' / '+viewId);

    const drill=await page.evaluate(()=>({
      page:document.documentElement.dataset.appPage||'',
      group:document.documentElement.dataset.activeDrillGroup||'',
      view:document.documentElement.dataset.activeDrillView||'',
      hidden:document.documentElement.hidden
    }));
    if(drill.hidden||drill.page!=='ultrasound'||drill.group!=='ultrasound'||drill.view!=='detail'){
      fail('A6 runtime drill state is ultrasound detail',mod.label+' / '+JSON.stringify(drill));
    }

    await page.goBack();
    await page.waitForFunction(()=>!document.querySelector('#ultrasoundAtlasListView')?.hidden,{timeout:5000});
    if(!await visible('#ultrasoundAtlasListView'))fail('A6 browser back detail to view list',mod.label);

    await page.goBack();
    await page.waitForFunction(()=>!document.querySelector('#ultrasoundAtlasRootView')?.hidden,{timeout:5000});
    if(!await visible('#ultrasoundAtlasRootView'))fail('A6 browser back view list to root',mod.label);
    pass('A6 ultrasound drill flow',mod.label+' / '+expected+' views');
  }
  if(ultrasoundViewTotal!==131)fail('A6 canonical ultrasound total = 131',String(ultrasoundViewTotal));
  pass('A6 canonical ultrasound total',String(ultrasoundViewTotal));

  await page.locator('.tab[data-page="quiz"]').click();
  await page.waitForFunction(()=>!document.querySelector('#quizSetupView')?.hidden,{timeout:5000});
  if(!await visible('#quizSetupView'))fail('A7 quiz setup visible after tab entry');
  if(await page.locator('#quizClinicalModuleChooser .clinical-quiz-start').count()!==10)fail('A7 clinical quiz module starter count = 10');

  await page.locator('#quizRegion').selectOption({label:'경추·후두하부'});
  await page.locator('#quizType').selectOption('origin');
  await page.locator('#quizDirection').selectOption('forward');
  await page.locator('#quizSetupView button').filter({hasText:'새 10문제 시작'}).click();
  await page.waitForFunction(()=>!document.querySelector('#quizSessionView')?.hidden,{timeout:5000});
  if(!await visible('#quizSessionView'))fail('A7 quiz session visible after start');
  if(await visible('#quizSetupView'))fail('A7 setup hidden during session');
  if(await page.locator('#quizArea .quiz-option').count()!==4)fail('A7 quiz question exposes four options');

  const expectedSessionLength=await page.evaluate(()=>quizSession.length);
  if(expectedSessionLength<1||expectedSessionLength>10)fail('A7 quiz session length valid',String(expectedSessionLength));
  for(let i=0;i<expectedSessionLength;i++){
    const options=page.locator('#quizArea .quiz-option');
    if(await options.count()!==4)fail('A7 question keeps four options','question '+(i+1));
    await options.first().click();
    const feedback=(await page.locator('#quizFeedback').textContent()||'').trim();
    if(!feedback)fail('A7 answer feedback visible','question '+(i+1));
    const next=page.locator('#quizNext');
    if(!await next.isVisible())fail('A7 next button visible after answer','question '+(i+1));
    await next.click();
    if(i<expectedSessionLength-1){
      await page.waitForFunction(()=>!document.querySelector('#quizSessionView')?.hidden,{timeout:3000});
    }
  }
  await page.waitForFunction(()=>!document.querySelector('#quizResultView')?.hidden,{timeout:5000});
  if(!await visible('#quizResultView'))fail('A7 result screen visible after session');
  if(await visible('#quizSessionView'))fail('A7 session hidden on result screen');
  const resultText=(await page.locator('#quizResultContent').textContent()||'').trim();
  if(!resultText.includes('완료'))fail('A7 result includes completion score',resultText);
  if(!resultText.includes('새 세션 설정'))fail('A7 result exposes new-session action',resultText);

  await page.goBack();
  await page.waitForFunction(()=>!document.querySelector('#quizSetupView')?.hidden,{timeout:5000});
  if(!await visible('#quizSetupView'))fail('A7 browser back result to setup');

  await page.locator('#quizClinicalModuleChooser [data-quiz-module="cervical"]').click();
  await page.waitForFunction(()=>!document.querySelector('#quizSessionView')?.hidden,{timeout:7000});
  if(!await visible('#quizSessionView'))fail('A7 cervical clinical quiz enters common session');
  const quizCrumb=(await page.locator('#quizSessionBreadcrumb').textContent()||'').trim();
  if(!quizCrumb.includes('경추 임상'))fail('A7 clinical quiz session label preserved',quizCrumb);
  if(await page.locator('#quizArea .quiz-option').count()!==4)fail('A7 clinical quiz exposes four options');
  await page.goBack();
  await page.waitForFunction(()=>!document.querySelector('#quizSetupView')?.hidden,{timeout:5000});
  if(!await visible('#quizSetupView'))fail('A7 browser back clinical session to setup');
  pass('A7 quiz setup/session/result hierarchy');

  await page.locator('.tab[data-page="oral"]').click();
  await page.waitForFunction(()=>!document.querySelector('#oralSetupView')?.hidden,{timeout:5000});
  if(!await visible('#oralSetupView'))fail('A8 Oral setup visible after tab entry');
  if(await visible('#oralSessionView'))fail('A8 Oral session hidden on setup');
  if(await page.locator('#oralRegion').count()!==1||await page.locator('#oralLevel').count()!==1||await page.locator('#oralField').count()!==1)fail('A8 Oral setup controls present');

  await page.locator('#oralRegion').selectOption({label:'경추·후두하부'});
  await page.locator('#oralLevel').selectOption('colleague');
  await page.locator('#oralField').selectOption('anatomy');
  await page.locator('#oralSetupView button').filter({hasText:'10문제 시작'}).click();
  await page.waitForFunction(()=>!document.querySelector('#oralSessionView')?.hidden,{timeout:5000});
  if(!await visible('#oralSessionView'))fail('A8 Oral session visible after start');
  if(await visible('#oralSetupView'))fail('A8 Oral setup hidden during session');

  let oralSafety=0;
  let forcedWrong=false;
  while(await visible('#oralSessionView')){
    oralSafety++;
    if(oralSafety>30)fail('A8 Oral session terminates','loop > 30');
    const textarea=page.locator('#oralAnswer');
    if(await textarea.count()!==1)fail('A8 Oral answer box visible','step '+oralSafety);
    if(!forcedWrong){
      await textarea.fill('');
      forcedWrong=true;
    }else{
      const canonical=await page.evaluate(()=>oralSession[oralIndex]?.targets?.map(t=>t.expected).filter(Boolean).join(' ; ')||'');
      if(!canonical)fail('A8 canonical answer available','step '+oralSafety);
      await textarea.fill(canonical);
    }
    await page.locator('#oralArea button').filter({hasText:'채점·교정'}).click();
    const coach=(await page.locator('#oralCoach').textContent()||'').trim();
    if(!coach)fail('A8 examiner feedback visible','step '+oralSafety);

    const repair=page.locator('#oralCoach button').filter({hasText:'교정 질문 바로 답하기'});
    const next=page.locator('#oralCoach button').filter({hasText:'다음 문제'});
    const follow=page.locator('#oralCoach button').filter({hasText:'꼬리질문 받기'});
    if(await repair.count())await repair.click();
    else if(await next.count())await next.click();
    else if(await follow.count()){
      // Correct answers expose follow-up plus next; if only follow-up is available, use the global next function.
      await page.evaluate(()=>nextOralQuestion());
    } else fail('A8 Oral feedback exposes continuation','step '+oralSafety);

    await page.waitForTimeout(25);
    if(await visible('#oralResultView'))break;
  }

  await page.waitForFunction(()=>!document.querySelector('#oralResultView')?.hidden,{timeout:5000});
  if(!await visible('#oralResultView'))fail('A8 Oral result screen visible after session');
  if(await visible('#oralSessionView'))fail('A8 Oral session hidden on result');
  const oralResultText=(await page.locator('#oralResultContent').textContent()||'').trim();
  if(!oralResultText.includes('완료'))fail('A8 Oral result includes completion summary',oralResultText);
  if(!oralResultText.includes('취약 질문 분야'))fail('A8 Oral result includes weakness categories',oralResultText);
  if(!oralResultText.includes('다시 볼 근육'))fail('A8 Oral result includes weak muscles',oralResultText);
  if(await page.locator('#oralResultContent .oral-weak-muscle').count()<1)fail('A8 Oral result has at least one weak muscle');

  await page.goBack();
  await page.waitForFunction(()=>!document.querySelector('#oralSetupView')?.hidden,{timeout:5000});
  if(!await visible('#oralSetupView'))fail('A8 browser back result to setup');

  await page.evaluate(()=>startOralForMuscle('m001'));
  await page.waitForFunction(()=>!document.querySelector('#oralSessionView')?.hidden,{timeout:5000});
  const oralCrumb=(await page.locator('#oralSessionBreadcrumb').textContent()||'').trim();
  if(!oralCrumb.includes('흉쇄유돌근 집중 Viva'))fail('A8 muscle direct Viva preserves fixed muscle context',oralCrumb);
  if(await page.evaluate(()=>oralFixedMuscleId)!=='m001')fail('A8 fixed muscle Stable ID preserved','m001');
  await page.goBack();
  await page.waitForFunction(()=>!document.querySelector('#oralSetupView')?.hidden,{timeout:5000});
  pass('A8 Oral setup/session/result weakness hierarchy');

  await page.evaluate(()=>{
    const personal=personalLearningState();
    personal.favorites=['muscle:m001'];
    personal.recent=[{key:'muscle:m001',last:Date.now()},{key:'clinical_test:ct082',last:Date.now()-1000}];
    localStorage.setItem(PERSONAL_LEARNING_KEY,JSON.stringify(personal));
    const qs=quizState();
    qs.wrong=Object.assign({},qs.wrong,{m001:2});
    qs.progress=Object.assign({},qs.progress,{m001:{seen:3,correct:1,streak:0,nextDue:0,last:Date.now()}});
    qs.total=Math.max(Number(qs.total||0),3);qs.correct=Math.max(Number(qs.correct||0),1);
    localStorage.setItem(QUIZ_KEY,JSON.stringify(qs));
    const os=oralState();
    os.history=Object.assign({},os.history,{'m001:anatomy:origin':{last:Date.now(),grade:'wrong',score:0,level:'colleague'}});
    os.wrong=Object.assign({},os.wrong,{'m001:anatomy:origin':1});
    localStorage.setItem(ORAL_KEY,JSON.stringify(os));
  });

  await page.locator('.tab[data-page="learning"]').click();
  await page.waitForFunction(()=>!document.querySelector('#learningRootView')?.hidden,{timeout:5000});
  if(!await visible('#learningRootView'))fail('A9 learning root visible after tab entry');
  if(await page.locator('#learningSectionChooser .learning-section-choice').count()!==4)fail('A9 learning root section count = 4');
  const rootText=(await page.locator('#learningRootView').textContent()||'').trim();
  for(const label of ['최근 본 항목','즐겨찾기','오답·약점 자동 모음','부위별 학습지표']){
    if(!rootText.includes(label))fail('A9 root section label present',label);
  }
  if((await page.locator('#learningRecentMenuCount').textContent()||'').trim()!=='2')fail('A9 recent root count reflects stored state');
  if((await page.locator('#learningFavoriteMenuCount').textContent()||'').trim()!=='1')fail('A9 favorite root count reflects stored state');

  const learningChecks=[
    {key:'recent',view:'#learningRecentView',target:'#recentLearningList .learning-item',expect:'흉쇄유돌근'},
    {key:'favorites',view:'#learningFavoritesView',target:'#favoriteLearningList .learning-item',expect:'흉쇄유돌근'},
    {key:'weak',view:'#learningWeakView',target:'#weakLearningList .learning-item',expect:'흉쇄유돌근'},
    {key:'mastery',view:'#learningMasteryView',target:'#masteryDashboard .mastery-row',expect:'경추·후두하부'}
  ];
  for(const item of learningChecks){
    await page.locator('#learningSectionChooser [data-learning-section="'+item.key+'"]').click();
    await page.waitForFunction(selector=>!document.querySelector(selector)?.hidden,item.view,{timeout:5000});
    if(!await visible(item.view))fail('A9 learning detail visible',item.key);
    if(await visible('#learningRootView'))fail('A9 learning root hidden while detail visible',item.key);
    if(await page.locator(item.target).count()<1)fail('A9 learning detail contains data',item.key);
    const detailText=(await page.locator(item.view).textContent()||'').trim();
    if(!detailText.includes(item.expect))fail('A9 learning detail contains expected content',item.key+' / '+item.expect);
    const drill=await page.evaluate(()=>({
      page:document.documentElement.dataset.appPage||'',
      group:document.documentElement.dataset.activeDrillGroup||'',
      view:document.documentElement.dataset.activeDrillView||''
    }));
    if(drill.page!=='learning'||drill.group!=='learning'||drill.view!==item.key)fail('A9 runtime drill state matches detail',item.key+' / '+JSON.stringify(drill));
    await page.goBack();
    await page.waitForFunction(()=>!document.querySelector('#learningRootView')?.hidden,{timeout:5000});
    if(!await visible('#learningRootView'))fail('A9 browser back detail to root',item.key);
  }
  pass('A9 personal learning root/recent/favorites/weak/mastery hierarchy');

  const a10SearchCases=[
    {query:'m001',type:'muscle',page:'regions',group:'anatomy',view:'detail',selector:'#regionDetailView',targetText:'m001'},
    {query:'sx01',type:'symptom_pattern',page:'symptoms',group:'symptoms',view:'menu',selector:'#symptomMenuView',targetText:'sx01'},
    {query:'ct082',type:'clinical_test',page:'clinical',group:'clinical',view:'detail',selector:'#clinicalDetailView',targetText:'ct082'},
    {query:'d089',type:'diagnosis_concept',page:'clinical',group:'clinical',view:'detail',selector:'#clinicalDetailView',targetText:'d089'},
    {query:'usv074',type:'ultrasound_view',page:'ultrasound',group:'ultrasound',view:'detail',selector:'#ultrasoundAtlasDetailView',targetText:'usv074'}
  ];
  for(const test of a10SearchCases){
    await page.locator('.tab[data-page="home"]').click();
    await page.waitForFunction(()=>document.documentElement.dataset.appPage==='home',{timeout:5000});
    await page.locator('#searchTypeFilter').selectOption(test.type);
    await page.locator('#searchBox').fill(test.query);
    await page.waitForFunction(q=>document.querySelector('#searchResults')?.textContent?.includes(q),test.query,{timeout:5000});
    const beforeLength=await page.evaluate(()=>history.length);
    const hit=page.locator('#searchResults .search-result-main').filter({hasText:test.query}).first();
    if(await hit.count()!==1)fail('A10 search returns target',test.query);
    await hit.click();
    await page.waitForFunction(selector=>{
      const el=document.querySelector(selector);
      return !!el&&!el.hidden&&getComputedStyle(el).display!=='none';
    },test.selector,{timeout:8000});
    const state=await page.evaluate(()=>({
      page:document.documentElement.dataset.appPage||'',
      group:document.documentElement.dataset.activeDrillGroup||'',
      view:document.documentElement.dataset.activeDrillView||'',
      historyLength:history.length
    }));
    if(state.page!==test.page||state.group!==test.group||state.view!==test.view){
      fail('A10 search lands in canonical destination',test.query+' / '+JSON.stringify(state));
    }
    const destinationText=(await page.locator(test.selector).textContent()||'').trim();
    if(!destinationText.includes(test.targetText))fail('A10 destination preserves Stable ID',test.query+' / '+destinationText.slice(0,300));
    if(state.historyLength!==beforeLength+1)fail('A10 search adds exactly one destination history entry',test.query+' before='+beforeLength+' after='+state.historyLength);

    await page.goBack();
    await page.waitForFunction(q=>document.documentElement.dataset.appPage==='home'&&document.querySelector('#searchBox')?.value===q,test.query,{timeout:5000});
    if(!await visible('#home'))fail('A10 browser back returns home',test.query);
    if((await page.locator('#searchTypeFilter').inputValue())!==test.type)fail('A10 browser back restores search filter',test.query);
    if(!((await page.locator('#searchResults').textContent()||'').includes(test.query)))fail('A10 browser back restores search results',test.query);
    pass('A10 one-back search route',test.query+' → '+test.page+'/'+test.view);
  }

  await page.locator('#searchTypeFilter').selectOption('all');
  await page.locator('#searchBox').fill('');
  pass('A10 home/search canonical direct-route shell');

  const deepPage=await context.newPage();
  const deepErrors=[];
  deepPage.on('pageerror',e=>deepErrors.push(String(e?.stack||e)));
  const deepUrl=new URL('?page=clinical&module=cervical&topic=exam&item=ct083',base).toString();
  await deepPage.goto(deepUrl,{waitUntil:'domcontentloaded',timeout:30000});
  await deepPage.waitForFunction(()=>document.documentElement.dataset.appPage==='clinical'&&!document.querySelector('#clinicalDetailView')?.hidden,{timeout:20000});
  const deepState=await deepPage.evaluate(()=>({
    page:document.documentElement.dataset.appPage||'',
    group:document.documentElement.dataset.activeDrillGroup||'',
    view:document.documentElement.dataset.activeDrillView||'',
    module:typeof selectedClinicalModuleKey==='string'?selectedClinicalModuleKey:'',
    topic:typeof selectedClinicalTopic==='string'?selectedClinicalTopic:'',
    item:typeof selectedClinicalItemId==='string'?selectedClinicalItemId:'',
    version:document.getElementById('appVersionLabel')?.textContent||''
  }));
  if(deepState.page!=='clinical'||deepState.group!=='clinical'||deepState.view!=='detail'||deepState.module!=='cervical'||deepState.topic!=='exam'||deepState.item!=='ct083'){
    fail('Clinical deep link opens exact ct083 detail',JSON.stringify(deepState));
  }
  const deepText=(await deepPage.locator('#clinicalDetailContent').textContent()||'').trim();
  if(!deepText.includes('ct083')||!deepText.includes('경추 견인 검사'))fail('Clinical deep link preserves ct083 identity',deepText.slice(0,400));
  if(await deepPage.locator('#clinicalDetailContent [data-exam-realistic-candidate="preview"]').count()!==1)fail('Clinical deep link renders ct083 realistic Preview candidate');
  if(deepErrors.length)fail('Clinical deep link has no page errors',deepErrors.join(' || '));
  await deepPage.close();
  pass('A11 direct clinical deep link',deepUrl);

  const ulntPage=await context.newPage();
  const ulntUrl=new URL('?page=clinical&module=cervical&topic=exam&item=ct084',base).toString();
  await ulntPage.goto(ulntUrl,{waitUntil:'domcontentloaded',timeout:30000});
  await ulntPage.waitForFunction(()=>document.documentElement.dataset.appPage==='clinical'&&!document.querySelector('#clinicalDetailView')?.hidden,{timeout:20000});
  const ulntText=(await ulntPage.locator('#clinicalDetailContent').textContent()||'').trim();
  for(const required of ['ct084','임상 해석 · 이 검사를 어떻게 읽을 것인가','무엇을 보는 검사인가','양성이면 우선 생각할 것','중요 감별진단','이 검사 하나로 배제할 수 없는 것','다음에 이어서 확인할 검사·판단','진단적 무게','해석의 핵심']){
    if(!ulntText.includes(required))fail('ct084 rich interpretation contains '+required,ulntText.slice(0,1600));
  }
  const img=ulntPage.locator('#clinicalDetailContent [data-exam-realistic-candidate="approved"] img');
  if(await img.count()!==1)fail('ct084 approved realistic image is present');
  await img.waitFor({state:'visible',timeout:10000});
  const expectedApproved=await ulntPage.evaluate(()=>{
    const p=physicalExamRealisticAssetsData?.profiles?.find(x=>x.clinical_test_id==='ct084');
    const raw=String(p?.user_approved_asset?.dimensions||'');
    const m=raw.match(/^(\d+)x(\d+)$/);
    return {
      width:m?Number(m[1]):0,
      height:m?Number(m[2]):0,
      raw,
      status:p?.status||'',
      composite:p?.composite_url||''
    };
  });
  const size=await img.evaluate(async el=>{
    try{await el.decode();}catch{}
    const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
    return{
      naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,
      clientWidth:Math.round(r.width),clientHeight:Math.round(r.height),
      display:cs.display,visibility:cs.visibility,opacity:cs.opacity,
      complete:el.complete,currentSrc:el.currentSrc
    };
  });
  if(expectedApproved.status!=='APPROVED'||!expectedApproved.composite)fail('ct084 registry is canonical approved',JSON.stringify(expectedApproved));
  if(!expectedApproved.width||!expectedApproved.height)fail('ct084 registry declares approved dimensions',JSON.stringify(expectedApproved));
  if(size.naturalWidth!==expectedApproved.width||size.naturalHeight!==expectedApproved.height){
    fail('ct084 approved image matches registry dimensions',JSON.stringify({expectedApproved,size}));
  }
  if(!size.complete||!size.currentSrc||size.naturalWidth<1||size.naturalHeight<1||size.clientWidth<200||size.clientHeight<300||size.display==='none'||size.visibility==='hidden'||Number(size.opacity)===0){
    fail('ct084 approved image is visibly rendered',JSON.stringify(size));
  }
  const steps=await ulntPage.locator('#clinicalDetailContent .clinical-exam-steps').evaluate(el=>{
    const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
    return{width:Math.round(r.width),height:Math.round(r.height),display:cs.display,visibility:cs.visibility,text:(el.textContent||'').trim()};
  });
  if(steps.width<250||steps.height<80||steps.display==='none'||steps.visibility==='hidden'||!steps.text.includes('1. 준비')||!steps.text.includes('2. 시행')||!steps.text.includes('3. 양성 판단')){
    fail('ct084 step-by-step sequence is visibly rendered',JSON.stringify(steps));
  }
  const interpretation=await ulntPage.locator('#clinicalDetailContent .clinical-interpretation-detail').evaluate(el=>{
    const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
    return{width:Math.round(r.width),height:Math.round(r.height),display:cs.display,visibility:cs.visibility,text:(el.textContent||'').trim()};
  });
  if(interpretation.width<250||interpretation.height<200||interpretation.display==='none'||interpretation.visibility==='hidden'){
    fail('ct084 interpretation block is visibly rendered',JSON.stringify(interpretation));
  }
  await ulntPage.close();
  pass('A12 ct084 approved realistic asset and interpretation detail',JSON.stringify({size,steps:{width:steps.width,height:steps.height},interpretation:{width:interpretation.width,height:interpretation.height}}));

  const hoffPage=await context.newPage();
  const hoffUrl=new URL('?page=clinical&module=cervical&topic=exam&item=ct088',base).toString();
  await hoffPage.goto(hoffUrl,{waitUntil:'domcontentloaded',timeout:30000});
  await hoffPage.waitForFunction(()=>document.documentElement.dataset.appPage==='clinical'&&!document.querySelector('#clinicalDetailView')?.hidden,{timeout:20000});
  const hoffText=(await hoffPage.locator('#clinicalDetailContent').textContent()||'').trim();
  for(const required of ['ct088','Hoffmann','임상 해석 · 이 검사를 어떻게 읽을 것인가','무엇을 보는 검사인가','양성이면 우선 생각할 것','중요 감별진단','이 검사 하나로 배제할 수 없는 것','다음에 이어서 확인할 검사·판단','진단적 무게','해석의 핵심']){
    if(!hoffText.includes(required))fail('ct088 rich interpretation contains '+required,hoffText.slice(0,1600));
  }
  const hoffInterpretation=await hoffPage.locator('#clinicalDetailContent .clinical-interpretation-detail').evaluate(el=>{
    const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
    return{width:Math.round(r.width),height:Math.round(r.height),display:cs.display,visibility:cs.visibility,text:(el.textContent||'').trim()};
  });
  if(hoffInterpretation.width<250||hoffInterpretation.height<200||hoffInterpretation.display==='none'||hoffInterpretation.visibility==='hidden'){
    fail('ct088 interpretation block is visibly rendered',JSON.stringify(hoffInterpretation));
  }
  if(await hoffPage.locator('#clinicalDetailContent [data-exam-realistic-candidate]').count()!==0){
    fail('ct088 user-deferred incomplete realistic candidate is not exposed');
  }
  const hoffDeferred=hoffPage.locator('#clinicalDetailContent [data-exam-realistic-deferred="ct088"]');
  if(await hoffDeferred.count()!==1){
    fail('ct088 deferred status note is visibly exposed exactly once');
  }
  const hoffDeferredText=(await hoffDeferred.textContent()||'').trim();
  if(!hoffDeferredText.includes('실사형 일러스트 · 미완성 보류')||
     !hoffDeferredText.includes('기존 Stable-ID 교육 도해')){
    fail('ct088 deferred status note explains fallback clearly',hoffDeferredText);
  }
  if(await hoffPage.locator('#clinicalDetailContent [data-exam-illustration]').count()!==1){
    fail('ct088 Stable-ID schematic fallback remains visible while realistic visual is deferred');
  }
  await hoffPage.close();
  pass('A13 ct088 deferred visual + explicit status note + schematic fallback + rich interpretation',
    JSON.stringify({interpretation:{width:hoffInterpretation.width,height:hoffInterpretation.height},deferred:hoffDeferredText}));

  for(const spec of [
    {
      id:'ct085',
      required:['어깨 외전 완화 검사','쉽게 이해하기','익숙한 팔','modified passive shoulder abduction','단독 rule-in/rule-out','교과서식 상세 해석'],
      hdApprovalLifecycle:true,
      passName:'A14 ct085 shoulder-abduction relief teaching + HD approval lifecycle + schematic fallback'
    },
    {
      id:'ct086',
      required:['경추 회전 ROM 평가','쉽게 이해하기','60°','독립적인 보편적 병적 cut-off로 사용하지 않는다','능동','교과서식 상세 해석','숫자는 임상판단을 돕는 자료이지 진단 그 자체가 아니다'],
      passName:'A15 ct086 cervical rotation ROM teaching + schematic fallback'
    },
    {
      id:'ct087',
      required:['C5–T1 신경학적 선별','쉽게 이해하기','T1','손가락 벌림','motor·sensory·reflex','교과서식 상세 해석'],
      passName:'A16 ct087 C5–T1 neurologic teaching + schematic fallback'
    }
  ]){
    const p=await context.newPage();
    const u=new URL('?page=clinical&module=cervical&topic=exam&item='+spec.id,base).toString();
    await p.goto(u,{waitUntil:'domcontentloaded',timeout:30000});
    await p.waitForFunction(()=>document.documentElement.dataset.appPage==='clinical'&&!document.querySelector('#clinicalDetailView')?.hidden,{timeout:20000});
    const textContent=(await p.locator('#clinicalDetailContent').textContent()||'').trim();
    for(const required of spec.required){
      if(!textContent.includes(required))fail(spec.id+' teaching contains '+required,textContent.slice(0,2200));
    }
    if(spec.id==='ct086'){
      const evidence=p.locator('#clinicalDetailContent [data-exam-evidence="ct086"] a');
      const hrefs=await evidence.evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')||''));
      if(hrefs.length<4||
         !hrefs.some(x=>x.includes('42070317'))||
         !hrefs.some(x=>x.includes('41680685'))||
         !hrefs.some(x=>x.includes('20170780'))||
         !hrefs.some(x=>x.includes('29187311'))){
        fail('ct086 evidence links include 2026 cluster and ROM measurement sources',JSON.stringify(hrefs));
      }
      const labels=await evidence.allTextContents();
      if(!labels.some(x=>x.includes('Cervical radiculopathy cluster 독립 검증'))||
         !labels.some(x=>x.includes('Cervical ROM 측정 신뢰도·타당도'))){
        fail('ct086 evidence links use readable labels',JSON.stringify(labels));
      }
    }
    const realistic=p.locator('#clinicalDetailContent [data-exam-realistic-candidate]');
    if(spec.hdApprovalLifecycle){
      const count=await realistic.count();
      if(count>1)fail(spec.id+' renders at most one realistic HD asset during approval transfer');
      if(count===1){
        const state=await realistic.getAttribute('data-exam-realistic-candidate');
        if(state!=='approved')fail(spec.id+' connected realistic asset must be approved after HD materialization',String(state));
        const img=realistic.locator('img');
        await img.waitFor({state:'visible',timeout:10000});
        const size=await img.evaluate(async el=>{
          try{await el.decode();}catch{}
          const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
          return{naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,clientWidth:Math.round(r.width),clientHeight:Math.round(r.height),display:cs.display,visibility:cs.visibility,opacity:cs.opacity,complete:el.complete,currentSrc:el.currentSrc};
        });
        if(size.naturalWidth!==1024||size.naturalHeight!==1536||!size.complete||!size.currentSrc||size.clientWidth<180||size.clientHeight<260||size.display==='none'||size.visibility==='hidden'||Number(size.opacity)===0){
          fail(spec.id+' approved HD asset is visibly rendered at 1024x1536 source dimensions',JSON.stringify(size));
        }
      }
    }else if(spec.realisticPreview){
      if(await realistic.count()!==1)fail(spec.id+' renders one realistic Preview candidate');
    }else if(await realistic.count()!==0){
      fail(spec.id+' has no realistic candidate before generation');
    }
    if(await p.locator('#clinicalDetailContent [data-exam-illustration]').count()!==1){
      fail(spec.id+' keeps Stable-ID schematic fallback before realistic candidate approval');
    }
    await p.close();
    pass(spec.passName);
  }


  await page.locator('.tab[data-page="diseaseTrauma"]').click();
  await page.waitForFunction(()=>document.querySelectorAll('#diseaseTraumaVolumeChooser [data-odt-volume]').length===24,{timeout:20000});
  if(!await visible('#diseaseTraumaRootView'))fail('Disease/Trauma root view visible');
  if(await page.locator('#diseaseTraumaVolumeChooser [data-odt-volume]').count()!==24)fail('Disease/Trauma 24-volume inventory rendered');
  await page.locator('[data-odt-volume="odt001"]').click();await page.waitForTimeout(80);
  if(!await visible('#diseaseTraumaVolumeView'))fail('Shoulder Disease volume view visible');
  if(await page.locator('#diseaseTraumaChapterList [data-odt-chapter]').count()!==10)fail('Shoulder Disease has 10 native chapters');
  await page.locator('[data-odt-chapter="odt001-s1"]').click();await page.waitForTimeout(80);
  if(!await visible('#diseaseTraumaChapterView'))fail('Shoulder Disease chapter detail visible');
  const odtText=(await page.locator('#diseaseTraumaChapterContent').textContent()||'').trim();
  for(const token of ['Rotator cuff disease','영상 소견 하나만','극상근 해부학','Jobe / Empty Can','근거·참고문헌'])if(!odtText.includes(token))fail('Shoulder Disease chapter contains '+token,odtText.slice(0,1600));
  if(await page.locator('#diseaseTraumaChapterContent [data-odt-link="muscle:m070"]').count()!==1)fail('Disease/Trauma cross-link to supraspinatus');
  if(await page.locator('#diseaseTraumaChapterContent [data-odt-link="clinical_test:ct001"]').count()!==1)fail('Disease/Trauma cross-link to Jobe test');
  await page.goBack();await page.waitForTimeout(80);if(!await visible('#diseaseTraumaVolumeView'))fail('Disease/Trauma browser back chapter -> volume');
  await page.goBack();await page.waitForTimeout(80);if(!await visible('#diseaseTraumaRootView'))fail('Disease/Trauma browser back volume -> root');
  pass('Disease/Trauma native prototype: 24-volume inventory + Shoulder Disease 10 chapters + cross-links + browser back');

  const nativeCards=page.locator('#diseaseTraumaVolumeChooser .odt-status.ready');
  if(await nativeCards.count()!==4)fail('Disease/Trauma renders exactly four native Preview volumes',String(await nativeCards.count()));
  await page.locator('[data-odt-volume="odt002"]').click();await page.waitForTimeout(80);
  if(!await visible('#diseaseTraumaVolumeView'))fail('Shoulder Trauma volume view visible');
  if(await page.locator('#diseaseTraumaChapterList [data-odt-chapter]').count()!==10)fail('Shoulder Trauma has 10 native chapters');
  const traumaMeta=(await page.locator('#diseaseTraumaVolumeMeta').textContent()||'').trim();
  if(!traumaMeta.includes('Preview 연결')||!traumaMeta.includes('MP4 이전 대기')||!traumaMeta.includes('2026 핵심 근거 갱신 · canonical review pending'))fail('Shoulder Trauma native/audio/evidence status visible',traumaMeta);

  await page.locator('[data-odt-chapter="odt002-s1"]').click();await page.waitForTimeout(80);
  const traumaDislocation=(await page.locator('#diseaseTraumaChapterContent').textContent()||'').trim();
  for(const token of ['Anterior shoulder dislocation','routine external-rotation brace','Arthroscopy Association of Canada','액와신경병증 감별','근거·참고문헌'])if(!traumaDislocation.includes(token))fail('Shoulder Trauma anterior-dislocation chapter contains '+token,traumaDislocation.slice(0,2200));
  if(await page.locator('#diseaseTraumaChapterContent [data-odt-link="diagnosis_concept:d014"]').count()!==1)fail('Shoulder Trauma cross-link to axillary neuropathy');

  await page.goBack();await page.waitForTimeout(80);
  if(!await visible('#diseaseTraumaVolumeView'))fail('Shoulder Trauma browser back chapter -> volume');
  await page.locator('[data-odt-chapter="odt002-s3"]').click();await page.waitForTimeout(80);
  const traumaCuff=(await page.locator('#diseaseTraumaChapterContent').textContent()||'').trim();
  for(const token of ['Traumatic rotator cuff tear','수술 시기를 단일 숫자로 고정하지 않고','External Rotation Lag','극상건 장축 초음파','견갑하건 장축 초음파','후방 회전근개 초음파'])if(!traumaCuff.includes(token))fail('Shoulder Trauma cuff chapter contains '+token,traumaCuff.slice(0,2600));
  for(const link of ['diagnosis_concept:d008','clinical_test:ct004','clinical_test:ct005','ultrasound_view:usv001','ultrasound_view:usv005','ultrasound_view:usv007'])if(await page.locator('#diseaseTraumaChapterContent [data-odt-link="'+link+'"]').count()!==1)fail('Shoulder Trauma cuff cross-link '+link);
  await page.goBack();await page.waitForTimeout(80);if(!await visible('#diseaseTraumaVolumeView'))fail('Shoulder Trauma cuff browser back -> volume');
  await page.goBack();await page.waitForTimeout(80);if(!await visible('#diseaseTraumaRootView'))fail('Shoulder Trauma browser back volume -> root');
  pass('Shoulder Trauma native: 10 chapters + 2026 evidence refresh + cuff/neuro/ultrasound cross-links + browser back');

  await page.locator('[data-odt-volume="odt003"]').click();await page.waitForTimeout(80);
  if(!await visible('#diseaseTraumaVolumeView'))fail('Elbow Disease volume view visible');
  if(await page.locator('#diseaseTraumaChapterList [data-odt-chapter]').count()!==12)fail('Elbow Disease has 12 native chapters');
  const elbowDiseaseMeta=(await page.locator('#diseaseTraumaVolumeMeta').textContent()||'').trim();
  if(!elbowDiseaseMeta.includes('Preview 연결')||!elbowDiseaseMeta.includes('2026 핵심 근거 갱신 · canonical review pending'))fail('Elbow Disease evidence status visible',elbowDiseaseMeta);
  await page.locator('[data-odt-chapter="odt003-s1"]').click();await page.waitForTimeout(80);
  const elbowDisease=(await page.locator('#diseaseTraumaChapterContent').textContent()||'').trim();
  for(const token of ['Lateral epicondylitis','스테로이드의 빠른 단기효과','Cozen 검사','공통신근건 장축 초음파','근거·참고문헌'])if(!elbowDisease.includes(token))fail('Elbow Disease chapter contains '+token,elbowDisease.slice(0,2300));
  for(const link of ['diagnosis_concept:d017','clinical_test:ct012','ultrasound_view:usv010'])if(await page.locator('#diseaseTraumaChapterContent [data-odt-link="'+link+'"]').count()!==1)fail('Elbow Disease cross-link '+link);
  await page.goBack();await page.waitForTimeout(80);if(!await visible('#diseaseTraumaVolumeView'))fail('Elbow Disease chapter back -> volume');
  await page.goBack();await page.waitForTimeout(80);if(!await visible('#diseaseTraumaRootView'))fail('Elbow Disease volume back -> root');

  await page.locator('[data-odt-volume="odt004"]').click();await page.waitForTimeout(80);
  if(!await visible('#diseaseTraumaVolumeView'))fail('Elbow Trauma volume view visible');
  if(await page.locator('#diseaseTraumaChapterList [data-odt-chapter]').count()!==11)fail('Elbow Trauma has 11 native chapters');
  await page.locator('[data-odt-chapter="odt004-s6"]').click();await page.waitForTimeout(80);
  const elbowTrauma=(await page.locator('#diseaseTraumaChapterContent').textContent()||'').trim();
  for(const token of ['Distal biceps tendon rupture','3주가 지나면 직접봉합 불가','Distal biceps Hook test','원위 이두건 초음파','근거·참고문헌'])if(!elbowTrauma.includes(token))fail('Elbow Trauma distal-biceps chapter contains '+token,elbowTrauma.slice(0,2400));
  for(const link of ['diagnosis_concept:d023','clinical_test:ct018','clinical_test:ct019','ultrasound_view:usv014'])if(await page.locator('#diseaseTraumaChapterContent [data-odt-link="'+link+'"]').count()!==1)fail('Elbow Trauma cross-link '+link);
  await page.goBack();await page.waitForTimeout(80);if(!await visible('#diseaseTraumaVolumeView'))fail('Elbow Trauma chapter back -> volume');
  await page.goBack();await page.waitForTimeout(80);if(!await visible('#diseaseTraumaRootView'))fail('Elbow Trauma volume back -> root');
  pass('Elbow native pair: Disease 12 chapters + Trauma 11 chapters + evidence states + Stable-ID cross-links + browser back');

  if(pageErrors.length)fail('No uncaught page errors',pageErrors.join(' || '));
  if(consoleErrors.length)fail('No console errors',consoleErrors.join(' || '));
  pass('No runtime errors during anatomy, clinical, ultrasound, quiz, Oral, learning and home/search click sweep');

  console.log('\n--- RUNTIME NAVIGATION E2E ---');
  console.log('PASS | anatomy + clinical + ultrasound 131 views + quiz + Oral + learning + A10 one-back home/search direct routes');
}finally{
  await browser.close();
}
