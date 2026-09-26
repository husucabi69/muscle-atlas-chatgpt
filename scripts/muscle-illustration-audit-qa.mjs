import fs from 'node:fs';

const core=JSON.parse(fs.readFileSync('data/knowledge-core-v1.json','utf8'));
const media=JSON.parse(fs.readFileSync('data/media-v1.json','utf8'));
const audit=JSON.parse(fs.readFileSync('data/muscle-illustration-audit-v1.json','utf8'));
const index=fs.readFileSync('index.html','utf8');
const version=fs.readFileSync('app-version.js','utf8');

const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const releaseStage=Number(version.match(/buildVersion:'[^']*-stage(\d+)\./)?.[1]||0);
check('Stage 17 audit survives current/later release',releaseStage>=17,String(releaseStage));
check('Audit status IN_PROGRESS or COMPLETE',['IN_PROGRESS','COMPLETE'].includes(audit.status),audit.status);
check('Audit ledger covers 205 muscles',(audit.muscles||[]).length===205,String((audit.muscles||[]).length));
check('Audit IDs unique',new Set((audit.muscles||[]).map(x=>x.muscle_id)).size===205);
check('Audit IDs match canonical core',
  [...new Set((audit.muscles||[]).map(x=>x.muscle_id))].sort().join('|')===
  [...new Set((core.muscles||[]).map(x=>x.muscle_id))].sort().join('|')
);

const reviewed=(audit.muscles||[]).filter(x=>x.status==='reviewed');
const pending=(audit.muscles||[]).filter(x=>x.status==='pending_review');
check('Audit accounting = 205',reviewed.length+pending.length===205,`${reviewed.length}+${pending.length}`);
check('Audit has progressed beyond first batch',reviewed.length>=4,String(reviewed.length));
if(audit.progress){
  check('Progress reviewed count matches',audit.progress.reviewed===reviewed.length,`${audit.progress.reviewed}/${reviewed.length}`);
  check('Progress pending count matches',audit.progress.pending_review===pending.length,`${audit.progress.pending_review}/${pending.length}`);
}

for(const row of reviewed){
  const asset=row.representative_asset;
  const registry=media.muscles?.[row.muscle_id]?.anatomy?.[0];
  check(row.muscle_id+' representative asset exists',!!asset);
  check(row.muscle_id+' media registry exists',!!registry);
  check(row.muscle_id+' file matches registry',asset?.file===registry?.file,registry?.file||'missing');
  check(row.muscle_id+' representative flag',registry?.representative===true);
  check(row.muscle_id+' view metadata',typeof asset?.view==='string'&&asset.view.length>2);
  check(row.muscle_id+' educational reason',typeof asset?.educationalReason==='string'&&asset.educationalReason.length>12);
  check(row.muscle_id+' source page',String(asset?.sourcePage||'').startsWith('https://commons.wikimedia.org/wiki/File:'));
  check(row.muscle_id+' license',typeof asset?.license==='string'&&asset.license.length>2);
}

const required={
  m070:'Supraspinatus muscle back.png',
  m071:'Infraspinatus muscle back.png',
  m072:'Teres minor muscle back.png',
  m073:'Subscapularis muscle frontal.png',
  m001:'Sternomastoid muscle lateral.png',
  m002:'Scalenus anterior.png',
  m003:'Gray384 - Scalenus medius muscle.png',
  m004:'Scalenus posterior.png',
  m009:'Musculus splenius capitis marked.png',
  m010:'Splenius cervicis muscle back.png',
  m011:'Gray384 Semispinalis capitis.png',
  m017:'Rectus capitis posterior major muscle back.png',
  m018:'Rectus capitis posterior minor muscle back.png',
  m019:'Obliquus capitis superior muscle.png',
  m020:'Obliquus capitis inferior muscle back.png',
  m151:'Posterior compartment of leg - soleus.png',
  m152:'Gray438-Musculus plantaris.png',
  m153:'Gray439-Musculus popliteus.png',
  m154:'Tibialis posterior.png',
  m155:'Gray439-Musculus flexor digitorum longus.png',
  m156:'Gray439-Musculus flexor hallucis longus.png',
  m143:'Anterior compartment of leg - Tibialis anterior.png',
  m144:'Anterior compartment of leg - Extensor hallucis longus.png',
  m145:'Anterior compartment of leg - Extensor digitorum longus.png',
  m146:'Anterior compartment of leg - Fibularis tertius.png',
  m147:'Lateral compartment of leg - Fibularis longus.png',
  m148:'Lateral compartment of leg - Fibularis brevis.png',
  m127:'Sartorius muscle.png',
  m128:'Rectus femoris.png',
  m129:'Vastus lateralis muscle.png',
  m130:'Vastus medialis muscle.png',
  m131:'Vastus intermedialis.gif',
  m133:'Pectineus 3D.gif',
  m134:'Adductor longus.gif',
  m135:'Adductor brevis.gif',
  m136:'Adductor magnus.gif',
  m138:'Gracilis.gif',
  m139:'Long head of biceps femoris.gif',
  m140:'Short head of biceps femoris.gif',
  m141:'Semitendinosus.png',
  m142:'Semimembranosus.gif',
  m123:'Gluteus maximus 3D.gif',
  m124:'Gluteus medius muscle01.png',
  m125:'Gluteus minimus muscle01.png',
  m126:'Tensor fasciae latae.png',
  m046:'Quadratuslumborum.png',
  m047:'Psoas major.gif',
  m048:'Musculus psoas minor.png',
  m049:'Iliacus muscle01.png',
  m179:'Rectus abdominis.png',
  m181:'Gray392.png',
  m182:'Gray395.png',
  m183:'Transversus abdominis.png'
};
for(const [id,file] of Object.entries(required)){
  const row=(audit.muscles||[]).find(x=>x.muscle_id===id);
  check(id+' required reviewed',row?.status==='reviewed');
  check(id+' required file',row?.representative_asset?.file===file,row?.representative_asset?.file||'missing');
}

check('Infraspinatus old superior view removed',
  !(media.muscles?.m071?.anatomy||[]).some(x=>x.file==='Infraspinatus muscle top.png')
);
check('Representative label rendered in app',index.includes("x.representative?'대표 시야 · ':'"));
check('Representative view metadata rendered',index.includes("x.view?('시야 '+x.view):''"));
check('Educational rationale rendered',index.includes("x.educationalReason?('선정 이유: '+x.educationalReason):''"));
check('Focused head label rendered',index.includes("x.focusLabel?('집중 구조: '+x.focusLabel):''"));

const headSpecific={
  m075:{file:'Biceps brachii muscle09.png',focusLabel:'장두 · 빨강',focusColor:'red'},
  m076:{file:'Biceps brachii muscle09.png',focusLabel:'단두 · 초록',focusColor:'green'},
  m079:{file:'Triceps brachii muscle06.png',focusLabel:'장두 · 빨강',focusColor:'red'},
  m080:{file:'Triceps brachii muscle06.png',focusLabel:'외측두 · 노랑',focusColor:'yellow'},
  m081:{file:'Triceps brachii muscle06.png',focusLabel:'내측두 · 초록',focusColor:'green'}
};
for(const [id,expected] of Object.entries(headSpecific)){
  const row=(audit.muscles||[]).find(x=>x.muscle_id===id);
  const reg=media.muscles?.[id]?.anatomy?.[0];
  check(id+' head-specific reviewed',row?.status==='reviewed');
  check(id+' head-specific file',reg?.file===expected.file,reg?.file||'missing');
  check(id+' focus label',reg?.focusLabel===expected.focusLabel,reg?.focusLabel||'missing');
  check(id+' focus color',reg?.focusColor===expected.focusColor,reg?.focusColor||'missing');
  check(id+' audit focus matches',row?.representative_asset?.focusLabel===expected.focusLabel);
}
check('Media registry Stage 17 version',String(media.version||'').includes('stage17'));

let fail=0;
for(const item of checks){
  console.log(`${item.pass?'PASS':'FAIL'} | ${item.name}${item.detail?' | '+item.detail:''}`);
  if(!item.pass)fail++;
}
console.log('\n--- STAGE 17 MUSCLE ILLUSTRATION AUDIT QA ---');
console.log(`REVIEWED=${reviewed.length} PENDING=${pending.length} PASS=${checks.length-fail} FAIL=${fail}`);
if(fail)process.exit(1);
