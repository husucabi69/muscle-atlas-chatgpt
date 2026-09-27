import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const version=fs.readFileSync('app-version.js','utf8');
const regions=JSON.parse(fs.readFileSync('data/regions-v1.json','utf8')).regions||[];
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});
const releaseStage=Number(version.match(/buildVersion:'[^']*-stage(\d+)\./)?.[1]||0);

check('Stage 21 release active',releaseStage>=21,String(releaseStage));
check('Clinical flow module contract exists',index.includes('const clinicalFlowModules={'));
for(const key of ['shoulder','elbow','wristHand','hipPelvis','kneeThigh','legAnkleFoot','cervical','thoracic','lumbarSacral','abdominalCore']){
  check('Clinical module '+key,index.includes(key+':{label:'));
}
check('All region fallbacks represented',regions.every(r=>index.includes("'"+r.name_ko+"':")),String(regions.filter(r=>!index.includes("'"+r.name_ko+"':")).map(r=>r.name_ko)));
check('Ultrasound ID determines clinical module',index.includes('function clinicalModuleFromViewId')&&index.includes("n>=1&&n<=9")&&index.includes("n<=131"));
check('Ultrasound mapping takes priority',index.includes("const us=(ultrasoundByMuscle?.[id]||[])")&&index.includes("return us||clinicalRegionFallback"));
check('Eight-step clinical flow exists',['증상','해부학','감별','진찰','초음파','Quiz','Oral','환자교육'].every(x=>index.includes("'"+x+"'")));
check('Clinical context banner exists',index.includes('id="clinicalFlowContext"')&&index.includes('renderClinicalFlowContext'));
check('Muscle modal keeps flow context',index.includes("clinicalFlowBar(m.id,'anatomy')"));
check('Symptom route offers clinical flow',index.includes('임상 흐름 시작')&&index.includes("openClinicalFlowStep('"));
check('Differential/exam/ultrasound direct routing exists',index.includes("meta?.[step]")&&index.includes("scrollIntoView"));
check('Fixed-muscle quiz exists',index.includes('function startQuizForMuscle')&&index.includes('for(let i=0;i<10;i++)'));
check('Fixed quiz alternates forward/reverse',index.includes("i%2===0?'forward':'reverse'"));
check('Flow routes to fixed quiz',index.includes("if(step==='quiz')")&&index.includes('startQuizForMuscle(id)'));
check('Flow routes to Oral',index.includes("if(step==='viva')")&&index.includes('startOralForMuscle(id)'));
check('Flow routes to patient education',index.includes("if(step==='education')")&&index.includes('openEducationForMuscle(id)'));
check('Patient-specific automatic recommendation prohibited',index.includes('환자별 진단·치료 권고를 자동 생성하지 않습니다.'));
check('Clinical focus visual feedback exists',index.includes('clinical-flow-focus'));

let fail=0;
for(const x of checks){console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);if(!x.pass)fail++;}
console.log('\n--- STAGE 21 CLINICAL LEARNING FLOW QA ---');
console.log(`PASS=${checks.length-fail} FAIL=${fail}`);
if(fail)process.exit(1);
