import fs from 'node:fs';
import {classifyProfile,getNextMainlineTask} from './next-realistic-exercise-task.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const next=getNextMainlineTask(manifest);
check('Current next realistic task resolves',Boolean(next),JSON.stringify(next));
check('Current next task is px007',next?.profile_id==='px007',JSON.stringify(next));
check('px007 requires regeneration from locked brief',next?.action==='REGENERATE_FROM_LOCKED_BRIEF',next?.action||'');
check('px007 carries hand intrinsic blocker',next?.blocker_codes?.includes('HAND_INTRINSIC_MOTION_MISMATCH'),(next?.blocker_codes||[]).join(','));

const p8=manifest.profiles.find(x=>x.profile_id==='px008');
const p9=manifest.profiles.find(x=>x.profile_id==='px009');
const p10=manifest.profiles.find(x=>x.profile_id==='px010');

check('Clean generated candidate maps to materialization/review',classifyProfile({...p8,approval_blockers:[]}).action==='MATERIALIZE_AND_PREVIEW_REVIEW');
check('Blocked candidate maps to regeneration',classifyProfile(p9).action==='REGENERATE_FROM_LOCKED_BRIEF');
check('Pending profile with brief maps to generation',classifyProfile(p10).action==='GENERATE_FROM_LOCKED_BRIEF');

const allApproved={...manifest,profiles:manifest.profiles.map(x=>({...x,status:'APPROVED',asset_gate:'A4_HD_APPROVED',approval_blockers:[],composite_url:'./assets/patient-exercise-realistic/'+x.profile_id+'.webp'}))};
check('All approved returns no pending task',getNextMainlineTask(allApproved)===null);

const mobileOnly={...manifest,profiles:manifest.profiles.map(x=>({...x,status:'APPROVED',asset_gate:'MOBILE_PREVIEW_APPROVED_A4_HD_PENDING',approval_blockers:[],composite_url:'./assets/patient-exercise-realistic/'+x.profile_id+'.webp'}))};
const a4Next=getNextMainlineTask(mobileOnly);
check('A4 upgrades wait until mobile set complete',a4Next?.action==='UPGRADE_A4_HD_ASSET_AFTER_MOBILE_SET_COMPLETE',JSON.stringify(a4Next));

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- REALISTIC NEXT-TASK QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
