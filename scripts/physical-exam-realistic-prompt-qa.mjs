import fs from 'node:fs';
import {buildPhysicalExamPrompt,nextPilotProfile} from './build-physical-exam-realistic-prompt.mjs';

const manifest=JSON.parse(fs.readFileSync('data/physical-exam-realistic-assets-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>{
  checks.push({name,pass:Boolean(pass),detail});
  console.log((pass?'PASS':'FAIL')+' | '+name+(detail?' | '+detail:''));
};

const next=nextPilotProfile(manifest);
check('Next EXAM-REAL pilot task is ct082 Spurling',next?.clinical_test_id==='ct082',next?.clinical_test_id||'missing');

const pilotIds=manifest.pilot?.clinical_test_ids||[];
check('Pilot contains six locked cervical tests',
  JSON.stringify(pilotIds)===JSON.stringify(['ct082','ct083','ct084','ct088','ct092','ct095']),
  JSON.stringify(pilotIds));

for(const id of pilotIds){
  let prompt='';
  try{prompt=buildPhysicalExamPrompt(manifest,id)}catch(e){prompt='ERROR '+e.message}
  check(id+' prompt builds',!prompt.startsWith('ERROR'),prompt.startsWith('ERROR')?prompt:'ok');
  check(id+' uses three realistic panels',
    prompt.includes('1 · 시작 자세 / 2 · 검사 시행 / 3 · 양성 판단')&&
    prompt.includes('실제 사람처럼 보이는')&&prompt.includes('같은 인물'));
  check(id+' locks examiner hand and force direction',
    prompt.includes('검사자 손 위치')&&prompt.includes('힘 또는 움직임 방향'));
  check(id+' keeps conservative diagnostic language',
    prompt.includes('단일 검사만으로 진단이 확정되는 것처럼 표현하지 않는다.'));
  check(id+' protects copyright/provenance',
    prompt.includes('복제·트레이싱하지 않는다')&&prompt.includes('새로운 gen_id')&&prompt.includes('인간이 임상내용'));
  check(id+' keeps EXAM-001 fallback until user approval',
    prompt.includes('사용자 Preview 승인 전 기존 EXAM-001 Stable-ID schematic을 교체하지 않는다.'));
}

const spurling=buildPhysicalExamPrompt(manifest,'ct082');
check('Spurling prompt distinguishes radicular symptom from local neck pain',
  spurling.includes('radicular pain/paresthesia')&&spurling.includes('목의 국소 통증만으로 양성 처리하지 않으며'));
check('Spurling prompt locks same-side cervical compression pose',
  spurling.includes('환자 오른쪽으로 경추 회전')&&
  spurling.includes('오른쪽 측굴')&&
  spurling.includes('약간의 신전')&&
  spurling.includes('축성 압박')&&
  spurling.includes('환자 오른팔'));

const ct082=manifest.profiles?.find(x=>x.clinical_test_id==='ct082');
check('ct082 latest candidate is candidate 2 with a new generation id',
  ct082?.preview_candidate?.candidate_no===2&&
  ct082?.preview_candidate?.gen_id==='2bbacf3a-f954-4b86-9d5e-a952b89eeca8',
  ct082?.preview_candidate?.gen_id||'missing');
check('ct082 candidate 2 is blocked from canonical promotion',
  ct082?.composite_url===null&&ct082?.review?.user_preview==='PENDING'&&
  ct082?.preview_candidate?.disposition==='NEEDS_REVISION_NOT_CANONICAL'&&
  Array.isArray(ct082?.approval_blockers)&&ct082.approval_blockers.length>0);
check('ct082 candidate history preserves candidate 1',
  Array.isArray(ct082?.candidate_history)&&
  ct082.candidate_history.some(x=>x.candidate_no===1&&x.gen_id==='7d4e6df1-19d5-4439-9fe4-41ce23d27f8f'));
check('ct082 latest failed axes stay explicit while baseline remains generation-ready',
  ct082?.status==='PENDING_GENERATION'&&ct082?.brief_status==='GENERATION_READY'&&
  ct082?.review?.clinical_content==='FAIL'&&
  ct082?.review?.visual_pose==='FAIL'&&
  ct082?.review?.embedded_text==='PASS');
check('ct082 evidence caution includes 2025 and 2026 reviews',
  ct082?.evidence_alignment?.status==='PASS_WITH_LOW_CERTAINTY_CAUTION'&&
  (ct082?.evidence_alignment?.canonical_refs||[]).includes('spurling_2025')&&
  (ct082?.evidence_alignment?.canonical_refs||[]).includes('radic_review_2026'));
check('ct082 candidate 5 correction brief locks portrait, minimal text and laterality',
  String(ct082?.generation_brief?.text_policy||'').includes('영문 병기·장문 설명 금지')&&
  String(ct082?.generation_brief?.panel_structure||'').includes('3열 가로 배치 금지')&&
  String(ct082?.generation_brief?.overlay_policy||'').includes('환자 오른쪽')&&
  String(ct082?.generation_brief?.overlay_policy||'').includes('환자 오른팔'));

check('ct082 candidate history preserves candidate 4 failed review evidence',
  Array.isArray(ct082?.candidate_history)&&
  ct082.candidate_history.some(x=>
    x.candidate_no===4&&
    x.gen_id==='3d216ff9-a4a8-44a0-98c0-b7f6daa865dc'&&
    x.disposition==='NEEDS_REVISION_NOT_CANONICAL'&&
    (x.failed_axes||[]).includes('clinical_content')&&
    (x.failed_axes||[]).includes('visual_pose')&&
    String(x.review_thumbnail_path||'').includes('ct082-spurling-gen-3d216ff9-review.svg')
  ));

const runtime=fs.readFileSync('index.html','utf8');
check('Runtime loads realistic Physical Examination registry',
  runtime.includes("fetch('./data/physical-exam-realistic-assets-v1.json'"));
check('Runtime renders realistic candidate without replacing schematic fallback',
  runtime.includes('physicalExamRealisticCandidateHtml(test)+clinicalExamIllustrationHtml(test,moduleKey)')&&
  runtime.includes('이 후보는 사용자 검수용이며 canonical 교체가 아닙니다.'));

let nonPilotBlocked=false;
try{buildPhysicalExamPrompt(manifest,'ct001')}catch(e){nonPilotBlocked=String(e.message).includes('not in the active realistic Physical Examination pilot')}
check('Non-pilot generation is blocked during cervical pilot',nonPilotBlocked);

const failed=checks.filter(x=>!x.pass);
console.log('\nPhysical Examination realistic prompt QA: '+(checks.length-failed.length)+'/'+checks.length+' PASS');
if(failed.length)process.exit(1);
