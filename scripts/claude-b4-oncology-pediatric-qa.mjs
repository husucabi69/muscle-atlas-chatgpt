// B4 academic originals #52–58: independent source gate, no synthetic summaries.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const manifest=JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json','utf8'));
const reader=fs.readFileSync('scripts/claude-native-muscle-series-v1.js','utf8');
const expected={
  52:[8,80,2,12,7],53:[8,82,4,7,3],54:[7,59,1,7,1],
  55:[8,75,4,7,2],56:[9,63,2,8,3],57:[8,67,3,5,0],58:[8,54,2,4,0]
};
const allowlist=reader.match(/const ELIGIBLE=new Set\(\[([\d,]+)\]\)/)?.[1].split(',').map(Number);
const immersive=reader.match(/const FULL_VIEW_PILOT=new Set\(\[([\d,]+)\]\)/)?.[1].split(',').map(Number);
assert.ok(allowlist&&immersive,'native/full-view canonical allowlists parse');
assert.deepEqual(Object.keys(expected).map(Number),[52,53,54,55,56,57,58],'complete B4 7');
const report=[];
for(const [raw,counts] of Object.entries(expected)){
  const id=Number(raw);
  const item=manifest.lectures.find(x=>x.number===id);
  assert.ok(item&&item.series==='골종양·소아','correct B4 manifest series #'+id);
  assert.ok(allowlist.includes(id)&&immersive.includes(id),'immersive reader enabled #'+id);
  const bytes=fs.readFileSync('claude-library/'+item.source_path);
  assert.equal(bytes.length,item.source_bytes,'original byte size #'+id);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.source_sha256,'original SHA-256 #'+id);
  const html=bytes.toString('utf8');
  assert.ok(html.includes('<div class="wrap">')&&html.includes('<style>')&&html.includes('window.__AUD__='),'academic reader-compatible original #'+id);
  assert.equal((html.match(/<script\b/gi)||[]).length,2,'source scripts require a type adapter review #'+id);
  assert.ok(html.includes('id="s2"'),'second chapter anchor #'+id);
  const actual=[/<section\b/gi,/\bdata-i="/g,/<table\b/gi,/<figure\b/gi,/<img\b/gi]
    .map(re=>(html.match(re)||[]).length);
  assert.deepEqual(actual,counts,'academic source count #'+id);
  report.push({number:id,title:item.title,bytes:bytes.length,sha256:item.source_sha256,
    sections:actual[0],speechSegments:actual[1],tables:actual[2],figures:actual[3],images:actual[4],
    physicalAndroidVerified:false,originalRecordedMp4Verified:false});
  console.log('PASS | B4 #'+id+' '+item.title+': '+actual.join('/')+' exact SHA + byte identity');
}
assert.equal(allowlist.filter(x=>x>=52&&x<=58).length,7);
assert.equal(immersive.filter(x=>x>=52&&x<=58).length,7);
fs.mkdirSync('qa-artifacts/claude-b4',{recursive:true});
fs.writeFileSync('qa-artifacts/claude-b4/source-report.json',JSON.stringify({batch:'B4',verified:report.length,sourceFilesUnchanged:true,physicalSamsungVerified:false,hostedMp4Verified:false,rows:report},null,2)+'\n');
console.log('LYSOS B4 SOURCE QA | 7/7 bone-tumour/paediatric academic originals intact; device/MP4 pending');
