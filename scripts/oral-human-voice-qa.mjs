import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const version=fs.readFileSync('app-version.js','utf8');
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

check('Stage 18 release version',/buildVersion:'[^']*-stage18\./.test(version),version.match(/buildVersion:'([^']+)'/)?.[1]||'missing');
check('Voice preference persisted locally',index.includes("ORAL_VOICE_KEY='mskOralVoiceV3'"));
check('Natural/neural voice ranking exists',index.includes('natural|neural|premium|enhanced|wavenet|studio'));
check('Korean voice ranking prefers ko-KR',index.includes("if(lang==='ko-kr')score+=120"));
check('voiceschanged refresh path exists',index.includes("'voiceschanged',refreshOralVoices")||index.includes('onvoiceschanged=refreshOralVoices'));
check('Four persona voice profiles exist',['friend','colleague','senior','master'].every(x=>index.includes(x+':{rate:')));
check('Persona pace/pitch tuning exists',index.includes('pitch:1.04')&&index.includes('pitch:.92'));
check('Punctuation segmentation exists',index.includes('function oralSpeechSegments')&&index.includes("(?<=[.!?])"));
check('Sequential pause scheduling exists',index.includes('setTimeout(()=>speakAt(i+1),pause)'));
check('Voice selector UI exists',index.includes('id="oralVoiceSelect"'));
check('Voice preview control exists',index.includes('onclick="previewOralVoice()"')&&index.includes('function previewOralVoice'));
check('SpeechSynthesis fallback guarded',index.includes("if(!('speechSynthesis' in window)")&&index.includes('return false'));
check('Question TTS uses persona level',index.includes("speakOral(q.stem,'question',q.level)"));
check('Feedback TTS uses persona level',index.includes("),'feedback',q.level);"));
check('Mic stops active TTS',index.includes('function toggleOralMic(){')&&index.includes('stopOralSpeech();'));
check('Voice engine initialized',index.includes('initOralVoiceEngine();'));
check('No external TTS API key embedded',!/(elevenlabs|openai\.com\/v1\/audio|azure.*speech|google.*texttospeech).*api[_-]?key/i.test(index));

let fail=0;
for(const item of checks){
  console.log(`${item.pass?'PASS':'FAIL'} | ${item.name}${item.detail?' | '+item.detail:''}`);
  if(!item.pass)fail++;
}
console.log('\n--- STAGE 18 ORAL HUMAN VOICE QA ---');
console.log(`PASS=${checks.length-fail} FAIL=${fail}`);
if(fail)process.exit(1);
