import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {connectPhysicalExamPreviewCandidate} from './physical-exam-preview-connect.mjs';
import {inspectWebP} from './inspect-realistic-webp.mjs';
const manifest=JSON.parse(fs.readFileSync('data/physical-exam-realistic-assets-v1.json','utf8'));
const p=manifest.profiles.find(x=>x.clinical_test_id==='ct086');
const checks=[];
const check=(name,ok,detail='')=>{checks.push({name,ok:Boolean(ok)});console.log((ok?'PASS':'FAIL')+' | '+name+(detail?' | '+detail:''));};
const fail=(call,message)=>{try{call();return false;}catch(e){return String(e.message).includes(message);}};
const audit={width:1024,height:1536,patient_gender:'female',examiner_gender:'female',
 same_patient_all_panels:true,same_examiner_all_panels:true,examiner_visible_all_panels:true,
 active_rotation_only:true,passive_force_present:false,trunk_shoulders_fixed:true,
 visible_text:['1 중립 자세','2 좌우 회전','3 제한 / 보상'],numeric_angle_present:false,
 degree_symbol_present:false,red_pain_overlay_present:false,infographic_copy_present:false};
const root=fs.mkdtempSync(path.join(os.tmpdir(),'lysos-ct086-binary-gate-'));
try{
 const dest=path.join(root,'assets/physical-exam-realistic/candidates');
 fs.mkdirSync(dest,{recursive:true});
 const original=fs.readFileSync('assets/physical-exam-realistic/approved/ct085-shoulder-abduction-relief-gen-1db0cd0f-approved-hd.webp');
 const raw=path.join(dest,'ct086-fixture-source.webp'),preview=path.join(dest,'ct086-fixture-preview.webp');
 fs.writeFileSync(raw,original);fs.writeFileSync(preview,original);
 const details=inspectWebP(preview);
 check('Test fixture is actual 1024x1536 approved HD WebP bytes',details.width===1024&&details.height===1536);
 const candidate={candidate_no:5,gen_id:'00000000-0000-4000-8000-000000000005',
  generated_on:'2026-10-14',generator:'CI TEST FIXTURE ONLY',dimensions:'1024x1536',
  source_asset_path:'./assets/physical-exam-realistic/candidates/ct086-fixture-source.webp',
  source_sha256:details.sha256,
  preview_asset_path:'./assets/physical-exam-realistic/candidates/ct086-fixture-preview.webp',
  preview_webp_sha256:details.sha256,preview_bytes:details.bytes,git_blob_sha1:details.git_blob_sha1};
 const opts={assetRoot:root};
 candidate.render_task_id=p.inflight_render_task.task_id;
 audit.task_id=p.inflight_render_task.task_id;
 audit.visual_review_state='PASS';
 audit.human_auditor='CI_SYNTHETIC_QA_REVIEWER';
 audit.reviewed_at='2026-10-14T14:05:00+09:00';
 audit.reviewed_source_sha256=details.sha256;
 audit.reviewed_preview_webp_sha256=details.sha256;
 audit.render_contract_version=p.generation_brief.image_render_contract.contract_version;
 const good=connectPhysicalExamPreviewCandidate(p,candidate,audit,opts);
 check('Only a real existing HD binary and passing visual-audit declarations can create a pending user-preview record',
  good.profile.status==='CANDIDATE_GENERATED_USER_PREVIEW_PENDING'&&
  good.profile.preview_candidate?.exact_binary_verified===true&&
  good.profile.preview_candidate?.preflight_passed===true&&
  good.profile.preview_candidate?.source_asset_path===candidate.source_asset_path&&
  good.profile.inflight_render_task.state==='IMAGE_VERIFIED_USER_PREVIEW_PENDING'&&
  good.profile.preview_candidate?.render_task_id===candidate.render_task_id&&
  !good.profile.composite_url&&good.profile.review.user_preview==='PENDING');
 check('Missing real candidate file is blocked',fail(()=>connectPhysicalExamPreviewCandidate(p,{...candidate,preview_asset_path:'./assets/physical-exam-realistic/candidates/nonexistent.webp'},audit,opts),'binary missing'));
 check('Forged source SHA256 is blocked',fail(()=>connectPhysicalExamPreviewCandidate(p,{...candidate,source_sha256:'a'.repeat(64)},audit,opts),'source_sha256 does not match'));
 check('Forged preview SHA256 is blocked',fail(()=>connectPhysicalExamPreviewCandidate(p,{...candidate,preview_webp_sha256:'b'.repeat(64)},audit,opts),'preview_webp_sha256 does not match'));
 check('Forged Git blob SHA1 is blocked',fail(()=>connectPhysicalExamPreviewCandidate(p,{...candidate,git_blob_sha1:'c'.repeat(40)},audit,opts),'git_blob_sha1 does not match'));
 check('Forged byte count is blocked',fail(()=>connectPhysicalExamPreviewCandidate(p,{...candidate,preview_bytes:123456},audit,opts),'preview_bytes does not match'));
 check('Candidate with no exact source binary path is blocked',fail(()=>connectPhysicalExamPreviewCandidate(p,{...candidate,source_asset_path:null},audit,opts),'candidate local asset path required'));
 check('Candidate path traversal is blocked',fail(()=>connectPhysicalExamPreviewCandidate(p,{...candidate,preview_asset_path:'./assets/physical-exam-realistic/candidates/../escape.webp'},audit,opts),'path escapes'));
 check('Candidate without the examiner is blocked',fail(()=>connectPhysicalExamPreviewCandidate(p,candidate,{...audit,examiner_visible_all_panels:false},opts),'EXAMINER_VISIBLE_ALL_PANELS'));
 check('Low-resolution candidate blocked',fail(()=>connectPhysicalExamPreviewCandidate(p,{...candidate,dimensions:'600x900'},{...audit,width:600,height:900},opts),'HD_DIMENSIONS'));
 check('Invalid source hash syntax blocked',fail(()=>connectPhysicalExamPreviewCandidate(p,{...candidate,source_sha256:'bad'},audit,opts),'source_sha256 invalid'));
 const approved=manifest.profiles.find(x=>x.clinical_test_id==='ct085');
 check('Previously approved ct085 cannot be regenerated',fail(()=>connectPhysicalExamPreviewCandidate(approved,candidate,audit,opts),'not generation-ready'));
 check('Missing explicit human review is blocked',
   fail(()=>connectPhysicalExamPreviewCandidate(p,candidate,{...audit,visual_review_state:'NOT_PERFORMED'},opts),'source-bound human visual review'));
 check('Missing image-exact audit SHA256 is blocked',
   fail(()=>connectPhysicalExamPreviewCandidate(p,candidate,{...audit,reviewed_source_sha256:null},opts),'source-bound human visual review'));
 check('Audit tied to different render is blocked',
   fail(()=>connectPhysicalExamPreviewCandidate(p,candidate,{...audit,task_id:'other'},opts),'render task identity mismatch'));
 check('Candidate tied to different render is blocked',
   fail(()=>connectPhysicalExamPreviewCandidate(p,{...candidate,render_task_id:'other'},audit,opts),'render task identity mismatch'));
 check('Candidate number mismatch is blocked',
   fail(()=>connectPhysicalExamPreviewCandidate(p,{...candidate,candidate_no:6},audit,opts),'render task identity mismatch'));
 check('Unknown reviewer is blocked',
   fail(()=>connectPhysicalExamPreviewCandidate(p,candidate,{...audit,human_auditor:null},opts),'source-bound human visual review'));
 for(const key of ['passive_force_present','numeric_angle_present','degree_symbol_present','red_pain_overlay_present','infographic_copy_present']){
  const incorrect={...audit};delete incorrect[key];
  check('Omitted clinical visual negative axis '+key+' blocked',fail(()=>connectPhysicalExamPreviewCandidate(p,candidate,incorrect,opts),'visual preflight'));
 }
 // This fixture is a borrowed existing approved image for *internal code QA only*.
 // It is NEVER written to the production registry or shown as ct086 artwork.
}finally{fs.rmSync(root,{recursive:true,force:true});}
const failed=checks.filter(x=>!x.ok);
console.log('Physical Examination Preview binary-identity gate QA: '+(checks.length-failed.length)+'/'+checks.length+' PASS');
if(failed.length)process.exit(1);
