import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {evaluatePhysicalExamCandidate} from './physical-exam-candidate-preflight.mjs';

const SHA256=/^[0-9a-f]{64}$/;
const SHA1=/^[0-9a-f]{40}$/;

export function connectPhysicalExamPreviewCandidate(profile,candidate,audit){
  if(!profile)throw new Error('missing profile');
  if(profile.status!=='PENDING_GENERATION'||profile.brief_status!=='GENERATION_READY'){
    throw new Error('profile is not generation-ready');
  }
  if(profile.preview_candidate||profile.composite_url)throw new Error('profile already has connected asset');
  if(!candidate?.gen_id)throw new Error('candidate gen_id missing');
  if(!Number.isInteger(candidate?.candidate_no)||candidate.candidate_no<1)throw new Error('candidate_no invalid');
  if(!SHA256.test(String(candidate?.source_sha256||'')))throw new Error('source_sha256 invalid');
  if(!SHA256.test(String(candidate?.preview_webp_sha256||'')))throw new Error('preview_webp_sha256 invalid');
  if(!SHA1.test(String(candidate?.git_blob_sha1||'')))throw new Error('git_blob_sha1 invalid');
  if(!Number.isInteger(candidate?.preview_bytes)||candidate.preview_bytes<=0)throw new Error('preview_bytes invalid');
  if(!String(candidate?.preview_asset_path||'').startsWith('./assets/physical-exam-realistic/candidates/')){
    throw new Error('preview_asset_path must use candidate asset directory');
  }

  const preflight=evaluatePhysicalExamCandidate(profile,audit);
  if(!preflight.eligible){
    const error=new Error('candidate failed visual preflight: '+preflight.failed_axes.join(','));
    error.preflight=preflight;
    throw error;
  }

  const dims=String(candidate?.dimensions||'');
  const expected=audit.width+'x'+audit.height;
  if(dims!==expected)throw new Error('candidate dimensions do not match audit: '+dims+' vs '+expected);

  const next=structuredClone(profile);
  next.status='CANDIDATE_GENERATED_USER_PREVIEW_PENDING';
  next.brief_status='CANDIDATE_READY_USER_PREVIEW';
  next.gen_id=candidate.gen_id;
  next.composite_url=null;
  next.preview_candidate={
    candidate_no:candidate.candidate_no,
    gen_id:candidate.gen_id,
    generated_on:candidate.generated_on||new Date().toISOString().slice(0,10),
    generator:candidate.generator||'OpenAI image generation',
    generation_brief_version:profile.generation_brief_version||null,
    render_contract_version:profile.generation_brief?.image_render_contract?.contract_version||null,
    source_dimensions:dims,
    source_sha256:candidate.source_sha256,
    preview_asset_path:candidate.preview_asset_path,
    preview_webp_sha256:candidate.preview_webp_sha256,
    preview_bytes:candidate.preview_bytes,
    git_blob_sha1:candidate.git_blob_sha1,
    disposition:'INTERNAL_PASS_USER_PREVIEW_PENDING',
    preflight_passed:true,
    preflight_axes:preflight.checks.map(x=>({name:x.name,pass:x.pass}))
  };
  next.review={
    ...(next.review||{}),
    clinical_content:'PASS',
    visual_pose:'PASS',
    examiner_hand_position:'PASS',
    force_direction:'PASS',
    embedded_text:'PASS',
    user_preview:'PENDING',
    note:'Structured render-contract preflight PASS; user Preview approval is still required before canonical promotion.'
  };
  next.approval_blockers=['User Preview approval required before canonical promotion'];
  return{profile:next,preflight};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const [registryPath='data/physical-exam-realistic-assets-v1.json',id,candidatePath,auditPath,outputPath]=process.argv.slice(2);
  if(!id||!candidatePath||!auditPath){
    console.error('usage: node scripts/physical-exam-preview-connect.mjs <registry> <clinical_test_id> <candidate.json> <audit.json> [output-registry.json]');
    process.exit(2);
  }
  const manifest=JSON.parse(fs.readFileSync(registryPath,'utf8'));
  const index=manifest.profiles?.findIndex(x=>x.clinical_test_id===id);
  if(index<0){console.error('unknown clinical test: '+id);process.exit(2);}
  const candidate=JSON.parse(fs.readFileSync(candidatePath,'utf8'));
  const audit=JSON.parse(fs.readFileSync(auditPath,'utf8'));
  try{
    const result=connectPhysicalExamPreviewCandidate(manifest.profiles[index],candidate,audit);
    manifest.profiles[index]=result.profile;
    const out=JSON.stringify(manifest,null,2)+'\n';
    if(outputPath)fs.writeFileSync(outputPath,out);
    else process.stdout.write(out);
  }catch(error){
    console.error('PHYSICAL EXAM PREVIEW CONNECT FAIL | '+error.message);
    process.exit(1);
  }
}
