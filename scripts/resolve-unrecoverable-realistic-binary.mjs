import fs from 'node:fs';
import {checkpointIdentity} from './register-realistic-candidate.mjs';

export function resolveUnrecoverableBinary(manifest,profileId,expectedGenId,{resolvedOn='2026-10-01',evidence=[]}={}){
  const p=manifest.profiles?.find(x=>x.profile_id===profileId);
  if(!p)throw new Error('Unknown profile: '+profileId);
  if(p.status!=='CANDIDATE_GENERATED')throw new Error(profileId+' is not a generated candidate');
  if(p.asset_gate!=='BINARY_HANDOFF_BLOCKED'||p.binary_handoff?.state!=='BLOCKED'){
    throw new Error(profileId+' is not in binary-handoff blocked state');
  }
  if(!expectedGenId||p.gen_id!==expectedGenId)throw new Error(profileId+' gen_id mismatch');
  if(p.candidate_asset_path)throw new Error(profileId+' already has candidate asset path');
  if(p.binary_receipt?.sha256)throw new Error(profileId+' has a binary receipt; recovery must be attempted');
  if(!p.candidate_checkpoint_path)throw new Error(profileId+' checkpoint path missing');
  const identity=checkpointIdentity(p.candidate_checkpoint_path);
  if(identity.profile_id!==profileId||identity.gen_id!==expectedGenId){
    throw new Error(profileId+' checkpoint identity mismatch');
  }
  const oldReview=p.candidate_review||null;
  const oldCheckpoint=p.candidate_checkpoint_path;
  const history=Array.isArray(p.lost_candidate_history)?p.lost_candidate_history:[];
  history.push({
    gen_id:expectedGenId,
    checkpoint_path:oldCheckpoint,
    candidate_review:oldReview,
    resolved_on:resolvedOn,
    resolution:'EXACT_BINARY_UNRECOVERABLE',
    evidence:[...evidence]
  });
  p.lost_candidate_history=history;
  p.status='PENDING_REGENERATION';
  p.asset_gate='BINARY_LOSS_CONFIRMED_REGENERATION_ALLOWED';
  p.recovery={
    state:'EXACT_BINARY_UNRECOVERABLE',
    resolved_on:resolvedOn,
    prior_gen_id:expectedGenId,
    prior_checkpoint_path:oldCheckpoint,
    next_action:'REGENERATE_FROM_LOCKED_BRIEF',
    rule:'New generation must receive a new gen_id and fresh three-axis review before ingest.'
  };
  p.gen_id=null;
  p.candidate_checkpoint_path=null;
  p.candidate_review=null;
  p.binary_handoff={state:'UNRECOVERABLE_RESOLVED',resolved_on:resolvedOn};
  p.candidate_asset_path=null;
  p.composite_url=null;
  return p;
}

if(process.argv[1]&&process.argv[1].endsWith('resolve-unrecoverable-realistic-binary.mjs')){
  try{
    const [profileId,genId]=process.argv.slice(2);
    if(!profileId||!genId)throw new Error('Usage: node scripts/resolve-unrecoverable-realistic-binary.mjs pxNNN <lost_gen_id>');
    const path='data/patient-exercise-realistic-assets-v1.json';
    const manifest=JSON.parse(fs.readFileSync(path,'utf8'));
    const p=resolveUnrecoverableBinary(manifest,profileId,genId,{
      evidence:[
        'candidate checkpoint records conversation-generated binary not repository-materialized',
        'candidate_asset_path is null',
        'binary_receipt is absent',
        'canonical repository asset path is absent'
      ]
    });
    fs.writeFileSync(path,JSON.stringify(manifest,null,2)+'\n');
    console.log(JSON.stringify(p,null,2));
  }catch(error){
    console.error('BINARY LOSS RESOLUTION FAIL | '+error.message);
    process.exit(1);
  }
}
