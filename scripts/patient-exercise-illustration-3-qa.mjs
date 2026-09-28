import fs from 'node:fs';

const ill=JSON.parse(fs.readFileSync('data/patient-exercise-illustration-v2.json','utf8'));
const lib=JSON.parse(fs.readFileSync('data/patient-exercise-library-v1.json','utf8'));
const index=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const actionable=ill.profiles.filter(x=>x.actionability===true);
const boundary=ill.profiles.filter(x=>x.actionability===false);
check('Stage 23B illustration schema = 3.0.0',ill.schema_version==='3.0.0',ill.schema_version);
check('Stage 23B clinical illustration standard',ill.policy?.illustration_standard==='clinical_patient_education_v3',ill.policy?.illustration_standard||'missing');
check('Stage 23B render contract canvas',ill.render_contract?.canvas==='240x180',ill.render_contract?.canvas||'missing');
check('Stage 23B render contract has two phases',ill.policy?.phase_count===2,String(ill.policy?.phase_count));
check('Stage 23B actionable profiles = 18',actionable.length===18,String(actionable.length));
check('Stage 23B evidence boundary remains px099',boundary.length===1&&boundary[0].profile_id==='px099',boundary.map(x=>x.profile_id).join(','));
check('Stage 23B profile IDs still match exercise library',lib.profiles.every(p=>ill.profiles.some(x=>x.profile_id===p.profile_id)));

for(const x of actionable){
  for(const field of ['figure_key','start_pose','end_pose','movement','support','common_error','stop_rule','alt_text','view_mode','support_visual','motion_focus','render_standard']){
    check(x.profile_id+' '+field,typeof x[field]==='string'&&x[field].length>2,x[field]||'missing');
  }
  check(x.profile_id+' render standard',x.render_standard==='clinical_patient_education_v3',x.render_standard);
}

const rendererStart=index.indexOf('function exercisePoseMarkup(k,phase){');
const rendererEnd=index.indexOf('function exerciseIllustration(p){',rendererStart);
check('Stage 23B renderer exists',rendererStart>=0&&rendererEnd>rendererStart,String(rendererStart));
const rendererSource=rendererStart>=0&&rendererEnd>rendererStart?index.slice(rendererStart,rendererEnd):'';

for(const primitive of ['const torsoFront=','const torsoSide=','const hand=','const foot=','const joint=','const arrow=','const curvedArrow=','const fixed=','const avoid=','const wall=','const rail=','const mat=','const band=']){
  check('Renderer primitive '+primitive,rendererSource.includes(primitive));
}
check('Legacy stick standing helper removed',!rendererSource.includes("const standing=()=>head()+line"));
check('Duplicate SVG marker IDs avoided',!rendererSource.includes('<defs><marker'));
check('Stage 23B uses 240x180 exercise canvas',index.includes('viewBox="0 0 240 180"'));
check('Stage 23B visual legend exists',['→ 움직임 방향','◎ 고정·지지','× 피할 보상'].every(x=>index.includes(x)));
check('Stage 23B mobile phase stacking preserved',index.includes('@media(max-width:420px){.exercise-sequence{grid-template-columns:1fr}}'));
check('Stage 23B A4 clipping protection preserved',index.includes('exercise-figure{break-inside:avoid'));
check('Stage 23B evidence boundary still suppresses action image',index.includes("p.profile_id==='px099'||spec?.actionability===false"));

let poseFn=null;
try{
  poseFn=new Function(rendererSource+';return exercisePoseMarkup;')();
  check('Stage 23B renderer compiles',typeof poseFn==='function');
}catch(error){
  check('Stage 23B renderer compiles',false,error.message);
}
if(poseFn){
  for(const x of actionable){
    const start=poseFn(x.figure_key,'start');
    const end=poseFn(x.figure_key,'end');
    check(x.profile_id+' start SVG substantial',typeof start==='string'&&start.length>250,String(start?.length||0));
    check(x.profile_id+' end SVG substantial',typeof end==='string'&&end.length>start.length,String(end?.length||0));
    check(x.profile_id+' start/end visibly differ',start!==end);
    check(x.profile_id+' SVG has no invalid values',!/(NaN|undefined|null)/.test(start+end));
    check(x.profile_id+' end contains motion/support annotation',end.includes('<text')&&end.includes('<circle'));
  }
}

check('No invented numeric dose added to illustration metadata',!ill.profiles.some(x=>Object.keys(x).some(k=>/dose|repetition|set|frequency/i.test(k))));

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- STAGE 23B PATIENT EXERCISE ILLUSTRATION 3.0 QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
