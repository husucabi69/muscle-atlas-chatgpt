// Source-first conversion readiness inventory for the complete Claude 87.
// An audit of files is NOT a claim that all 87 have native UI or working speech.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const manifest=JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json','utf8'));
assert.equal(manifest.lectures.length,87,'canonical original lecture count');
const nativeSource=fs.readFileSync('scripts/claude-native-muscle-series-v1.js','utf8');
const allowed=nativeSource.match(/const ELIGIBLE=new Set\(\[([\d,]+)\]\)/);
assert.ok(allowed,'exact native lecture allowlist must be inspectable');
const nativeNumbers=new Set([3,...allowed[1].split(',').map(Number)]);
const largeInteractiveDeviceVoiceNumbers=new Set([1,2]); // full interactive original in large app-owned shell, not static native rewrite
const rows=[];
for(const item of manifest.lectures){
 const bytes=fs.readFileSync('claude-library/'+item.source_path);
 assert.equal(bytes.length,item.source_bytes,'source byte identity '+item.number);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
   item.source_sha256,'source SHA identity '+item.number);
 const s=bytes.toString('utf8');
 const count=re=>(s.match(re)||[]).length;
 const audioDeclarations=count(/window\.__AUD__\s*=/g);
 const declared=s.match(/window\.__AUD__\s*=\s*(\{[^\n]+?\})\s*;/);
 let audioParts=0,originalCueSegments=0,untimedSourceCues=0,audioParse='NO_CUE_MAP';
 if(declared){
   try{
     const audio=JSON.parse(declared[1]);
     if(Array.isArray(audio.urls)&&Array.isArray(audio.t)){
       audioParts=audio.urls.length;
       originalCueSegments=audio.t.length;
       untimedSourceCues=audio.t.filter(t=>
         Array.isArray(t)&&t.length===3&&t[2]===t[1]).length;
       audioParse='PARSED_SOURCE_NOT_PLAYBACK';
     }
   }catch(error){audioParse='SOURCE_CUE_PARSE_REVIEW';}
 }
 const markCount=count(/\bdata-i=["']\d+/g);
 const sections=count(/<section\b/gi);
 const scriptCount=count(/<script\b/gi);
 const native=nativeNumbers.has(item.number);
 const interactiveVoice=largeInteractiveDeviceVoiceNumbers.has(item.number);
 const sourceShape=sections&&markCount
   ? (audioDeclarations>1?'DUPLICATE_AUDIO_DECLARATION_REVIEW':
      scriptCount>3?'ADDITIONAL_DYNAMIC_SCRIPT_REVIEW':
      'ACADEMIC_MARKUP_PRESENT_ADAPTER_REVIEW')
   : 'INTERACTIVE_OR_NONSTANDARD_SOURCE_REVIEW';
 rows.push({
   number:item.number,title:item.title,series:item.series,
   originalBytes:bytes.length,sourceSha256:item.source_sha256,
   nativePreviewIntegrated:native,freeKoreanTtsImplemented:native||interactiveVoice,
   interactiveOriginalLargeScreenDeviceTts:interactiveVoice,
   actualAndroidAudioVerified:false,hostedRecordedMp4Verified:false,
   sections,readingSegments:markCount,tables:count(/<table\b/gi),
   figures:count(/<figure\b/gi),images:count(/<img\b/gi),
   scriptCount,audioDeclarations,audioParts,originalCueSegments,
   untimedSourceCues,audioParse,sourceShape,
   nextAction:native?'ANDROID_REAL_DEVICE_QA_PENDING':
      'EXPLICIT_TYPE_ADAPTER_AND_FIDELITY_QA_REQUIRED'
 });
}
assert.equal(new Set(rows.map(x=>x.number)).size,87,'lecture IDs unique');
assert.ok(rows.some(x=>x.number===14&&x.nativePreviewIntegrated),
  'new clinical source must be represented');
assert.ok(rows.some(x=>x.number===17&&x.nativePreviewIntegrated),
  'wrist examination #17 must be counted after original fidelity validation');
assert.ok(rows.filter(x=>x.number>=18&&x.number<=27).every(x=>x.nativePreviewIntegrated&&x.freeKoreanTtsImplemented),
  '14 physical-examination originals #14–27 must be counted only when integrated');
assert.ok(rows.filter(x=>x.interactiveOriginalLargeScreenDeviceTts).length===2,
  'original compendium 1–2 added voice controls but remains interactive original');
const total=(test)=>rows.filter(test).length;
const report={
 provenance:'GitHub original HTML exact byte/SHA comparison',
 warning:'Source inventory only; original MP4 streaming and Android voice playback NOT confirmed.',
 generatedAt:new Date().toISOString(),
 originalLectureFiles:rows.length,
 nativePreviewIntegrated:total(x=>x.nativePreviewIntegrated),
 diseaseTraumaPilot28:rows.find(x=>x.number===28)?.nativePreviewIntegrated===true,
 originalOnly:total(x=>!x.nativePreviewIntegrated),
 enhancedOriginalWithDeviceVoice:total(x=>x.interactiveOriginalLargeScreenDeviceTts),
 deviceVoiceCodeAvailable:total(x=>x.freeKoreanTtsImplemented),
 sourceCueMapsParsed:total(x=>x.audioParse==='PARSED_SOURCE_NOT_PLAYBACK'),
 sourceCuesMissingTiming:rows.reduce((n,x)=>n+x.untimedSourceCues,0),
 actualAndroidAudioVerified:0,serverRecordedAudioVerified:0,
 rows
};
assert.equal(report.nativePreviewIntegrated,26,'pilot #3 + 10 muscle + 14 clinical + disease #28');
assert.equal(report.originalOnly,61,'unported native source-only lecture count including enhanced interactive originals');
assert.equal(report.deviceVoiceCodeAvailable,28,'26 native + 2 interactive original read-aloud wrappers');
fs.mkdirSync('qa-artifacts/claude-native-readiness',{recursive:true});
fs.writeFileSync('qa-artifacts/claude-native-readiness/report.json',
 JSON.stringify(report,null,2)+'\n');
console.log('CLAUDE ALL 87 READINESS | originals 87/87 exact SHA; native 25; source-only 62; device voice UI '+report.deviceVoiceCodeAvailable+'; source cue maps '+report.sourceCueMapsParsed+'; untimed original cues '+report.sourceCuesMissingTiming+'; physical Android 0 verified; MP4 hosted 0 verified');
console.log('NOTE | Extra/duplicate scripts require type-specific review; static classification does NOT authorize automatic native integration');
