import fs from 'node:fs';
import {registerCandidate} from './register-realistic-candidate.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const clone=structuredClone(manifest);
const p7=clone.profiles.find(x=>x.profile_id==='px007');
let blockedApproved=false;
try{
  const approvedClone=structuredClone(manifest);
  registerCandidate(approvedClone,'px001','assets/patient-exercise-realistic/px001.webp',{gen_id:'test'});
}catch(e){blockedApproved=String(e.message).includes('already APPROVED');}

let badPathRejected=false;
try{
  registerCandidate(structuredClone(manifest),'px007','assets/patient-exercise-realistic/px006.webp',{gen_id:'test'});
}catch(e){badPathRejected=String(e.message).includes('canonical path');}

const tmp=structuredClone(manifest);
const target=tmp.profiles.find(x=>x.profile_id==='px007');
target.status='PENDING_GENERATION';
let result=null,error=null;
try{
  // px006 is a known-valid fixture; temporarily give the test profile the matching ID/path contract.
  const fixture=structuredClone(tmp);
  const testProfile=fixture.profiles.find(x=>x.profile_id==='px006');
  testProfile.status='PENDING_GENERATION';
  testProfile.composite_url=null;
  result=registerCandidate(fixture,'px006','assets/patient-exercise-realistic/px006.webp',{gen_id:'qa-fixture',generated_on:'2026-09-30'});
}catch(e){error=e.message;}

const checks=[
  ['approved asset cannot be overwritten',blockedApproved],
  ['wrong canonical asset path is rejected',badPathRejected],
  ['known-valid WebP can be registered',Boolean(result),error||''],
  ['registration leaves asset off-screen',result?.profile?.composite_url===null],
  ['registration requires three-part review',result?.profile?.asset_gate==='PREVIEW_REVIEW_PENDING'],
  ['registration records binary integrity PASS',result?.profile?.binary_integrity?.result==='PASS']
];
let failed=0;
for(const [name,pass,detail=''] of checks){
  console.log(`${pass?'PASS':'FAIL'} | ${name}${detail?' | '+detail:''}`);
  if(!pass)failed++;
}
console.log('\n--- REALISTIC CANDIDATE REGISTRATION QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
