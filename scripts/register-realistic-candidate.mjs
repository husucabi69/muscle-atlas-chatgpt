import fs from 'node:fs';
import path from 'node:path';
import {inspectWebP} from './inspect-realistic-webp.mjs';

export function checkpointIdentity(checkpointPath){
  if(!checkpointPath||!fs.existsSync(checkpointPath))throw new Error('Checkpoint missing: '+String(checkpointPath||''));
  const raw=fs.readFileSync(checkpointPath,'utf8');
  if(path.extname(checkpointPath).toLowerCase()==='.json'){
    const data=JSON.parse(raw);
    const profileId=data.profile_id||data.stable_id||data.profile?.id||null;
    const genId=data.gen_id||data.candidate?.gen_id||null;
    return{profile_id:profileId,gen_id:genId,raw};
  }
  const profileMatch=raw.match(/(?:Stable ID|Profile(?: ID)?|profile_id)\s*[:=]\s*[`"']?(px\d{3})/i);
  const genMatch=raw.match(/(?:Candidate gen_id|gen_id)\s*[:=]\s*[`"']?([0-9a-f-]{20,})/i);
  return{profile_id:profileMatch?.[1]||null,gen_id:genMatch?.[1]||null,raw};
}

function verifyBlockedHandoff(profile,meta){
  if(profile.asset_gate!=='BINARY_HANDOFF_BLOCKED'&&profile.binary_handoff?.state!=='BLOCKED')return null;
  if(!meta.gen_id)throw new Error(profile.profile_id+' exact gen_id is required for blocked binary handoff');
  if(meta.gen_id!==profile.gen_id)throw new Error(profile.profile_id+' gen_id mismatch: expected '+profile.gen_id+' got '+meta.gen_id);
  const checkpoint=checkpointIdentity(profile.candidate_checkpoint_path);
  if(checkpoint.profile_id!==profile.profile_id){
    throw new Error(profile.profile_id+' checkpoint profile mismatch: '+String(checkpoint.profile_id));
  }
  if(checkpoint.gen_id!==profile.gen_id){
    throw new Error(profile.profile_id+' checkpoint gen_id mismatch: '+String(checkpoint.gen_id));
  }
  return checkpoint;
}

export function registerCandidate(manifest,profileId,assetPath,meta={}){
  const profile=manifest.profiles?.find(x=>x.profile_id===profileId);
  if(!profile)throw new Error('Unknown profile: '+profileId);
  if(profile.status==='APPROVED')throw new Error(profileId+' is already APPROVED; do not overwrite approved asset through candidate registration.');

  const checkpoint=verifyBlockedHandoff(profile,meta);
  const info=inspectWebP(assetPath);
  const canonical='./assets/patient-exercise-realistic/'+profileId+'.webp';
  const normalized='./'+assetPath.replace(/^\.\//,'');
  if(normalized!==canonical)throw new Error('Candidate must use canonical path '+canonical);

  const priorReview=profile.candidate_review?structuredClone(profile.candidate_review):null;
  profile.status='CANDIDATE_GENERATED';
  profile.composite_url=null;
  profile.candidate_asset_path=canonical;
  profile.candidate_generated_on=meta.generated_on||new Date().toISOString().slice(0,10);
  if(meta.gen_id)profile.gen_id=meta.gen_id;
  profile.asset_gate='PREVIEW_REVIEW_PENDING';
  profile.approval_blockers=[];
  if(priorReview)profile.pre_materialization_review=priorReview;
  profile.candidate_review={
    clinical_content:'PENDING',
    visual_pose:'PENDING',
    embedded_text:'PENDING',
    reviewed_on:null,
    note:checkpoint
      ?'정확한 gen_id와 체크포인트가 일치하는 WebP materialization 완료. 저장소 파일 자체를 다시 내용·자세·문구 3중 검수해야 함.'
      :'정상 WebP 파일 등록 완료. 앱 노출 전 내용·자세·문구 3중 검수 필요.'
  };
  profile.binary_integrity={
    checked_on:profile.candidate_generated_on,
    bytes:info.bytes,
    width:info.width,
    height:info.height,
    format:'WEBP',
    sha256:info.sha256,
    result:'PASS'
  };
  if(checkpoint){
    profile.binary_handoff={
      ...(profile.binary_handoff||{}),
      state:'MATERIALIZED_PENDING_REVIEW',
      materialized_on:profile.candidate_generated_on,
      gen_id_verified:true,
      checkpoint_verified:true
    };
  }
  return{profile,info,checkpoint_verified:Boolean(checkpoint)};
}

if(process.argv[1]&&process.argv[1].endsWith('register-realistic-candidate.mjs')){
  try{
    const [profileId,assetPath,genId]=process.argv.slice(2);
    if(!profileId||!assetPath)throw new Error('Usage: node scripts/register-realistic-candidate.mjs pxNNN assets/.../pxNNN.webp [gen_id]');
    const manifestPath='data/patient-exercise-realistic-assets-v1.json';
    const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
    const out=registerCandidate(manifest,profileId,assetPath,{gen_id:genId});
    fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
    console.log(JSON.stringify(out,null,2));
  }catch(error){
    console.error('CANDIDATE REGISTRATION FAIL | '+error.message);
    process.exit(1);
  }
}
