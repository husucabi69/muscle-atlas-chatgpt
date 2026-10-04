import fs from 'node:fs';

const reg=JSON.parse(fs.readFileSync('data/physical-exam-realistic-assets-v1.json','utf8'));
const profiles=reg.profiles||[];
const allowedByReviewKey={
  clinical_content:new Set(['PENDING','PASS','FAIL']),
  visual_pose:new Set(['PENDING','PASS','FAIL','PENDING_USER','PASS_INTERNAL']),
  examiner_hand_position:new Set(['PENDING','PASS','FAIL','NOT_APPLICABLE','PASS_INTERNAL']),
  force_direction:new Set(['PENDING','PASS','FAIL','PENDING_USER','PASS_INTERNAL']),
  embedded_text:new Set(['PENDING','PASS','FAIL','PASS_INTERNAL']),
  user_preview:new Set(['PENDING','PASS','FAIL','DEFERRED'])
};
const errors=[];

for(const p of profiles){
  for(const [key,set] of Object.entries(allowedByReviewKey)){
    if(!set.has(p.review?.[key])) errors.push(`${p.clinical_test_id}:${key}:${p.review?.[key]}`);
  }
  const isDeferred=String(p.status||'').startsWith('INCOMPLETE_DEFERRED');
  if(p.review?.user_preview==='DEFERRED'&&!isDeferred) errors.push(`${p.clinical_test_id}:DEFERRED_without_deferred_lifecycle`);
  if(isDeferred&&p.review?.user_preview!=='DEFERRED') errors.push(`${p.clinical_test_id}:deferred_lifecycle_without_DEFERRED_review`);

  if(p.status==='USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING'){
    if(p.review?.user_preview!=='PASS') errors.push(`${p.clinical_test_id}:binary_pending_without_user_PASS`);
    if(p.approved_asset||p.user_approved_asset||p.composite_url) errors.push(`${p.clinical_test_id}:binary_pending_false_canonical_asset`);
  }
  if(p.status==='APPROVED'){
    if(p.review?.user_preview!=='PASS') errors.push(`${p.clinical_test_id}:approved_without_user_PASS`);
    if(!(p.approved_asset||p.user_approved_asset)||!p.composite_url) errors.push(`${p.clinical_test_id}:approved_without_canonical_asset`);
  }
}

const ct088=profiles.find(p=>p.clinical_test_id==='ct088');
if(ct088?.review?.user_preview!=='DEFERRED') errors.push('ct088:expected_DEFERRED');

if(errors.length){
  console.error('EXAM-REAL review lifecycle QA FAIL');
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`EXAM-REAL review lifecycle QA PASS: ${profiles.length} profiles; internal/user review stages and deferred/backlog states are recognized.`);
