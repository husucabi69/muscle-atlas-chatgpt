// Regression gate for new native muscle lectures 2–11: original bytes remain unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const manifest=JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json','utf8'));
const reader=fs.readFileSync('scripts/claude-native-muscle-series-v1.js','utf8');
const speech=fs.readFileSync('scripts/claude-native-muscle-audio-v1.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const workflow=fs.readFileSync('.github/workflows/global-qa.yml','utf8');
const list=manifest.lectures.filter(x=>x.number>=4&&x.number<=13);
assert.equal(list.length,10);
assert.ok(index.includes('<script src="./scripts/claude-native-muscle-series-v1.js"></script>'));
assert.ok(index.indexOf('claude-native-muscle-series-v1.js')>index.indexOf('claude-native-muscle-v1.js'));
assert.ok(reader.includes('new Set([4,5,6,7,8,9,10,11,12,13])'));
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
  assert.equal(x.series,'근육학');
  const src=fs.readFileSync('claude-library/'+x.source_path);
  const actualSha=crypto.createHash('sha256').update(src).digest('hex');
  assert.equal(actualSha,x.source_sha256,'source SHA unchanged for '+x.number);
  assert.equal(src.byteLength,x.source_bytes,'source bytes unchanged for '+x.number);
  const s=src.toString('utf8');
  const count=p=>(s.match(p)||[]).length;
  const sections=count(/<section\b/g),paragraphs=count(/\bdata-i="/g),
    tables=count(/<table\b/g),figures=count(/<figure\b/g),images=count(/<img\b/g);
  assert.ok(sections>0&&paragraphs>0,'static full-content lecture needed: '+x.number);
  assert.ok(/class=["']wrap["']/.test(s),'canonical source body wrapper missing: '+x.number);
  assert.ok(s.includes('<style>'),'original theme must be preserved');
  assert.ok(s.includes('window.__AUD__='),'original source audio timings preserved');
  report.push({number:x.number,title:x.title,sections,paragraphs,tables,figures,images});
  console.log('PASS | Source-locked native volume '+x.number+': '+sections+' chapters, '+paragraphs+' speech markers, '+tables+' tables, '+figures+' figures');
}
fs.mkdirSync('qa-artifacts/claude-native-series',{recursive:true});
fs.writeFileSync('qa-artifacts/claude-native-series/report.json',JSON.stringify({plannedNativeVolumes:[3,...list.map(x=>x.number)],verifiedSourceVolumes:report,sourceBytesProtected:true,actualAndroidVerified:false,originalMp4AutoHosted:false},null,2)+'\n');
console.log('CLAUDE NATIVE 10-VOLUME SOURCE QA | 10/10 exact SHA + full content inventory PASS');
