import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const reg=json('data/physical-exam-realistic-assets-v1.json');
const examFiles=[
  'data/examination-shoulder-v1.json','data/examination-elbow-v1.json','data/examination-wrist-hand-v1.json',
  'data/examination-hip-pelvis-v1.json','data/examination-knee-thigh-v1.json','data/examination-leg-ankle-foot-v1.json',
  'data/examination-cervical-v1.json','data/examination-thoracic-back-chestwall-v1.json',
  'data/examination-lumbar-sacral-v1.json','data/examination-abdominal-core-v1.json'
];
const canonical=examFiles.flatMap(p=>(json(p).clinical_tests||[]));
const profiles=reg.profiles||[];
const checks=[];
const check=(name,pass,detail='')=>{
  checks.push({name,pass:Boolean(pass),detail});
  console.log((pass?'PASS':'FAIL')+' | '+name+(detail?' | '+detail:''));
};

check('Canonical clinical tests = 148',canonical.length===148,String(canonical.length));
check('Realistic exam profiles = 148',profiles.length===148,String(profiles.length));
const canonicalIds=new Set(canonical.map(x=>x.clinical_test_id));
const profileIds=new Set(profiles.map(x=>x.clinical_test_id));
check('One-to-one Stable-ID coverage',canonicalIds.size===148&&profileIds.size===148&&[...canonicalIds].every(id=>profileIds.has(id)));
check('EXAM-001 baseline dependency locked',reg.baseline_contract?.exam_001==='COMPLETE_148_OF_148');
check('Realistic style contract linked',String(reg.style_contract||'').includes('REALISTIC_HUMAN_ILLUSTRATION_STYLE_CONTRACT'));
check('Copyright contract linked',String(reg.copyright_contract||'').includes('COPYRIGHT_REGISTRATION_STRATEGY'));
check('AI raw output cannot be final',profiles.every(p=>p.provenance?.ai_raw_output_allowed_as_final===false&&p.provenance?.human_edit_required===true));
const reviewKeys=['clinical_content','visual_pose','examiner_hand_position','force_direction','embedded_text','user_preview'];
const reviewValues=new Set(['PENDING','PASS','FAIL']);
check('All profiles require six review gates',profiles.every(p=>reviewKeys.every(k=>reviewValues.has(p.review?.[k]))));
check('Unreviewed profiles remain PENDING on all six review gates',
  profiles.filter(p=>!p.preview_candidate).every(p=>reviewKeys.every(k=>p.review?.[k]==='PENDING')));
check('All profiles preserve schematic fallback',String(reg.asset_policy?.fallback||'').includes('EXAM-001'));
check('Pilot batch is cervical six-test set',
  JSON.stringify(reg.pilot?.clinical_test_ids||[])===JSON.stringify(['ct082','ct083','ct084','ct088','ct092','ct095']),
  JSON.stringify(reg.pilot?.clinical_test_ids||[]));
check('Pilot profiles are generation-ready',profiles.filter(p=>(reg.pilot?.clinical_test_ids||[]).includes(p.clinical_test_id)).every(p=>p.brief_status==='GENERATION_READY'));
check('No realistic asset falsely approved before generation',profiles.every(p=>p.status==='PENDING_GENERATION'&&p.composite_url===null));

for(const p of profiles){
  const b=p.generation_brief||{};
  check(p.clinical_test_id+' brief completeness',
    String(b.patient_setup||'').length>5&&String(b.examiner_maneuver||'').length>5&&
    String(b.positive_finding||'').length>5&&String(b.limitation_safety||'').length>5);
}

const failed=checks.filter(x=>!x.pass);
console.log('\nPhysical exam realistic asset registry QA: '+(checks.length-failed.length)+'/'+checks.length+' PASS');
if(failed.length)process.exit(1);
