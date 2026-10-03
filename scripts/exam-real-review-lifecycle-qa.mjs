import fs from 'node:fs';

const reg=JSON.parse(fs.readFileSync('data/physical-exam-realistic-assets-v1.json','utf8'));
const profiles=reg.profiles||[];
const technicalKeys=['clinical_content','visual_pose','examiner_hand_position','force_direction','embedded_text'];
const technicalValues=new Set(['PENDING','PASS','FAIL']);
const userPreviewValues=new Set(['PENDING','PASS','FAIL','DEFERRED']);
const errors=[];

for(const p of profiles){
  for(const key of technicalKeys){
    if(!technicalValues.has(p.review?.[key])) errors.push(`${p.clinical_test_id}:${key}:${p.review?.[key]}`);
  }
  if(!userPreviewValues.has(p.review?.user_preview)){
    errors.push(`${p.clinical_test_id}:user_preview:${p.review?.user_preview}`);
  }
  if(p.review?.user_preview==='DEFERRED' && !String(p.status||'').startsWith('INCOMPLETE_DEFERRED_BY_USER_')){
    errors.push(`${p.clinical_test_id}:DEFERRED_without_deferred_lifecycle`);
  }
  if(String(p.status||'').startsWith('INCOMPLETE_DEFERRED_BY_USER_') && p.review?.user_preview!=='DEFERRED'){
    errors.push(`${p.clinical_test_id}:deferred_lifecycle_without_DEFERRED_review`);
  }
  if(p.status==='USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING'){
    if(p.review?.user_preview!=='PASS') errors.push(`${p.clinical_test_id}:binary_pending_without_user_PASS`);
    if(p.approved_asset || p.composite_url) errors.push(`${p.clinical_test_id}:binary_pending_false_canonical_asset`);
  }
}

const ct088=profiles.find(p=>p.clinical_test_id==='ct088');
const ct089=profiles.find(p=>p.clinical_test_id==='ct089');
if(ct088?.review?.user_preview!=='DEFERRED') errors.push('ct088:expected_DEFERRED');
if(ct089?.status==='USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING' && ct089?.review?.user_preview!=='PASS') errors.push('ct089:expected_user_PASS');

if(errors.length){
  console.error('EXAM-REAL review lifecycle QA FAIL');
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`EXAM-REAL review lifecycle QA PASS: ${profiles.length} profiles; DEFERRED is user-preview-only; binary-pending approval remains non-canonical.`);
