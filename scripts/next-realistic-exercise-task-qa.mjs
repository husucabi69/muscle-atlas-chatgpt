import fs from 'node:fs';
import {classifyProfile,getNextMainlineTask} from './next-realistic-exercise-task.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const next=getNextMainlineTask(manifest);
check('Current next realistic task resolves',Boolean(next),JSON.stringify(next));
check('Current next task is px006 after px001-px005 approval',next?.profile_id==='px006',JSON.stringify(next));
check('px006 requires regeneration from locked brief',next?.action==='REGENERATE_FROM_LOCKED_BRIEF',next?.action||'');
check('px006 carries unsupported fixed-dosage blocker',next?.blocker_codes?.includes('UNSUPPORTED_FIXED_DOSAGE_TEXT'),(next?.blocker_codes||[]).join(','));

const p8=manifest.profiles.find(x=>x.profile_id==='px008');
const p9=manifest.profiles.find(x=>x.profile_id==='px009');
const p10=manifest.profiles.find(x=>x.profile_id==='px010');

check('Clean candidate without binary maps to binary acquisition/review',
  classifyProfile({...p8,approval_blockers:[],candidate_asset_path:null}).action==='OBTAIN_BINARY_AND_PREVIEW_REVIEW'
);
check('Candidate binary with pending review maps to Preview review',
  classifyProfile({...p8,approval_blockers:[],candidate_asset_path:'./assets/patient-exercise-realistic/px008.webp',candidate_review:{clinical_content:'PASS',visual_pose:'PENDING',embedded_text:'PASS'}}).action==='PREVIEW_REVIEW_CANDIDATE'
);
check('Candidate binary with three-part PASS maps to ingest',
  classifyProfile({...p8,approval_blockers:[],candidate_asset_path:'./assets/patient-exercise-realistic/px008.webp',candidate_review:{clinical_content:'PASS',visual_pose:'PASS',embedded_text:'PASS'}}).action==='INGEST_REVIEWED_CANDIDATE'
);
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
