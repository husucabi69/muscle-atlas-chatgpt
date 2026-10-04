import fs from 'node:fs';

export function restoreLateRecoveredReviewedBinary(manifest, profileId, {
  gen_id,
  checkpoint_path,
  sha256,
  bytes,
  resolution,
  recovered_on=new Date().toISOString().slice(0,10),
  source_note='late recovered exact reviewed binary'
}={}){
  const profile=manifest.profiles?.find(x=>x.profile_id===profileId);
  if(!profile) throw new Error('Unknown profile: '+profileId);
  if(profile.status==='APPROVED') throw new Error(profileId+' is already APPROVED');
  if(!gen_id || !checkpoint_path) throw new Error('gen_id and checkpoint_path required');
  if(!/^[a-f0-9]{64}$/i.test(String(sha256||''))) throw new Error('valid SHA-256 required');
  if(!Number.isInteger(bytes) || bytes<=0) throw new Error('positive byte count required');
  const history=Array.isArray(profile.lost_candidate_history)?profile.lost_candidate_history:[];
  const lost=history.find(x=>x.gen_id===gen_id && x.checkpoint_path===checkpoint_path);
  if(!lost) throw new Error('late recovery must match preserved lost_candidate_history');
  const review=lost.candidate_review;
  if(!review || !['clinical_content','visual_pose','embedded_text'].every(k=>review[k]==='PASS')){
    throw new Error('historical three-axis PASS review required');
  }
  profile.status='CANDIDATE_GENERATED';
  profile.gen_id=gen_id;
  profile.candidate_checkpoint_path=checkpoint_path;
  profile.candidate_asset_path=null;
  profile.asset_gate='BINARY_HANDOFF_BLOCKED';
  profile.approval_blockers=[];
  profile.candidate_review={...review,note:(review.note||'')+' Late recovery restores the reviewed candidate identity only; repository-file re-review is still required after materialization.'};
  profile.binary_receipt={sha256,bytes,source:'late_recovery'};
  profile.binary_handoff={
    state:'BLOCKED',
    checked_on:recovered_on,
    reason:'Exact reviewed binary was recovered after the earlier loss audit but is not yet repository-materialized.',
    next_action:'Materialize the recovered exact binary; do not regenerate this profile.',
    recovered_binary:{sha256,bytes,resolution:resolution||null,source_note}
  };
  profile.recovery={
    ...(profile.recovery||{}),
    state:'EXACT_BINARY_RECOVERED_NOT_MATERIALIZED',
    recovered_on,
    recovered_webp_sha256:sha256,
    recovered_webp_bytes:bytes,
    recovered_webp_resolution:resolution||null,
    next_action:'MATERIALIZE_RECOVERED_EXACT_BINARY',
    rule:'Preserve prior loss audit as history; do not regenerate the recovered reviewed candidate.'
  };
  return profile;
}

if(process.argv[1] && process.argv[1].endsWith('restore-reviewed-realistic-binary-recovery.mjs')){
  try{
    const [profileId,genId,checkpointPath,sha256,bytesArg,resolution]=process.argv.slice(2);
    if(!profileId||!genId||!checkpointPath||!sha256||!bytesArg) throw new Error('Usage: node scripts/restore-reviewed-realistic-binary-recovery.mjs pxNNN <gen_id> <checkpoint> <sha256> <bytes> [resolution]');
    const manifestPath='data/patient-exercise-realistic-assets-v1.json';
    const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
    const restored=restoreLateRecoveredReviewedBinary(manifest,profileId,{gen_id:genId,checkpoint_path:checkpointPath,sha256,bytes:Number(bytesArg),resolution});
    fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
    console.log(JSON.stringify({profile_id:restored.profile_id,status:restored.status,asset_gate:restored.asset_gate,recovery:restored.recovery,binary_receipt:restored.binary_receipt},null,2));
  }catch(error){
    console.error('LATE BINARY RECOVERY RESTORE FAIL | '+error.message);
    process.exit(1);
  }
}
