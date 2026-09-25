import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const json = p => JSON.parse(read(p));
const failures = [];
const passes = [];
const check = (name, ok, detail='') => {
  (ok ? passes : failures).push({name, detail});
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${detail ? ' | '+detail : ''}`);
};

const modules = {
  shoulder:{exam:11,us:9,quiz:30,media:9},
  elbow:{exam:10,us:8,quiz:24,media:8},
  'wrist-hand':{exam:14,us:12,quiz:30,media:12},
  'hip-pelvis':{exam:14,us:12,quiz:30,media:12},
  'knee-thigh':{exam:15,us:14,quiz:30,media:14},
  'leg-ankle-foot':{exam:17,us:18,quiz:30,media:18},
  cervical:{exam:17,us:14,quiz:30,media:14},
  'thoracic-back-chestwall':{exam:16,us:14,quiz:30,media:14},
  'lumbar-sacral':{exam:18,us:15,quiz:30,media:15},
  'abdominal-core':{exam:16,us:15,quiz:30,media:15}
};

const core = json('data/knowledge-core-v1.json');
const lib = json('data/patient-exercise-library-v1.json');
const mediaGlobal = json('data/media-license-global-audit-v1.json');
const html = read('index.html');
const manifest = json('manifest.webmanifest');
const sw = read('sw.js');

check('Schema version 1.0.0', core.schema_version === '1.0.0', core.schema_version);
check('Canonical muscles = 205', core.muscles.length === 205, String(core.muscles.length));
check('Stage 11 dataset version', core.dataset_version === '2026.09.25-j', core.dataset_version);
const regionCounts=core.regions.map(r=>core.muscles.filter(m=>m.region_id===r.region_id).length);
check('Anatomy regions = 14 and all populated', core.regions.length===14 && regionCounts.every(n=>n>0), JSON.stringify(regionCounts));

const oifnMissing = [];
for (const m of core.muscles) {
  for (const [k,v] of Object.entries({
    origin:m.anatomy?.origin,
    insertion:m.anatomy?.insertion,
    function:m.anatomy?.function,
    nerve:m.innervation_text
  })) if (!String(v||'').trim()) oifnMissing.push(`${m.muscle_id}:${k}`);
}
check('O/I/F/N coverage = 820/820', oifnMissing.length === 0, oifnMissing.join(','));

const sets = [
 ['region',core.regions,'region_id'],['muscle',core.muscles,'muscle_id'],
 ['symptom_pattern',core.symptom_patterns,'symptom_id'],['symptom_group',core.symptom_groups,'symptom_group_id'],
 ['tendon',core.tendons,'tendon_id'],['nerve',core.nerves,'nerve_id'],['joint',core.joints,'joint_id'],
 ['bursa',core.bursae,'bursa_id'],['ligament',core.ligaments,'ligament_id'],['fascia',core.fasciae||[],'fascia_id'],
 ['clinical_finding',core.clinical_findings,'finding_id'],['clinical_test',core.clinical_tests,'clinical_test_id'],
 ['diagnosis_concept',core.diagnosis_concepts,'diagnosis_concept_id'],['ultrasound_view',core.ultrasound_views,'ultrasound_view_id'],
 ['content_asset',core.content_assets||[],'content_asset_id']
];
const idMap = new Map(), collisions = [], badRegions = [];
for (const [type,arr,key] of sets) {
  for (const x of arr||[]) {
    const id=x[key];
    if (idMap.has(id)) collisions.push(`${id}:${idMap.get(id)}+${type}`);
    else idMap.set(id,type);
    if (type!=='region' && x.region_id && !core.regions.some(r=>r.region_id===x.region_id)) badRegions.push(`${id}->${x.region_id}`);
  }
}
check('Global entity ID collisions = 0', collisions.length===0, collisions.join(','));
check('Invalid region references = 0', badRegions.length===0, badRegions.join(','));

const relIds = core.relationships.map(r=>r.relationship_id);
const dupRel = [...new Set(relIds.filter((x,i)=>relIds.indexOf(x)!==i))];
const orphan = [], relType = [], duplicateEdges = [];
const edgeSet = new Set();
for (const r of core.relationships) {
  const ft=idMap.get(r.from_id), tt=idMap.get(r.to_id);
  if (!ft || !tt) orphan.push(r.relationship_id);
  if (ft && r.from_type!==ft) relType.push(`${r.relationship_id}:from ${r.from_type}->${ft}`);
  if (tt && r.to_type!==tt) relType.push(`${r.relationship_id}:to ${r.to_type}->${tt}`);
  const edgeKey=`${r.from_id}|${r.relation}|${r.to_id}`;
  if (edgeSet.has(edgeKey)) duplicateEdges.push(`${r.relationship_id}:${edgeKey}`); else edgeSet.add(edgeKey);
}
check('Relationship ID duplicates = 0', dupRel.length===0, dupRel.join(','));
check('Orphan relationships = 0', orphan.length===0, orphan.join(','));
check('Relationship endpoint type mismatch = 0', relType.length===0, relType.slice(0,20).join(','));
check('Duplicate relationship edges = 0', duplicateEdges.length===0, duplicateEdges.slice(0,20).join(','));

const known = new Set();
for (const [arr,key] of [[core.muscles,'muscle_id'],[core.tendons,'tendon_id'],[core.nerves,'nerve_id'],[core.joints,'joint_id'],[core.bursae,'bursa_id'],[core.ligaments,'ligament_id'],[core.fasciae||[],'fascia_id'],[core.clinical_tests,'clinical_test_id'],[core.diagnosis_concepts,'diagnosis_concept_id'],[core.ultrasound_views,'ultrasound_view_id'],[core.symptom_patterns,'symptom_id']]) {
  for (const x of arr||[]) known.add(x[key]);
}

const allQuizIds = [], quizErrors = [], mediaErrors = [];
let quizTotal = 0, mediaTotal = 0, usTotal = 0;
for (const [m,spec] of Object.entries(modules)) {
  const ex=json(`data/examination-${m}-v1.json`);
  const us=json(`data/ultrasound-${m}-v1.json`);
  const q=json(`data/quiz-${m}-v1.json`);
  const media=json(`data/media-audit-${m}-v1.json`);
  check(`${m} examination count`, ex.clinical_tests?.length===spec.exam, `${ex.clinical_tests?.length}/${spec.exam}`);
  check(`${m} ultrasound count`, us.ultrasound_views?.length===spec.us, `${us.ultrasound_views?.length}/${spec.us}`);
  check(`${m} quiz count`, q.questions?.length===spec.quiz, `${q.questions?.length}/${spec.quiz}`);
  check(`${m} media coverage`, media.coverage?.views_total===spec.media && media.coverage?.unverified===0, JSON.stringify(media.coverage));
  for (const v of media.views||[]) {
    for (const key of ['source_page','figure_label','license','reuse_policy','license_status','media_integrity']) if (!v[key]) mediaErrors.push(`${m}:${v.ultrasound_view_id}:missing_${key}`);
    if (!['link_only','embedded_reuse_with_attribution'].includes(v.reuse_policy)) mediaErrors.push(`${m}:${v.ultrasound_view_id}:reuse_policy`);
    if (v.reuse_policy==='embedded_reuse_with_attribution' && v.license_status!=='explicit') mediaErrors.push(`${m}:${v.ultrasound_view_id}:embedded_without_explicit_license`);
  }
  quizTotal += q.questions?.length||0;
  usTotal += us.ultrasound_views?.length||0;
  mediaTotal += media.coverage?.views_total||0;
  for (const z of q.questions||[]) {
    allQuizIds.push(z.quiz_id);
    const vals=(z.options||[]).map(o=>o.value), labels=(z.options||[]).map(o=>o.label);
    if ((z.options||[]).length!==4) quizErrors.push(`${m}:${z.quiz_id}:option_count`);
    if (new Set(vals).size!==vals.length) quizErrors.push(`${m}:${z.quiz_id}:duplicate_values`);
    if (new Set(labels).size!==labels.length) quizErrors.push(`${m}:${z.quiz_id}:duplicate_labels`);
    if (!vals.includes(z.correct_value)) quizErrors.push(`${m}:${z.quiz_id}:correct_value`);
    if (!known.has(z.related_muscle_id)) quizErrors.push(`${m}:${z.quiz_id}:muscle:${z.related_muscle_id}`);
    if (z.related_entity_id && !known.has(z.related_entity_id) && !/^dg\d+$/.test(z.related_entity_id)) quizErrors.push(`${m}:${z.quiz_id}:entity:${z.related_entity_id}`);
  }
}
const dupQuiz=[...new Set(allQuizIds.filter((x,i)=>allQuizIds.indexOf(x)!==i))];
check('Clinical quiz total = 294', quizTotal===294, String(quizTotal));
check('Clinical quiz structural errors = 0', quizErrors.length===0, quizErrors.slice(0,30).join(','));
check('Global quiz ID duplicates = 0', dupQuiz.length===0, dupQuiz.join(','));
check('Module ultrasound total = 131', usTotal===131, String(usTotal));
check('Module media total = 131', mediaTotal===131, String(mediaTotal));
check('Per-view media/license metadata errors = 0', mediaErrors.length===0, mediaErrors.slice(0,30).join(','));

const profileById=Object.fromEntries(lib.profiles.map(p=>[p.profile_id,p]));
const sourceIds=new Set(Object.keys(lib.sources));
const assignmentIds=lib.assignments.map(a=>a.muscle_id);
const exerciseErrors=[];
if (lib.assignments.length!==205 || new Set(assignmentIds).size!==205) exerciseErrors.push('assignment_count');
for (const m of core.muscles) if (!assignmentIds.includes(m.muscle_id)) exerciseErrors.push(`missing:${m.muscle_id}`);
for (const a of lib.assignments) {
  const pids=[...(a.stretch_profile_ids||[]),...(a.strength_profile_ids||[])];
  if (!pids.length) exerciseErrors.push(`no_outcome:${a.muscle_id}`);
  if (!['A','B','C'].includes(a.evidence_tier)) exerciseErrors.push(`tier:${a.muscle_id}`);
  let sourced=false;
  for (const pid of pids) {
    const p=profileById[pid];
    if (!p) exerciseErrors.push(`bad_profile:${a.muscle_id}:${pid}`);
    if ((p?.source_refs||[]).length) sourced=true;
  }
  if (['A','B'].includes(a.evidence_tier) && !sourced) exerciseErrors.push(`high_tier_unsourced:${a.muscle_id}`);
}
for (const p of lib.profiles) {
  if (!p.title_ko || !p.type || !p.evidence_tier || !Array.isArray(p.steps) || !p.steps.length || !p.dose) exerciseErrors.push(`profile_incomplete:${p.profile_id}`);
  for (const sid of p.source_refs||[]) if (!sourceIds.has(sid)) exerciseErrors.push(`bad_source:${p.profile_id}:${sid}`);
}
check('Patient Education 205-muscle integrity', exerciseErrors.length===0, exerciseErrors.slice(0,30).join(','));

check('Global media audit view total = 131', mediaGlobal.summary?.ultrasound_views_total===131, String(mediaGlobal.summary?.ultrasound_views_total));
check('Global media audit unresolved issues = 0', mediaGlobal.summary?.unresolved_issues===0, String(mediaGlobal.summary?.unresolved_issues));
check('No generated B-mode substitute', mediaGlobal.policy?.actual_ultrasound_only===true && mediaGlobal.policy?.generated_b_mode_substitute===false);

for (const token of ['<section id="oral"','startOralSession','gradeOralAnswer','toggleOralMic','speechSynthesis','mskOralProgressV2']) {
  check(`Oral Viva wiring: ${token}`, html.includes(token));
}
check('Oral Viva v9.2 examiner roles',
  ['friend:{','colleague:{','senior:{','master:{'].every(token=>html.includes(token))
);
check('Oral Viva v9.2 multi-domain question engine',
  ["category:'anatomy'","category:'function'","category:'exam'","category:'clinical'","category:'ultrasound'","category:'reverse'"].every(token=>html.includes(token))
);
check('Oral Viva completeness grading hardened',
  html.includes("function oralTargetScore") &&
  html.includes("missing.length===0") &&
  html.includes("allComplete") &&
  html.includes("friend:.42,colleague:.56,senior:.62,master:.68")
);
check('Oral Viva short anatomy-token guard present',
  html.includes("if(t.length<=3)") &&
  html.includes("grammatical.includes(t)")
);
check('Oral Viva teaching feedback present',
  html.includes("function fieldTeaching") &&
  html.includes("한 단계 더") &&
  html.includes("정본 답")
);
check('Patient-first exercise UX present',
  html.includes('data-page="education">환자 운동·스트레칭</button>') &&
  html.includes("function printCurrentEducation") &&
  html.includes("function exerciseIllustration") &&
  html.includes("function exerciseCaution")
);
check('App identity v9.2',
  html.includes("<h1>이윤석정형외과 근육</h1>") &&
  manifest.name==="이윤석정형외과 근육"
);
check('Privacy policy linked',
  html.includes("./privacy.html") &&
  sw.includes("./privacy.html")
);

// Independent regression model for the canonical-answer and partial-answer invariants.
// This mirrors the intended strict grading contract rather than trusting UI wiring alone.
const oralStopQA=new Set(['근육','기능','신경','지배','기시','정지','에서','으로','하고','하며','보조','동반','운동','해당','부분','외측면','상면']);
const oralNormQA=s=>String(s||'').toLowerCase()
  .replace(/transverse process/g,'횡돌기').replace(/posterior tubercle/g,'후결절').replace(/anterior tubercle/g,'전결절')
  .replace(/cervical nerve/g,'경신경').replace(/ventral ramus|ventral rami/g,'전지')
  .replace(/목을?|목/g,'경추').replace(/옆으로\s*굽히\S*/g,'측굴').replace(/측방\s*굴곡/g,'측굴')
  .replace(/들어\s*올리\S*/g,'거상').replace(/돌리\S*/g,'회전').replace(/굽히\S*/g,'굴곡').replace(/펴\S*/g,'신전')
  .replace(/바깥\s*돌림/g,'외회전').replace(/안쪽\s*돌림/g,'내회전').replace(/벌리\S*|벌림/g,'외전').replace(/모으\S*|모음/g,'내전')
  .replace(/\s+/g,'').replace(/[.,;:·/()\[\]{}'"“”‘’→+\-]/g,'');
const oralTokensQA=s=>String(s||'').replace(/[;,·/()\[\]{}:+]/g,' ').split(/\s+/)
  .map(x=>x.trim()).filter(x=>x.length>=2&&!oralStopQA.has(x));
const oralTokenMatchQA=(user,token)=>{
  const u=oralNormQA(user),t=oralNormQA(token);
  if(!t)return false;
  if(t.length<=3){
    const userTokens=String(user||'').replace(/[;,·/()\[\]{}:+]/g,' ').split(/\s+/).map(x=>oralNormQA(x)).filter(Boolean);
    if(userTokens.includes(t))return true;
    const grammatical=userTokens.map(x=>x.length>=4?x.replace(/(?:에서|으로|에게|부터|까지|은|는|이|가|을|를|의|에|도|만)$/,''):x);
    return grammatical.includes(t);
  }
  return u.includes(t)||(t.includes(u)&&u.length>=4);
};
const oralClauseScoreQA=(user,expected)=>{
  const toks=[...new Set(oralTokensQA(expected))];
  if(!toks.length)return oralNormQA(user).includes(oralNormQA(expected))?1:0;
  return toks.filter(t=>oralTokenMatchQA(user,t)).length/toks.length;
};
const oralGradeQA=(answer,expected)=>{
  const threshold=.62;
  const clauses=String(expected||'').split(/[;,]+/).map(x=>x.trim()).filter(Boolean);
  const scores=clauses.map(c=>oralClauseScoreQA(answer,c));
  const score=scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:0;
  const missing=clauses.filter((c,i)=>scores[i]<.65);
  const complete=missing.length===0;
  return !answer?'wrong':complete&&score>=threshold?'correct':score>=Math.max(.28,threshold*.55)?'partial':'wrong';
};
const oralCanonicalFailures=[], oralPartialOvergrades=[];
for(const m of core.muscles){
  for(const [field,expected] of Object.entries({
    origin:m.anatomy?.origin,insertion:m.anatomy?.insertion,function:m.anatomy?.function,nerve:m.innervation_text
  })){
    if(oralGradeQA(expected,expected)!=='correct') oralCanonicalFailures.push(`${m.muscle_id}:${field}`);
    const parts=String(expected||'').split(/[;,]+/).map(x=>x.trim()).filter(Boolean);
    if(parts.length>1 && oralGradeQA(parts[0],expected)==='correct') oralPartialOvergrades.push(`${m.muscle_id}:${field}`);
  }
}
check('Oral Viva canonical self-answer = 820/820 correct', oralCanonicalFailures.length===0, oralCanonicalFailures.slice(0,20).join(','));
check('Oral Viva partial-component overgrade = 0', oralPartialOvergrades.length===0, oralPartialOvergrades.slice(0,20).join(','));
for (const token of ['<section id="education"','openEducationMuscle','loadPatientExerciseLibrary']) {
  check(`Patient Education wiring: ${token}`, html.includes(token));
}
let jsSyntax=true,jsError='';
try {
  const m=html.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('script not found');
  new Function(m[1]);
} catch (e) { jsSyntax=false; jsError=String(e); }
check('App JavaScript syntax', jsSyntax, jsError);
check('Stage 10 UI present', html.includes('Stage 10 COMPLETE') && html.includes('loadAbdominalCoreClinicalModule();'));
const requiredPages=['home','symptoms','regions','clinical','education','quiz','oral'];
check('All 7 app pages wired', requiredPages.every(id=>html.includes(`data-page="${id}"`) && html.includes(`<section id="${id}"`)), requiredPages.join(','));
check('PWA id', manifest.id==='/muscle-atlas-chatgpt/', manifest.id);
check('PWA start_url', manifest.start_url==='/muscle-atlas-chatgpt/?source=pwa', manifest.start_url);
check('PWA scope', manifest.scope==='/muscle-atlas-chatgpt/', manifest.scope);
check('PWA fullscreen', manifest.display==='fullscreen' && manifest.display_override?.includes('standalone'), manifest.display);

const cacheNeedles=['patient-exercise-library-v1.json','knowledge-core-v1.json','symptom-groups-v1.json','symptoms-v1.json',...Object.keys(modules).flatMap(m=>[
  `examination-${m}-v1.json`,`ultrasound-${m}-v1.json`,`quiz-${m}-v1.json`,`differential-${m}-v1.json`,`media-audit-${m}-v1.json`
])];
const missingCache=cacheNeedles.filter(x=>!sw.includes(x));
check('PWA clinical cache coverage', missingCache.length===0, missingCache.join(','));

const phiNeedles=['patient_name','patient_id','encounter_id','resident_registration','주민등록번호'];
const scanFiles=['data/knowledge-core-v1.json','data/patient-exercise-library-v1.json',...Object.keys(modules).flatMap(m=>[
  `data/examination-${m}-v1.json`,`data/ultrasound-${m}-v1.json`,`data/quiz-${m}-v1.json`,`data/differential-${m}-v1.json`
])];
const phiHits=[];
for (const p of scanFiles) {
  const t=read(p).toLowerCase();
  for (const n of phiNeedles) if (t.includes(n.toLowerCase())) phiHits.push(`${p}:${n}`);
}
check('PHI boundary scan', phiHits.length===0, phiHits.join(','));

console.log('\n--- GLOBAL QA SUMMARY ---');
console.log(`PASS=${passes.length} FAIL=${failures.length}`);
if (failures.length) {
  console.error(JSON.stringify(failures,null,2));
  process.exit(1);
}
