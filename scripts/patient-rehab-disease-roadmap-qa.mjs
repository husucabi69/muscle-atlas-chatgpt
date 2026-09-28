import fs from 'node:fs';

const data=JSON.parse(fs.readFileSync('data/patient-rehab-disease-roadmap-v1.json','utf8'));
const next=fs.readFileSync('docs/NEXT_UPGRADE_ROADMAP.md','utf8');
const master=fs.readFileSync('docs/MASTER_ROADMAP.md','utf8');
const constitution=fs.readFileSync('docs/DEVELOPMENT_CONSTITUTION.md','utf8');

const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

check('Disease rehab roadmap schema',data.schema_version==='1.0.0',data.schema_version);
check('Disease rehab blocks Stage 23C',data.completion_policy?.blocks_stage_23c===true);
check('Disease rehab has 10 anatomy regions',data.regions?.length===10,String(data.regions?.length||0));
check('Every region has representative conditions',data.regions?.every(r=>Array.isArray(r.priority_conditions)&&r.priority_conditions.length>=3));
check('Required patient education sections complete',data.completion_policy?.required_patient_sections?.length>=10,String(data.completion_policy?.required_patient_sections?.length||0));
check('Evidence priority includes CPG',data.completion_policy?.evidence_priority?.includes('clinical_practice_guideline'));
check('Postoperative rehab is separated',data.completion_policy?.postoperative_separate===true);
check('No invented dose policy',data.completion_policy?.no_invented_dose===true);

const userTerms=['오십견','극상근 파열','극상근 스트레칭','극상근 강화 운동','퇴행성 관절염','퇴행성 통증 증후군','연골 낭종'];
for(const term of userTerms){
  check('User-requested term preserved: '+term,data.user_requested_terms?.some(x=>x.term_ko===term));
}
check('Ambiguous user terminology retained for review',
  ['퇴행성 통증 증후군','연골 낭종'].every(term=>data.user_requested_terms?.some(x=>x.term_ko===term&&x.status==='TERMINOLOGY_REVIEW_PENDING'))
);

check('Patient navigation has disease rehab path',
  JSON.stringify(data.patient_navigation?.primary_path||[]).includes('질환별 재활')
);
check('Existing muscle education path preserved',data.patient_navigation?.preserve_existing_muscle_path===true);
check('Home search direct route required',data.patient_navigation?.home_search_direct_route===true);
check('Clinical detail direct route required',data.patient_navigation?.clinical_detail_direct_route===true);
check('Print action required',data.patient_navigation?.print_action==='one_click_a4_pdf');

check('NEXT roadmap has mandatory disease rehab stage',next.includes('Stage 23B-Disease Rehab')&&next.includes('MUST IMPLEMENT BEFORE STAGE 23C'));
check('NEXT roadmap forbids Stage 23C before disease rehab gate',next.includes('이 Gate를 통과하기 전 Stage 23C로 이동 금지'));
check('MASTER roadmap has mandatory disease rehab stage',master.includes('Stage 23B-Disease Rehab')&&master.includes('MANDATORY'));
check('Constitution locks disease rehab gate',constitution.includes('Stage 23B-Disease Rehab Gate가 끝나기 전 Stage 23C로 이동하지 않는다'));

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- STAGE 23B DISEASE REHAB ROADMAP QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
