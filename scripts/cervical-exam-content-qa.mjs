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

const ct085 = tests.get('ct085');
const p85 = profiles.get('ct085');
check('ct085 clinical teaching is expanded', Boolean(ct085?.interpretation_detail?.plain_language_explanation));
check('ct085 positive definition requires familiar radicular symptom relief',
  /익숙한.*(통증|저림)|방사통.*저림/.test(ct085?.positive_definition ?? ''));
check('ct085 generation brief is ready', p85?.brief_status === 'GENERATION_READY');
check('ct085 clinical gate PASS', p85?.review?.clinical_content === 'PASS');

const ct086 = tests.get('ct086');
const p86 = profiles.get('ct086');
check('ct086 teaching warns 60 degrees is not universal cutoff',
  /60°.*(보편|cut-off|cutoff)|보편.*60°/.test(
    [ct086?.positive_definition, ct086?.interpretation_detail?.diagnostic_weight].join(' ')
  ));
check('ct086 defaults to active ROM', /능동/.test(ct086?.maneuver ?? ''));
check('ct086 generation brief is ready', p86?.brief_status === 'GENERATION_READY');
check('ct086 clinical gate PASS', p86?.review?.clinical_content === 'PASS');

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

const ct088 = tests.get('ct088');
const p88 = profiles.get('ct088');
const pc88 = p88?.preview_candidate;
check('ct088 clinical maneuver fixes third digit', /제3수지|중지/.test(ct088?.maneuver ?? ''));
check('ct088 clinical maneuver fixes PIP support and DIP flick',
  /PIP/.test(ct088?.maneuver ?? '') && /DIP/.test(ct088?.maneuver ?? '') && /손바닥 쪽/.test(ct088?.maneuver ?? ''));
check('ct088 positive response is thumb/index on same hand',
  /엄지/.test(ct088?.positive_definition ?? '') && /검지/.test(ct088?.positive_definition ?? ''));
check('ct088 lifecycle restored to user Preview pending',
  p88?.status === 'CANDIDATE_GENERATED_USER_PREVIEW_PENDING' &&
  p88?.review?.user_preview === 'PENDING');
check('ct088 active candidate is Candidate 13', pc88?.candidate_no === 13);
check('ct088 active candidate gen_id locked',
  pc88?.gen_id === '64db8f81-b5e0-460a-8b41-046895643b0b');

const ct088Path = String(pc88?.preview_asset_path ?? '').replace(/^\.\//, '');
check('ct088 active candidate asset exists', ct088Path && fs.existsSync(ct088Path), ct088Path);
if (ct088Path && fs.existsSync(ct088Path)) {
  const bytes = fs.readFileSync(ct088Path);
  const sha = crypto.createHash('sha256').update(bytes).digest('hex');
  check('ct088 SVG sha256 matches locked metadata',
    sha === pc88?.preview_svg_sha256,
    `actual=${sha} expected=${pc88?.preview_svg_sha256 ?? 'missing'}`);
  const svg = bytes.toString('utf8');
  check('ct088 SVG is 900x1053', /width="900"/.test(svg) && /height="1053"/.test(svg));
  check('ct088 SVG embeds WebP and no external raster dependency',
    /data:image\/webp;base64,/.test(svg) && !/<image[^>]+href="https?:\/\//.test(svg));
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
