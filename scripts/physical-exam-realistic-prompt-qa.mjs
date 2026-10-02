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
  spurling.includes('평소 팔의 방사통·저림')&&spurling.includes('목의 국소 통증만으로 양성 처리하지 않으며'));
check('Spurling prompt locks cervical compression pose',
  spurling.includes('증상측으로 경추를 회전·측굴/신전')&&spurling.includes('축성 압박'));

const ct082=manifest.profiles?.find(x=>x.clinical_test_id==='ct082');
check('ct082 candidate 1 has a new generation id',
  ct082?.preview_candidate?.gen_id==='7d4e6df1-19d5-4439-9fe4-41ce23d27f8f',
  ct082?.preview_candidate?.gen_id||'missing');
check('ct082 candidate 1 is blocked from canonical promotion',
  ct082?.composite_url===null&&ct082?.review?.user_preview==='PENDING'&&
  Array.isArray(ct082?.approval_blockers)&&ct082.approval_blockers.length>0);
check('ct082 failed axes stay explicit while baseline remains generation-ready',
  ct082?.status==='PENDING_GENERATION'&&ct082?.brief_status==='GENERATION_READY'&&
  ct082?.review?.visual_pose==='FAIL'&&ct082?.review?.embedded_text==='FAIL');

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
