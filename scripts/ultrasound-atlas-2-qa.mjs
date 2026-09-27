import fs from 'node:fs';

const modules=['shoulder','elbow','wrist-hand','hip-pelvis','knee-thigh','leg-ankle-foot','cervical','thoracic-back-chestwall','lumbar-sacral','abdominal-core'];
const guidance=JSON.parse(fs.readFileSync('data/ultrasound-probe-guidance-v2.json','utf8'));
const media=JSON.parse(fs.readFileSync('data/media-license-global-audit-v1.json','utf8'));
const index=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const version=fs.readFileSync('app-version.js','utf8');
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const all=[];
for(const m of modules){
  const d=JSON.parse(fs.readFileSync('data/ultrasound-'+m+'-v1.json','utf8'));
  for(const v of d.ultrasound_views||[])all.push({...v,module_id:m});
}
const src=Object.fromEntries(all.map(x=>[x.ultrasound_view_id,x]));
const g=Object.fromEntries(guidance.views.map(x=>[x.ultrasound_view_id,x]));
const releaseStage=Number(version.match(/buildVersion:'[^']*-stage(\d+)\./)?.[1]||0);

check('Stage 20 release active',releaseStage>=20,String(releaseStage));
check('Canonical ultrasound views = 131',all.length===131,String(all.length));
check('Canonical ultrasound IDs unique',new Set(all.map(x=>x.ultrasound_view_id)).size===131);
check('Probe guidance = 131',guidance.views.length===131,String(guidance.views.length));
check('Probe guidance IDs unique',new Set(guidance.views.map(x=>x.ultrasound_view_id)).size===131);
check('Guidance IDs match canonical',all.every(x=>!!g[x.ultrasound_view_id])&&guidance.views.every(x=>!!src[x.ultrasound_view_id]));

const missing=[];
for(const v of all){
  for(const f of ['patient_position','probe_orientation','normal_finding'])if(!String(v[f]||'').trim())missing.push(v.ultrasound_view_id+':'+f);
  if(!(v.landmarks||[]).length)missing.push(v.ultrasound_view_id+':landmarks');
  if(!(v.pitfalls||[]).length)missing.push(v.ultrasound_view_id+':pitfalls');
}
check('131 view guidance source fields complete',missing.length===0,missing.slice(0,20).join(','));

const mismatches=[];
for(const x of guidance.views){
  const v=src[x.ultrasound_view_id];
  if(!v)continue;
  if(x.patient_position!==v.patient_position)mismatches.push(x.ultrasound_view_id+':position');
  if(x.probe_orientation!==v.probe_orientation)mismatches.push(x.ultrasound_view_id+':orientation');
  if(x.diagram_kind!=='probe-placement-schematic-not-bmode')mismatches.push(x.ultrasound_view_id+':kind');
  if(!x.axis)mismatches.push(x.ultrasound_view_id+':axis');
}
check('Guidance mirrors canonical scan instructions',mismatches.length===0,mismatches.slice(0,20).join(','));
check('Probe guide renderer exists',index.includes('function renderUltrasoundProbeGuide'));
check('Probe guide is explicitly not B-mode',index.includes('교육용 Probe 도해')&&index.includes('실제 B-mode 아님'));
check('Real ultrasound section labeled separately',index.includes('실제 B-mode / 검증 원문'));
check('All ten module renderers call probe guide',(index.match(/renderUltrasoundProbeGuide\(v\)/g)||[]).length>=10,String((index.match(/renderUltrasoundProbeGuide\(v\)/g)||[]).length));
check('Probe axis/orientation visualization exists',index.includes('function ultrasoundProbeAxis')&&index.includes('function ultrasoundProbeAngle'));
check('Guidance cached offline',sw.includes('./data/ultrasound-probe-guidance-v2.json'));
check('Actual ultrasound only policy retained',media.policy?.actual_ultrasound_only===true);
check('Generated B-mode remains forbidden',media.policy?.generated_b_mode_substitute===false&&guidance.policy?.generated_bmode===false);
check('No synthetic B-mode generator introduced',!index.includes('generateBMode')&&!index.includes('syntheticBMode'));

let fail=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)fail++;
}
console.log('\n--- STAGE 20 ULTRASOUND ATLAS 2.0 QA ---');
console.log(`PASS=${checks.length-fail} FAIL=${fail}`);
if(fail)process.exit(1);
