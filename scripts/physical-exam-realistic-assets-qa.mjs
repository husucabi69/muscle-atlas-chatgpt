import fs from 'node:fs';
import crypto from 'node:crypto';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const sha256=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const gitBlobSha1=p=>{
  const b=fs.readFileSync(p);
  const header=Buffer.from('blob '+b.length+'\0','utf8');
  return crypto.createHash('sha1').update(header).update(b).digest('hex');
};
const webpIntegrity=p=>{
  const b=fs.readFileSync(p);
  if(b.length<20||b.subarray(0,4).toString('ascii')!=='RIFF'||b.subarray(8,12).toString('ascii')!=='WEBP'){
    return {ok:false,reason:'missing RIFF/WEBP header',actual:b.length,declared:null};
  }
  const declared=b.readUInt32LE(4)+8;
  return {ok:declared===b.length,reason:declared===b.length?'ok':'truncated-or-overlong',actual:b.length,declared};
};
const reg=json('data/physical-exam-realistic-assets-v1.json');
const index=read('index.html');
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

const allowedByReviewKey={
  clinical_content:new Set(['PENDING','PASS','FAIL']),
  visual_pose:new Set(['PENDING','PASS','FAIL','PENDING_USER','PASS_INTERNAL']),
  examiner_hand_position:new Set(['PENDING','PASS','FAIL','NOT_APPLICABLE','PASS_INTERNAL']),
  force_direction:new Set(['PENDING','PASS','FAIL','PENDING_USER','PASS_INTERNAL']),
  embedded_text:new Set(['PENDING','PASS','FAIL','PASS_INTERNAL']),
  user_preview:new Set(['PENDING','PASS','FAIL','DEFERRED'])
};
check('All profiles use recognized review-gate values',profiles.every(p=>
  Object.entries(allowedByReviewKey).every(([k,set])=>set.has(p.review?.[k]))
));

const allowedStates=new Set([
  'PENDING_GENERATION','PREVIEW_CANDIDATE_READY','APPROVED',
  'INCOMPLETE_DEFERRED_BY_USER_2026_10_04','INCOMPLETE_DEFERRED_MUST_REVISIT',
  'USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING','CANDIDATE_GENERATED_USER_PREVIEW_PENDING'
]);
check('All EXAM-REAL lifecycle states are recognized',
  profiles.every(p=>allowedStates.has(p.status)),
  profiles.filter(p=>!allowedStates.has(p.status)).map(p=>p.clinical_test_id+':'+p.status).join(','));

const rawBacklog=profiles.filter(p=>
  p.status==='PENDING_GENERATION'&&
  p.brief_status==='READY_FROM_CANONICAL_BASELINE'&&
  !p.preview_candidate&&!p.approved_asset&&!p.user_approved_asset
);
check('Raw backlog profiles remain PENDING on all six review gates',
  rawBacklog.every(p=>Object.keys(allowedByReviewKey).every(k=>p.review?.[k]==='PENDING')),
  String(rawBacklog.length));

const generationReady=profiles.filter(p=>
  p.status==='PENDING_GENERATION'&&
  p.brief_status==='GENERATION_READY'&&
  !p.preview_candidate&&!p.approved_asset&&!p.user_approved_asset
);
check('Generation-ready profiles may lock clinical content while visual gates remain pending',
  generationReady.every(p=>
    ['PENDING','PASS'].includes(p.review?.clinical_content)&&
    ['visual_pose','examiner_hand_position','force_direction','embedded_text','user_preview'].every(k=>p.review?.[k]==='PENDING')
  ),
  generationReady.map(p=>p.clinical_test_id).join(',')
);
check('All profiles preserve schematic fallback',String(reg.asset_policy?.fallback||'').includes('EXAM-001'));

const approved=profiles.filter(p=>p.status==='APPROVED');
check('Approved profiles have user PASS, canonical URL and approval metadata',
  approved.every(p=>p.review?.user_preview==='PASS'&&Boolean(p.composite_url)&&Boolean(p.approved_asset||p.user_approved_asset)),
  approved.map(p=>p.clinical_test_id).join(','));

for(const p of approved){
  const meta=p.approved_asset||p.user_approved_asset||{};
  const path=String(p.composite_url||meta.preview_asset_path||meta.approved_asset_path||'').replace(/^\.\//,'');
  check(p.clinical_test_id+' approved asset exists',Boolean(path)&&fs.existsSync(path),path);
  if(path&&fs.existsSync(path)){
    const hash=sha256(path);
    const expected=meta.preview_webp_sha256||meta.approved_webp_sha256||meta.approved_svg_sha256||'';
    if(expected) check(p.clinical_test_id+' approved asset hash matches registry',hash===expected,hash);
    if(path.endsWith('.webp')){
      const wi=webpIntegrity(path);
      check(p.clinical_test_id+' approved WebP RIFF length is complete',wi.ok,JSON.stringify(wi));
    }
  }
}

const binaryPending=profiles.filter(p=>p.status==='USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING');
check('Binary-transfer pending approvals remain non-canonical',binaryPending.every(p=>
  p.review?.user_preview==='PASS'&&!p.composite_url&&!(p.approved_asset||p.user_approved_asset)&&Array.isArray(p.approval_blockers)&&p.approval_blockers.length>0
),binaryPending.map(p=>p.clinical_test_id).join(','));

const deferred=profiles.filter(p=>String(p.status||'').startsWith('INCOMPLETE_DEFERRED'));
check('Deferred items stay non-canonical and explicitly DEFERRED',deferred.every(p=>
  p.review?.user_preview==='DEFERRED'&&!p.composite_url&&!(p.approved_asset||p.user_approved_asset)
),deferred.map(p=>p.clinical_test_id).join(','));

const candidatePending=profiles.filter(p=>p.status==='CANDIDATE_GENERATED_USER_PREVIEW_PENDING');
check('Generated candidates remain user-preview pending and non-canonical',candidatePending.every(p=>
  p.review?.user_preview==='PENDING'&&!p.composite_url&&!(p.approved_asset||p.user_approved_asset)
),candidatePending.map(p=>p.clinical_test_id).join(','));

for(const p of candidatePending){
  const path=String(p.preview_candidate?.preview_asset_path||'').replace(/^\.\//,'');
  if(!path)continue;
  check(p.clinical_test_id+' pending candidate asset exists',fs.existsSync(path),path);
  if(fs.existsSync(path)){
    const expected=p.preview_candidate?.preview_webp_sha256||'';
    const expectedBytes=p.preview_candidate?.preview_bytes;
    const expectedGitBlob=p.preview_candidate?.git_blob_sha1||'';
    const hash=sha256(path);
    const actualBytes=fs.statSync(path).size;
    if(expected)check(p.clinical_test_id+' pending candidate hash matches registry',hash===expected,hash);
    if(Number.isInteger(expectedBytes))check(p.clinical_test_id+' pending candidate byte count matches registry',actualBytes===expectedBytes,String(actualBytes));
    if(expectedGitBlob){
      const actualGitBlob=gitBlobSha1(path);
      check(p.clinical_test_id+' pending candidate Git blob identity matches registry',actualGitBlob===expectedGitBlob,actualGitBlob);
    }
    if(path.endsWith('.webp')){
      const wi=webpIntegrity(path);
      check(p.clinical_test_id+' pending candidate WebP RIFF length is complete',wi.ok,JSON.stringify(wi));
    }
  }
}

check('Runtime supports canonical approved composite_url',index.includes("p?.status==='APPROVED'&&p?.composite_url"));
check('Runtime supports both approval metadata schemas',index.includes("p?.approved_asset||p?.user_approved_asset"));
check('Runtime renders approved asset from composite_url',index.includes("const assetPath=isApproved?p.composite_url"));
check('Runtime explains deferred realistic assets without exposing incomplete candidates',
  index.includes('data-exam-realistic-deferred')&&
  index.includes('실사형 일러스트 · 미완성 보류')&&
  index.includes('기존 Stable-ID 교육 도해'));

check('Runtime exposes plain-language and protocol teaching blocks',
  index.includes('쉽게 이해하기')&&index.includes('표준 시행 순서')&&index.includes('잘못된 보상 / 기능 저하 패턴'));

const ct095=profiles.find(p=>p.clinical_test_id==='ct095');
check('ct095 user-approved asset and teaching lock',
  ct095?.status==='APPROVED'&&
  ct095?.review?.user_preview==='PASS'&&
  String(ct095?.composite_url||'').includes('ct095-ccft-gen-34351135-approved.webp')&&
  ct095?.user_approved_asset?.approved_webp_sha256==='141060b6e1eb05cc93606354dd92054666900009e93196f4cd44b9052dc82bb7');



for(const p of profiles){
  const b=p.generation_brief||{};
  check(p.clinical_test_id+' brief completeness',
    String(b.patient_setup||'').length>5&&String(b.examiner_maneuver||'').length>5&&
    String(b.positive_finding||'').length>5&&String(b.limitation_safety||'').length>5);
}

const failed=checks.filter(x=>!x.pass);
console.log('\nPhysical exam realistic asset registry QA: '+(checks.length-failed.length)+'/'+checks.length+' PASS');
if(failed.length)process.exit(1);
