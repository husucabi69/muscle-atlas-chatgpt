import fs from 'node:fs';
import {inspectWebP} from './inspect-realistic-webp.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const approved=manifest.profiles.filter(x=>x.status==='APPROVED');
check('At least one approved realistic asset exists',approved.length>0,String(approved.length));
for(const p of approved){
  const path=String(p.composite_url||'').replace(/^\.\//,'');
  let info=null,error=null;
  try{info=inspectWebP(path);}catch(e){error=e.message;}
  check(p.profile_id+' approved WebP passes strict integrity',Boolean(info),error||JSON.stringify(info));
  if(info){
    check(p.profile_id+' approved WebP has useful dimensions',info.width>=200&&info.height>=200,info.width+'x'+info.height);
    check(p.profile_id+' approved WebP has SHA-256 fingerprint',/^[0-9a-f]{64}$/.test(info.sha256||''),info.sha256||'');
  }
}

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- REALISTIC WEBP INTEGRITY QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
