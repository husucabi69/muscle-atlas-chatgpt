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
const p85 = profiles.get('ct085');
check('ct085 clinical teaching is expanded', Boolean(ct085?.interpretation_detail?.plain_language_explanation));
check('ct085 positive definition requires familiar radicular symptom relief',
  /익숙한.*(통증|저림)|방사통.*저림/.test(ct085?.positive_definition ?? ''));
check('ct085 generation brief is ready', p85?.brief_status === 'GENERATION_READY');
check('ct085 clinical gate PASS', p85?.review?.clinical_content === 'PASS');
check('ct085 2026 evidence distinguishes classic relief sign from modified passive shoulder abduction',
  /modified passive shoulder abduction/.test(ct085?.interpretation_detail?.diagnostic_weight ?? '') &&
  /완전히 같은 검사로 취급하면 안 된다/.test(ct085?.interpretation_detail?.diagnostic_weight ?? ''));
check('ct085 2026 pooled diagnostic values are preserved conservatively',
  /sensitivity 0\.49/.test(ct085?.interpretation_detail?.diagnostic_weight ?? '') &&
  /specificity 0\.76/.test(ct085?.interpretation_detail?.diagnostic_weight ?? '') &&
  /근거 확실성은 매우 낮/.test(ct085?.interpretation_detail?.diagnostic_weight ?? ''));

const ct086 = tests.get('ct086');
const p86 = profiles.get('ct086');
check('ct086 teaching warns 60 degrees is not universal cutoff',
  /60°.*(보편|cut-off|cutoff)|보편.*60°/.test(
    [ct086?.positive_definition, ct086?.interpretation_detail?.diagnostic_weight].join(' ')
  ));
check('ct086 defaults to active ROM', /능동/.test(ct086?.maneuver ?? ''));
check('ct086 generation brief is ready', p86?.brief_status === 'GENERATION_READY');
check('ct086 clinical gate PASS', p86?.review?.clinical_content === 'PASS');
check('ct086 60-degree threshold stays cluster-only, not universal cutoff',
  /2003.*cluster/.test(ct086?.interpretation_detail?.diagnostic_weight ?? '') &&
  /독립 정상\/병적 경계로 쓰는 근거는 아니다/.test(ct086?.interpretation_detail?.diagnostic_weight ?? ''));
check('ct086 evidence records 2026 independent MRI-referenced cluster validation',
  /2026년 독립 검증 연구/.test(ct086?.interpretation_detail?.diagnostic_weight ?? '') &&
  /MRI/.test(ct086?.interpretation_detail?.diagnostic_weight ?? ''));

const ct087 = tests.get('ct087');
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
