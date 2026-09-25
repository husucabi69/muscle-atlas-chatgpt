import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const failures=[],passes=[];
const check=(name,ok,detail='')=>{
  (ok?passes:failures).push({name,detail});
  console.log(`${ok?'PASS':'FAIL'} | ${name}${detail?' | '+detail:''}`);
};

const s=json('data/play-store-submission-v1.json');
const appGradle=read('android-twa/app/build.gradle');
const androidManifest=read('android-twa/app/src/main/AndroidManifest.xml');
const privacy=read('privacy.html');
const plan=read('docs/PLAY_STORE_RELEASE_PLAN.md');

check('Submission schema 1.0.0',s.schema_version==='1.0.0',s.schema_version);
check('Submission not falsely marked submitted',s.status==='PREPARED_NOT_SUBMITTED',s.status);
check('App name <= 30 chars',[...s.app.name].length<=30,String([...s.app.name].length));
check('Short description <= 80 chars',[...s.store_listing.short_description].length<=80,String([...s.store_listing.short_description].length));
check('Full description <= 4000 chars',[...s.store_listing.full_description].length<=4000,String([...s.store_listing.full_description].length));
check('Required non-medical-device disclaimer',/의료기기가 아니며/.test(s.store_listing.full_description));
check('Diagnosis/treat/prevent disclaimer',/진단/.test(s.store_listing.full_description)&&/처치/.test(s.store_listing.full_description)&&/치료/.test(s.store_listing.full_description)&&/예방/.test(s.store_listing.full_description));
check('Healthcare professional reminder',/의료전문가/.test(s.store_listing.full_description));
check('Medical Reference declaration',s.health_apps_declaration.recommended_select.includes('Medical Reference and Education'));
check('Physical Therapy declaration',s.health_apps_declaration.recommended_select.includes('Physical Therapy and Rehabilitation'));
check('Clinical Decision Support not claimed',s.health_apps_declaration.not_currently_applicable.includes('Clinical Decision Support'));
check('Medical Device not claimed',s.health_apps_declaration.not_currently_applicable.includes('Medical Device Apps'));
check('Data Safety remains unresolved until voice verification',s.data_safety_preassessment.final_submission_ready===false);
check('SpeechRecognition blocker present',s.data_safety_preassessment.unresolved_before_submission.some(x=>/SpeechRecognition/.test(x)));
check('No premature no-data claim',/Do not submit an overall 'no user data collected'/.test(s.data_safety_preassessment.prohibited_premature_claim));
check('Organization account gate recorded',s.developer_account_gate.organization_account_expected_for_health===true);
check('Play icon dimensions',s.assets.app_icon.width===512&&s.assets.app_icon.height===512);
check('Feature graphic dimensions',s.assets.feature_graphic.width===1024&&s.assets.feature_graphic.height===500);
check('Screenshot minimum count',s.assets.phone_screenshots.minimum_count>=2);
check('Android targetSdk 36',/targetSdk\s+36/.test(appGradle));
check('Package matches provisional ID',new RegExp(`applicationId\\s+'${s.app.package_id.replace(/\./g,'\\.')}'`).test(appGradle));
check('No native RECORD_AUDIO permission',!/RECORD_AUDIO/.test(androidManifest));
check('Privacy covers localStorage',/localStorage/.test(privacy));
check('Privacy covers SpeechRecognition',/SpeechRecognition/.test(privacy));
check('Release plan keeps root assetlinks gate',/husucabi69\.github\.io\/\.well-known\/assetlinks\.json/.test(plan));
check('No public placeholder fingerprint instruction',/placeholder fingerprint는 public 배포하지 않는다/.test(plan));

console.log('\n--- PLAY STORE SUBMISSION QA SUMMARY ---');
console.log(`PASS=${passes.length} FAIL=${failures.length}`);
if(failures.length){
  console.error(JSON.stringify(failures,null,2));
  process.exit(1);
}
