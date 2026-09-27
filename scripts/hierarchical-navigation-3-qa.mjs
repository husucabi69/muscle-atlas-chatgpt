import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const core=JSON.parse(fs.readFileSync('data/knowledge-core-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

check('Common drill navigation v3 contract',index.includes("const APP_DRILL_NAV_VERSION='3.0'"));
check('Reusable drill screen switcher exists',index.includes('function setDrillView(group,viewId)'));
check('Reusable navigation viewport reset exists',index.includes('function resetNavigationViewport()'));
check('Reusable navigation history helpers exist',index.includes('function pushAppNavigationState(state)')&&index.includes('function replaceAppNavigationState(state)'));
check('Top-level pages share navigation reset',index.includes('document.documentElement.dataset.appPage=page')&&index.includes('resetNavigationViewport();'));

for(const view of ['regions','muscles','detail','deep']){
  check('Anatomy drill screen: '+view,index.includes('data-drill-group="anatomy" data-drill-view="'+view+'"'));
}
check('Anatomy root shows only region chooser contract',index.includes('1단계 · 부위 목차'));
check('Anatomy region opens muscle-only level',index.includes('2단계 · 근육 목차')&&index.includes("setAnatomyView('muscles')"));
check('Muscle opens learning menu before content',index.includes('학습 목차')&&index.includes("setAnatomyView('detail')"));
check('Deep topic is separate screen',index.includes('id="regionDeepView"')&&index.includes("setAnatomyView('deep')"));
check('Muscle opening does not auto-open basic topic',!/indexOf/.test('') && !index.slice(index.indexOf('function openRegionMuscle'),index.indexOf('function showRegionMuscleTab')).includes("showRegionMuscleTab('basic')"));
for(const topic of ['basic','anatomy','ultrasound','clinical','learning']){
  check('Anatomy menu topic: '+topic,index.includes('data-anatomy-detail-tab="'+topic+'"'));
}
check('Deep breadcrumb exists',index.includes('id="regionDeepBreadcrumb"'));
check('Hierarchy back controls exist',index.includes("anatomyBack('regions')")&&index.includes("anatomyBack('muscles')")&&index.includes("anatomyBack('detail')"));
check('Anatomy state records deep topic',index.includes('anatomyTopic:selectedRegionMuscleTab'));
check('Browser back restores deep topic',index.includes("state.anatomyLevel==='deep'")&&index.includes('showRegionMuscleTab(state.anatomyTopic,false)'));
check('Every drill transition resets to top',index.includes("window.scrollTo({top:0,behavior:'auto'})"));
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
