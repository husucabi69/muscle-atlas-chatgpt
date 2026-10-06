import fs from 'node:fs';
import crypto from 'node:crypto';

const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const exam = readJson('data/examination-cervical-v1.json');
const registry = readJson('data/physical-exam-realistic-assets-v1.json');

const tests = new Map(exam.clinical_tests.map(x => [x.clinical_test_id, x]));
const profiles = new Map(registry.profiles.map(x => [x.clinical_test_id, x]));
const failures = [];

const check = (name, pass, detail = '') => {
  const ok = Boolean(pass);
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${detail ? ` | ${detail}` : ''}`);
  if (!ok) failures.push(name);
};

for (const id of ['ct085', 'ct086', 'ct087', 'ct088']) {
  check(`${id} clinical test exists`, tests.has(id));
  check(`${id} realistic profile exists`, profiles.has(id));
}

const p83 = profiles.get('ct083');
check('ct083 remains internal-PASS user-review pending',
  p83?.status === 'CANDIDATE_GENERATED_USER_PREVIEW_PENDING' &&
  p83?.review?.user_preview === 'PENDING' &&
  p83?.preview_candidate?.candidate_no === 2);
const ct083Path = String(p83?.preview_candidate?.preview_asset_path ?? '').replace(/^\.\//, '');
check('ct083 Candidate 2 asset exists', ct083Path && fs.existsSync(ct083Path), ct083Path);
if (ct083Path && fs.existsSync(ct083Path)) {
  const sha = crypto.createHash('sha256').update(fs.readFileSync(ct083Path)).digest('hex');
  check('ct083 Candidate 2 WebP sha256 matches locked metadata',
    sha === p83?.preview_candidate?.preview_webp_sha256,
    `actual=${sha} expected=${p83?.preview_candidate?.preview_webp_sha256 ?? 'missing'}`);
}

const ct085 = tests.get('ct085');
check('ct085 textbook narrative is detailed prose',
  String(tests.get('ct085')?.interpretation_detail?.textbook_interpretation_narrative||'').length>=1200 &&
  String(tests.get('ct085')?.interpretation_detail?.textbook_interpretation_narrative||'').includes('검사'),
  String(tests.get('ct085')?.interpretation_detail?.textbook_interpretation_narrative||'').length);
const p85 = profiles.get('ct085');
check('ct085 clinical teaching is expanded', Boolean(ct085?.interpretation_detail?.plain_language_explanation));
check('ct085 positive definition requires familiar radicular symptom relief',
  /익숙한.*(통증|저림)|방사통.*저림/.test(ct085?.positive_definition ?? ''));
const ct085HdTransferPending=(
  p85?.status === 'USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING' &&
  p85?.brief_status === 'USER_APPROVED_HD_BINARY_TRANSFER_PENDING' &&
  p85?.review?.user_preview === 'PASS' &&
  p85?.approved_binary_handoff?.gen_id === '1db0cd0f-8b06-4d13-acf2-072ee5de3351' &&
  p85?.approved_binary_handoff?.source_review_dimensions === '1024x1536' &&
  p85?.approved_binary_handoff?.expected_dimensions === '1024x1536' &&
  p85?.approved_binary_handoff?.expected_webp_sha256 === 'a9d7e97588283739117a1e36d74994b8604c66e37d01b3ed4749cdd7d9fb7de2' &&
  !p85?.composite_url
);
const ct085HdApproved=(
  p85?.status === 'APPROVED' &&
  p85?.brief_status === 'APPROVED' &&
  p85?.review?.user_preview === 'PASS' &&
  String(p85?.composite_url||'').includes('ct085-shoulder-abduction-relief-gen-1db0cd0f-approved-hd.webp') &&
  (p85?.user_approved_asset?.dimensions === '1024x1536' || p85?.approved_asset?.dimensions === '1024x1536')
);
check('ct085 latest high-resolution illustration stays valid across transfer lifecycle',
  ct085HdTransferPending || ct085HdApproved,
  JSON.stringify({status:p85?.status,brief_status:p85?.brief_status,composite_url:p85?.composite_url}));
check('ct085 approved HD asset remains clinically locked',
  p85?.review?.clinical_content === 'PASS' &&
  p85?.review?.visual_pose === 'PASS' &&
  p85?.review?.examiner_hand_position === 'PASS' &&
  p85?.review?.force_direction === 'PASS' &&
  p85?.review?.embedded_text === 'PASS');
check('ct085 2026 evidence distinguishes classic relief sign from modified passive shoulder abduction',
  /modified passive shoulder abduction/.test(ct085?.interpretation_detail?.diagnostic_weight ?? '') &&
  /완전히 같은 검사로 취급하면 안 된다/.test(ct085?.interpretation_detail?.diagnostic_weight ?? ''));
check('ct085 2026 pooled diagnostic values are preserved conservatively',
  /sensitivity 0\.49/.test(ct085?.interpretation_detail?.diagnostic_weight ?? '') &&
  /specificity 0\.76/.test(ct085?.interpretation_detail?.diagnostic_weight ?? '') &&
  /근거 확실성은 매우 낮/.test(ct085?.interpretation_detail?.diagnostic_weight ?? ''));

const ct086 = tests.get('ct086');
check('ct086 textbook narrative is detailed prose',
  String(tests.get('ct086')?.interpretation_detail?.textbook_interpretation_narrative||'').length>=1200 &&
  String(tests.get('ct086')?.interpretation_detail?.textbook_interpretation_narrative||'').includes('검사'),
  String(tests.get('ct086')?.interpretation_detail?.textbook_interpretation_narrative||'').length);
check('ct086 textbook narrative carries expanded measurement evidence',
  String(tests.get('ct086')?.interpretation_detail?.textbook_interpretation_narrative||'').length>=4000 &&
  tests.get('ct086')?.evidence_refs?.includes('crom_measurement_review_2010') &&
  tests.get('ct086')?.evidence_refs?.includes('crom_reliability_neck_pain_2017') &&
  String(tests.get('ct086')?.interpretation_detail?.textbook_interpretation_narrative||'').includes('Cervical Range of Motion(CROM) device') &&
  String(tests.get('ct086')?.interpretation_detail?.textbook_interpretation_narrative||'').includes('숫자는 임상판단을 돕는 자료이지 진단 그 자체가 아니다.'),
  String(tests.get('ct086')?.interpretation_detail?.textbook_interpretation_narrative||'').length);
const p86 = profiles.get('ct086');
check('ct086 teaching warns 60 degrees is not universal cutoff',
  /60°.*(보편|cut-off|cutoff)|보편.*60°/.test(
    [ct086?.positive_definition, ct086?.interpretation_detail?.diagnostic_weight].join(' ')
  ));
check('ct086 defaults to active ROM', /능동/.test(ct086?.maneuver ?? ''));
check('ct086 generation brief is ready', p86?.brief_status === 'GENERATION_READY');
check('ct086 rejected candidates stay audit-only with no Preview connection',
  Array.isArray(p86?.candidate_history)&&p86.candidate_history.length>=4&&
  p86.candidate_history.slice(-4).every(x=>x.disposition==='REJECTED_INTERNAL_NOT_FOR_PREVIEW')&&
  !p86?.preview_candidate&&!p86?.composite_url&&p86?.review?.user_preview==='PENDING',
  JSON.stringify({history:p86?.candidate_history?.length,preview:p86?.preview_candidate,composite:p86?.composite_url}));
check('ct086 retry state requires structured image-only render contract',
  p86?.generation_retry_state?.state==='STRUCTURED_IMAGE_RENDER_CONTRACT_READY_FOR_CANDIDATE5'&&
  p86?.generation_retry_state?.rejected_candidate_count===4&&
  p86?.generation_retry_state?.preview_connected===false&&
  p86?.generation_brief?.image_render_contract?.contract_version==='2026-10-07-ct086-v2',
  JSON.stringify(p86?.generation_retry_state));
check('ct086 clinical gate PASS', p86?.review?.clinical_content === 'PASS');
check('ct086 60-degree threshold stays cluster-only, not universal cutoff',
  /2003.*cluster/.test(ct086?.interpretation_detail?.diagnostic_weight ?? '') &&
  /60°/.test(ct086?.interpretation_detail?.diagnostic_weight ?? '') &&
  /독립.*(경계|cut-off)/.test(ct086?.interpretation_detail?.diagnostic_weight ?? ''));
check('ct086 evidence records 2026 independent MRI-referenced cluster validation',
  /2026년/.test(ct086?.interpretation_detail?.diagnostic_weight ?? '') &&
  /MRI/.test(ct086?.interpretation_detail?.diagnostic_weight ?? '') &&
  /독립 검증/.test(ct086?.interpretation_detail?.diagnostic_weight ?? ''));
check('ct086 all evidence refs resolve to source registry',
  (tests.get('ct086')?.evidence_refs||[]).every(id=>Boolean(data.source_refs?.[id]))&&
  (tests.get('ct086')?.evidence_refs||[]).length>=4,
  JSON.stringify(tests.get('ct086')?.evidence_refs||[]));


const ct087 = tests.get('ct087');
check('ct087 textbook narrative is detailed prose',
  String(tests.get('ct087')?.interpretation_detail?.textbook_interpretation_narrative||'').length>=1200 &&
  String(tests.get('ct087')?.interpretation_detail?.textbook_interpretation_narrative||'').includes('검사'),
  String(tests.get('ct087')?.interpretation_detail?.textbook_interpretation_narrative||'').length);
const p87 = profiles.get('ct087');
check('ct087 includes T1 finger abduction/adduction',
  /T1.*(벌림|모음)/.test(
    [ct087?.maneuver, ct087?.interpretation_detail?.standard_protocol].join(' ')
  ));
check('ct087 includes motor sensory reflex integration',
  /motor|근력/.test(JSON.stringify(ct087)) &&
  /sensory|감각/.test(JSON.stringify(ct087)) &&
  /reflex|반사/.test(JSON.stringify(ct087)));
check('ct087 warns root maps overlap', /중복|overlap/.test(JSON.stringify(ct087)));
check('ct087 generation brief is ready', p87?.brief_status === 'GENERATION_READY');
check('ct087 clinical gate PASS', p87?.review?.clinical_content === 'PASS');
for (const id of ['ct085','ct086','ct087']) {
  const p = profiles.get(id);
  check(`${id} is bound to active cervical pilot batch`,
    p?.pilot_batch === registry.pilot?.batch_id);
}

const ct088 = tests.get('ct088');
const p88 = profiles.get('ct088');
check('ct088 clinical maneuver fixes third digit', /제3수지|중지/.test(ct088?.maneuver ?? ''));
check('ct088 clinical maneuver fixes PIP support and DIP flick',
  /PIP/.test(ct088?.maneuver ?? '') && /DIP/.test(ct088?.maneuver ?? '') && /손바닥 쪽/.test(ct088?.maneuver ?? ''));
check('ct088 positive response is thumb/index on same hand',
  /엄지/.test(ct088?.positive_definition ?? '') && /검지/.test(ct088?.positive_definition ?? ''));
check('ct088 is explicitly user-deferred incomplete',
  p88?.status === 'INCOMPLETE_DEFERRED_MUST_REVISIT' &&
  p88?.brief_status === 'LOCKED_BUT_VISUAL_NOT_APPROVED' &&
  p88?.review?.user_preview === 'DEFERRED' &&
  !p88?.preview_candidate &&
  !p88?.composite_url);
check('ct088 clinical teaching stays PASS while visual gates reset',
  p88?.review?.clinical_content === 'PASS' &&
  p88?.review?.visual_pose === 'PENDING' &&
  p88?.review?.examiner_hand_position === 'PENDING' &&
  p88?.review?.force_direction === 'PENDING' &&
  p88?.review?.embedded_text === 'PENDING');
check('ct088 deferred blockers preserve unresolved panel 3/4 requirements',
  Array.isArray(p88?.approval_blockers) &&
  p88.approval_blockers.some(x=>String(x).includes('3번 패널')) &&
  p88.approval_blockers.some(x=>String(x).includes('4번 패널')) &&
  p88.approval_blockers.some(x=>String(x).includes('사용자 Preview 승인')));

const p89 = profiles.get('ct089');
check('ct089 remains user-approved binary-transfer pending',
  p89?.status === 'USER_APPROVED_ASSETS_BINARY_TRANSFER_PENDING' &&
  p89?.review?.user_preview === 'PASS');
check('ct089 has no false canonical asset before exact binary recovery',
  !p89?.composite_url && !p89?.approved_asset && !p89?.user_approved_asset);
check('ct089 approved Babinski source hash is preserved',
  p89?.user_approved_assets?.babinski?.sha256 === 'efefc0fcde07756f620a38e7e024260f6b01c6199a680d57ba6fadfa5e9474d6');
check('ct089 approved clonus source hash is preserved',
  p89?.user_approved_assets?.ankle_clonus?.sha256 === 'c97854a065fe1fc04e29de00cf9c1a94c569bd48625a6f83daf8a9cfe670c2a4');

for (const id of ['ct091', 'ct092']) {
  const p = profiles.get(id);
  check(`${id} remains user-review pending`, p?.review?.user_preview === 'PENDING');
  check(`${id} has no false canonical composite before binary connection`, !p?.composite_url);
}

const promptLocks=[
  ['ct085','docs/render-requests/CT085_SHOULDER_ABDUCTION_RELIEF_PROMPT_LOCK.md','2026-10-06-ct085-v1'],
  ['ct086','docs/render-requests/CT086_CERVICAL_ROTATION_ROM_PROMPT_LOCK.md','2026-10-06-ct086-v1'],
  ['ct087','docs/render-requests/CT087_C5_T1_NEUROLOGIC_SCREEN_PROMPT_LOCK.md','2026-10-06-ct087-v1']
];
for(const [id,file,version] of promptLocks){
  check(id+' frozen generation packet exists',fs.existsSync(file));
  if(fs.existsSync(file)){
    const packet=fs.readFileSync(file,'utf8');
    check(id+' frozen packet carries exact brief version',packet.includes(version));
  }
}
if(fs.existsSync(promptLocks[0][1])){
  const packet=fs.readFileSync(promptLocks[0][1],'utf8');
  check('ct085 frozen packet forbids modified passive substitution',
    packet.includes('modified passive shoulder abduction test')&&
    packet.includes('patient actively places the symptomatic hand/forearm overhead'));
}
if(fs.existsSync(promptLocks[1][1])){
  const packet=fs.readFileSync(promptLocks[1][1],'utf8');
  check('ct086 frozen packet forbids numeric cutoff in image',
    packet.includes('Do not print 60°')&&packet.includes('cluster context only'));
}
if(fs.existsSync(promptLocks[2][1])){
  const packet=fs.readFileSync(promptLocks[2][1],'utf8');
  check('ct087 frozen packet keeps four domains distinct',
    packet.includes('motor / sensory / reflex / segment pattern')&&
    packet.includes('one-to-one root mapping'));
}
if(fs.existsSync(promptLocks[0][1])){
  const packet=fs.readFileSync(promptLocks[0][1],'utf8');
  check('ct085 frozen packet carries 2026 pooled diagnostic evidence',
    packet.includes('PMID 41680685')&&packet.includes('sensitivity 0.49')&&packet.includes('specificity 0.76'));
}
if(fs.existsSync(promptLocks[1][1])){
  const packet=fs.readFileSync(promptLocks[1][1],'utf8');
  check('ct086 frozen packet carries 2026 CPR validation evidence',
    packet.includes('PMID 42070317')&&packet.includes('rotation <60°')&&packet.includes('cluster context'));
}
if(fs.existsSync(promptLocks[2][1])){
  const packet=fs.readFileSync(promptLocks[2][1],'utf8');
  check('ct087 frozen packet carries radiculopathy and DCM evidence locks',
    packet.includes('PMID 41680685')&&packet.includes('dcm_signs_2024')&&packet.includes('dcm_scoping_2025'));
}

for (const doc of [
  'docs/render-requests/CT085_SHOULDER_ABDUCTION_RELIEF_RENDER_REQUEST.md',
  'docs/render-requests/CT086_CERVICAL_ROTATION_ROM_RENDER_REQUEST.md',
  'docs/render-requests/CT087_C5_T1_NEUROLOGIC_SCREEN_RENDER_REQUEST.md',
  'docs/render-requests/CT088_HOFFMANN_SIGN_RENDER_REQUEST.md',
]) {
  check(`${doc} exists`, fs.existsSync(doc));
}

console.log(`SUMMARY | ${failures.length ? 'FAIL' : 'PASS'} | failures=${failures.length}`);
if (failures.length) process.exit(1);
