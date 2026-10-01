import fs from 'node:fs';
import path from 'node:path';
import {inspectWebP} from './inspect-realistic-webp.mjs';
import {checkpointIdentity,registerCandidate} from './register-realistic-candidate.mjs';

function checkpointBinaryReceipt(checkpointPath){
  if(!checkpointPath||!fs.existsSync(checkpointPath)||path.extname(checkpointPath).toLowerCase()!=='.json')return null;
  const checkpoint=JSON.parse(fs.readFileSync(checkpointPath,'utf8'));
  const recovery=checkpoint.binary_recovery||{};
  const sha256=recovery.converted_webp_sha256||null;
  const bytes=Number.isInteger(recovery.converted_webp_bytes)?recovery.converted_webp_bytes:null;
  if(!sha256&&!bytes)return null;
  return{sha256,bytes,source:'candidate_checkpoint'};
}

export function planReviewedBinaryMaterialization(manifest,profileId,sourcePath,genId){
  const profile=manifest.profiles?.find(x=>x.profile_id===profileId);
  if(!profile)throw new Error('Unknown profile: '+profileId);
  if(profile.status==='APPROVED')throw new Error(profileId+' is already APPROVED');
  if(profile.asset_gate!=='BINARY_HANDOFF_BLOCKED'||profile.binary_handoff?.state!=='BLOCKED'){
    throw new Error(profileId+' is not in blocked reviewed-binary handoff state');
  }
  if(!genId||genId!==profile.gen_id){
    throw new Error(profileId+' exact gen_id mismatch: expected '+String(profile.gen_id)+' got '+String(genId||''));
  }
  const identity=checkpointIdentity(profile.candidate_checkpoint_path);
  if(identity.profile_id!==profileId)throw new Error(profileId+' checkpoint profile mismatch: '+String(identity.profile_id));
  if(identity.gen_id!==genId)throw new Error(profileId+' checkpoint gen_id mismatch: '+String(identity.gen_id));
  const sourceInfo=inspectWebP(sourcePath);
  const manifestReceipt=profile.binary_receipt||null;
  const checkpointReceipt=checkpointBinaryReceipt(profile.candidate_checkpoint_path);
  if(manifestReceipt?.sha256&&checkpointReceipt?.sha256&&manifestReceipt.sha256!==checkpointReceipt.sha256){
    throw new Error(profileId+' manifest/checkpoint binary receipt SHA-256 mismatch');
  }
  if(Number.isInteger(manifestReceipt?.bytes)&&Number.isInteger(checkpointReceipt?.bytes)&&manifestReceipt.bytes!==checkpointReceipt.bytes){
    throw new Error(profileId+' manifest/checkpoint binary receipt byte-size mismatch');
  }
  const receipt={
    sha256:manifestReceipt?.sha256||checkpointReceipt?.sha256||null,
    bytes:Number.isInteger(manifestReceipt?.bytes)?manifestReceipt.bytes:(checkpointReceipt?.bytes??null),
    source:manifestReceipt?.sha256||Number.isInteger(manifestReceipt?.bytes)?'manifest':(checkpointReceipt?.source||null)
  };
  if(receipt.sha256&&receipt.sha256!==sourceInfo.sha256){
    throw new Error(profileId+' recovered binary SHA-256 does not match recorded receipt');
  }
  if(Number.isInteger(receipt.bytes)&&receipt.bytes!==sourceInfo.bytes){
    throw new Error(profileId+' recovered binary byte-size does not match recorded receipt');
  }
  const canonicalRel='assets/patient-exercise-realistic/'+profileId+'.webp';
  return{
    profile_id:profileId,
    gen_id:genId,
    checkpoint_path:profile.candidate_checkpoint_path,
    source_path:sourcePath,
    source_info:sourceInfo,
    canonical_path:canonicalRel,
    receipt_sha256:receipt.sha256,
    receipt_bytes:receipt.bytes,
    receipt_source:receipt.source,
    receipt_verified:receipt.sha256?receipt.sha256===sourceInfo.sha256:null,
    receipt_size_verified:Number.isInteger(receipt.bytes)?receipt.bytes===sourceInfo.bytes:null
  };
}

export function materializeReviewedBinary(manifest,profileId,sourcePath,genId,{generated_on=new Date().toISOString().slice(0,10)}={}){
  const plan=planReviewedBinaryMaterialization(manifest,profileId,sourcePath,genId);
  const target=plan.canonical_path;
  const sourceResolved=path.resolve(sourcePath);
  const targetResolved=path.resolve(target);
  let copied=false;
  if(sourceResolved!==targetResolved){
    if(fs.existsSync(target))throw new Error('Canonical target already exists; refuse overwrite: '+target);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    const tmp=target+'.handoff.tmp';
    try{
      fs.copyFileSync(sourcePath,tmp);
      const copiedInfo=inspectWebP(tmp);
      if(copiedInfo.sha256!==plan.source_info.sha256)throw new Error('Copied WebP SHA-256 mismatch');
      if(copiedInfo.bytes!==plan.source_info.bytes)throw new Error('Copied WebP byte-size mismatch');
      fs.renameSync(tmp,target);
      copied=true;
    }catch(error){
      if(fs.existsSync(tmp))fs.unlinkSync(tmp);
      throw error;
    }
  }
  try{
    const registered=registerCandidate(manifest,profileId,target,{gen_id:genId,generated_on});
    return{plan,registered,copied};
  }catch(error){
    if(copied&&fs.existsSync(target))fs.unlinkSync(target);
    throw error;
  }
}

if(process.argv[1]&&process.argv[1].endsWith('materialize-reviewed-realistic-binary.mjs')){
  try{
    const [profileId,sourcePath,genId]=process.argv.slice(2);
    if(!profileId||!sourcePath||!genId){
      throw new Error('Usage: node scripts/materialize-reviewed-realistic-binary.mjs pxNNN /path/to/exact.webp <gen_id>');
    }
    const manifestPath='data/patient-exercise-realistic-assets-v1.json';
    const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
    const out=materializeReviewedBinary(manifest,profileId,sourcePath,genId);
    fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
    console.log(JSON.stringify(out,null,2));
  }catch(error){
    console.error('REVIEWED BINARY MATERIALIZATION FAIL | '+error.message);
    process.exit(1);
  }
}
