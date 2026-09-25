import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const core=JSON.parse(fs.readFileSync('data/knowledge-core-v1.json','utf8'));
const version=fs.readFileSync('app-version.js','utf8');

const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

check('Stage 16 build version',version.includes("stage16.1")&&version.includes("v10.1 · Stage 16 Hierarchical Navigation"));
check('Canonical muscles still 205',(core.muscles||[]).length===205,String((core.muscles||[]).length));

for(const id of ['regionChooserView','regionMusclesView','regionDetailView','regionMuscleDetailHead','regionMuscleDetailContent']){
  check('Anatomy view exists: '+id,index.includes('id="'+id+'"'));
}
for(const tab of ['basic','anatomy','ultrasound','clinical','learning']){
  check('Detail tab exists: '+tab,index.includes('data-anatomy-detail-tab="'+tab+'"'));
}

check('Region list uses internal detail navigation',index.includes("openRegionMuscle(\\'"));
check('Legacy region panel removed',!index.includes('id="regionMusclesPanel"'));
check('Region muscle buttons no longer directly open modal',!index.includes('class="region-muscle" onclick="openMuscle'));
check('Independent view state function',index.includes('function setAnatomyView(view)'));
check('Region to list transition',index.includes("setAnatomyView('muscles')"));
check('Muscle to detail transition',index.includes("setAnatomyView('detail')"));
check('Back to anatomy regions',index.includes('onclick="showAnatomyRegions()"')||index.includes('onclick="showAnatomyRegions(true)"'));
check('Back to current region list',index.includes('onclick="showCurrentRegionMuscles()"'));
check('Immediate scroll reset',index.includes("window.scrollTo({top:0,behavior:'auto'})"));
check('History state recorded',index.includes('function recordAnatomyHistory(level)')&&index.includes('history.pushState'));
check('Physical/browser back handled',index.includes("window.addEventListener('popstate'"));
check('History restore does not repush',index.includes('restoringAnatomyHistory=true')&&index.includes('openRegionMuscle(state.anatomyMuscleId,false)'));

for(const label of ['Origin · 기시','Insertion · 정지','Function · 기능','Nerve · 신경지배','Blood supply · 혈액공급','촉지법','임상 중요점','초음파 핵심']){
  check('Basic detail field: '+label,index.includes(label));
}

check('Anatomy deep tab loads media in-page',index.includes('id="regionAnatomyMedia"')&&index.includes('loadAnatomyInto(m,document.getElementById(\'regionAnatomyMedia\'))'));
check('Ultrasound deep tab loads media in-page',index.includes('id="regionUSMedia"')&&index.includes('loadUSInto(m,document.getElementById(\'regionUSMedia\'))'));
check('Clinical deep tab includes symptoms',index.includes('관련 증상')&&index.includes('symptomsByMuscle[m.id]'));
check('Clinical deep tab includes diagnosis concepts',index.includes('관련 진단 개념')&&index.includes('diagnosesByMuscle[m.id]'));
check('Learning deep tab links Oral Viva',index.includes('이 근육 Oral 시작'));
check('Learning deep tab links patient education',index.includes('환자교육 열기'));
check('Legacy overlay preserved for non-region entry',index.includes('function openMuscle(id)')&&index.includes('id="muscleOverlay"'));
check('Shared anatomy media loader preserved',index.includes('async function loadAnatomyInto(m,el)')&&index.includes('async function loadAnatomy(m)'));
check('Shared ultrasound media loader preserved',index.includes('async function loadUSInto(m,el)')&&index.includes('async function loadUS(m)'));

let fail=0;
for(const item of checks){
  console.log(`${item.pass?'PASS':'FAIL'} | ${item.name}${item.detail?' | '+item.detail:''}`);
  if(!item.pass)fail++;
}
console.log(`\n--- STAGE 16 HIERARCHICAL NAVIGATION QA ---`);
console.log(`PASS=${checks.length-fail} FAIL=${fail}`);
if(fail)process.exit(1);
