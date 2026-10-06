import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {nextPilotProfile} from './build-physical-exam-realistic-prompt.mjs';

export const REGISTRY_PATH='data/physical-exam-realistic-assets-v1.json';

export function canGeneratePhysicalExamProfile(manifest,clinicalTestId,options={}){
  const profile=manifest.profiles?.find(x=>x.clinical_test_id===clinicalTestId);
  if(!profile)return{allowed:false,reason:'UNKNOWN_CLINICAL_TEST',clinical_test_id:clinicalTestId};

  if(String(profile.status||'').startsWith('INCOMPLETE_DEFERRED')||profile.review?.user_preview==='DEFERRED'){
    return{allowed:false,reason:'USER_DEFERRED',clinical_test_id:clinicalTestId,status:profile.status};
  }
  if(profile.status==='APPROVED'){
    return{allowed:false,reason:'APPROVED_REGENERATION_LOCKED',clinical_test_id:clinicalTestId};
  }
  if(profile.status==='CANDIDATE_GENERATED_USER_PREVIEW_PENDING'){
    return{allowed:false,reason:'USER_PREVIEW_PENDING_NO_DUPLICATE_GENERATION',clinical_test_id:clinicalTestId};
  }
  if(profile.status!=='PENDING_GENERATION'||profile.brief_status!=='GENERATION_READY'){
    return{allowed:false,reason:'TARGET_NOT_GENERATION_READY',clinical_test_id:clinicalTestId,status:profile.status,brief_status:profile.brief_status};
  }

  const pilot=manifest.pilot||{};
  if(!Array.isArray(pilot.clinical_test_ids)||!pilot.clinical_test_ids.includes(clinicalTestId)){
    return{allowed:false,reason:'NOT_IN_ACTIVE_PILOT',clinical_test_id:clinicalTestId};
  }
  if(profile.pilot_batch!==pilot.batch_id){
    return{allowed:false,reason:'PILOT_BATCH_MISMATCH',clinical_test_id:clinicalTestId,pilot_batch:profile.pilot_batch,active_batch:pilot.batch_id};
  }

  const next=nextPilotProfile(manifest);
  if(next?.clinical_test_id!==clinicalTestId){
    return{
      allowed:false,
      reason:'OUT_OF_ORDER',
      clinical_test_id:clinicalTestId,
      required_next_clinical_test_id:next?.clinical_test_id||null
    };
  }

  if(options.binaryMaterializationAvailable!==true){
    return{
      allowed:false,
      reason:'BINARY_MATERIALIZATION_UNAVAILABLE',
      clinical_test_id:clinicalTestId,
      required_next_action:'Generate only in a session that can immediately save, hash-check, register and Preview the generated binary.'
    };
  }

  return{
    allowed:true,
    reason:'READY',
    clinical_test_id:clinicalTestId,
    pilot_batch:profile.pilot_batch,
    generation_brief_version:profile.generation_brief_version||null
  };
}

export function loadRegistry(path=REGISTRY_PATH){
  return JSON.parse(fs.readFileSync(path,'utf8'));
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const manifest=loadRegistry();
  const arg=process.argv[2]||'--next';
  const target=arg==='--next'?nextPilotProfile(manifest)?.clinical_test_id:arg;
  if(!target){
    console.log(JSON.stringify({allowed:false,reason:'NO_GENERATION_READY_TARGET'},null,2));
    process.exit(1);
  }
  const result=canGeneratePhysicalExamProfile(manifest,target,{
    binaryMaterializationAvailable:process.env.BINARY_MATERIALIZATION_AVAILABLE==='YES'
  });
  console.log(JSON.stringify(result,null,2));
  if(!result.allowed)process.exit(1);
}
