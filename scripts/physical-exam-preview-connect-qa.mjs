import fs from 'node:fs';
import {connectPhysicalExamPreviewCandidate} from './physical-exam-preview-connect.mjs';

const manifest=JSON.parse(fs.readFileSync('data/physical-exam-realistic-assets-v1.json','utf8'));
const p=manifest.profiles.find(x=>x.clinical_test_id==='ct086');
const checks=[];
const check=(name,pass,detail='')=>{
  checks.push({name,pass:Boolean(pass),detail});
  console.log((pass?'PASS':'FAIL')+' | '+name+(detail?' | '+detail:''));
};

const audit={
  width:1024,height:1536,
  patient_gender:'female',examiner_gender:'female',
  same_patient_all_panels:true,same_examiner_all_panels:true,examiner_visible_all_panels:true,
  active_rotation_only:true,passive_force_present:false,trunk_shoulders_fixed:true,
  visible_text:['1 중립 자세','2 좌우 회전','3 제한 / 보상'],
  numeric_angle_present:false,degree_symbol_present:false,
  red_pain_overlay_present:false,infographic_copy_present:false
};
const candidate={
  candidate_no:5,
  gen_id:'00000000-0000-4000-8000-000000000005',
  generated_on:'2026-10-07',
  generator:'OpenAI image generation',
  dimensions:'1024x1536',
  source_sha256:'a'.repeat(64),
  preview_asset_path:'./assets/physical-exam-realistic/candidates/ct086-candidate5-hd.webp',
  preview_webp_sha256:'b'.repeat(64),
  preview_bytes:123456,
  git_blob_sha1:'c'.repeat(40)
};

const good=connectPhysicalExamPreviewCandidate(p,candidate,audit);
check('valid ct086 Candidate 5 can enter user Preview pending lifecycle',
  good.profile.status==='CANDIDATE_GENERATED_USER_PREVIEW_PENDING'&&
  good.profile.brief_status==='CANDIDATE_READY_USER_PREVIEW'&&
  good.profile.preview_candidate?.candidate_no===5&&
  good.profile.preview_candidate?.render_contract_version==='2026-10-07-ct086-v2'&&
  good.profile.preview_candidate?.preflight_passed===true&&
  good.profile.review?.user_preview==='PENDING'&&
  !good.profile.composite_url,
  JSON.stringify(good.profile.preview_candidate));

let badVisualBlocked=false;
try{
  connectPhysicalExamPreviewCandidate(p,candidate,{...audit,examiner_visible_all_panels:false});
}catch(e){
  badVisualBlocked=String(e.message).includes('EXAMINER_VISIBLE_ALL_PANELS');
}
check('candidate with missing examiner is blocked before registry connection',badVisualBlocked);

let badDimsBlocked=false;
try{
  connectPhysicalExamPreviewCandidate(p,{...candidate,dimensions:'600x900'},{...audit,width:600,height:900});
}catch(e){
  badDimsBlocked=String(e.message).includes('HD_DIMENSIONS');
}
check('low-resolution candidate is blocked before registry connection',badDimsBlocked);

let badHashBlocked=false;
try{
  connectPhysicalExamPreviewCandidate(p,{...candidate,source_sha256:'bad'},audit);
}catch(e){
  badHashBlocked=String(e.message).includes('source_sha256 invalid');
}
check('candidate with invalid hash metadata is blocked',badHashBlocked);

let approvedDuplicateBlocked=false;
const approved=manifest.profiles.find(x=>x.clinical_test_id==='ct085');
try{
  connectPhysicalExamPreviewCandidate(approved,candidate,audit);
}catch(e){
  approvedDuplicateBlocked=String(e.message).includes('not generation-ready');
}
check('approved ct085 cannot re-enter candidate connection lifecycle',approvedDuplicateBlocked);

const failed=checks.filter(x=>!x.pass);
console.log('\nPhysical Examination Preview connection QA: '+(checks.length-failed.length)+'/'+checks.length+' PASS');
if(failed.length)process.exit(1);
