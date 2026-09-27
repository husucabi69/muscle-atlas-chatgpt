import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const index=read('index.html');
const sw=read('sw.js');
const version=read('app-version.js');
const manifest=json('manifest.webmanifest');
const core=json('data/knowledge-core-v1.json');
const illustration=json('data/muscle-illustration-audit-v1.json');
const androidManifest=read('android-twa/app/src/main/AndroidManifest.xml');
const androidStrings=read('android-twa/app/src/main/res/values/strings.xml');
const docs=read('docs/REAL_DEVICE_OFFLINE_QA.md');

const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});
const releaseStage=Number(version.match(/buildVersion:'[^']*-stage(\d+)\./)?.[1]||0);

check('Stage 23 release active',releaseStage>=23,String(releaseStage));
check('Manifest fullscreen',manifest.display==='fullscreen',manifest.display);
check('Manifest orientation any',manifest.orientation==='any',manifest.orientation);
check('Manifest 192 icon',(manifest.icons||[]).some(x=>x.sizes==='192x192'));
check('Manifest 512 icon',(manifest.icons||[]).some(x=>x.sizes==='512x512'));
check('Manifest maskable icon contract',(manifest.icons||[]).every(x=>String(x.purpose||'').includes('maskable')));

check('Service worker exposes cache diagnostics',
  sw.includes("message.type==='GET_CACHE_STATUS'") &&
  sw.includes("coreTotal:CORE.length") &&
  sw.includes("coreCached:CORE.length-missing.length")
);
check('Offline shell contains canonical knowledge',sw.includes("'./data/knowledge-core-v1.json'"));
check('Offline shell contains patient exercise',sw.includes("'./data/patient-exercise-library-v1.json'")&&sw.includes("'./data/patient-exercise-illustration-v2.json'"));
check('Offline shell contains ultrasound guidance',sw.includes("'./data/ultrasound-probe-guidance-v2.json'"));
check('Offline navigation fallback exists',sw.includes("networkFirst(event.request,'./index.html')"));
check('Online recovery update hook exists',index.includes("window.addEventListener('online',()=>checkForAppUpdate(false))"));
check('Offline runtime hook exists',index.includes("window.addEventListener('offline'"));
check('Update path preserves learning storage',!sw.includes('localStorage.clear')&&!index.includes('localStorage.clear'));
check('One-shot update reload guard exists',index.includes("sessionStorage.getItem(reloadKey)!==APP_RELEASE.buildVersion"));

check('Device quality gate UI exists',index.includes('id="deviceQualityGate"')&&index.includes('실기기·오프라인 품질 점검'));
check('Device automatic diagnostics exist',index.includes('async function runDeviceQualityGate()'));
check('Device runtime mode distinguishes TWA/PWA/browser',
  index.includes("source==='twa'")&&index.includes("return'설치 PWA'")&&index.includes("return'Chrome / 브라우저'")
);
check('Storage sentinel is isolated',index.includes("DEVICE_QA_SENTINEL='mskDeviceQaSentinelV1'"));
check('Quiz history persistence probe',index.includes("storageJsonReadable(QUIZ_KEY)"));
check('Oral history persistence probe',index.includes("storageJsonReadable(ORAL_KEY)"));
check('Manual gate is user-controlled',index.includes('function setDeviceManualGate')&&index.includes("'pass','fail','pending'"));
for(const id of ['offlineColdStart','onlineRecovery','oralMic','oralVoice','patientPrintShare','rotateLargeText','twaToolbarless']){
  check('Manual gate: '+id,index.includes("id:'"+id+"'"));
}

check('Oral microphone fallback present',
  index.includes('window.SpeechRecognition||window.webkitSpeechRecognition') &&
  index.includes('음성인식 미지원 · 입력 사용')
);
check('Human voice TTS fallback present',
  index.includes("'speechSynthesis' in window") &&
  index.includes('화면·텍스트 Oral은 그대로 사용할 수 있습니다.')
);
check('Patient education print exists',index.includes('function printCurrentEducation()')&&index.includes('window.print()'));
check('Patient education share exists',index.includes('async function shareCurrentEducation()')&&index.includes('navigator.share'));
check('Patient education share clipboard fallback',index.includes('navigator.clipboard?.writeText'));
check('Share text excludes patient-specific fields',
  index.includes('function patientEducationShareText') &&
  !/function patientEducationShareText[\s\S]{0,1600}(patient[_ ]?name|patient[_ ]?id|encounter|chart[_ ]?number|주민등록|차트번호)/i.test(index)
);

check('Hierarchical anatomy DOM preserved',
  ['regionChooserView','regionMusclesView','regionDetailView'].every(x=>index.includes('id="'+x+'"'))
);
check('Representative illustration audit 205',illustration.muscles?.length===205,String(illustration.muscles?.length||0));
check('Representative illustration pending 0',(illustration.muscles||[]).every(x=>x.status==='reviewed'));
check('Canonical ultrasound views 131',core.ultrasound_views?.length===131,String(core.ultrasound_views?.length||0));
check('Device gate verifies ultrasound 131',index.includes("'131 ultrasound navigation'")&&index.includes('core?.ultrasound_views.length===131'));

check('Small-screen 360px rule exists',index.includes('@media(max-width:360px)'));
check('Landscape rule exists',index.includes('@media(orientation:landscape) and (max-height:560px)'));
check('Minimum touch target exists',index.includes('button,select,input,textarea{min-height:44px}'));
check('Root overflow runtime probe exists',index.includes('document.documentElement.scrollWidth<=window.innerWidth+3'));
check('Orientation runtime probe exists',index.includes('screen.orientation?.type'));

check('Android TWA immersive display mode',/DEFAULT_URL[\s\S]*DISPLAY_MODE[\s\S]*immersive/.test(androidManifest));
check('Android TWA launch source marker',androidStrings.includes('?source=twa'));
check('Android native microphone permission absent',!/RECORD_AUDIO/.test(androidManifest));
check('TWA root assetlinks blocker documented',docs.includes('https://husucabi69.github.io/.well-known/assetlinks.json'));
check('Chrome/PWA/TWA comparison documented',docs.includes('Chrome 브라우저')&&docs.includes('설치 PWA')&&docs.includes('Android TWA'));
check('Stage 23 completion requires data loss 0',docs.includes('data loss 0')&&docs.includes('update regression 0'));

let jsSyntax=true,jsError='';
try{
  const blocks=[...index.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(x=>x.trim());
  for(const block of blocks)new Function(block);
}catch(e){jsSyntax=false;jsError=String(e);}
check('App inline JavaScript syntax',jsSyntax,jsError);

let fail=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)fail++;
}
console.log('\n--- STAGE 23 REAL DEVICE & OFFLINE QUALITY GATE ---');
console.log(`PASS=${checks.length-fail} FAIL=${fail}`);
if(fail)process.exit(1);
