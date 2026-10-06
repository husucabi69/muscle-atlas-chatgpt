import fs from 'node:fs';
import {evaluatePhysicalExamCandidate} from './physical-exam-candidate-preflight.mjs';

const manifest=JSON.parse(fs.readFileSync('data/physical-exam-realistic-assets-v1.json','utf8'));
const p=manifest.profiles.find(x=>x.clinical_test_id==='ct086');
const checks=[];
const check=(name,pass,detail='')=>{
  checks.push({name,pass:Boolean(pass),detail});
  console.log((pass?'PASS':'FAIL')+' | '+name+(detail?' | '+detail:''));
};

const good={
  width:1024,height:1536,
  patient_gender:'female',
  examiner_gender:'female',
  same_patient_all_panels:true,
  same_examiner_all_panels:true,
  examiner_visible_all_panels:true,
  active_rotation_only:true,
  passive_force_present:false,
  trunk_shoulders_fixed:true,
  visible_text:['1 중립 자세','2 좌우 회전','3 제한 / 보상'],
  numeric_angle_present:false,
  degree_symbol_present:false,
  red_pain_overlay_present:false,
  infographic_copy_present:false
};
const pass=evaluatePhysicalExamCandidate(p,good);
check('ct086 clean Candidate 5-shaped audit passes preflight',
  pass.eligible&&pass.reason==='PASS_INTERNAL_PREFLIGHT',
  JSON.stringify(pass));

const priorFailure={
  ...good,
  patient_gender:'male',
  examiner_visible_all_panels:false,
  visible_text:['1 중립 자세','2 좌우 회전','3 제한 / 보상','60°'],
  numeric_angle_present:true,
  degree_symbol_present:true,
  red_pain_overlay_present:true,
  infographic_copy_present:true
};
const reject=evaluatePhysicalExamCandidate(p,priorFailure);
check('ct086 prior-failure pattern is rejected',
  !reject.eligible&&
  reject.failed_axes.includes('FEMALE_PATIENT')&&
  reject.failed_axes.includes('EXAMINER_VISIBLE_ALL_PANELS')&&
  reject.failed_axes.includes('THREE_ALLOWED_HEADERS_ONLY')&&
  reject.failed_axes.includes('NO_NUMERIC_ANGLE_OR_CUTOFF')&&
  reject.failed_axes.includes('NO_RED_PAIN_OVERLAY')&&
  reject.failed_axes.includes('NO_INFOGRAPHIC_COPY'),
  JSON.stringify(reject));

const lowRes=evaluatePhysicalExamCandidate(p,{...good,width:600,height:900});
check('ct086 low-resolution candidate is rejected',
  !lowRes.eligible&&lowRes.failed_axes.includes('HD_DIMENSIONS'),
  JSON.stringify(lowRes));

const passive=evaluatePhysicalExamCandidate(p,{...good,active_rotation_only:false,passive_force_present:true});
check('ct086 passive-force candidate is rejected',
  !passive.eligible&&passive.failed_axes.includes('ACTIVE_ROTATION_ONLY'),
  JSON.stringify(passive));

const trunk=evaluatePhysicalExamCandidate(p,{...good,trunk_shoulders_fixed:false});
check('ct086 trunk-compensation candidate is rejected',
  !trunk.eligible&&trunk.failed_axes.includes('TRUNK_SHOULDERS_FIXED'),
  JSON.stringify(trunk));

const failed=checks.filter(x=>!x.pass);
console.log('\nPhysical Examination candidate preflight QA: '+(checks.length-failed.length)+'/'+checks.length+' PASS');
if(failed.length)process.exit(1);
