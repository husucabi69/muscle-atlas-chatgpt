import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const cervical=JSON.parse(fs.readFileSync('data/differential-cervical-v1.json','utf8'));
const sources=JSON.parse(fs.readFileSync('data/board-exam-sources-v1.json','utf8'));
const files=[
  'differential-shoulder-v1.json','differential-elbow-v1.json','differential-wrist-hand-v1.json','differential-hip-pelvis-v1.json',
  'differential-knee-thigh-v1.json','differential-leg-ankle-foot-v1.json','differential-cervical-v1.json','differential-thoracic-back-chestwall-v1.json',
  'differential-lumbar-sacral-v1.json','differential-abdominal-core-v1.json'
];
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

let candidateCases=0,groups=0;
for(const name of files){
  const j=JSON.parse(fs.readFileSync('data/'+name,'utf8'));
  groups+=(j.differential_groups||[]).length;
  candidateCases+=(j.differential_groups||[]).reduce((n,g)=>n+(g.candidates||[]).filter(c=>(c.look_for||[]).length>0).length,0);
}
check('Specialist case source covers all 10 clinical regions',files.length===10,String(files.length));
check('Differential groups provide broad specialist pool',groups>=60,String(groups));
check('Candidate-derived case pool supports 120-question sessions',candidateCases>=120,String(candidateCases));
check('UI exposes 20/40/80/120 specialist session sizes',
  ['value="20"','value="40"','value="80"','value="120"'].every(x=>index.includes(x))
);
check('Specialist generator exists',index.includes('function boardCaseQuestionPool()')&&index.includes('function startSpecialistBoardQuiz()'));
check('Specialist questions use close differential candidates',index.includes('const local=groupIds.filter')&&index.includes('const distractors='));
check('Specialist questions carry rationale',index.includes("rationale:'정답을 지지하는 핵심 소견:"));
check('Board case mode excludes generic O/I/F/N generator',index.includes("type:'board_case'")&&index.includes("beginQuizSession('board',true)"));
check('Board case answer can deep-link to diagnosis detail',index.includes("openClinicalStableDetail(\\'diagnosis_concept\\'"));

const cdx=cervical.diagnosis_concepts||[];
check('All cervical diagnosis concepts have textbook detail',cdx.length>=12&&cdx.every(d=>d.textbook_detail),String(cdx.filter(d=>d.textbook_detail).length));
check('Cervical textbook detail covers core sections',
  cdx.every(d=>['summary','pathophysiology','history','exam','imaging','management','pitfalls'].every(k=>typeof d.textbook_detail?.[k]==='string'&&d.textbook_detail[k].length>20))
);
check('Differential candidate cards are clickable details',index.includes('class="diagnosis-candidate"')&&index.includes('후보를 눌러 상세설명'));
check('Focused diagnosis auto-opens detail',index.includes("if('open' in el)el.open=true"));

check('Clinical exam detail has educational illustration renderer',
  index.includes('function clinicalExamIllustrationHtml(test,moduleKey)')&&
  index.includes('검사 시행 도해')&&
  (index.includes('검사별 시행 도해')||index.includes('공통 개념도'))
);
check('Clinical exam detail separates setup, examiner maneuver, positive criteria, interpretation and limitations',
  ['검사 전 확인','환자 시작 자세','검사자 동작 · 시행 순서','양성 기준','임상 해석','한계 / 흔한 오류'].every(x=>index.includes(x))
);
check('Clinical exam detail links target structures and differential concepts',
  index.includes('related_diagnosis_concept_ids')&&index.includes('연결 감별진단')
);

check('Official source registry policy exists',sources.policy?.rule?.includes('공식 공개자료만'));
check('Official 2026 oral scope linked',sources.sources?.some(x=>x.id==='koa_2026_oral_scope'&&x.kind==='official_scope'));
check('Official 2026 reference bibliography linked',sources.sources?.some(x=>x.id==='koa_2026_reference'&&x.kind==='official_reference'));
check('Public resident exam is not mislabeled as specialist past exam',
  sources.sources?.some(x=>x.id==='koa_2016_resident_exam'&&x.kind==='official_public_resident_questions'&&/전문의 자격시험 기출이 아니라/.test(x.note||''))
);
check('App does not claim auto-generated questions are real past questions',
  index.includes('실제 기출 복제가 아니라')&&sources.policy?.generated_questions?.includes('실제 기출 복제가 아니라')
);

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- SPECIALIST QUIZ & DIFFERENTIAL DETAIL QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
