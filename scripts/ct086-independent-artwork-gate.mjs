import fs from 'node:fs';
import path from 'node:path';
import {evaluatePhysicalExamCandidate} from './physical-exam-candidate-preflight.mjs';
import {verifyPhysicalExamPreviewBinary} from './physical-exam-preview-binary-identity.mjs';

/**
 * EXAM-REAL-001 / ct086: independent-source Preview-only clinical gate.
 * No provider APIs, downloads, image generation, or automatic approval.
 * The historical excluded vendor task stays in the archived provenance.
 */
const SOURCE_KINDS=new Set(['HUMAN_ORIGINAL','LICENSED_INDEPENDENT','AI_ASSISTED_HUMAN_EDITED']);
const SOURCE_ROOT='./assets/physical-exam-realistic/candidates/';
const HEX64=/^[0-9a-f]{64}$/;
const HEX40=/^[0-9a-f]{40}$/;
const DATE=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/;
function reject(why){throw Error('CT086_INDEPENDENT_SOURCE_'+why);}
function nonempty(v,n){return typeof v==='string'&&v.trim().length>=n;}
function sourcePathIsIndependent(v){
  return typeof v==='string'&&v.startsWith(SOURCE_ROOT+'ct086-independent-')&&
    !/[?#]/.test(v)&&!v.includes('..')&&/\.(png|webp)$/.test(v);
}
function previewPathIsIndependent(v){
  return typeof v==='string'&&v.startsWith(SOURCE_ROOT+'ct086-independent-')&&
    !/[?#]/.test(v)&&!v.includes('..')&&v.endsWith('.webp');
}
export function connectCt086IndependentArtwork(profile,candidate,audit,origin,{assetRoot=process.cwd()}={}){
  if(profile?.clinical_test_id!=='ct086')reject('WRONG_CLINICAL_TEST');
  if(profile.status!=='PENDING_GENERATION'||profile.brief_status!=='GENERATION_READY'||
     profile.preview_candidate||profile.composite_url)reject('PROFILE_NOT_PENDING');
  if(!/runway/i.test(String(profile.inflight_render_task?.generator||''))||
     profile.inflight_render_task?.state!=='IMAGE_SUCCEEDED_BINARY_TRANSFER_PENDING'){
     reject('LEGACY_HISTORY_MISMATCH');
  }
  if(!Number.isInteger(candidate?.candidate_no)||candidate.candidate_no<6||
     !/^LYSOS-INDEPENDENT-[0-9a-f]{16}$/.test(String(candidate.gen_id||''))||
     candidate.gen_id!=='LYSOS-INDEPENDENT-'+candidate.source_sha256?.slice(0,16)){
    reject('NEW_IDENTITY_REQUIRED');
  }
  if(!sourcePathIsIndependent(candidate.source_asset_path)||
     !previewPathIsIndependent(candidate.preview_asset_path)||
     !HEX64.test(String(candidate.source_sha256||''))||
     !HEX64.test(String(candidate.preview_webp_sha256||''))||
     !HEX40.test(String(candidate.git_blob_sha1||''))||
     !Number.isInteger(candidate.preview_bytes)||candidate.preview_bytes<=0||
     typeof candidate.dimensions!=='string')reject('INVALID_SOURCE_METADATA');
  if(String(candidate.generator||'')!=='LYSOS_INDEPENDENT_ORIGINAL'||
     candidate.render_task_id!=null||candidate.task_id!=null||
     candidate.source_sha256===profile?.preview_candidate?.source_sha256){
    reject('OLD_GENERATOR_IDENTITY_FORBIDDEN');
  }
  if(origin?.schema!=='lysos-independent-original-provenance-v1'||
     origin?.clinical_test_id!=='ct086'||
     origin?.source_kind==null||!SOURCE_KINDS.has(origin.source_kind)||
     origin.source_sha256!==candidate.source_sha256||
     origin.no_legacy_provider_lineage_attested!==true||
     origin.rights_review_state!=='PASS'||
     !nonempty(origin.creative_process_record,40)||
     !nonempty(origin.human_editing_record,40)||
     !nonempty(origin.rights_basis,30)||
     !nonempty(origin.evidence_reference,12)||
     !nonempty(origin.reviewer,2)||!DATE.test(String(origin.reviewed_at||''))){
      reject('INDEPENDENT_ORIGIN_RIGHTS_EVIDENCE_REQUIRED');
  }
  if(audit?.clinical_test_id!=='ct086'||audit.visual_review_state!=='PASS'||
     audit.source_match_to_independent_origin_confirmed!==true||
     !nonempty(audit.source_match_review_note,20)||
     !nonempty(audit.human_auditor,2)||!DATE.test(String(audit.reviewed_at||''))||
     audit.reviewed_source_sha256!==candidate.source_sha256||
     audit.reviewed_preview_webp_sha256!==candidate.preview_webp_sha256||
     audit.render_contract_version!==profile.generation_brief?.image_render_contract?.contract_version){
    reject('SOURCE_BOUND_CLINICAL_REVIEW_REQUIRED');
  }
  const preflight=evaluatePhysicalExamCandidate(profile,audit);
  if(!preflight.eligible)reject('VISUAL_PREFLIGHT_'+preflight.failed_axes.join('_'));
  if(candidate.dimensions!==audit.width+'x'+audit.height)reject('DIMENSIONS_NOT_ATTESTED');
  // Byte-level checks must be based on actual stored source and Preview files.
  const verified=verifyPhysicalExamPreviewBinary(candidate,audit,{assetRoot});
  const next=structuredClone(profile);
  next.historical_restricted_provider_render_task=structuredClone(profile.inflight_render_task);
  next.inflight_render_task={
    state:'IMAGE_VERIFIED_USER_PREVIEW_PENDING',
    generator:'LYSOS_INDEPENDENT_ORIGINAL',
    candidate_no:candidate.candidate_no,task_id:candidate.gen_id,
    binary_verified:true,visual_audit:'PASS',user_preview:'PENDING'
  };
  next.status='CANDIDATE_GENERATED_USER_PREVIEW_PENDING';
  next.brief_status='CANDIDATE_READY_USER_PREVIEW';
  next.composite_url=null;
  next.gen_id=candidate.gen_id;
  next.preview_candidate={
    candidate_no:candidate.candidate_no,gen_id:candidate.gen_id,
    generator:'LYSOS_INDEPENDENT_ORIGINAL',
    generated_on:candidate.generated_on||null,
    source_asset_path:candidate.source_asset_path,
    source_sha256:verified.source_sha256,
    preview_asset_path:candidate.preview_asset_path,
    preview_webp_sha256:verified.preview_webp_sha256,
    git_blob_sha1:verified.git_blob_sha1,preview_bytes:verified.preview_bytes,
    source_dimensions:verified.dims,
    provenance_evidence_reference:origin.evidence_reference,
    independent_artwork_verified:true,
    independent_source_kind:origin.source_kind,
    preflight_passed:true,exact_binary_verified:true,
    review_state:'CLINICAL_AUDIT_PASS_USER_APPROVAL_PENDING',
    render_contract_version:profile.generation_brief.image_render_contract.contract_version,
    human_auditor:audit.human_auditor,reviewed_at:audit.reviewed_at,
    preflight_axes:preflight.checks.map(x=>({name:x.name,pass:x.pass}))
  };
  next.review={...next.review,clinical_content:'PASS',visual_pose:'PASS',
    examiner_hand_position:'PASS',force_direction:'PASS',embedded_text:'PASS',
    user_preview:'PENDING',note:'New independent-source human-reviewed candidate awaiting chairman approval.'};
  next.approval_blockers=['Chairman must review the exact original clinical illustration in Preview'];
  return {profile:next,source_verification:verified,preflight,
    disposition:'INDEPENDENT_BINARY_AND_ATTESTED_REVIEW_PASS_USER_APPROVAL_PENDING'};
}

if(process.argv[1]&&process.argv[1].endsWith('/ct086-independent-artwork-gate.mjs')){
  try{
    const [registryPath,candidatePath,auditPath,originPath,outPath]=process.argv.slice(2);
    if(!registryPath||!candidatePath||!auditPath||!originPath||!outPath){
      reject('USAGE_REGISTRY_CANDIDATE_AUDIT_ORIGIN_OUTPUT');
    }
    const absoluteOut=path.resolve(outPath);
    if(absoluteOut===path.resolve(registryPath)||fs.existsSync(absoluteOut)){
      reject('OUTPUT_MUST_BE_NEW_STAGING_FILE');
    }
    const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
    const index=registry.profiles.findIndex(x=>x.clinical_test_id==='ct086');
    if(index<0)reject('REGISTRY_MISSING_CT086');
    const candidate=JSON.parse(fs.readFileSync(candidatePath,'utf8'));
    const audit=JSON.parse(fs.readFileSync(auditPath,'utf8'));
    const origin=JSON.parse(fs.readFileSync(originPath,'utf8'));
    registry.profiles[index]=connectCt086IndependentArtwork(registry.profiles[index],candidate,audit,origin).profile;
    fs.writeFileSync(absoluteOut,JSON.stringify(registry,null,2)+'\n',{flag:'wx'});
    console.log('CT086_INDEPENDENT_SOURCE_STAGED_FOR_REVIEW_ONLY | '+absoluteOut);
  }catch(e){console.error(e.message);process.exitCode=1;}
}
