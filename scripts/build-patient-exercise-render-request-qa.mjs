import fs from 'node:fs';
import {buildRenderRequest} from './build-patient-exercise-render-request.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const curated=JSON.parse(fs.readFileSync('data/patient-exercise-render-requests-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const p7=buildRenderRequest(manifest,curated,'px007');
check('px007 uses curated override',p7.source==='CURATED_OVERRIDE',p7.source);
check('px007 curated request forbids fist closure',p7.must_not_show?.includes('주먹쥐기'));

const p9=buildRenderRequest(manifest,curated,'px009');
check('px009 uses curated safety override',p9.source==='CURATED_OVERRIDE',p9.source);
check('px009 keeps knee-toe absolute-cue correction',p9.must_not_show?.some(x=>x.includes('발끝보다 앞으로')&&x.includes('절대금기')));

const p11=buildRenderRequest(manifest,curated,'px011');
check('px011 falls back to locked manifest brief',p11.source==='MANIFEST_GENERATION_BRIEF',p11.source);
check('px011 canonical output path',p11.output_path==='assets/patient-exercise-realistic/px011.webp',p11.output_path);
check('px011 carries support and common-error rules',String(p11.exact_motion?.fixed_points||'').includes('지지')&&p11.must_not_show?.some(x=>x.includes('반동')));
check('px011 inherits approved style lock',p11.style?.style_lock_name===manifest.style_lock.name,p11.style?.style_lock_name||'');

const p18=buildRenderRequest(manifest,curated,'px018');
check('px018 carries deadbug stability brief',String(p18.exact_motion?.end||'').includes('반대 팔과 다리')&&p18.must_not_show?.some(x=>x.includes('숨 참기')));
check('generic request forbids invented fixed numbers',p18.must_not_show?.some(x=>x.includes('임의 반복횟수')));

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- RENDER REQUEST BUILDER QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
