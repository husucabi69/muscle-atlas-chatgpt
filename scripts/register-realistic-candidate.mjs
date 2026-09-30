import fs from 'node:fs';
import {inspectWebP} from './inspect-realistic-webp.mjs';

export function registerCandidate(manifest,profileId,assetPath,meta={}){
  const profile=manifest.profiles?.find(x=>x.profile_id===profileId);
  if(!profile)throw new Error('Unknown profile: '+profileId);
  if(profile.status==='APPROVED')throw new Error(profileId+' is already APPROVED; do not overwrite approved asset through candidate registration.');

  const info=inspectWebP(assetPath);
  const canonical='./assets/patient-exercise-realistic/'+profileId+'.webp';
  const normalized='./'+assetPath.replace(/^\.\//,'');
  if(normalized!==canonical)throw new Error('Candidate must use canonical path '+canonical);

  profile.status='CANDIDATE_GENERATED';
  profile.composite_url=null;
  profile.candidate_asset_path=canonical;
  profile.candidate_generated_on=meta.generated_on||new Date().toISOString().slice(0,10);
  if(meta.gen_id)profile.gen_id=meta.gen_id;
  profile.asset_gate='PREVIEW_REVIEW_PENDING';
  profile.approval_blockers=[];
  profile.candidate_review={
    clinical_content:'PENDING',
    visual_pose:'PENDING',
    embedded_text:'PENDING',
    reviewed_on:null,
    note:'정상 WebP 파일 등록 완료. 앱 노출 전 내용·자세·문구 3중 검수 필요.'
  };
  profile.binary_integrity={
    checked_on:profile.candidate_generated_on,
    bytes:info.bytes,
    width:info.width,
    height:info.height,
    format:'WEBP',
    result:'PASS'
  };
  return{profile,info};
}

if(process.argv[1]&&process.argv[1].endsWith('register-realistic-candidate.mjs')){
  try{
    const [profileId,assetPath,genId]=process.argv.slice(2);
    if(!profileId||!assetPath)throw new Error('Usage: node scripts/register-realistic-candidate.mjs pxNNN assets/.../pxNNN.webp [gen_id]');
    const path='data/patient-exercise-realistic-assets-v1.json';
    const manifest=JSON.parse(fs.readFileSync(path,'utf8'));
    const out=registerCandidate(manifest,profileId,assetPath,{gen_id:genId});
    fs.writeFileSync(path,JSON.stringify(manifest,null,2)+'\n');
    console.log(JSON.stringify(out,null,2));
  }catch(error){
    console.error('CANDIDATE REGISTRATION FAIL | '+error.message);
    process.exit(1);
  }
}
