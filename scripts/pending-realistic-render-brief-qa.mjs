import fs from 'node:fs';
import {buildRenderRequest} from './build-patient-exercise-render-request.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const curated=JSON.parse(fs.readFileSync('data/patient-exercise-render-requests-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const ids=['px012','px013','px014','px015','px016','px017','px018'];
for(const id of ids){
  const p=manifest.profiles.find(x=>x.profile_id===id);
  check(id+' remains pending generation',p?.status==='PENDING_GENERATION',p?.status||'');
  check(id+' has no visible realistic asset',p?.composite_url==null,String(p?.composite_url));
  check(id+' has no current gen_id',!p?.gen_id,String(p?.gen_id||''));
  check(id+' generation brief was reviewed',p?.generation_brief_reviewed_on==='2026-09-30',p?.generation_brief_reviewed_on||'');
  check(id+' forbids invented numeric prescription',
    /임의/.test(p?.generation_brief?.text_policy||'')&&/금지/.test(p?.generation_brief?.text_policy||''),
    p?.generation_brief?.text_policy||''
  );
  const req=buildRenderRequest(manifest,curated,id);
  check(id+' render request resolves from locked brief',req?.source==='MANIFEST_GENERATION_BRIEF',req?.source||'');
  check(id+' render request uses canonical WebP path',req?.output_path==='assets/patient-exercise-realistic/'+id+'.webp',req?.output_path||'');
  check(id+' render request preserves approved style lock',req?.style?.style_lock_name===manifest.style_lock?.name,req?.style?.style_lock_name||'');
  check(id+' render request carries mobile review gate',req?.review_gate?.some(x=>x.includes('모바일')));
}

const byId=id=>manifest.profiles.find(x=>x.profile_id===id)?.generation_brief||{};
check('px012 protects against fall-risk progression',
  /지지물/.test(byId('px012').support||'')&&/눈 감기/.test(byId('px012').common_error||'')
);
check('px013 does not normalize suspected rupture',
  /파열 의심/.test(byId('px013').text_policy||'')
);
check('px014 keeps neurologic red flags out of exercise continuation',
  /신경학적 red flag/.test(byId('px014').text_policy||'')
);
check('px015 thoracic rotation stops for chest pain or dyspnea',
  /흉통/.test(byId('px015').text_policy||'')&&/호흡곤란/.test(byId('px015').text_policy||'')
);
check('px016 breathing exercise stops for chest pain, dyspnea, or dizziness',
  /흉통/.test(byId('px016').text_policy||'')&&/호흡곤란/.test(byId('px016').text_policy||'')&&/어지럼/.test(byId('px016').text_policy||'')
);
check('px017 elbow flexion keeps acute tendon/surgery caveat',
  /급성 건 손상/.test(byId('px017').text_policy||'')&&/수술 후/.test(byId('px017').text_policy||'')
);
check('px018 deadbug prioritizes progressive weakness/cauda-equina-type red flags',
  /진행성 근력저하/.test(byId('px018').text_policy||'')&&/배뇨 이상/.test(byId('px018').text_policy||'')&&/진료 우선/.test(byId('px018').text_policy||'')
);

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- PENDING REALISTIC RENDER BRIEF QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
