import fs from 'node:fs';
import {inspectWebP} from './inspect-realistic-webp.mjs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const index=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const approved=(manifest.profiles||[]).filter(p=>p.status==='APPROVED'&&p.composite_url);
check('At least one approved realistic asset exists',approved.length>0,String(approved.length));

for(const p of approved){
  const rel=String(p.composite_url||'').replace(/^\.\//,'');
  check(p.profile_id+' approved asset exists',fs.existsSync(rel),rel);
  if(!fs.existsSync(rel))continue;
  let info=null,error=null;
  try{info=inspectWebP(rel);}catch(e){error=e.message;}
  check(p.profile_id+' WebP is readable',Boolean(info),error||'');
  if(!info)continue;
  const recorded=String(p.preview_resolution||'').match(/^(\d+)x(\d+)$/);
  check(p.profile_id+' preview resolution metadata exists',Boolean(recorded),p.preview_resolution||'');
  if(recorded){
    check(p.profile_id+' recorded width matches binary',Number(recorded[1])===info.width,info.width+'px');
    check(p.profile_id+' recorded height matches binary',Number(recorded[2])===info.height,info.height+'px');
  }
  const belowA4=info.width<1240||info.height<1754;
  if(belowA4){
    check(p.profile_id+' low-resolution asset is mobile-preview only',
      p.asset_gate==='MOBILE_PREVIEW_APPROVED_A4_HD_PENDING',
      p.asset_gate||''
    );
  }
  if(p.asset_gate==='A4_HD_APPROVED'){
    check(p.profile_id+' A4-HD width minimum',info.width>=1240,String(info.width));
    check(p.profile_id+' A4-HD height minimum',info.height>=1754,String(info.height));
  }
}

const cssStart=index.indexOf('.exercise-realistic-media{');
const cssEnd=index.indexOf('.exercise-realistic-badge{',cssStart);
const css=cssStart>=0&&cssEnd>cssStart?index.slice(cssStart,cssEnd):'';
check('realistic media CSS exists',Boolean(css),String(cssStart));
check('realistic image uses intrinsic width',/\.exercise-realistic-media img\{[^}]*width:auto/.test(css));
check('realistic image has responsive viewport cap',css.includes('max-width:calc(100vw - 48px)'));
check('desktop realistic image has 720px cap',css.includes('@media(min-width:769px){.exercise-realistic-media img{max-width:720px}}'));
check('realistic image is not forced to width 100%',!/\.exercise-realistic-media img\{[^}]*width:100%/.test(css));
check('runtime labels mobile-preview assets honestly',index.includes("a4Pending?'실사형 환자교육 일러스트 · 모바일 미리보기':'실사형 환자교육 일러스트'"));
check('A4 still hides mobile-preview realistic image',index.includes('body.printing-education .exercise-realistic-media.a4-hd-pending'));
check('A4 still exposes sharp SVG fallback',index.includes('body.printing-education .exercise-svg-fallback.a4-hd-pending[hidden]{display:block!important}'));

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- STAGE 23B REALISTIC DISPLAY FIDELITY QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
