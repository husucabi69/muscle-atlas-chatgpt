import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const version=fs.readFileSync('app-version.js','utf8');
const core=JSON.parse(fs.readFileSync('data/knowledge-core-v1.json','utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});
const releaseStage=Number(version.match(/buildVersion:'[^']*-stage(\d+)\./)?.[1]||0);

check('Stage 22 release active',releaseStage>=22,String(releaseStage));
check('Personal learning tab/page exists',
  index.includes('data-page="learning">내 학습</button>') &&
  index.includes('<section id="learning" class="page">')
);
check('Unified search supports Korean English abbreviation Stable ID',
  index.includes('function searchEntityIndex') &&
  index.includes('m.abbreviation') &&
  index.includes('function unifiedSearchHits') &&
  index.includes("if(id===q)score+=120")
);
check('Search entity type filter exists',
  index.includes('id="searchTypeFilter"') &&
  ['muscle','symptom_pattern','tendon','nerve','joint','bursa','ligament','fascia','clinical_test','diagnosis_concept','ultrasound_view','region']
    .every(x=>index.includes('value="'+x+'"'))
);
check('Search covers canonical core entity arrays',
  ['regions','muscles','symptom_patterns','tendons','nerves','joints','bursae','ligaments','fasciae','clinical_tests','diagnosis_concepts','ultrasound_views']
    .every(x=>index.includes('core.'+x))
);
check('Recent-view tracking exists',
  index.includes('function recordRecentEntity') &&
  index.includes("recordRecentEntity('muscle',id)") &&
  index.includes("recordRecentEntity('symptom_pattern',id)")
);
check('Favorites exist',
  index.includes('function toggleFavoriteEntity') &&
  index.includes('function isFavoriteEntity') &&
  index.includes('learningFavoriteCount')
);
check('Weakness auto-collection combines quiz and Oral',
  index.includes('function combinedWeakness') &&
  index.includes('quizState()') &&
  index.includes('oralWeaknessScores()') &&
  index.includes('weakLearningList')
);
check('Regional mastery dashboard exists',
  index.includes('function regionMasteryRows') &&
  index.includes('coverage*.3+performance*.7') &&
  index.includes('masteryDashboard')
);
check('Local-only storage contract exists',
  index.includes("const PERSONAL_LEARNING_KEY='mskPersonalLearningV1'") &&
  index.includes('localStorage.setItem(PERSONAL_LEARNING_KEY') &&
  index.includes('기기에만 저장')
);
check('Export/import schema exists',
  index.includes("const LEARNING_EXPORT_SCHEMA='lys-muscle-learning-v1'") &&
  index.includes('function exportLearningRecords') &&
  index.includes('function importLearningRecords')
);
check('Export uses whitelist sanitizers',
  index.includes('function sanitizeQuizForTransfer') &&
  index.includes('function sanitizeOralForTransfer') &&
  index.includes('function sanitizePersonalForTransfer') &&
  index.includes('data:{quiz:sanitizeQuizForTransfer')
);
check('No raw oral answer exported',
  !/buildLearningExport\([\s\S]{0,1200}(oralAnswer|transcript|microphone|audio)/i.test(index)
);
check('No patient/encounter fields in Stage22 export object',
  !/buildLearningExport\([\s\S]{0,1200}(patient_name|patient_id|encounter_id|resident_registration|주민등록번호)/i.test(index)
);
check('Imported records are Stable-ID filtered',
  index.includes('function validPersonalEntityKey') &&
  index.includes('if(byId[id])out.progress[id]') &&
  index.includes("const id=key.split(':')[0];if(!byId[id])continue")
);
check('Learning dashboard refreshes from quiz/oral saves',
  index.includes('saveQuizState(s){localStorage.setItem(QUIZ_KEY,JSON.stringify(s));updateQuizStats();renderLearningDashboard();}') &&
  index.includes('saveOralState(s){localStorage.setItem(ORAL_KEY,JSON.stringify(s));renderLearningDashboard();}')
);
check('All canonical Stable IDs represented in searchable source',
  core.muscles.length===205 &&
  core.clinical_tests.length===148 &&
  core.ultrasound_views.length===131
);

let jsSyntax=true,jsError='';
try{
  const m=index.match(/<script>([\s\S]*?)<\/script>/);
  if(!m)throw new Error('inline script not found');
  new Function(m[1]);
}catch(e){jsSyntax=false;jsError=String(e);}
check('App JavaScript syntax',jsSyntax,jsError);

let fail=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)fail++;
}
console.log('\n--- STAGE 22 SEARCH & PERSONAL LEARNING 2.0 QA ---');
console.log(`PASS=${checks.length-fail} FAIL=${fail}`);
if(fail)process.exit(1);
