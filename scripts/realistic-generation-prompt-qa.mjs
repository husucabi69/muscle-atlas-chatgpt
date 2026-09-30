import fs from 'node:fs';
import {buildGenerationPrompt} from './build-realistic-exercise-prompt.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

for(const id of ['px007','px008','px009','px010','px011','px012','px013','px014','px015','px016','px017','px018']){
  let prompt='';
  try{prompt=buildGenerationPrompt(manifest,id);}catch(e){prompt='';}
  check(id+' canonical prompt builds',prompt.length>700,String(prompt.length));
  check(id+' prompt keeps start/end labels',prompt.includes('1 · 시작')&&prompt.includes('2 · 끝'));
  check(id+' prompt carries no-invented-dose policy',prompt.includes('금지')&&prompt.includes('임의'));
  check(id+' prompt carries support/common-error cues',prompt.includes('지지·고정')&&prompt.includes('흔한 오류'));
}
const p7=buildGenerationPrompt(manifest,'px007');
const p9=buildGenerationPrompt(manifest,'px009');
check('px007 prompt carries intrinsic-hand mismatch blocker',p7.includes('HAND_INTRINSIC_MOTION_MISMATCH')&&p7.includes('손 내재근'));
check('px009 prompt carries knee-toe absolute-cue blocker',p9.includes('SQUAT_KNEE_TOE_ABSOLUTE_CUE')&&p9.includes('절대 금기'));

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- REALISTIC GENERATION PROMPT QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
