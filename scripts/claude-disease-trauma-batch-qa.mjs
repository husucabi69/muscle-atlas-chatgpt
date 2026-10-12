// B3 disease/trauma originals #28–39. Never infer conversion from source inventory alone.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const manifest=JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json','utf8'));
const reader=fs.readFileSync('scripts/claude-native-muscle-series-v1.js','utf8');
const counts={28:[10,103,3,9,6],29:[10,88,2,8,9],30:[12,126,3,8,6],31:[11,90,1,6,6],32:[11,86,2,8,6],33:[11,77,1,6,6],34:[10,80,2,8,7],35:[12,71,1,10,8],
  36:[11,104,2,9,6],37:[11,94,4,8,6],38:[9,69,1,8,4],39:[10,62,2,8,4]};
assert.ok(reader.includes('const FULL_VIEW_PILOT=new Set([28,29,30,31,32,33,34,35,36,37,38,39])'));
for(const [id,expected] of Object.entries(counts)){
  const item=manifest.lectures.find(x=>x.number===Number(id));
  assert.ok(item&&item.series==='질환·외상',id+' manifest category');
  const data=fs.readFileSync('claude-library/'+item.source_path);
  assert.equal(data.byteLength,item.source_bytes,'original bytes #'+id);
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'),item.source_sha256,'original SHA #'+id);
  const s=data.toString('utf8');
  assert.ok(s.includes('<div class="wrap">')&&s.includes('<style>')&&s.includes('window.__AUD__='),'academic source shape #'+id);
  assert.equal((s.match(/<script\b/g)||[]).length,2,'source scripts must remain original audio only #'+id);
  const actual=[/<section\b/g,/\bdata-i="/g,/<table\b/g,/<figure\b/g,/<img\b/g].map(re=>(s.match(re)||[]).length);
  assert.deepEqual(actual,expected,'original sections/paragraphs/tables/figures/images #'+id);
  console.log('PASS | Disease Trauma original #'+id+' '+item.title+' '+actual.join('/')+' SHA identity');
}
console.log('LYSOS B3 01–12 exact HTML source count and SHA: 12/12 PASS; installed Android pending');
