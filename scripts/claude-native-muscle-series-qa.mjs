// Native series QA: Muscle #4–13 plus clinical/referred-pain #14–19.
// Original source bytes, academic text/figures/tables and series boundaries stay intact.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const manifest=JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json','utf8'));
const reader=fs.readFileSync('scripts/claude-native-muscle-series-v1.js','utf8');
const speech=fs.readFileSync('scripts/claude-native-muscle-audio-v1.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const workflow=fs.readFileSync('.github/workflows/global-qa.yml','utf8');
const list=manifest.lectures.filter(x=>x.number>=4&&x.number<=19);
assert.equal(list.length,16);
assert.ok(index.includes('<script src="./scripts/claude-native-muscle-series-v1.js"></script>'));
assert.ok(index.indexOf('claude-native-muscle-series-v1.js')>index.indexOf('claude-native-muscle-v1.js'));
assert.ok(reader.includes('new Set([4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])'));
assert.ok(reader.includes('&&ELIGIBLE.has(x.number)'), 'native next-course gate must never spill into non-native original lessons');
assert.ok(reader.includes("crypto.subtle.digest('SHA-256',bytes)"));
assert.ok(reader.includes('full.textContent!==source.textContent'));
assert.ok(reader.includes('window.LYSNativeAudio.mount(shadow'));
assert.ok(reader.includes('window.LYSClaudeSequence'));
assert.ok(reader.includes("previousOpen(number,false)"),'native source failure must offer verified original route');
assert.ok(speech.includes('repeatFrom')&&speech.includes('repeatTo')&&speech.includes('repeatEnabled'));
assert.ok(speech.includes('punctuationSelect')&&speech.includes('spokenText'));
assert.ok(speech.includes('onComplete'));
assert.ok(workflow.includes('node scripts/claude-native-muscle-series-qa.mjs'));
const report=[];
for(const x of list){
  assert.equal(x.series,x.number<=13?'근육학':'이학적 검진·연관통');
  const src=fs.readFileSync('claude-library/'+x.source_path);
  const actualSha=crypto.createHash('sha256').update(src).digest('hex');
  assert.equal(actualSha,x.source_sha256,'source SHA unchanged for '+x.number);
  assert.equal(src.byteLength,x.source_bytes,'source bytes unchanged for '+x.number);
  const s=src.toString('utf8');
  const count=p=>(s.match(p)||[]).length;
  const sections=count(/<section\b/g),paragraphs=count(/\bdata-i="/g),
    tables=count(/<table\b/g),figures=count(/<figure\b/g),images=count(/<img\b/g);
  assert.ok(sections>0&&paragraphs>0,'static full-content lecture needed: '+x.number);
  // Each transplanted examination source must remain the *actual* full
  // academic page: not a shortened synthetic synopsis or lecture outline.
  if(x.number===14)assert.ok(sections===12&&paragraphs===194&&tables===8,'referred pain source fidelity');
  if(x.number===15)assert.ok(sections===15&&paragraphs===500&&tables===46&&figures===15,'shoulder examination source fidelity');
  if(x.number===16)assert.ok(sections===16&&paragraphs===361&&tables===35&&figures===13,'elbow examination source fidelity');
  if(x.number===17)assert.ok(sections===13&&paragraphs===282&&tables===22&&figures===8&&images===3,'wrist examination original structure');
  if(x.number===18)assert.ok(sections===15&&paragraphs===240&&tables===19&&figures===5&&images===1,'hand and fingers original');
  if(x.number===19)assert.ok(sections===11&&paragraphs===208&&tables===19&&figures===5&&images===2,'cervical spine / upper limb nerves original');
  assert.ok(/class=["']wrap["']/.test(s),'canonical source body wrapper missing: '+x.number);
  assert.ok(s.includes('<style>'),'original theme must be preserved');
  assert.ok(s.includes('window.__AUD__='),'original source audio timings preserved');
  report.push({number:x.number,title:x.title,sections,paragraphs,tables,figures,images});
  console.log('PASS | Source-locked native volume '+x.number+': '+sections+' chapters, '+paragraphs+' speech markers, '+tables+' tables, '+figures+' figures');
}
fs.mkdirSync('qa-artifacts/claude-native-series',{recursive:true});
fs.writeFileSync('qa-artifacts/claude-native-series/report.json',JSON.stringify({plannedNativeVolumes:[3,...list.map(x=>x.number)],verifiedSourceVolumes:report,sourceBytesProtected:true,clinicalExtension:[14,15,16,17,18,19],actualAndroidVerified:false,originalMp4AutoHosted:false},null,2)+'\n');
console.log('CLAUDE NATIVE 16-VOLUME SOURCE QA | 16/16 exact SHA + full content inventory PASS (Muscle 10 + Exam 6)');
