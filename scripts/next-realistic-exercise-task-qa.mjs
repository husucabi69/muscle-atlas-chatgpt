import fs from 'node:fs';
import {classifyProfile,getNextMainlineTask} from './next-realistic-exercise-task.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const next=getNextMainlineTask(manifest);
check('Current next realistic task resolves',Boolean(next),JSON.stringify(next));
check('Current next task is px007 after px001-px006 approval',next?.profile_id==='px007',JSON.stringify(next));
check('px007 documented binary loss requires locked-brief regeneration',next?.action==='REGENERATE_FROM_LOCKED_BRIEF',next?.action||'');
check('px007 regeneration carries no content blocker',Array.isArray(next?.blocker_codes)&&next.blocker_codes.length===0,(next?.blocker_codes||[]).join(','));
check('px007 profile classifies as regeneration after binary loss',classifyProfile(manifest.profiles.find(x=>x.profile_id==='px007')).action==='REGENERATE_FROM_LOCKED_BRIEF');

const p8=manifest.profiles.find(x=>x.profile_id==='px008');
const p9=manifest.profiles.find(x=>x.profile_id==='px009');
const p10=manifest.profiles.find(x=>x.profile_id==='px010');

const syntheticCandidate={...p8,status:'CANDIDATE_GENERATED',approval_blockers:[],candidate_asset_path:null};
check('Clean candidate without binary maps to binary acquisition/review',
  classifyProfile(syntheticCandidate).action==='OBTAIN_BINARY_AND_PREVIEW_REVIEW'
);
check('Candidate binary with pending review maps to Preview review',
  classifyProfile({...syntheticCandidate,candidate_asset_path:'./assets/patient-exercise-realistic/px008.webp',candidate_review:{clinical_content:'PASS',visual_pose:'PENDING',embedded_text:'PASS'}}).action==='PREVIEW_REVIEW_CANDIDATE'
);
check('Candidate binary with three-part PASS maps to ingest',
  classifyProfile({...syntheticCandidate,candidate_asset_path:'./assets/patient-exercise-realistic/px008.webp',candidate_review:{clinical_content:'PASS',visual_pose:'PASS',embedded_text:'PASS'}}).action==='INGEST_REVIEWED_CANDIDATE'
);
const syntheticBlocked={...p9,status:'CANDIDATE_GENERATED',approval_blockers:[{code:'SYNTHETIC_BLOCK'}]};
check('Blocked candidate maps to regeneration',classifyProfile(syntheticBlocked).action==='REGENERATE_FROM_LOCKED_BRIEF');
check('px008 reviewed overnight candidate waits for exact binary handoff',classifyProfile(p8).action==='OBTAIN_BINARY_AND_PREVIEW_REVIEW');
check('px009 corrected overnight candidate waits for exact binary handoff',classifyProfile(p9).action==='OBTAIN_BINARY_AND_PREVIEW_REVIEW');
check('px010 reviewed overnight candidate waits for exact binary handoff',classifyProfile(p10).action==='OBTAIN_BINARY_AND_PREVIEW_REVIEW');

const after7={...manifest,profiles:manifest.profiles.map(x=>x.profile_id==='px007'?{
  ...x,status:'APPROVED',asset_gate:'MOBILE_PREVIEW_APPROVED_A4_HD_PENDING',
  approval_blockers:[],composite_url:'./assets/patient-exercise-realistic/px007.webp'
}:x)};
const nextAfter7=getNextMainlineTask(after7);
check('After px007 approval, px008 binary handoff is next',nextAfter7?.profile_id==='px008'&&nextAfter7?.action==='OBTAIN_BINARY_AND_PREVIEW_REVIEW',JSON.stringify(nextAfter7));

const after8={...after7,profiles:after7.profiles.map(x=>x.profile_id==='px008'?{
  ...x,status:'APPROVED',asset_gate:'MOBILE_PREVIEW_APPROVED_A4_HD_PENDING',
  approval_blockers:[],composite_url:'./assets/patient-exercise-realistic/px008.webp'
}:x)};
const nextAfter8=getNextMainlineTask(after8);
check('After px008 approval, corrected px009 binary handoff is next',nextAfter8?.profile_id==='px009'&&nextAfter8?.action==='OBTAIN_BINARY_AND_PREVIEW_REVIEW',JSON.stringify(nextAfter8));

const after9={...after8,profiles:after8.profiles.map(x=>x.profile_id==='px009'?{
  ...x,status:'APPROVED',asset_gate:'MOBILE_PREVIEW_APPROVED_A4_HD_PENDING',
  approval_blockers:[],composite_url:'./assets/patient-exercise-realistic/px009.webp'
}:x)};
const nextAfter9=getNextMainlineTask(after9);
check('After px009 approval, px010 bridge binary handoff is next',nextAfter9?.profile_id==='px010'&&nextAfter9?.action==='OBTAIN_BINARY_AND_PREVIEW_REVIEW',JSON.stringify(nextAfter9));

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
