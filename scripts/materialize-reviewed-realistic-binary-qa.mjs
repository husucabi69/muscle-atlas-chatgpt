import fs from 'node:fs';
import {planReviewedBinaryMaterialization} from './materialize-reviewed-realistic-binary.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const checkpoint='tmp-materialize-reviewed-binary-checkpoint.json';
fs.writeFileSync(checkpoint,JSON.stringify({
  profile_id:'px006',
  gen_id:'qa-materialize',
  candidate_review:{clinical_content:'PASS',visual_pose:'PASS',embedded_text:'PASS'}
}));

const synthetic=structuredClone(manifest);
const p=synthetic.profiles.find(x=>x.profile_id==='px006');
p.status='CANDIDATE_GENERATED';
p.composite_url=null;
p.gen_id='qa-materialize';
p.asset_gate='BINARY_HANDOFF_BLOCKED';
p.binary_handoff={state:'BLOCKED'};
p.candidate_checkpoint_path=checkpoint;
p.candidate_review={clinical_content:'PASS',visual_pose:'PASS',embedded_text:'PASS'};

let plan=null,error=null;
try{
  plan=planReviewedBinaryMaterialization(synthetic,'px006','assets/patient-exercise-realistic/px006.webp','qa-materialize');
}catch(e){error=e.message;}

let wrongGen=false;
try{
  planReviewedBinaryMaterialization(synthetic,'px006','assets/patient-exercise-realistic/px006.webp','wrong');
}catch(e){wrongGen=String(e.message).includes('gen_id mismatch');}

let approvedBlocked=false;
try{
  planReviewedBinaryMaterialization(manifest,'px001','assets/patient-exercise-realistic/px001.webp','anything');
}catch(e){approvedBlocked=String(e.message).includes('already APPROVED');}

fs.unlinkSync(checkpoint);

const checks=[
  ['valid blocked candidate materialization plan resolves',Boolean(plan),error||''],
  ['plan keeps exact gen_id',plan?.gen_id==='qa-materialize',plan?.gen_id||''],
  ['plan points to canonical WebP target',plan?.canonical_path==='assets/patient-exercise-realistic/px006.webp',plan?.canonical_path||''],
  ['plan validates source WebP fingerprint',/^[0-9a-f]{64}$/.test(plan?.source_info?.sha256||''),plan?.source_info?.sha256||''],
  ['wrong gen_id is rejected',wrongGen],
  ['approved profile cannot enter reviewed-binary materialization',approvedBlocked]
];
let failed=0;
for(const [name,pass,detail=''] of checks){
  console.log(`${pass?'PASS':'FAIL'} | ${name}${detail?' | '+detail:''}`);
  if(!pass)failed++;
}
console.log('\n--- REVIEWED BINARY MATERIALIZATION QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
