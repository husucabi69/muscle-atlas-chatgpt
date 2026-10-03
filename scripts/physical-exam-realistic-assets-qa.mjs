import fs from 'node:fs';
import crypto from 'node:crypto';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const sha256=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const reg=json('data/physical-exam-realistic-assets-v1.json');
const examFiles=[
  'data/examination-shoulder-v1.json','data/examination-elbow-v1.json','data/examination-wrist-hand-v1.json',
  'data/examination-hip-pelvis-v1.json','data/examination-knee-thigh-v1.json','data/examination-leg-ankle-foot-v1.json',
  'data/examination-cervical-v1.json','data/examination-thoracic-back-chestwall-v1.json',
  'data/examination-lumbar-sacral-v1.json','data/examination-abdominal-core-v1.json'
];
const canonical=examFiles.flatMap(p=>(json(p).clinical_tests||[]));
const profiles=reg.profiles||[];
const checks=[];
const check=(name,pass,detail='')=>{
  checks.push({name,pass:Boolean(pass),detail});
  console.log((pass?'PASS':'FAIL')+' | '+name+(detail?' | '+detail:''));
};

check('Canonical clinical tests = 148',canonical.length===148,String(canonical.length));
check('Realistic exam profiles = 148',profiles.length===148,String(profiles.length));
const canonicalIds=new Set(canonical.map(x=>x.clinical_test_id));
const profileIds=new Set(profiles.map(x=>x.clinical_test_id));
check('One-to-one Stable-ID coverage',canonicalIds.size===148&&profileIds.size===148&&[...canonicalIds].every(id=>profileIds.has(id)));
check('EXAM-001 baseline dependency locked',reg.baseline_contract?.exam_001==='COMPLETE_148_OF_148');
check('Realistic style contract linked',String(reg.style_contract||'').includes('REALISTIC_HUMAN_ILLUSTRATION_STYLE_CONTRACT'));
check('Copyright contract linked',String(reg.copyright_contract||'').includes('COPYRIGHT_REGISTRATION_STRATEGY'));
check('AI raw output cannot be final',profiles.every(p=>p.provenance?.ai_raw_output_allowed_as_final===false&&p.provenance?.human_edit_required===true));

const reviewKeys=['clinical_content','visual_pose','examiner_hand_position','force_direction','embedded_text','user_preview'];
const technicalReviewKeys=['clinical_content','visual_pose','examiner_hand_position','force_direction','embedded_text'];
const technicalReviewValues=new Set(['PENDING','PASS','FAIL']);
const userPreviewValues=new Set(['PENDING','PASS','FAIL','DEFERRED']);
check('All profiles require lifecycle-aware six review gates',profiles.every(p=>
  technicalReviewKeys.every(k=>technicalReviewValues.has(p.review?.[k]))&&
  userPreviewValues.has(p.review?.user_preview)
));
check('DEFERRED is restricted to user_preview only',profiles.every(p=>
  technicalReviewKeys.every(k=>p.review?.[k]!=='DEFERRED')
));

const unreviewed=profiles.filter(p=>p.status==='PENDING_GENERATION'&&!p.preview_candidate&&!p.approved_asset);
check('Unreviewed profiles remain PENDING on all six review gates',
  unreviewed.every(p=>reviewKeys.every(k=>p.review?.[k]==='PENDING')),
  String(unreviewed.length));

check('All profiles preserve schematic fallback',String(reg.asset_policy?.fallback||'').includes('EXAM-001'));
check('Pilot batch is cervical six-test set',
  JSON.stringify(reg.pilot?.clinical_test_ids||[])===JSON.stringify(['ct082','ct083','ct084','ct088','ct092','ct095']),
  JSON.stringify(reg.pilot?.clinical_test_ids||[]));

const lifecycleStates=new Set([
  'PENDING_GENERATION',
  'PREVIEW_CANDIDATE_READY',
  'APPROVED',
  'INCOMPLETE_DEFERRED_BY_USER_2026_10_04',
  'USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING'
]);
check('All EXAM-REAL lifecycle states are recognized',
  profiles.every(p=>lifecycleStates.has(p.status)),
  profiles.filter(p=>!lifecycleStates.has(p.status)).map(p=>p.clinical_test_id+':'+p.status).join(','));

const pilotProfiles=profiles.filter(p=>(reg.pilot?.clinical_test_ids||[]).includes(p.clinical_test_id));
check('Pilot states preserve approval, deferral, binary-transfer and generation semantics',
  pilotProfiles.every(p=>{
    if(p.status==='APPROVED') return p.brief_status==='APPROVED'&&p.review?.user_preview==='PASS'&&Boolean(p.approved_asset)&&Boolean(p.composite_url);
    if(p.status==='INCOMPLETE_DEFERRED_BY_USER_2026_10_04') return p.review?.user_preview==='DEFERRED'&&!p.approved_asset&&!p.preview_candidate&&!p.composite_url;
    if(p.status==='USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING') return p.review?.user_preview==='PASS'&&!p.approved_asset&&!p.preview_candidate&&!p.composite_url&&Array.isArray(p.approval_blockers)&&p.approval_blockers.length>0;
    return ['PENDING_GENERATION','PREVIEW_CANDIDATE_READY'].includes(p.status)&&p.brief_status==='GENERATION_READY';
  }));

const approvedProfiles=profiles.filter(p=>p.status==='APPROVED');
check('Canonical approval remains limited to ct082 until exact binaries are ingested',
  approvedProfiles.length===1&&approvedProfiles[0]?.clinical_test_id==='ct082',
  approvedProfiles.map(p=>p.clinical_test_id).join(','));

const ct082=profiles.find(p=>p.clinical_test_id==='ct082');
check('ct082 has user-approved realistic asset',
  ct082?.review?.user_preview==='PASS'&&
  ct082?.approved_asset?.gen_id==='919bcbfd-9a99-4e37-b635-f78fa5655151'&&
  ct082?.approved_asset?.disposition==='USER_APPROVED_PREVIEW_ASSET'&&
  Array.isArray(ct082?.approval_blockers)&&ct082.approval_blockers.length===0);

check('ct082 approved asset remains paired with EXAM-001 fallback',
  String(ct082?.composite_url||'').includes('ct082-spurling-gen-919bcbfd-approved.webp')&&
  String(reg.asset_policy?.fallback||'').includes('EXAM-001'));

const approvedPath=String(ct082?.approved_asset?.preview_asset_path||'').replace(/^\.\//,'');
check('ct082 approved WebP exists',approvedPath&&fs.existsSync(approvedPath),approvedPath);
if(approvedPath&&fs.existsSync(approvedPath)){
  check('ct082 approved WebP SHA-256 matches registry',
    sha256(approvedPath)===ct082?.approved_asset?.preview_webp_sha256,
    sha256(approvedPath));
}

check('No false canonical approval outside approved asset',
  profiles.every(p=>{
    if(p.status==='APPROVED') return Boolean(p.approved_asset)&&p.review?.user_preview==='PASS'&&Boolean(p.composite_url);
    if(p.status==='USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING') return p.review?.user_preview==='PASS'&&!p.approved_asset&&!p.preview_candidate&&p.composite_url===null&&Array.isArray(p.approval_blockers)&&p.approval_blockers.length>0;
    if(p.status==='INCOMPLETE_DEFERRED_BY_USER_2026_10_04') return p.review?.user_preview==='DEFERRED'&&!p.approved_asset&&!p.preview_candidate&&p.composite_url===null;
    return ['PENDING_GENERATION','PREVIEW_CANDIDATE_READY'].includes(p.status)&&p.review?.user_preview!=='PASS'&&p.composite_url===null;
  }));

for(const p of profiles){
  const b=p.generation_brief||{};
  check(p.clinical_test_id+' brief completeness',
    String(b.patient_setup||'').length>5&&String(b.examiner_maneuver||'').length>5&&
    String(b.positive_finding||'').length>5&&String(b.limitation_safety||'').length>5);
}

const failed=checks.filter(x=>!x.pass);
console.log('\nPhysical exam realistic asset registry QA: '+(checks.length-failed.length)+'/'+checks.length+' PASS');
if(failed.length)process.exit(1);
