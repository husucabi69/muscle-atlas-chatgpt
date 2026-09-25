import fs from 'node:fs';

const core=JSON.parse(fs.readFileSync('data/knowledge-core-v1.json','utf8'));
const media=JSON.parse(fs.readFileSync('data/media-v1.json','utf8'));
const audit=JSON.parse(fs.readFileSync('data/muscle-illustration-audit-v1.json','utf8'));
const index=fs.readFileSync('index.html','utf8');
const version=fs.readFileSync('app-version.js','utf8');

const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

check('Stage 17 build version',version.includes("stage17.1")&&version.includes("v10.2 · Stage 17 Muscle Illustration Audit"));
check('Audit status IN_PROGRESS',audit.status==='IN_PROGRESS',audit.status);
check('Audit ledger covers 205 muscles',(audit.muscles||[]).length===205,String((audit.muscles||[]).length));
check('Audit IDs unique',new Set((audit.muscles||[]).map(x=>x.muscle_id)).size===205);
check('Audit IDs match canonical core',
  [...new Set((audit.muscles||[]).map(x=>x.muscle_id))].sort().join('|')===
  [...new Set((core.muscles||[]).map(x=>x.muscle_id))].sort().join('|')
);

const reviewed=(audit.muscles||[]).filter(x=>x.status==='reviewed');
const pending=(audit.muscles||[]).filter(x=>x.status==='pending_review');
check('First rotator-cuff batch reviewed',reviewed.length===4,String(reviewed.length));
check('Remaining audit work explicit',pending.length===201,String(pending.length));

const expected={
  m070:{file:'Supraspinatus muscle back.png',view:'posterior'},
  m071:{file:'Infraspinatus muscle back.png',view:'posterior'},
  m072:{file:'Teres minor muscle back.png',view:'posterior'},
  m073:{file:'Subscapularis muscle frontal.png',view:'anterior'}
};

for(const [id,e] of Object.entries(expected)){
  const row=(audit.muscles||[]).find(x=>x.muscle_id===id);
  const asset=media.muscles?.[id]?.anatomy?.[0];
  check(id+' audit reviewed',row?.status==='reviewed');
  check(id+' representative audit file',row?.representative_asset?.file===e.file,row?.representative_asset?.file||'missing');
  check(id+' representative audit view',row?.representative_asset?.view===e.view,row?.representative_asset?.view||'missing');
  check(id+' media registry file',asset?.file===e.file,asset?.file||'missing');
  check(id+' media representative flag',asset?.representative===true);
  check(id+' explicit educational reason',typeof asset?.educationalReason==='string'&&asset.educationalReason.length>12);
  check(id+' source page is Wikimedia Commons',String(asset?.sourcePage||'').startsWith('https://commons.wikimedia.org/wiki/File:'));
  check(id+' explicit reuse license',typeof asset?.license==='string'&&asset.license.includes('CC'));
}

check('Infraspinatus old superior view removed',
  !(media.muscles?.m071?.anatomy||[]).some(x=>x.file==='Infraspinatus muscle top.png')
);
check('Infraspinatus now posterior',
  media.muscles?.m071?.anatomy?.[0]?.file==='Infraspinatus muscle back.png'
);
check('Representative label rendered in app',index.includes("x.representative?'대표 시야 · ':'"));
check('Representative view metadata rendered',index.includes("x.view?('시야 '+x.view):''"));
check('Educational rationale rendered',index.includes("x.educationalReason?('선정 이유: '+x.educationalReason):''"));
check('Media registry Stage 17 version',String(media.version||'').includes('stage17'));

let fail=0;
for(const item of checks){
  console.log(`${item.pass?'PASS':'FAIL'} | ${item.name}${item.detail?' | '+item.detail:''}`);
  if(!item.pass)fail++;
}
console.log('\n--- STAGE 17 MUSCLE ILLUSTRATION AUDIT QA ---');
console.log(`PASS=${checks.length-fail} FAIL=${fail}`);
if(fail)process.exit(1);
