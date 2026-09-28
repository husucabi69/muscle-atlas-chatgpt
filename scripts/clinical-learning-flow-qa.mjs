import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const version=fs.readFileSync('app-version.js','utf8');
const core=JSON.parse(fs.readFileSync('data/knowledge-core-v1.json','utf8'));
const regions=JSON.parse(fs.readFileSync('data/regions-v1.json','utf8')).regions||[];
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});
const releaseStage=Number(version.match(/buildVersion:'[^']*-stage(\d+)\./)?.[1]||0);

check('Stage 21 release active',releaseStage>=21,String(releaseStage));
check('Clinical flow module contract exists',index.includes('const clinicalFlowModules={'));
for(const key of ['shoulder','elbow','wristHand','hipPelvis','kneeThigh','legAnkleFoot','cervical','thoracic','lumbarSacral','abdominalCore']){
  check('Clinical module '+key,index.includes(key+':{label:'));
}
check('All region fallbacks represented',regions.every(r=>index.includes("'"+r.name_ko+"':")),String(regions.filter(r=>!index.includes("'"+r.name_ko+"':")).map(r=>r.name_ko)));

check('Shared learning context has five canonical fields',
  index.includes("const learningFlowContext={symptomId:null,muscleId:null,clinicalModule:null,ultrasoundViewIds:[],sourcePage:null}")
);
check('Learning context setter exists',
  index.includes('function setLearningFlowContext') &&
  index.includes('learningFlowContext.clinicalModule=clinicalModuleForMuscle') &&
  index.includes('learningFlowContext.ultrasoundViewIds=canonicalUltrasoundViewsForMuscle')
);
check('Overlay cleanup contract exists',
  index.includes('function cleanupLearningOverlays') &&
  index.includes("['muscleOverlay','symptomOverlay']") &&
  index.includes("document.body.style.overflow=''")
);

check('Ultrasound ID determines clinical module',
  index.includes('function clinicalModuleFromViewId') &&
  index.includes("n>=1&&n<=9") &&
  index.includes("n<=131")
);
check('Canonical ultrasound resolver uses target_structure_ids',
  index.includes('function canonicalUltrasoundViewsForMuscle') &&
  index.includes('target_structure_ids') &&
  index.includes('muscleTendonIds(id)')
);
check('Child tendon resolver exists',
  index.includes('function muscleTendonIds') &&
  index.includes('parent_muscle_id===id')
);
check('Canonical ultrasound mapping takes priority over region fallback',
  index.includes("const canonical=canonicalUltrasoundViewsForMuscle(id)") &&
  index.includes("return canonical||clinicalRegionFallback")
);

check('Eight-step clinical flow exists',
  ['증상','해부학','감별','진찰','초음파','Quiz','Oral','환자교육'].every(x=>index.includes("'"+x+"'"))
);
check('Clinical context banner exists',
  index.includes('id="clinicalFlowContext"') &&
  index.includes('renderClinicalFlowContext')
);
check('Muscle modal keeps flow context',
  index.includes("clinicalFlowBar(m.id,'anatomy')") &&
  index.includes("setLearningFlowContext({muscleId:id")
);
check('Symptom context preserves selected muscle',
  (index.includes('function openSymptom(id,preferredMuscleId)')||index.includes('function openSymptom(id,preferredMuscleId,record=true)')) &&
  index.includes('function selectSymptomFlowMuscle') &&
  index.includes("symptomId:id,muscleId:preserved")
);
check('Differential/exam/ultrasound direct routing uses clinical hierarchy',
  index.includes('async function openClinicalFlowStep(id,step)') &&
  index.includes('await openClinicalModule(moduleKey,true)') &&
  index.includes('await openClinicalTopic(step,true)') &&
  index.includes('await openClinicalItem(itemId,true)')
);
check('Ultrasound route can focus canonical stable view',
  index.includes("itemId=canonicalUltrasoundViewsForMuscle(id)") &&
  index.includes("x=>x.ultrasound_view_id||x.id")
);
check('Fixed-muscle quiz exists',
  index.includes('function startQuizForMuscle') &&
  index.includes('for(let i=0;i<10;i++)')
);
check('Fixed quiz alternates forward/reverse',
  index.includes("i%2===0?'forward':'reverse'")
);
check('Flow routes to fixed quiz, Oral and education',
  index.includes("if(step==='quiz')") && index.includes('startQuizForMuscle(id)') &&
  index.includes("if(step==='viva')") && index.includes('startOralForMuscle(id)') &&
  index.includes("if(step==='education')") && index.includes('openEducationForMuscle(id)')
);

const modules=[
 'shoulder','elbow','wrist-hand','hip-pelvis','knee-thigh',
 'leg-ankle-foot','cervical','thoracic-back-chestwall','lumbar-sacral','abdominal-core'
];
let testCount=0,candidateCount=0;
const dataErrors=[];
for(const mod of modules){
  const exam=JSON.parse(fs.readFileSync('data/examination-'+mod+'-v1.json','utf8'));
  const diff=JSON.parse(fs.readFileSync('data/differential-'+mod+'-v1.json','utf8'));
  if(!String(diff.safety_rule||'').trim())dataErrors.push(mod+':missing_safety_rule');
  for(const t of exam.clinical_tests||[]){
    testCount++;
    for(const k of ['clinical_test_id','category','setup','maneuver','positive_definition','interpretation_note','limitation']){
      if(!String(t[k]||'').trim())dataErrors.push(mod+':'+(t.clinical_test_id||'?')+':missing_'+k);
    }
  }
  for(const g of diff.differential_groups||[]){
    for(const c of g.candidates||[]){
      candidateCount++;
      if(!c.diagnosis_concept_id)dataErrors.push(mod+':candidate_missing_id');
      if(!Array.isArray(c.look_for)||!c.look_for.length)dataErrors.push(mod+':'+c.diagnosis_concept_id+':missing_supporting');
      if(!Array.isArray(c.not_diagnostic_alone)||!c.not_diagnostic_alone.length)dataErrors.push(mod+':'+c.diagnosis_concept_id+':missing_opposing_limit');
    }
  }
}
check('Clinical test contract complete',testCount===148 && dataErrors.filter(x=>x.includes('missing_')&&!x.includes('candidate')).length===0,String(testCount));
const targetlessTests=(core.clinical_tests||[]).filter(t=>!Array.isArray(t.target_structure_ids)||!t.target_structure_ids.length);
check('Targetless regional/system tests retain stable clinical_test_id',targetlessTests.every(t=>/^ct\d+$/.test(t.clinical_test_id)),targetlessTests.map(t=>t.clinical_test_id).join(','));
check('Differential supporting/opposing clue contract complete',candidateCount>0 && dataErrors.filter(x=>x.includes('candidate')||x.includes('missing_supporting')||x.includes('missing_opposing')).length===0,String(candidateCount));
check('All 10 modules have red-flag safety boundary',dataErrors.filter(x=>x.includes('missing_safety_rule')).length===0);

check('Clinical cards expose purpose/method/positive/limitations',
  ['<b>목적</b>','<b>방법</b>','<b>양성 기준</b>','<b>한계 / 흔한 오류</b>','Stable ID'].every(x=>index.includes(x))
);
check('Red flag rendered separately',
  index.includes('clinical-redflag') &&
  index.includes('Red flag / 안전 경계')
);
check('Supporting/opposing clues rendered separately',
  index.includes('clinical-support') &&
  index.includes('clinical-oppose') &&
  index.includes('지지 단서') &&
  index.includes('반대·제한 단서')
);
for(const type of ['tendon','nerve','joint','bursa','ligament']){
  check('Quick navigation entity '+type,index.includes("'"+type+"'"));
}
check('Stable clinical test navigation exists',
  index.includes("'clinical_test'") &&
  index.includes("'clinical-test-'+t.clinical_test_id")
);
check('Stable diagnosis concept navigation exists',
  index.includes("'diagnosis_concept'") &&
  index.includes("'diagnosis-concept-'+c.diagnosis_concept_id")
);
check('Stable ultrasound view navigation exists',
  index.includes("'ultrasound_view'") &&
  index.includes("'ultrasound-view-'+v.ultrasound_view_id")
);

const coreIds=new Set([
 ...(core.muscles||[]).map(x=>x.muscle_id),
 ...(core.tendons||[]).map(x=>x.tendon_id),
 ...(core.nerves||[]).map(x=>x.nerve_id),
 ...(core.joints||[]).map(x=>x.joint_id),
 ...(core.bursae||[]).map(x=>x.bursa_id),
 ...(core.ligaments||[]).map(x=>x.ligament_id),
 ...(core.fasciae||[]).map(x=>x.fascia_id)
]);
const badTargets=[];
for(const t of core.clinical_tests||[])for(const id of t.target_structure_ids||[])if(!coreIds.has(id))badTargets.push(t.clinical_test_id+':'+id);
for(const v of core.ultrasound_views||[])for(const id of v.target_structure_ids||[])if(!coreIds.has(id))badTargets.push(v.ultrasound_view_id+':'+id);
check('Stable target structure IDs resolve',badTargets.length===0,badTargets.slice(0,20).join(','));

check('Patient-specific automatic recommendation prohibited',
  index.includes('환자별 진단·치료 권고를 자동 생성하지 않습니다.')
);
check('No Stage 21 PHI storage/transmission path',
  !/learningFlowContext\s*=\s*\{[^}]*patient/i.test(index) &&
  !/learningFlowContext\s*=\s*\{[^}]*encounter/i.test(index)
);
check('Annotation loop guard exists',
  index.includes("note.dataset.stage21Contract==='1'") &&
  index.includes("note.dataset.stage21Contract='1'")
);
check('No known declaration corruption',
  !index.includes('let patientExerciseLibrary=let patientExerciseLibrary')
);

let fail=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)fail++;
}
console.log('\n--- STAGE 21 CLINICAL LEARNING FLOW 2.0 QA ---');
console.log(`PASS=${checks.length-fail} FAIL=${fail}`);
if(dataErrors.length)console.log('DATA_ERRORS='+dataErrors.slice(0,30).join(','));
if(fail)process.exit(1);
