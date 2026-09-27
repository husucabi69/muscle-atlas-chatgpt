import fs from 'node:fs';

const lib=JSON.parse(fs.readFileSync('data/patient-exercise-library-v1.json','utf8'));
const ill=JSON.parse(fs.readFileSync('data/patient-exercise-illustration-v2.json','utf8'));
const index=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const version=fs.readFileSync('app-version.js','utf8');
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const byId=Object.fromEntries(ill.profiles.map(x=>[x.profile_id,x]));
const actionable=ill.profiles.filter(x=>x.actionability===true);
const boundary=ill.profiles.filter(x=>x.actionability===false);
check('Stage 19 release version',/buildVersion:'[^']*-stage19\./.test(version),version.match(/buildVersion:'([^']+)'/)?.[1]||'missing');
check('Illustration audit covers all 19 profiles',ill.profiles.length===19,String(ill.profiles.length));
check('Illustration profile IDs unique',new Set(ill.profiles.map(x=>x.profile_id)).size===19);
check('Illustration IDs match patient exercise library',lib.profiles.every(p=>!!byId[p.profile_id])&&ill.profiles.every(x=>lib.profiles.some(p=>p.profile_id===x.profile_id)));
check('Actionable profiles = 18',actionable.length===18,String(actionable.length));
check('Evidence-boundary profile = 1',boundary.length===1&&boundary[0].profile_id==='px099',boundary.map(x=>x.profile_id).join(','));
for(const x of actionable){
  check(x.profile_id+' figure_key',typeof x.figure_key==='string'&&x.figure_key.length>1,x.figure_key||'missing');
  for(const field of ['start_pose','end_pose','movement','support','common_error','stop_rule','alt_text']){
    check(x.profile_id+' '+field,typeof x[field]==='string'&&x[field].length>5,x[field]||'missing');
  }
}
check('No invented numeric dose in illustration metadata',!ill.profiles.some(x=>Object.keys(x).some(k=>/dose|repetition|set|frequency/i.test(k))));
check('Two-phase start/end UI exists',index.includes('exercise-sequence')&&index.includes("phase('1 · 시작'")&&index.includes("phase('2 · 끝'"));
check('Movement/support/error/stop cues rendered',['움직임','고정·지지','흔한 실수','중단 기준'].every(x=>index.includes(x)));
check('360px stacking rule exists',index.includes('@media(max-width:420px){.exercise-sequence{grid-template-columns:1fr}}'));
check('A4 print avoids clipping',index.includes('@page{size:A4')&&index.includes('exercise-figure{break-inside:avoid'));
check('Grayscale print-safe overrides exist',index.includes('background:#fff!important;color:#000!important'));
check('Accessible role/alt labels exist',index.includes('role="img" aria-label="'));
check('Evidence boundary suppresses exercise image',index.includes("p.profile_id==='px099'||spec?.actionability===false"));
check('Offline cache includes illustration metadata',sw.includes('./data/patient-exercise-illustration-v2.json'));

let fail=0;
for(const x of checks){console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);if(!x.pass)fail++;}
console.log('\n--- STAGE 19 PATIENT EXERCISE ILLUSTRATION QA ---');
console.log(`PASS=${checks.length-fail} FAIL=${fail}`);
if(fail)process.exit(1);
