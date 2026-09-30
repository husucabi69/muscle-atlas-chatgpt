import fs from 'node:fs';
import {registerCandidate} from './register-realistic-candidate.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));

let blockedApproved=false;
try{
  const approvedClone=structuredClone(manifest);
  registerCandidate(approvedClone,'px001','assets/patient-exercise-realistic/px001.webp',{gen_id:'test'});
}catch(e){blockedApproved=String(e.message).includes('already APPROVED');}

let badPathRejected=false;
try{
  const x=structuredClone(manifest);
  const p=x.profiles.find(v=>v.profile_id==='px007');
  p.asset_gate='PREVIEW_REVIEW_PENDING';
  p.binary_handoff={state:'MATERIALIZED_PENDING_REVIEW'};
  registerCandidate(x,'px007','assets/patient-exercise-realistic/px006.webp',{gen_id:p.gen_id});
}catch(e){badPathRejected=String(e.message).includes('canonical path');}

const fixtureCheckpoint='tmp-px006-binary-handoff-checkpoint.json';
fs.writeFileSync(fixtureCheckpoint,JSON.stringify({
  profile_id:'px006',
  gen_id:'qa-fixture',
  candidate_review:{clinical_content:'PASS',visual_pose:'PASS',embedded_text:'PASS'}
}));

let wrongGenRejected=false;
try{
  const x=structuredClone(manifest);
  const p=x.profiles.find(v=>v.profile_id==='px006');
  p.status='CANDIDATE_GENERATED';
  p.composite_url=null;
  p.gen_id='qa-fixture';
  p.candidate_checkpoint_path=fixtureCheckpoint;
  p.asset_gate='BINARY_HANDOFF_BLOCKED';
  p.binary_handoff={state:'BLOCKED'};
  registerCandidate(x,'px006','assets/patient-exercise-realistic/px006.webp',{gen_id:'wrong-gen'});
}catch(e){wrongGenRejected=String(e.message).includes('gen_id mismatch');}

let blockedResult=null,blockedError=null;
try{
  const x=structuredClone(manifest);
  const p=x.profiles.find(v=>v.profile_id==='px006');
  p.status='CANDIDATE_GENERATED';
  p.composite_url=null;
  p.gen_id='qa-fixture';
  p.candidate_checkpoint_path=fixtureCheckpoint;
  p.asset_gate='BINARY_HANDOFF_BLOCKED';
  p.binary_handoff={state:'BLOCKED'};
  p.candidate_review={clinical_content:'PASS',visual_pose:'PASS',embedded_text:'PASS',reviewed_on:'2026-10-01'};
  blockedResult=registerCandidate(x,'px006','assets/patient-exercise-realistic/px006.webp',{gen_id:'qa-fixture',generated_on:'2026-10-01'});
}catch(e){blockedError=e.message;}

let normalResult=null,normalError=null;
try{
  const x=structuredClone(manifest);
  const p=x.profiles.find(v=>v.profile_id==='px006');
  p.status='PENDING_GENERATION';
  p.composite_url=null;
  p.asset_gate='GENERATE_FROM_LOCKED_BRIEF';
  p.binary_handoff=null;
  p.candidate_checkpoint_path=null;
  normalResult=registerCandidate(x,'px006','assets/patient-exercise-realistic/px006.webp',{gen_id:'normal-fixture',generated_on:'2026-10-01'});
}catch(e){normalError=e.message;}

fs.unlinkSync(fixtureCheckpoint);

const checks=[
  ['approved asset cannot be overwritten',blockedApproved],
  ['wrong canonical asset path is rejected',badPathRejected],
  ['blocked handoff rejects wrong gen_id',wrongGenRejected],
  ['exact blocked handoff can materialize known-valid WebP',Boolean(blockedResult),blockedError||''],
  ['exact handoff verifies checkpoint identity',blockedResult?.checkpoint_verified===true],
  ['exact handoff records materialized-pending-review state',blockedResult?.profile?.binary_handoff?.state==='MATERIALIZED_PENDING_REVIEW'],
  ['pre-materialization review is preserved for audit',blockedResult?.profile?.pre_materialization_review?.clinical_content==='PASS'],
  ['repository binary must be re-reviewed before display',blockedResult?.profile?.candidate_review?.clinical_content==='PENDING'&&blockedResult?.profile?.composite_url===null],
  ['normal valid WebP can still be registered',Boolean(normalResult),normalError||''],
  ['normal registration records binary integrity PASS',normalResult?.profile?.binary_integrity?.result==='PASS'],
  ['blocked handoff stores SHA-256 fingerprint',/^[0-9a-f]{64}$/.test(blockedResult?.profile?.binary_integrity?.sha256||'')],
  ['normal registration stores SHA-256 fingerprint',/^[0-9a-f]{64}$/.test(normalResult?.profile?.binary_integrity?.sha256||'')]
];
let failed=0;
for(const [name,pass,detail=''] of checks){
  console.log(`${pass?'PASS':'FAIL'} | ${name}${detail?' | '+detail:''}`);
  if(!pass)failed++;
}
console.log('\n--- REALISTIC CANDIDATE REGISTRATION QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
