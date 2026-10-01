import fs from 'node:fs';
import {buildRenderRequest} from './build-patient-exercise-render-request.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const curated=JSON.parse(fs.readFileSync('data/patient-exercise-render-requests-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const p7=buildRenderRequest(manifest,curated,'px007');
check('px007 uses curated override',p7.source==='CURATED_OVERRIDE',p7.source);
check('px007 is ready to regenerate from locked brief after loss audit',
  p7.status==='READY_TO_REGENERATE'&&p7.generation_permission?.allowed===true&&p7.generation_permission?.reason==='READY_REGENERATION',
  JSON.stringify({status:p7.status,permission:p7.generation_permission})
);
check('px007 curated request forbids fist closure',p7.must_not_show?.includes('주먹쥐기'));

const p9=buildRenderRequest(manifest,curated,'px009');
check('px009 uses curated safety override',p9.source==='CURATED_OVERRIDE',p9.source);
check('px009 stays blocked for exact reviewed binary handoff',
  p9.status==='REVIEWED_CANDIDATE_BINARY_HANDOFF_BLOCKED'&&p9.generation_permission?.blocking_profile_id==='px009',
  JSON.stringify({status:p9.status,permission:p9.generation_permission})
);
check('px009 keeps knee-toe absolute-cue correction',p9.must_not_show?.some(x=>x.includes('발끝보다 앞으로')&&x.includes('절대금기')));

const p11=buildRenderRequest(manifest,curated,'px011');
check('px011 falls back to locked manifest brief',p11.source==='MANIFEST_GENERATION_BRIEF',p11.source);
check('px011 existing reviewed candidate is not falsely marked ready',
  p11.status==='REVIEWED_CANDIDATE_BINARY_HANDOFF_BLOCKED'&&p11.generation_permission?.blocking_profile_id==='px011',
  JSON.stringify({status:p11.status,permission:p11.generation_permission})
);
check('px011 canonical output path',p11.output_path==='assets/patient-exercise-realistic/px011.webp',p11.output_path);
check('px011 carries support and common-error rules',String(p11.exact_motion?.fixed_points||'').includes('지지')&&p11.must_not_show?.some(x=>x.includes('반동')));
check('px011 inherits approved style lock',p11.style?.style_lock_name===manifest.style_lock.name,p11.style?.style_lock_name||'');

const p18=buildRenderRequest(manifest,curated,'px018');
check('px018 is blocked behind earliest unresolved binary handoff',
  p18.status==='BLOCKED_BEHIND_EARLIER_BINARY_HANDOFF'&&p18.generation_permission?.blocking_profile_id==='px008',
  JSON.stringify({status:p18.status,permission:p18.generation_permission})
);
check('px018 carries deadbug stability brief',String(p18.exact_motion?.end||'').includes('반대 팔과 다리')&&p18.must_not_show?.some(x=>x.includes('숨 참기')));
check('generic request forbids invented fixed numbers',p18.must_not_show?.some(x=>x.includes('임의 반복횟수')));

const cleared={...manifest,profiles:manifest.profiles.map(p=>{
  if(['px007','px008','px009','px010','px011'].includes(p.profile_id)){
    return{...p,status:'APPROVED',asset_gate:'MOBILE_PREVIEW_APPROVED_A4_HD_PENDING',binary_handoff:null,composite_url:'./assets/patient-exercise-realistic/'+p.profile_id+'.webp'};
  }
  return p;
})};
const p12Ready=buildRenderRequest(cleared,curated,'px012');
check('px012 becomes ready only after earlier handoffs are cleared',
  p12Ready.status==='READY_TO_GENERATE'&&p12Ready.generation_permission?.allowed===true,
  JSON.stringify({status:p12Ready.status,permission:p12Ready.generation_permission})
);

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- RENDER REQUEST BUILDER QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
