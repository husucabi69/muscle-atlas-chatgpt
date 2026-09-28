import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const core=JSON.parse(fs.readFileSync('data/knowledge-core-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

check('Common drill navigation v3.1 contract',index.includes("const APP_DRILL_NAV_VERSION='3.1'"));
check('Reusable drill screen switcher exists',index.includes('function setDrillView(group,viewId)'));
check('Drill registry is scoped to real screens',
  index.includes("querySelectorAll('.drill-screen[data-drill-group=") &&
  index.includes('function drillViewsFor(group)')
);
check('Drill runtime state is separate from screen registry',
  index.includes('const drillNavigationState=Object.seal') &&
  index.includes('dataset.activeDrillGroup') &&
  index.includes('dataset.activeDrillView') &&
  !index.includes('document.documentElement.dataset.drillGroup=') &&
  !index.includes('document.documentElement.dataset.drillView=')
);
check('Reusable navigation viewport reset exists',index.includes('function resetNavigationViewport()'));
check('Reusable navigation history helpers exist',index.includes('function pushAppNavigationState(state)')&&index.includes('function replaceAppNavigationState(state)'));
check('Top-level pages share navigation reset',index.includes('document.documentElement.dataset.appPage=page')&&index.includes('resetNavigationViewport();'));

for(const view of ['regions','muscles','detail']){
  check('Anatomy drill screen: '+view,index.includes('data-drill-group="anatomy" data-drill-view="'+view+'"'));
}
check('Anatomy has no extra deep hierarchy',!index.includes('data-drill-group="anatomy" data-drill-view="deep"'));
check('Anatomy root preserves v11.14 region chooser contract',index.includes('단계 1 · 부위 선택'));
check('Anatomy region opens muscle-only level',index.includes('단계 2 · 근육 선택')&&index.includes("setAnatomyView('muscles')"));
check('Anatomy visual baseline locked to v11.14',
  index.includes("const ANATOMY_DETAIL_LAYOUT_BASELINE='v11.14 · Stage 17 Precision Anatomy'")
);
check('Muscle opens exact v11.14 single detail screen',
  index.includes('class="anatomy-detail-tabs"') &&
  index.includes('id="regionMuscleDetailContent" class="anatomy-detail-content"') &&
  index.includes("showRegionMuscleTab('basic')") &&
  index.includes("selectedRegionMuscleTab='basic'") &&
  index.includes("setAnatomyView('detail')")
);
check('No vertical learning-menu cards in anatomy muscle detail',
  !index.slice(index.indexOf('id="regionDetailView"'),index.indexOf('</section>',index.indexOf('id="regionDetailView"'))).includes('drill-menu-grid')
);
check('No repeated deep anatomy header or deep screen',
  !index.includes('id="regionMuscleDeepHead"') &&
  !index.includes('id="regionMuscleDeepTabs"') &&
  !index.includes('id="regionDeepView"')
);
check('Anatomy fixed tabs are v11.14 source of truth',
  index.includes("function syncAnatomyDetailTabState(activeTab='basic')")
);
const expectedAnatomyTabs=[
  ['basic','기본정보'],
  ['anatomy','해부도해'],
  ['ultrasound','초음파'],
  ['clinical','임상'],
  ['learning','심화·학습']
];
for(const [topic,label] of expectedAnatomyTabs){
  check('Anatomy v11.14 tab: '+topic,
    index.includes('data-anatomy-detail-tab="'+topic+'"') &&
    index.includes(">"+label+"</button>")
  );
}
const anatomyTabBlock=index.slice(index.indexOf('function showRegionMuscleTab'),index.indexOf('function refreshRegionNavigation'));
check('Anatomy tabs swap content in same detail view',
  !anatomyTabBlock.includes("setAnatomyView('deep')") &&
  !anatomyTabBlock.includes("setAnatomyView('detail')") &&
  !anatomyTabBlock.includes('recordAnatomyHistory(')
);
check('Anatomy browser history has only regions muscles detail',
  !index.includes("state.anatomyLevel==='deep'") &&
  !index.includes('anatomyTopic:selectedRegionMuscleTab')
);
check('Education hierarchy has 4 drill screens',
  ['regions','muscles','menu','exercise'].every(view=>index.includes('data-drill-group="education" data-drill-view="'+view+'"'))
);
check('Education root-to-muscle navigation exists',
  index.includes('function showEducationRegions(') &&
  index.includes('function openEducationRegion(') &&
  index.includes("setEducationView('muscles')")
);
check('Education muscle opens program menu, not full program stack',
  index.includes('function openEducationMuscle(') &&
  index.includes("setEducationView('menu')") &&
  index.includes('3단계 · 운동 목차')
);
check('Education exercise opens single detail screen',
  index.includes('function openEducationExercise(') &&
  index.includes("setEducationView('exercise')") &&
  index.includes('4단계 · 운동 상세')
);
check('Education hierarchy records and restores history',
  index.includes('function recordEducationHistory(') &&
  index.includes('educationProfileId:selectedEducationProfileId') &&
  index.includes("state.educationLevel==='exercise'") &&
  index.includes('openEducationExercise(state.educationProfileId,false)')
);
check('Education back contract exists',
  index.includes("educationBack('regions')") &&
  index.includes("educationBack('menu')")
);
check('Patient safety disclaimer preserved',
  index.includes('의료기기가 아닙니다') &&
  index.includes('의료전문가와 상담')
);
check('Patient print/share remain available',
  index.includes('function printCurrentEducation()') &&
  index.includes('function printEducationRegion()') &&
  index.includes('function shareCurrentEducation()')
);
check('Direct muscle education entry seeds hierarchy',
  index.includes('openEducationRegion(m.region,true);') &&
  index.includes('openEducationMuscle(id,true);')
);

check('Symptoms hierarchy has 4 drill screens',
  ['groups','list','menu','deep'].every(view=>index.includes('data-drill-group="symptoms" data-drill-view="'+view+'"'))
);
check('Symptoms group opens symptom-only list',
  index.includes('function openSymptomGroup(groupId,record=true)') &&
  index.includes("setSymptomView('list')") &&
  index.includes('2단계 · 증상 목차')
);
check('Symptom opens learning menu instead of overlay',
  index.includes('function openSymptom(id,preferredMuscleId,record=true)') &&
  index.includes("setSymptomView('menu')") &&
  !index.slice(index.indexOf('function openSymptom(id,preferredMuscleId,record=true)'),index.indexOf('function stripHTML')).includes("classList.add('show')")
);
check('Symptom menu exposes five topics',
  ['differential','muscles','nerves','ultrasound','learning'].every(topic=>index.includes('data-symptom-topic="'+topic+'"'))
);
check('Symptom deep topic uses separate screen',
  index.includes('function showSymptomTopic(topic,record=true)') &&
  index.includes("setSymptomView('deep')") &&
  index.includes('id="symptomDeepContent"')
);
check('Symptom hierarchy records and restores history',
  index.includes('function recordSymptomHistory(') &&
  index.includes('symptomTopic:selectedSymptomTopic') &&
  index.includes("state.symptomLevel==='deep'") &&
  index.includes('showSymptomTopic(state.symptomTopic')
);
check('Direct symptom entry seeds its list state',
  index.includes('hasMatchingListState') &&
  index.includes('openSymptomGroup(groupId,true)')
);
check('Symptom selected muscle context persists',
  index.includes('selectedSymptomMuscleId') &&
  index.includes('function selectSymptomFlowMuscle(') &&
  index.includes("symptomId,muscleId,sourcePage:'symptom'")
);
check('Symptom root resets on top-level entry',
  index.includes("if(pageId==='symptoms')showSymptomGroups(false)") &&
  index.includes("if(btn.dataset.page==='symptoms')showSymptomGroups(true)")
);

check('Clinical hierarchy has 4 drill screens',
  ['modules','menu','list','detail'].every(view=>index.includes('data-drill-group="clinical" data-drill-view="'+view+'"'))
);
check('Clinical root exposes 10 canonical modules',
  index.includes('function renderClinicalModuleChooser()') &&
  ['shoulder','elbow','wristHand','hipPelvis','kneeThigh','legAnkleFoot','cervical','thoracic','lumbarSacral','abdominalCore'].every(key=>index.includes(key+':{label:'))
);
check('Clinical module menu exposes three topics',
  ['differential','exam','ultrasound'].every(topic=>index.includes(topic+':{label:')) &&
  index.includes('data-clinical-topic="')
);
check('Clinical topic opens item-only list',
  index.includes('async function openClinicalTopic(topic,record=true)') &&
  index.includes("setClinicalView('list')") &&
  index.includes('id="clinicalItemList"')
);
check('Clinical item opens one detail screen',
  index.includes('async function openClinicalItem(itemId,record=true)') &&
  index.includes("setClinicalView('detail')") &&
  index.includes('id="clinicalDetailContent"')
);
check('Clinical detail preserves Stable IDs and safety fields',
  index.includes("id=\"clinical-test-'+esc(test.clinical_test_id)") &&
  index.includes("id=\"ultrasound-view-'+esc(view.ultrasound_view_id)") &&
  index.includes("id=\"diagnosis-concept-'+esc(candidate.diagnosis_concept_id)") &&
  index.includes('Red flag / 안전 경계') &&
  index.includes('한계 / 흔한 오류')
);
check('Clinical hierarchy records and restores history',
  index.includes('function recordClinicalHistory(') &&
  index.includes('clinicalItemId:selectedClinicalItemId') &&
  index.includes("state.clinicalLevel==='detail'") &&
  index.includes('await openClinicalItem(state.clinicalItemId,false)')
);
check('Clinical top-level entry resets to module root',
  index.includes("if(pageId==='clinical')showClinicalModules(false)") &&
  index.includes("if(btn.dataset.page==='clinical')showClinicalModules(true)")
);
check('Clinical learning-flow routes into A5 hierarchy',
  index.includes('async function openClinicalFlowStep(id,step)') &&
  index.includes('await openClinicalModule(moduleKey,true)') &&
  index.includes('await openClinicalTopic(step,true)')
);
check('Clinical Stable IDs route directly without requiring a muscle proxy',
  index.includes('async function openSearchEntity(type,id)') &&
  index.includes("if(type==='clinical_test'||type==='diagnosis_concept')") &&
  index.includes('await openClinicalStableDetail(type,id,null,false)') &&
  index.includes("if(type==='ultrasound_view')") &&
  index.includes('await openUltrasoundAtlasStableView(id,false)')
);
check('Clinical Stable ID routing tolerates pre-load timing',
  index.includes('await Promise.all(Object.keys(clinicalFlowModules).map(ensureClinicalModuleLoaded))') &&
  index.includes('route=clinicalModuleForStableItem(type,id)')
);

check('A6 ultrasound top-level page exists',
  index.includes('data-page="ultrasound"') &&
  index.includes('<section id="ultrasound" class="page">')
);
check('A6 ultrasound hierarchy has regions views detail screens',
  ['regions','views','detail'].every(view=>index.includes('data-drill-group="ultrasound" data-drill-view="'+view+'"'))
);
check('A6 ultrasound root exposes canonical region chooser',
  index.includes('function renderUltrasoundAtlasRegions()') &&
  index.includes('id="ultrasoundAtlasRegionChooser"') &&
  index.includes('data-ultrasound-module="') &&
  ['shoulder','elbow','wristHand','hipPelvis','kneeThigh','legAnkleFoot','cervical','thoracic','lumbarSacral','abdominalCore'].every(key=>index.includes(key+':{label:'))
);
check('A6 ultrasound region opens canonical view-only list',
  index.includes('async function openUltrasoundAtlasRegion(moduleKey,record=true)') &&
  index.includes("setUltrasoundAtlasView('views')") &&
  index.includes('ultrasoundAtlasViewsForModule(moduleKey)')
);
check('A6 ultrasound view opens single detail using shared canonical renderer',
  index.includes('async function openUltrasoundAtlasView(viewId,record=true)') &&
  index.includes("setUltrasoundAtlasView('detail')") &&
  index.includes('clinicalUltrasoundDetailHtml(view,moduleKey)')
);
check('A6 ultrasound history restores hierarchy',
  index.includes('function recordUltrasoundAtlasHistory(') &&
  index.includes('ultrasoundViewId:selectedUltrasoundAtlasViewId') &&
  index.includes("state.ultrasoundLevel==='detail'") &&
  index.includes('await openUltrasoundAtlasView(state.ultrasoundViewId,false)')
);
check('A6 top-level entry resets to ultrasound root',
  index.includes("if(pageId==='ultrasound')showUltrasoundAtlasRegions(false)") &&
  index.includes("if(btn.dataset.page==='ultrasound')showUltrasoundAtlasRegions(true)")
);
check('A6 preserves canonical ultrasound field contract',
  ['환자 자세','Probe 위치·방향','Landmark','정상 확인','Pitfall / 주의','Stable ID'].every(x=>index.includes(x))
);

check('A7 quiz hierarchy has setup session result screens',
  ['setup','session','result'].every(view=>index.includes('data-drill-group="quiz" data-drill-view="'+view+'"'))
);
check('A7 quiz setup preserves region type direction controls',
  ['id="quizRegion"','id="quizType"','id="quizDirection"'].every(x=>index.includes(x)) &&
  index.includes('id="quizClinicalModuleChooser"')
);
check('A7 quiz setup exposes all 10 clinical module starters',
  ['shoulder','elbow','wristHand','hipPelvis','kneeThigh','legAnkleFoot','cervical','thoracic','lumbarSacral','abdominalCore']
    .every(key=>index.includes('data-quiz-module="'+key+'"'))
);
check('A7 common session state replaces flat quiz rendering',
  index.includes('function beginQuizSession(') &&
  index.includes("setQuizView('session')") &&
  index.includes('function renderQuizResult()') &&
  index.includes("setQuizView('result')")
);
check('A7 result separates score and wrong-muscle review',
  index.includes('id="quizResultContent"') &&
  index.includes('quiz-missed-item') &&
  index.includes('이번 오답')
);
check('A7 quiz history uses terminal result replace semantics',
  index.includes('function recordQuizHistory(') &&
  index.includes("recordQuizHistory('result','replace')") &&
  index.includes("state?.lysPage==='quiz'") &&
  index.includes("['session','result'].includes(state.quizLevel)")
);
check('A7 top-level entry resets to quiz setup',
  index.includes("if(btn.dataset.page==='quiz')showQuizSetup(true)") &&
  index.includes("if(pageId==='quiz')showQuizSetup(false)")
);
check('A7 muscle focus quiz enters common session',
  index.includes("beginQuizSession('muscle',true)") &&
  index.includes("setLearningFlowContext({muscleId:id,sourcePage:'quiz',step:'quiz'})")
);
check('A7 all clinical module quizzes enter common session',
  (index.match(/beginQuizSession\('clinical',true\)/g)||[]).length===10,
  String((index.match(/beginQuizSession\('clinical',true\)/g)||[]).length)
);
check('A7 preserves quiz progress storage keys',
  index.includes("const QUIZ_KEY='mskQuizProgressV2'") &&
  index.includes("const OLD_QUIZ_KEY='mskQuizProgressV1'")
);

check('A8 Oral hierarchy has setup session result screens',
  ['setup','session','result'].every(view=>index.includes('data-drill-group="oral" data-drill-view="'+view+'"'))
);
check('A8 Oral setup preserves region examiner field and voice controls',
  ['id="oralRegion"','id="oralLevel"','id="oralField"','id="oralVoiceSelect"'].every(x=>index.includes(x)) &&
  index.includes('음성 미리듣기')
);
check('A8 Oral session preserves mic voice grading and repair actions',
  index.includes('id="oralMicBtn"') &&
  index.includes('toggleOralMic()') &&
  index.includes('gradeOralAnswer()') &&
  index.includes('queueOralRepair(') &&
  index.includes('askOralFollowup()')
);
check('A8 Oral result separates score weakness categories and muscles',
  index.includes('id="oralResultContent"') &&
  index.includes('취약 질문 분야') &&
  index.includes('다시 볼 근육') &&
  index.includes('oral-weak-muscle')
);
check('A8 Oral records session grade without changing persistent progress key',
  index.includes("const ORAL_KEY='mskOralProgressV2'") &&
  index.includes('q.grade=grade') &&
  index.includes('q.gradeScore=Number(score.toFixed(2))')
);
check('A8 Oral result is terminal history state',
  index.includes('function recordOralHistory(') &&
  index.includes("recordOralHistory('result','replace')") &&
  index.includes("['session','result'].includes(state.oralLevel)")
);
check('A8 Oral top-level entry resets setup and direct muscle flow preserves fixed muscle',
  index.includes("if(btn.dataset.page==='oral')showOralSetup(true,true)") &&
  index.includes("if(pageId==='oral')showOralSetup(false,false)") &&
  index.includes('function startOralForMuscle(id)')
);
check('A8 Oral session completion opens result instead of overwriting question card',
  index.includes('renderOralResult();return;') &&
  index.includes("setOralView('result')")
);

check('A9 personal learning has root plus four independent detail screens',
  ['root','recent','favorites','weak','mastery'].every(view=>index.includes('data-drill-group="learning" data-drill-view="'+view+'"'))
);
check('A9 learning root exposes exactly four section choices',
  ['recent','favorites','weak','mastery'].every(section=>index.includes('data-learning-section="'+section+'"')) &&
  index.includes('id="learningSectionChooser"')
);
check('A9 preserves summary metrics and transfer controls on root',
  ['id="learningStudied"','id="learningFavoriteCount"','id="learningWeakCount"','id="learningDueCount"','exportLearningRecords()','importLearningRecords(this)'].every(x=>index.includes(x))
);
check('A9 recent favorites weak and mastery retain canonical render targets',
  ['id="recentLearningList"','id="favoriteLearningList"','id="weakLearningList"','id="masteryDashboard"'].every(x=>index.includes(x))
);
check('A9 detail sections use common navigation and history',
  index.includes('function openLearningSection(section,record=true)') &&
  index.includes('function recordLearningHistory(') &&
  index.includes('function learningBack()') &&
  index.includes("state?.lysPage==='learning'") &&
  index.includes("['recent','favorites','weak','mastery'].includes(state.learningLevel)")
);
check('A9 top-level entry resets to learning root',
  index.includes("if(btn.dataset.page==='learning')showLearningRoot(true)") &&
  index.includes("if(pageId==='learning')showLearningRoot(false)")
);
check('A9 preserves personal learning and transfer storage contracts',
  index.includes("const PERSONAL_LEARNING_KEY='mskPersonalLearningV1'") &&
  index.includes("const LEARNING_EXPORT_SCHEMA='lys-muscle-learning-v1'") &&
  index.includes("data:{quiz:sanitizeQuizForTransfer(quizState()),oral:sanitizeOralForTransfer(oralState()),personal:sanitizePersonalForTransfer(personalLearningState())}")
);
check('A9 detail screens expose full stored limits instead of old dashboard truncation',
  index.includes("(state.recent||[]).slice(0,30)") &&
  index.includes("(state.favorites||[]).slice(0,100)") &&
  index.includes("if(weakEl)weakEl.innerHTML=weak.map(w=>")
);

check('A10 home search state preserves query filter and scroll',
  index.includes('function currentHomeNavigationState()') &&
  index.includes("lysPage:'home'") &&
  index.includes('homeQuery:query') &&
  index.includes("homeFilter:filter?.value||'all'") &&
  index.includes('homeScrollY:')
);
check('A10 home popstate restores search results',
  index.includes('function restoreHomeNavigation(state=history.state)') &&
  index.includes("if(!state||state.lysPage!=='home')return") &&
  index.includes('renderUnifiedSearch()') &&
  index.includes("input.value=state?.homeQuery||''")
);
check('A10 muscle search routes to canonical v11.14 anatomy detail not legacy overlay',
  index.includes("if(type==='muscle'){") &&
  index.includes('openRegion(m.region,false)') &&
  index.includes('openRegionMuscle(id,false)') &&
  index.includes("recordAnatomyHistory('detail')")
);
check('A10 symptom search routes directly to symptom menu',
  index.includes("if(type==='symptom_pattern'){") &&
  index.includes('openSymptom(id,null,false)') &&
  index.includes("recordSymptomHistory('menu')")
);
check('A10 clinical test and diagnosis search use one-shot clinical detail',
  index.includes("if(type==='clinical_test'||type==='diagnosis_concept')") &&
  index.includes('openClinicalStableDetail(type,id,null,false)') &&
  index.includes("recordClinicalHistory('detail')")
);
check('A10 ultrasound search routes to independent A6 detail',
  index.includes("if(type==='ultrasound_view')") &&
  index.includes('openUltrasoundAtlasStableView(id,false)') &&
  index.includes("recordUltrasoundAtlasHistory('detail')")
);
check('A10 clinical Stable-ID renderer supports no-history mode',
  index.includes('async function openClinicalStableDetail(type,id,muscleId=null,record=true)') &&
  index.includes('showClinicalModules(record)') &&
  index.includes('await openClinicalModule(route.key,record)') &&
  index.includes('await openClinicalTopic(route.topic,record)') &&
  index.includes('await openClinicalItem(route.itemId,record)')
);
check('A10 search inputs continuously replace canonical home history',
  index.includes("addEventListener('input',()=>{renderUnifiedSearch();if(document.documentElement.dataset.appPage==='home')recordHomeHistory('replace');})") &&
  index.includes("addEventListener('change',()=>{renderUnifiedSearch();if(document.documentElement.dataset.appPage==='home')recordHomeHistory('replace');})")
);
check('A10 home quick symptom buttons use common direct router',
  ['sx01','sx04','sx06','sx11','sx18'].every(id=>index.includes("openSearchEntity('symptom_pattern','"+id+"')"))
);

check('Canonical muscles remain 205',(core.muscles||[]).length===205,String((core.muscles||[]).length));

const inline=[...index.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).join('\n');
try{
  new Function(inline);
  check('Inline JavaScript syntax valid',true);
}catch(error){
  check('Inline JavaScript syntax valid',false,error.message);
}

let failed=0;
for(const item of checks){
  console.log(`${item.pass?'PASS':'FAIL'} | ${item.name}${item.detail?' | '+item.detail:''}`);
  if(!item.pass)failed++;
}
console.log(`\n--- STAGE 23A HIERARCHICAL NAVIGATION 3.0 QA ---`);
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
