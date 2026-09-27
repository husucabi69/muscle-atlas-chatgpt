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

for(const view of ['regions','muscles','detail','deep']){
  check('Anatomy drill screen: '+view,index.includes('data-drill-group="anatomy" data-drill-view="'+view+'"'));
}
check('Anatomy root shows only region chooser contract',index.includes('1단계 · 부위 목차'));
check('Anatomy region opens muscle-only level',index.includes('2단계 · 근육 목차')&&index.includes("setAnatomyView('muscles')"));
check('Anatomy visual baseline locked to v11.14',
  index.includes("const ANATOMY_DETAIL_LAYOUT_BASELINE='v11.14 · Stage 17 Precision Anatomy'")
);
check('Muscle opens v11.14 horizontal tab hub before content',
  index.includes('id="regionMuscleHubTabs" class="anatomy-detail-tabs"') &&
  index.includes("setAnatomyView('detail')") &&
  !index.slice(index.indexOf('id="regionDetailView"'),index.indexOf('id="regionDeepView"')).includes('drill-menu-grid')
);
check('Deep topic is separate screen with preserved muscle header and tabs',
  index.includes('id="regionDeepView"') &&
  index.includes('id="regionMuscleDeepHead" class="anatomy-detail-head"') &&
  index.includes('id="regionMuscleDeepTabs" class="anatomy-detail-tabs"') &&
  index.includes("setAnatomyView('deep')")
);
check('Muscle opening does not auto-open basic topic',
  !index.slice(index.indexOf('function openRegionMuscle'),index.indexOf('function showRegionMuscleTab')).includes("showRegionMuscleTab('basic')")
);
check('Shared anatomy tab renderer is single source of truth',
  index.includes('function anatomyDetailTabsHtml(activeTab=null)') &&
  index.includes('function renderAnatomyDetailTabs(activeTab=null)')
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
    index.includes("['"+topic+"','"+label+"']")
  );
}
check('Deep breadcrumb exists',index.includes('id="regionDeepBreadcrumb"'));
check('Hierarchy back controls exist',index.includes("anatomyBack('regions')")&&index.includes("anatomyBack('muscles')")&&index.includes("anatomyBack('detail')"));
check('Anatomy state records deep topic',index.includes('anatomyTopic:selectedRegionMuscleTab'));
check('Browser back restores deep topic',index.includes("state.anatomyLevel==='deep'")&&index.includes('showRegionMuscleTab(state.anatomyTopic,false)'));
check('Every drill transition resets to top',index.includes("window.scrollTo({top:0,behavior:'auto'})"));
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
