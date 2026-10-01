import fs from 'node:fs';
import {resolveUnrecoverableBinary} from './resolve-unrecoverable-realistic-binary.mjs';
import {classifyProfile,getNextMainlineTask} from './next-realistic-exercise-task.mjs';
import {canGenerateRealisticProfile} from './can-generate-realistic-profile.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const p7=manifest.profiles.find(x=>x.profile_id==='px007');
check('px007 binary loss is explicitly resolved',p7?.status==='PENDING_REGENERATION'&&p7?.recovery?.state==='EXACT_BINARY_UNRECOVERABLE',JSON.stringify({status:p7?.status,recovery:p7?.recovery}));
check('px007 old candidate history preserves exact gen_id',p7?.lost_candidate_history?.some(x=>x.gen_id==='8c940201-f1c0-4440-832d-83972f8efbb8'));
check('px007 old review is preserved in history',p7?.lost_candidate_history?.some(x=>x.candidate_review?.clinical_content==='PASS'&&x.candidate_review?.visual_pose==='PASS'));
check('px007 active candidate identity is cleared before regeneration',p7?.gen_id===null&&p7?.candidate_checkpoint_path===null&&p7?.candidate_review===null);
check('px007 remains off-screen',p7?.composite_url===null&&p7?.candidate_asset_path===null);
check('px007 next task is locked-brief regeneration',classifyProfile(p7).action==='REGENERATE_FROM_LOCKED_BRIEF',classifyProfile(p7).action);
const next=getNextMainlineTask(manifest);
check('mainline still starts at px007',next?.profile_id==='px007'&&next?.action==='REGENERATE_FROM_LOCKED_BRIEF',JSON.stringify(next));
const permission=canGenerateRealisticProfile(manifest,'px007');
check('px007 regeneration is permitted after documented loss',permission.allowed===true&&permission.reason==='READY_REGENERATION',JSON.stringify(permission));

const synthetic=structuredClone(manifest);
const target=synthetic.profiles.find(x=>x.profile_id==='px008');
let refused=false;
try{
  resolveUnrecoverableBinary(synthetic,'px008','wrong-gen-id',{evidence:['synthetic']});
}catch(e){refused=/gen_id mismatch/.test(String(e.message));}
check('wrong gen_id cannot resolve a binary loss',refused);

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- REALISTIC BINARY LOSS RESOLUTION QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
