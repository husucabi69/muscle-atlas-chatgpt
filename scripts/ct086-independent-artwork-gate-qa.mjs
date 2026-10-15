import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {connectCt086IndependentArtwork} from './ct086-independent-artwork-gate.mjs';
import {inspectWebP} from './inspect-realistic-webp.mjs';

// OFFLINE FIXTURE ONLY: approved ct085 pixels temporarily stand in for any image
// for byte-integrity plumbing; NEVER call them ct086 clinical PASS in production.
const registry=JSON.parse(fs.readFileSync('data/physical-exam-realistic-assets-v1.json','utf8'));
const profile=registry.profiles.find(x=>x.clinical_test_id==='ct086');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'lysos-independent-gate-'));
const d=path.join(root,'assets/physical-exam-realistic/candidates');
fs.mkdirSync(d,{recursive:true});
let checks=0;
const check=(name,fn)=>{fn();checks++;console.log('PASS | '+name);};
const denied=(f,pattern)=>assert.throws(f,pattern);
try{
  const bytes=fs.readFileSync('assets/physical-exam-realistic/approved/ct085-shoulder-abduction-relief-gen-1db0cd0f-approved-hd.webp');
  const hash=inspectWebP('assets/physical-exam-realistic/approved/ct085-shoulder-abduction-relief-gen-1db0cd0f-approved-hd.webp').sha256;
  const file='ct086-independent-'+hash.slice(0,16);
  const src='./assets/physical-exam-realistic/candidates/'+file+'-master.webp';
  const preview='./assets/physical-exam-realistic/candidates/'+file+'-preview.webp';
  fs.writeFileSync(path.join(d,path.basename(src)),bytes);
  fs.writeFileSync(path.join(d,path.basename(preview)),bytes);
  const scan=inspectWebP(path.join(d,path.basename(preview)));
  const candidate={candidate_no:6,gen_id:'LYSOS-INDEPENDENT-'+hash.slice(0,16),
    generator:'LYSOS_INDEPENDENT_ORIGINAL',source_asset_path:src,source_sha256:hash,
    preview_asset_path:preview,preview_webp_sha256:scan.sha256,preview_bytes:scan.bytes,
    git_blob_sha1:scan.git_blob_sha1,dimensions:scan.width+'x'+scan.height};
  const origin={schema:'lysos-independent-original-provenance-v1',clinical_test_id:'ct086',
    source_kind:'HUMAN_ORIGINAL',source_sha256:hash,
    no_legacy_provider_lineage_attested:true,rights_review_state:'PASS',
    creative_process_record:'TEST ONLY: independent source documented with exact bytes, patient/examiner clinical casting, and source author.',
    human_editing_record:'TEST ONLY: this is an offline fixture for source attestation, not a human review of an actual ct086 artwork.',
    rights_basis:'TEST ONLY: borrowed approved ct085 image for temporary isolated QA fixture; never publish.',
    evidence_reference:'ip-vault/qa-fixtures/ct086-independent-intake',
    reviewer:'CI_FIXTURE_ONLY',reviewed_at:'2026-10-15T12:40:00+09:00'};
  const audit={clinical_test_id:'ct086',visual_review_state:'PASS',
    source_match_to_independent_origin_confirmed:true,
    source_match_review_note:'TEST ONLY: exact offline source and preview bytes used for gate QA.',
    human_auditor:'CI_FIXTURE_NOT_MEDICAL_REVIEW',reviewed_at:'2026-10-15T12:40:00+09:00',
    reviewed_source_sha256:hash,reviewed_preview_webp_sha256:scan.sha256,
    render_contract_version:profile.generation_brief.image_render_contract.contract_version,
    width:scan.width,height:scan.height,patient_gender:'female',examiner_gender:'female',
    same_patient_all_panels:true,same_examiner_all_panels:true,
    examiner_visible_all_panels:true,active_rotation_only:true,
    passive_force_present:false,trunk_shoulders_fixed:true,
    visible_text:['1 중립 자세','2 좌우 회전','3 제한 / 보상'],
    numeric_angle_present:false,degree_symbol_present:false,
    red_pain_overlay_present:false,infographic_copy_present:false};
  const go=(pr=profile,c=candidate,a=audit,o=origin)=>connectCt086IndependentArtwork(pr,c,a,o,{assetRoot:root});
  check('Offline real-byte staging accepted but ONLY as candidate pending user review',()=>{
    const r=go();assert.equal(r.profile.status,'CANDIDATE_GENERATED_USER_PREVIEW_PENDING');
    assert.equal(r.profile.preview_candidate.independent_artwork_verified,true);
    assert.equal(r.profile.review.user_preview,'PENDING');
    assert.equal(r.profile.composite_url,null);
    assert.equal(r.profile.inflight_render_task.generator,'LYSOS_INDEPENDENT_ORIGINAL');
  });
  check('Old restricted source is kept only in a historical separate field',()=>{
    const r=go();assert.deepEqual(r.profile.historical_restricted_provider_render_task,profile.inflight_render_task);
    assert.equal(profile.inflight_render_task.generator,'Runway connected image generator');
    assert.equal(profile.status,'PENDING_GENERATION');
  });
  check('Wrong clinical test denied',()=>denied(()=>go({...profile,clinical_test_id:'ct087'}),/WRONG_CLINICAL_TEST/));
  check('Existing approved artwork is immutable',()=>denied(()=>go(registry.profiles.find(x=>x.clinical_test_id==='ct085')),/WRONG_CLINICAL_TEST/));
  check('No old candidate number or old origin ID reuse',()=>{
    denied(()=>go(profile,{...candidate,candidate_no:5}),/NEW_IDENTITY_REQUIRED/);
    denied(()=>go(profile,{...candidate,gen_id:profile.inflight_render_task.task_id}),/NEW_IDENTITY_REQUIRED/);
  });
  check('Provider identity must be new independent artwork',()=>denied(()=>go(profile,{...candidate,generator:'Runway'}),/OLD_GENERATOR_IDENTITY_FORBIDDEN/));
  check('Reusing legacy task IDs denied',()=>denied(()=>go(profile,{...candidate,render_task_id:profile.inflight_render_task.task_id}),/OLD_GENERATOR_IDENTITY_FORBIDDEN/));
  check('Existing registry must be in exact historic pending state',()=>denied(()=>go({...profile,inflight_render_task:{...profile.inflight_render_task,state:'OTHER'}}),/LEGACY_HISTORY_MISMATCH/));
  check('No source-rights approval → no candidate',()=>denied(()=>go(profile,candidate,audit,{...origin,rights_review_state:'PENDING'}),/INDEPENDENT_ORIGIN_RIGHTS_EVIDENCE_REQUIRED/));
  check('Missing human creative record → no candidate',()=>denied(()=>go(profile,candidate,audit,{...origin,human_editing_record:'none'}),/INDEPENDENT_ORIGIN_RIGHTS_EVIDENCE_REQUIRED/));
  check('Missing positive identity audit → no candidate',()=>denied(()=>go(profile,candidate,{...audit,source_match_to_independent_origin_confirmed:false}),/SOURCE_BOUND_CLINICAL_REVIEW_REQUIRED/));
  check('No actual clinical review → no candidate',()=>denied(()=>go(profile,candidate,{...audit,visual_review_state:'PENDING'}),/SOURCE_BOUND_CLINICAL_REVIEW_REQUIRED/));
  check('Wrong image source digest → no candidate',()=>{
    const fake='f'.repeat(64);
    denied(()=>go(profile,{...candidate,source_sha256:fake,gen_id:'LYSOS-INDEPENDENT-'+fake.slice(0,16)},
      {...audit,reviewed_source_sha256:fake},{...origin,source_sha256:fake}),/source_sha256 does not match/);
  });
  check('Wrong Preview WebP digest → no candidate',()=>{
    const fake='f'.repeat(64);
    denied(()=>go(profile,{...candidate,preview_webp_sha256:fake},{...audit,reviewed_preview_webp_sha256:fake}),/preview_webp_sha256 does not match/);
  });
  check('Low-resolution declaration denied',()=>denied(()=>go(profile,{...candidate,dimensions:'600x900'},{...audit,width:600,height:900}),/VISUAL_PREFLIGHT_HD_DIMENSIONS/));
  check('Missing examiner denied',()=>denied(()=>go(profile,candidate,{...audit,examiner_visible_all_panels:false}),/VISUAL_PREFLIGHT_EXAMINER_VISIBLE_ALL_PANELS/));
  check('Refuse ambiguous source paths',()=>denied(()=>go(profile,{...candidate,source_asset_path:'./assets/physical-exam-realistic/candidates/../unreviewed.webp'}),/INVALID_SOURCE_METADATA/));
  check('Refuse imaginary candidate file',()=>denied(()=>go(profile,{...candidate,preview_asset_path:'./assets/physical-exam-realistic/candidates/ct086-independent-missing.webp'}),/binary missing/));
  console.log('CT086 INDEPENDENT ARTWORK SOURCE GATE: '+checks+'/'+checks+' PASS | no network; NO user art approved');
}finally{fs.rmSync(root,{recursive:true,force:true});}
