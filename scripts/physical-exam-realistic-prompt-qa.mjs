import fs from 'node:fs';
import {buildPhysicalExamPrompt,nextPilotProfile,modelCastingForClinicalTestId} from './build-physical-exam-realistic-prompt.mjs';

const manifest=JSON.parse(fs.readFileSync('data/physical-exam-realistic-assets-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>{
  checks.push({name,pass:Boolean(pass),detail});
  console.log((pass?'PASS':'FAIL')+' | '+name+(detail?' | '+detail:''));
};

const next=nextPilotProfile(manifest);

const c84=modelCastingForClinicalTestId('ct084');
check('ct084 balanced casting rule is deterministic',
  c84?.patient==='여성형'&&c84?.examiner==='남성형'&&c84?.rule_version==='2026-10-03',
  JSON.stringify(c84));
check('Next EXAM-REAL pilot task is ct083 Cervical distraction',
  next?.clinical_test_id==='ct083',next?.clinical_test_id||'missing');

const pilotIds=manifest.pilot?.clinical_test_ids||[];
check('Pilot contains six locked cervical tests',
  JSON.stringify(pilotIds)===JSON.stringify(['ct082','ct083','ct084','ct088','ct092','ct095']),
  JSON.stringify(pilotIds));

const generationReadyIds=pilotIds.filter(id=>{
  const p=manifest.profiles?.find(x=>x.clinical_test_id===id);
  return p?.status==='PENDING_GENERATION'&&p?.brief_status==='GENERATION_READY';
});
check('Five cervical pilot profiles are generation-ready while ct088 binary handoff is safely blocked',
  JSON.stringify(generationReadyIds)===JSON.stringify(['ct083','ct084','ct088','ct092','ct095']),
  JSON.stringify(generationReadyIds));
const ct088=manifest.profiles?.find(x=>x.clinical_test_id==='ct088');
check('ct088 is safely reverted to schematic fallback after binary integrity failure',
  ct088?.status==='PENDING_GENERATION'&&
  !ct088?.preview_candidate&&
  ct088?.review?.user_preview==='PENDING'&&
  ct088?.generation_blocker?.reason==='BINARY_HANDOFF_INTEGRITY_FAILURE'&&
  !ct088?.approved_asset);

for(const id of generationReadyIds){
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
  if(Number(id.match(/(\d+)$/)?.[1]||0)>=84){
    check(id+' prompt carries balanced model casting',
      prompt.includes('모델 배정: 환자')&&prompt.includes('검사자')&&prompt.includes('서로 다른 검사에서 같은 인물 이미지를 재사용하지 않는다.'));
  }
}

const ct082=manifest.profiles?.find(x=>x.clinical_test_id==='ct082');
let approvedGenerationBlocked=false;
try{buildPhysicalExamPrompt(manifest,'ct082')}catch(e){approvedGenerationBlocked=String(e.message).includes('not generation-ready')}
check('Approved ct082 is blocked from accidental regeneration by prompt builder',approvedGenerationBlocked);

check('ct082 approval state is complete',
  ct082?.status==='APPROVED'&&
  ct082?.brief_status==='APPROVED'&&
  ct082?.review?.clinical_content==='PASS'&&
  ct082?.review?.visual_pose==='PASS'&&
  ct082?.review?.examiner_hand_position==='PASS'&&
  ct082?.review?.force_direction==='PASS'&&
  ct082?.review?.embedded_text==='PASS'&&
  ct082?.review?.user_preview==='PASS');

check('ct082 approved asset uses final generation id',
  ct082?.approved_asset?.candidate_no===9&&
  ct082?.approved_asset?.gen_id==='919bcbfd-9a99-4e37-b635-f78fa5655151'&&
  ct082?.approved_asset?.preview_webp_sha256==='7e6d505b9d0411422c45b2a79a46134f8b6d3f0ba834d43acee82088df4a483b');

check('ct082 approved source hash is explicitly verified',
  ct082?.approved_asset?.source_png_sha256_verified==='050ff5edaa489813605835125471e56f961fa1d7ba61ccb2b0b88e38893a3621');

check('ct082 locked brief preserves ipsilateral clinical rule',
  String(ct082?.generation_brief?.patient_setup||'').includes('환자 오른쪽으로 경추 회전')&&
  String(ct082?.generation_brief?.patient_setup||'').includes('오른쪽 측굴')&&
  String(ct082?.generation_brief?.patient_setup||'').includes('약간의 신전')&&
  String(ct082?.generation_brief?.examiner_maneuver||'').includes('축성 압박')&&
  String(ct082?.generation_brief?.positive_finding||'').includes('환자 오른쪽')&&
  String(ct082?.generation_brief?.positive_finding||'').includes('오른쪽 어깨·팔·손'));

check('ct082 candidate history preserves early failures and final selection',
  Array.isArray(ct082?.candidate_history)&&
  ct082.candidate_history.some(x=>x.candidate_no===1&&x.gen_id==='7d4e6df1-19d5-4439-9fe4-41ce23d27f8f')&&
  ct082.candidate_history.some(x=>x.candidate_no===4&&x.gen_id==='3d216ff9-a4a8-44a0-98c0-b7f6daa865dc')&&
  ct082.candidate_history.some(x=>x.candidate_no===9&&x.gen_id==='919bcbfd-9a99-4e37-b635-f78fa5655151'&&x.disposition==='USER_APPROVED'));

check('ct082 evidence caution includes 2025 and 2026 reviews',
  ct082?.evidence_alignment?.status==='PASS_WITH_LOW_CERTAINTY_CAUTION'&&
  (ct082?.evidence_alignment?.canonical_refs||[]).includes('spurling_2025')&&
  (ct082?.evidence_alignment?.canonical_refs||[]).includes('radic_review_2026'));

const runtime=fs.readFileSync('index.html','utf8');
check('Runtime loads realistic Physical Examination registry',
  runtime.includes("fetch('./data/physical-exam-realistic-assets-v1.json'"));
check('Runtime supports approved realistic asset while retaining schematic fallback',
  runtime.includes('approved=p?.approved_asset')&&
  runtime.includes('실사형 승인본 · Preview 적재')&&
  runtime.includes('기존 Stable-ID 도해는 보조 reference로 유지합니다.')&&
  runtime.includes('physicalExamRealisticCandidateHtml(test)+clinicalExamIllustrationHtml(test,moduleKey)'));

let nonPilotBlocked=false;
try{buildPhysicalExamPrompt(manifest,'ct001')}catch(e){nonPilotBlocked=String(e.message).includes('not in the active realistic Physical Examination pilot')}
check('Non-pilot generation is blocked during cervical pilot',nonPilotBlocked);

const failed=checks.filter(x=>!x.pass);
console.log('\nPhysical Examination realistic prompt QA: '+(checks.length-failed.length)+'/'+checks.length+' PASS');
if(failed.length)process.exit(1);
