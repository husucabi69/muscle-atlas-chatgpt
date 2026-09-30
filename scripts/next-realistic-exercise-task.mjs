import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

export const MANIFEST_PATH='data/patient-exercise-realistic-assets-v1.json';

function fail(message){throw new Error(message);}

export function classifyProfile(profile){
  if(!profile)fail('Profile missing.');
  const blockers=Array.isArray(profile.approval_blockers)?profile.approval_blockers:[];
  if(profile.status==='APPROVED'){
    if(profile.asset_gate==='MOBILE_PREVIEW_APPROVED_A4_HD_PENDING'){
      return{action:'APPROVED_MOBILE_A4_HD_PENDING',blocking:false};
    }
    return{action:'APPROVED_COMPLETE',blocking:false};
  }
  if(profile.status==='CANDIDATE_GENERATED'){
    if(blockers.length){
      return{
        action:'REGENERATE_FROM_LOCKED_BRIEF',
        blocking:true,
        blocker_codes:blockers.map(x=>x.code||'UNKNOWN')
      };
    }
    return{action:'MATERIALIZE_AND_PREVIEW_REVIEW',blocking:true};
  }
  if(profile.status==='PENDING_GENERATION'){
    if(!profile.generation_brief){
      return{action:'LOCK_GENERATION_BRIEF',blocking:true};
    }
    return{action:'GENERATE_FROM_LOCKED_BRIEF',blocking:true};
  }
  if(profile.status==='STYLE_REFERENCE_APPROVED'){
    return{action:'GENERATE_FINAL_ASSET_FROM_STYLE_REFERENCE',blocking:true};
  }
  return{action:'REVIEW_UNKNOWN_STATE',blocking:true};
}

export function getNextMainlineTask(manifest){
  const profiles=[...(manifest.profiles||[])].sort((a,b)=>a.profile_id.localeCompare(b.profile_id));
  for(const profile of profiles){
    const state=classifyProfile(profile);
    if(state.blocking){
      return{
        profile_id:profile.profile_id,
        title_ko:profile.title_ko,
        status:profile.status,
        action:state.action,
        blocker_codes:state.blocker_codes||[],
        gen_id:profile.gen_id||null,
        asset_gate:profile.asset_gate||null
      };
    }
  }
  const a4=profiles.find(x=>classifyProfile(x).action==='APPROVED_MOBILE_A4_HD_PENDING');
  if(a4){
    return{
      profile_id:a4.profile_id,
      title_ko:a4.title_ko,
      status:a4.status,
      action:'UPGRADE_A4_HD_ASSET_AFTER_MOBILE_SET_COMPLETE',
      blocker_codes:[],
      gen_id:a4.gen_id||null,
      asset_gate:a4.asset_gate||null
    };
  }
  return null;
}

export function loadNextTask(manifestPath=MANIFEST_PATH){
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  return getNextMainlineTask(manifest);
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    const task=loadNextTask();
    if(!task){
      console.log('NO_PENDING_REALISTIC_EXERCISE_TASK');
    }else{
      console.log(JSON.stringify(task,null,2));
    }
  }catch(error){
    console.error('NEXT TASK FAIL | '+error.message);
    process.exit(1);
  }
}
