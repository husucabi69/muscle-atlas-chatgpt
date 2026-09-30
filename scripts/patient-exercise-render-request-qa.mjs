import fs from 'node:fs';

const requests=JSON.parse(fs.readFileSync('data/patient-exercise-render-requests-v1.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

check('render request schema is 1.0.0',requests.schema_version==='1.0.0',requests.schema_version||'');
const r=requests.requests?.find(x=>x.profile_id==='px007');
const p=manifest.profiles?.find(x=>x.profile_id==='px007');
check('px007 render request exists',Boolean(r));
check('px007 current state is clean generation pending',p?.status==='PENDING_GENERATION',p?.status||'');
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

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- PATIENT EXERCISE RENDER REQUEST QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
