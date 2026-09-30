import fs from 'node:fs';

const requests=JSON.parse(fs.readFileSync('data/patient-exercise-render-requests-v1.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

check('render request schema is 1.0.0',requests.schema_version==='1.0.0',requests.schema_version||'');
const r=requests.requests?.find(x=>x.profile_id==='px007');
const p=manifest.profiles?.find(x=>x.profile_id==='px007');
check('px007 render request exists',Boolean(r));
check('px007 current state is reviewed candidate waiting for binary',p?.status==='CANDIDATE_GENERATED'&&p?.asset_gate==='BINARY_HANDOFF_BLOCKED',`${p?.status||''}/${p?.asset_gate||''}`);
check('px007 request output path is canonical',r?.output_path==='assets/patient-exercise-realistic/px007.webp',r?.output_path||'');
check('px007 start pose is fingers together',r?.exact_motion?.start?.includes('모은다'));
check('px007 end pose is finger spread',r?.exact_motion?.end?.includes('벌린다'));
check('px007 wrist remains neutral and supported',r?.exact_motion?.fixed_points?.includes('손목 중립')&&r?.exact_motion?.fixed_points?.includes('지지'));
check('px007 explicitly forbids fist closure',r?.must_not_show?.includes('주먹쥐기'));
check('px007 explicitly forbids arbitrary resistance',r?.must_not_show?.some(x=>x.includes('임의 저항')));
check('px007 explicitly forbids invented dose numbers',r?.must_not_show?.some(x=>x.includes('반복횟수')&&x.includes('숫자')));
check('px007 review gate checks start/end/wrist/fist/dose/mobile',
  ['시작 자세','끝 자세','손목 중립','주먹쥐기','고정 숫자','모바일'].every(term=>r?.review_gate?.some(x=>x.includes(term)))
);
check('px007 request matches manifest locked brief',
  p?.generation_brief?.start?.includes('모은')&&
  p?.generation_brief?.end?.includes('벌린')&&
  p?.generation_brief?.common_error?.includes('주먹쥐기')
);

for(const id of ['px008','px009','px010']){
  const x=requests.requests?.find(r=>r.profile_id===id);
  check(id+' render request exists',Boolean(x));
  check(id+' output path is canonical',x?.output_path==='assets/patient-exercise-realistic/'+id+'.webp',x?.output_path||'');
  check(id+' forbids invented fixed numbers',x?.must_not_show?.some(v=>v.includes('숫자')));
  check(id+' has mobile review gate',x?.review_gate?.some(v=>v.includes('모바일')));
}
const r7=requests.requests?.find(r=>r.profile_id==='px007');
check('px007 render request is blocked on exact binary handoff',r7?.status==='REVIEWED_CANDIDATE_BINARY_HANDOFF_BLOCKED',r7?.status||'');
const r8=requests.requests?.find(r=>r.profile_id==='px008');
check('px008 render request is blocked on exact binary handoff',r8?.status==='REVIEWED_CANDIDATE_BINARY_HANDOFF_BLOCKED',r8?.status||'');
check('px008 locks pelvis/trunk control',r8?.review_gate?.some(v=>v.includes('골반'))&&r8?.must_not_show?.some(v=>v.includes('몸통')));
const r9=requests.requests?.find(r=>r.profile_id==='px009');
check('px009 corrected render request is blocked on exact binary handoff',r9?.status==='REVIEWED_CANDIDATE_BINARY_HANDOFF_BLOCKED',r9?.status||'');
check('px009 forbids knee-toe absolute prohibition',
  r9?.must_not_show?.some(v=>v.includes('발끝보다 앞으로')&&v.includes('절대금기'))&&
  r9?.patient_copy?.some(v=>v.includes('무조건 금지하지 않습니다'))
);
const r10=requests.requests?.find(r=>r.profile_id==='px010');
check('px010 render request is blocked on exact binary handoff',r10?.status==='REVIEWED_CANDIDATE_BINARY_HANDOFF_BLOCKED',r10?.status||'');
check('px010 locks glute-driven bridge without lumbar overextension',
  r10?.exact_motion?.end?.includes('엉덩이')&&r10?.must_not_show?.some(v=>v.includes('허리'))
);

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- PATIENT EXERCISE RENDER REQUEST QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
