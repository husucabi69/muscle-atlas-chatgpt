import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const registry=json('data/clinical-exam-illustration-presets-v1.json');
const shoulder=json('data/examination-shoulder-v1.json');
const elbow=json('data/examination-elbow-v1.json');
const wristHand=json('data/examination-wrist-hand-v1.json');
const hipPelvis=json('data/examination-hip-pelvis-v1.json');
const kneeThigh=json('data/examination-knee-thigh-v1.json');
const legAnkleFoot=json('data/examination-leg-ankle-foot-v1.json');
const index=read('index.html');
const sw=read('sw.js');

const checks=[];
const check=(name,pass,detail='')=>{
  checks.push({name,pass:Boolean(pass),detail});
  console.log((pass?'PASS':'FAIL')+' | '+name+(detail?' | '+detail:''));
};

const shoulderTests=shoulder.clinical_tests||[];
const elbowTests=elbow.clinical_tests||[];
const wristHandTests=wristHand.clinical_tests||[];
const hipPelvisTests=hipPelvis.clinical_tests||[];
const kneeThighTests=kneeThigh.clinical_tests||[];
const legAnkleFootTests=legAnkleFoot.clinical_tests||[];
const tests=[...shoulderTests,...elbowTests,...wristHandTests,...hipPelvisTests,...kneeThighTests,...legAnkleFootTests];
const presets=registry.presets||{};
const ids=tests.map(x=>x.clinical_test_id);
const customIds=Object.keys(presets).sort();

check('Shoulder canonical examination count',shoulderTests.length===11,String(shoulderTests.length));
check('Elbow canonical examination count',elbowTests.length===10,String(elbowTests.length));
check('Wrist-hand canonical examination count',wristHandTests.length===14,String(wristHandTests.length));
check('Hip-pelvis canonical examination count',hipPelvisTests.length===14,String(hipPelvisTests.length));
check('Knee-thigh canonical examination count',kneeThighTests.length===15,String(kneeThighTests.length));
check('Leg-ankle-foot canonical examination count',legAnkleFootTests.length===17,String(legAnkleFootTests.length));
check('Custom illustration registry covers shoulder + elbow + wrist-hand + hip-pelvis + knee-thigh + leg-ankle-foot',
  customIds.length===81&&ids.every(id=>presets[id]),customIds.join(', '));
check('Registry coverage metadata matches 81/148',
  registry.coverage?.customized===81&&registry.coverage?.total_canonical_tests===148&&
  Array.isArray(registry.coverage?.modules)&&
  ['shoulder','elbow','wrist-hand','hip-pelvis','knee-thigh','leg-ankle-foot'].every(x=>registry.coverage.modules.includes(x)),
  JSON.stringify(registry.coverage||{}));

for(const test of tests){
  const p=presets[test.clinical_test_id];
  check(test.clinical_test_id+' custom precision',p?.precision==='custom',p?.precision||'missing');
  check(test.clinical_test_id+' stable id matches',p?.clinical_test_id===test.clinical_test_id,p?.clinical_test_id||'missing');
  const upperPose=Array.isArray(p?.start?.shoulder)&&Array.isArray(p?.start?.elbow)&&Array.isArray(p?.start?.wrist)&&
    Array.isArray(p?.action?.shoulder)&&Array.isArray(p?.action?.elbow)&&Array.isArray(p?.action?.wrist);
  const lowerPose=Array.isArray(p?.start?.hip)&&Array.isArray(p?.start?.knee)&&Array.isArray(p?.start?.ankle)&&
    Array.isArray(p?.action?.hip)&&Array.isArray(p?.action?.knee)&&Array.isArray(p?.action?.ankle);
  check(test.clinical_test_id+' start/action pose',upperPose||lowerPose);
  check(test.clinical_test_id+' examiner teaching text',
    String(p?.examiner_position||'').length>=20&&String(p?.hand_force||'').length>=20&&String(p?.common_error||'').length>=20);
  check(test.clinical_test_id+' positive marker',
    Number.isFinite(p?.positive?.x)&&Number.isFinite(p?.positive?.y)&&String(p?.positive?.label||'').length>0);
  check(test.clinical_test_id+' motion cue',
    Array.isArray(p?.arrows)&&p.arrows.length>=1);
}

check('App loads clinical exam illustration registry',
  index.includes("fetch('./data/clinical-exam-illustration-presets-v1.json',{cache:'no-cache'})"));
check('App renders Stable-ID custom exam illustration',
  index.includes('data-exam-illustration="custom"')&&index.includes('function clinicalExamPresetFigure(test,preset)'));
check('App displays examiner position and force direction',
  index.includes('검사자 위치 · 손 위치')&&index.includes('<b>힘의 방향:</b>'));
check('App keeps generic fallback for remaining tests',
  index.includes('data-exam-illustration="generic"')&&index.includes('검사별 고정밀 도해 교체 대기'));
check('Service worker precaches illustration registry',
  sw.includes("'./data/clinical-exam-illustration-presets-v1.json'"));

const failed=checks.filter(x=>!x.pass);
console.log('\nClinical exam illustration QA: '+(checks.length-failed.length)+'/'+checks.length+' PASS');
if(failed.length)process.exit(1);
